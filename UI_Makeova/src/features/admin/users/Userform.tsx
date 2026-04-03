import { getAllServices, IService } from '@/api/services/servicesApi'
import { getAllRoles, getCachedRoleId, IRoleDoc, UserFormData, UserRoleType } from '@/api/Userapi'
import { IUser } from '@/types'
import React, { useState, useEffect } from 'react'
import { getWorkingDayLabel } from '@/features/appointments/appointmentUtils'


const DAYS = ['sun','mon','tue','wed','thu','fri','sat'] as const
const MINIMUM_AGE = 18
const NAME_PATTERN = /[^A-Za-z\s.'-]/g

const getAgeFromDob = (dob: string): number => {
  const birthDate = new Date(dob)
  if (Number.isNaN(birthDate.getTime())) return 0

  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1
  }

  return age
}

// ── Which fields to show per role ─────────────────────────
const ROLE_FIELDS: Record<UserRoleType, (keyof UserFormData)[]> = {
  staff:        ['name','email','password','phonenumber','gender','address','dob','specialization','experienceYears','Bio','WorkingDay','isAvailable'],
  receptionist: ['name','email','password','phonenumber','gender','address','dob','isAvailable'],
  customer:     ['name','email','password','phonenumber','gender','address','dob'],
}

interface UserFormProps {
  mode:     'create' | 'edit'
  roleType: UserRoleType
  initial?: IUser
  onSubmit: (data: UserFormData) => Promise<void>
  onCancel: () => void
}

const EMPTY = (roleValue: string): UserFormData => ({
  name:            '',
  email:           '',
  password:        '',
  phonenumber:     '',
  gender:          '' as string,
  address:         '',
  dob:             '',
  specialization:  '',
  experienceYears: '',
  isAvailable:     true,
  Bio:             '',
  WorkingDay:      [],
  role:            [roleValue],
})

const UserForm: React.FC<UserFormProps> = ({ mode, roleType, initial, onSubmit, onCancel }) => {
  const [form,     setForm]     = useState<UserFormData>(EMPTY(roleType))
  const [errors,   setErrors]   = useState<Partial<Record<keyof UserFormData, string>>>({})
  const [loading,  setLoading]  = useState(false)
  const [apiErr,   setApiErr]   = useState('')
  const [services, setServices] = useState<IService[]>([])
  const [roles,    setRoles]    = useState<IRoleDoc[]>([])
  const [showPass, setShowPass] = useState(false)

  const show = (field: keyof UserFormData) => ROLE_FIELDS[roleType].includes(field)

  // Fetch roles + services on mount
  useEffect(() => {
    getAllRoles({ page: 1, limit: 10 }).then(response => setRoles(response.items)).catch(() => setRoles([]))
    if (roleType === 'staff') {
      getAllServices({ page: 1, limit: 10 }).then(response => setServices(response.items)).catch(() => setServices([]))
    }
  }, [roleType])

  // Set role ObjectId dynamically from fetched roles, with fallback to cache
  useEffect(() => {
    if (mode !== 'create') return
    
    const matched = roles.find(r => r.name.toLowerCase() === roleType.toLowerCase())
    
    if (matched) {
      setForm(p => ({ ...p, role: [matched._id] }))
    } else {
      // Fallback: try to get from cache (handles receptionist authorization filtering)
      const cachedId = getCachedRoleId(roleType)
      if (cachedId) {
        setForm(p => ({ ...p, role: [cachedId] }))
      }
    }
  }, [roles, roleType, mode])

  // Populate for edit
  useEffect(() => {
    if (initial && roles.length > 0) {
      const matched = roles.find(r => r.name.toLowerCase() === roleType.toLowerCase())
      setForm({
        name:            initial.name,
        email:           initial.email,
        password:        '',
        phonenumber:     initial.phonenumber,
        gender:          initial.gender as string,
        address:         initial.address,
        dob:             initial.dob ?? '',
        specialization:  initial.specialization ?? '',
        experienceYears: initial.experienceYears !== undefined ? String(initial.experienceYears) : '',
        isAvailable:     initial.isAvailable,
        Bio:             initial.Bio ?? '',
        WorkingDay:      Array.isArray(initial.WorkingDay)
          ? initial.WorkingDay
          : initial.WorkingDay
            ? [initial.WorkingDay]
            : [],
        role:            matched ? [matched._id] : [],
      })
    }
  }, [initial, roles, roleType])

  const set = (key: keyof UserFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const rawValue = e.target.value
      const nextValue = key === 'phonenumber'
        ? rawValue.replace(/\D/g, '').slice(0, 10)
        : key === 'name'
          ? rawValue.replace(NAME_PATTERN, '')
          : rawValue

      setErrors(p => ({ ...p, [key]: '' }))
      setApiErr('')
      setForm(p => ({ ...p, [key]: nextValue }))
    }

  const validate = (): boolean => {
    const e: typeof errors = {}
    if (!form.name.trim())        e.name        = 'Name is required'
    else if (/\d/.test(form.name)) e.name = 'Full name cannot contain numbers'
    if (!form.email.trim())       e.email       = 'Email is required'
    if (mode === 'create' && !form.password) e.password = 'Password is required'
    if (mode === 'create' && form.password && form.password.length < 6) e.password = 'Min 6 characters'
    if (!form.phonenumber.trim()) e.phonenumber = 'Phone is required'
    else if (!/^\d{10}$/.test(form.phonenumber.trim())) e.phonenumber = 'Phone number must be exactly 10 digits'
    if (!form.gender)             e.gender      = 'Gender is required'
    if (!form.address.trim())     e.address     = 'Address is required'
    if (!form.dob) e.dob = 'Date of birth is required'
    else if (getAgeFromDob(form.dob) < MINIMUM_AGE) e.dob = 'User must be at least 18 years old'
    if (roleType === 'staff' && (!form.WorkingDay || form.WorkingDay.length === 0)) {
      e.WorkingDay = 'Select at least 1 working day'
    }
    if (roleType === 'staff' && (form.WorkingDay?.length ?? 0) > 6) {
      e.WorkingDay = 'You can select up to 6 working days'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    setApiErr('')
    try {
      await onSubmit(form)
    } catch (err) {
      setApiErr(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const inp = (field: keyof UserFormData) =>
    `w-full px-3 py-[10px] border-2 rounded-[10px] text-[13px] text-[#2d2d2d] outline-none transition-all bg-white font-serif
    ${errors[field] ? 'border-[#EF9A9A]' : 'border-[#F0DDD5] focus:border-[#C49A7A]'}`

  const roleLabel = roleType.charAt(0).toUpperCase() + roleType.slice(1)
  const toggleWorkingDay = (day: typeof DAYS[number]) => {
    setErrors(p => ({ ...p, WorkingDay: '' }))
    setApiErr('')
    setForm(prev => {
      const selectedDays = prev.WorkingDay ?? []
      const isSelected = selectedDays.includes(day)

      if (isSelected) {
        return { ...prev, WorkingDay: selectedDays.filter(selected => selected !== day) }
      }

      if (selectedDays.length >= 6) {
        setErrors(current => ({ ...current, WorkingDay: 'You can select up to 6 working days' }))
        return prev
      }

      return { ...prev, WorkingDay: [...selectedDays, day] }
    })
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">

      {apiErr && (
        <div className="flex items-center gap-2 bg-[#FFEBEE] border border-[#EF9A9A] rounded-xl px-4 py-3">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#E53935" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span className="text-[12px] text-[#E53935]">{apiErr}</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">

        {/* Name */}
        <div className="col-span-2">
          <label className="text-[12px] text-[#888] block mb-[5px] font-serif">Full Name *</label>
          <input value={form.name} onChange={set('name')} placeholder={`${roleLabel} full name`} className={inp('name')} />
          {errors.name && <p className="text-[11px] text-[#E53935] mt-1 m-0">{errors.name}</p>}
        </div>

        {/* Email */}
        <div>
          <label className="text-[12px] text-[#888] block mb-[5px] font-serif">Email *</label>
          <input type="email" value={form.email} onChange={set('email')} placeholder="email@makeova.com"
            className={inp('email')} disabled={mode === 'edit'} />
          {errors.email && <p className="text-[11px] text-[#E53935] mt-1 m-0">{errors.email}</p>}
        </div>

        {/* Phone */}
        <div>
          <label className="text-[12px] text-[#888] block mb-[5px] font-serif">Phone *</label>
          <input
            type="tel"
            inputMode="numeric"
            value={form.phonenumber}
            onChange={set('phonenumber')}
            placeholder="9876543210"
            className={`${inp('phonenumber')} font-numeric`}
          />
          {errors.phonenumber && <p className="text-[11px] text-[#E53935] mt-1 m-0">{errors.phonenumber}</p>}
        </div>

        {/* Password — create only */}
        {show('password') && mode === 'create' && (
          <div className="col-span-2">
            <label className="text-[12px] text-[#888] block mb-[5px] font-serif">Password *</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={form.password} onChange={set('password')}
                placeholder="Min 6 characters"
                className={`${inp('password')} pr-10`}
              />
              <button type="button" onClick={() => setShowPass(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#ccc] bg-transparent border-none cursor-pointer p-0">
                {showPass
                  ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                }
              </button>
            </div>
            {errors.password && <p className="text-[11px] text-[#E53935] mt-1 m-0">{errors.password}</p>}
          </div>
        )}

        {/* Gender */}
        <div>
          <label className="text-[12px] text-[#888] block mb-[5px] font-serif">Gender *</label>
          <select value={form.gender} onChange={set('gender')} className={inp('gender')}>
            <option value="">Select gender</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="other">Other</option>
          </select>
          {errors.gender && <p className="text-[11px] text-[#E53935] mt-1 m-0">{errors.gender}</p>}
        </div>

        {/* DOB */}
        {show('dob') && (
          <div>
            <label className="text-[12px] text-[#888] block mb-[5px] font-serif">Date of Birth</label>
            <input type="date" value={form.dob ?? ''} onChange={set('dob')} className={`${inp('dob')} font-numeric`} />
            {errors.dob && <p className="text-[11px] text-[#E53935] mt-1 m-0">{errors.dob}</p>}
          </div>
        )}

        {/* Address */}
        <div className="col-span-2">
          <label className="text-[12px] text-[#888] block mb-[5px] font-serif">Address *</label>
          <input value={form.address} onChange={set('address')} placeholder="Full address" className={inp('address')} />
          {errors.address && <p className="text-[11px] text-[#E53935] mt-1 m-0">{errors.address}</p>}
        </div>

        {/* Staff-only fields */}
        {show('specialization') && (
          <div>
            <label className="text-[12px] text-[#888] block mb-[5px] font-serif">Specialization</label>
            <select value={form.specialization ?? ''} onChange={set('specialization')} className={inp('specialization')}>
              <option value="">Select service</option>
              {services.map(s => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>
          </div>
        )}

        {show('experienceYears') && (
          <div>
            <label className="text-[12px] text-[#888] block mb-[5px] font-serif">Experience (years)</label>
            <input type="number" min="0" max="50"
              value={form.experienceYears ?? ''}
              onChange={set('experienceYears')}
              placeholder="0"
              className={`${inp('experienceYears')} font-numeric`}
            />
          </div>
        )}

        {show('Bio') && (
          <div className="col-span-2">
            <label className="text-[12px] text-[#888] block mb-[5px] font-serif">Bio</label>
            <textarea value={form.Bio ?? ''} onChange={set('Bio')} rows={2}
              placeholder="Brief description..." className={`${inp('Bio')} resize-none`} />
          </div>
        )}

        {show('WorkingDay') && (
          <div className="col-span-2">
            <label className="text-[12px] text-[#888] block mb-[6px] font-serif">Weekly Working Days *</label>
            <div className="flex gap-2 flex-wrap">
              {DAYS.map(d => (
                <button key={d} type="button"
                  onClick={() => toggleWorkingDay(d)}
                  className={`px-3 py-1.5 rounded-lg text-[12px] font-serif border-2 cursor-pointer capitalize transition-all
                    ${form.WorkingDay?.includes(d)
                      ? 'bg-[#C49A7A] text-white border-[#C49A7A]'
                      : 'bg-white text-[#888] border-[#F0DDD5] hover:border-[#C49A7A]'
                    }`}
                >{getWorkingDayLabel(d)}</button>
              ))}
            </div>
            <p className="text-[11px] text-[#aaa] mt-2 mb-0 font-serif">
              Select up to 6 working days. Providers can only take bookings on these days unless they are inactive or on approved leave.
            </p>
            {errors.WorkingDay && <p className="text-[11px] text-[#E53935] mt-1 m-0">{errors.WorkingDay}</p>}
          </div>
        )}

        {show('isAvailable') && (
          <div className="col-span-2 flex items-center justify-between bg-[#FDF6F2] rounded-xl px-4 py-3 border border-[#F0DDD5]">
            <div>
              <p className="text-[13px] font-semibold text-[#2d2d2d] m-0 font-serif">Active for Booking</p>
              <p className="text-[11px] text-[#aaa] m-0">Working day and approved leave are checked automatically</p>
            </div>
            <button type="button"
              onClick={() => setForm(p => ({ ...p, isAvailable: !p.isAvailable }))}
              className={`relative w-11 h-6 rounded-full transition-all duration-200 border-none cursor-pointer flex-shrink-0
                ${form.isAvailable ? 'bg-[#C49A7A]' : 'bg-[#E0E0E0]'}`}>
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-200
                ${form.isAvailable ? 'left-[22px]' : 'left-0.5'}`} />
            </button>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-5 border-t border-[#F9F0EC]">
        <button type="button" onClick={onCancel}
          className="flex-1 py-[11px] bg-white border-2 border-[#F0DDD5] text-[#888] text-[13px] font-serif rounded-xl cursor-pointer hover:bg-[#FDF6F2] transition-colors">
          Cancel
        </button>
        <button type="submit" disabled={loading}
          className="flex-1 py-[11px] text-white text-[13px] font-semibold font-serif rounded-xl border-none cursor-pointer hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          style={{ background: 'linear-gradient(135deg,#C49A7A,#E8B89A)' }}>
          {loading
            ? <><svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>{mode === 'create' ? 'Creating...' : 'Saving...'}</>
            : mode === 'create' ? `+ Add ${roleLabel}` : 'Save Changes'
          }
        </button>
      </div>
    </form>
  )
}

export default UserForm
