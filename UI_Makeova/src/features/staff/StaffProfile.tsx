import React, { useState } from 'react'
import { useAppSelector } from '../../store'
import { selectUser } from '../../store/slices/authSlice'
import StaffLayout from './StaffLayout'
import { getWorkingDayLabel } from '@/features/appointments/appointmentUtils'

const DAYS: { key: string; label: string }[] = [
  { key: 'sun', label: 'Sun' },
  { key: 'mon', label: 'Mon' },
  { key: 'tue', label: 'Tue' },
  { key: 'wed', label: 'Wed' },
  { key: 'thu', label: 'Thu' },
  { key: 'fri', label: 'Fri' },
  { key: 'sat', label: 'Sat' },
]

const MINIMUM_AGE = 18
const NAME_PATTERN = /[^A-Za-z\s.'-]/g

type StaffProfileForm = {
  name: string
  email: string
  phonenumber: string
  gender: 'female' | 'male' | 'other'
  address: string
  dob: string
  Bio: string
  WorkingDay: string[]
  experienceYears: number
  isAvailable: boolean
}

type StaffProfileErrors = {
  name?: string
  phonenumber?: string
  dob?: string
}

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

const buildInitialForm = (user: ReturnType<typeof selectUser>): StaffProfileForm => ({
  name: user?.name ?? '',
  email: user?.email ?? '',
  phonenumber: user?.phonenumber ?? '',
  gender: user?.gender ?? 'female',
  address: user?.address ?? '',
  dob: user?.dob ?? '',
  Bio: user?.Bio ?? '',
  WorkingDay: Array.isArray(user?.WorkingDay)
    ? [...user.WorkingDay]
    : user?.WorkingDay
      ? [user.WorkingDay]
      : [],
  experienceYears: user?.experienceYears ?? 0,
  isAvailable: user?.isAvailable ?? true,
})

const StaffProfile: React.FC = () => {
  const user = useAppSelector(selectUser)
  const initialForm = buildInitialForm(user)

  const [editing, setEditing] = useState(false)
  const [saved, setSaved] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<StaffProfileErrors>({})
  const [form, setForm] = useState<StaffProfileForm>(initialForm)

  const set = (key: keyof StaffProfileForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const rawValue = e.target.value
      const nextValue = key === 'phonenumber'
        ? rawValue.replace(/\D/g, '').slice(0, 10)
        : key === 'name'
          ? rawValue.replace(NAME_PATTERN, '')
          : key === 'experienceYears'
            ? (rawValue === '' ? 0 : Number(rawValue))
            : rawValue

      setFieldErrors(prev => ({ ...prev, [key]: undefined }))
      setForm(prev => ({
        ...prev,
        [key]: e.type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : nextValue,
      }))
    }

  const handleSave = () => {
    const nextErrors: StaffProfileErrors = {}

    if (!/^\d{10}$/.test(String(form.phonenumber).trim())) {
      nextErrors.phonenumber = 'Phone number must be exactly 10 digits'
    }

    if (!String(form.name).trim()) {
      nextErrors.name = 'Full name is required'
    } else if (/\d/.test(String(form.name))) {
      nextErrors.name = 'Full name cannot contain numbers'
    }

    if (!form.dob) {
      nextErrors.dob = 'Date of birth is required'
    } else if (getAgeFromDob(form.dob) < MINIMUM_AGE) {
      nextErrors.dob = 'User must be at least 18 years old'
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors)
      return
    }

    // Replace with: await api.patch(`/user/updateuser/${user?._id}`, form)
    setSaved(true)
    setEditing(false)
    setTimeout(() => setSaved(false), 2500)
  }

  const handleCancel = () => {
    setForm(buildInitialForm(user))
    setFieldErrors({})
    setEditing(false)
  }

  const inputCls = (disabled: boolean) =>
    `w-full px-3 py-[10px] border rounded-[8px] text-[13px] font-serif outline-none transition-all
    ${disabled
      ? 'border-[#E8F5E9] bg-[#F0FAF4] text-[#888] cursor-not-allowed'
      : 'border-[#C8E6C9] bg-white text-[#2d2d2d] focus:border-[#7AC49A] focus:ring-2 focus:ring-[#7AC49A]/10'
    }`

  return (
    <StaffLayout>
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-[22px] font-bold text-[#2d2d2d] m-0 font-serif">My Profile</h1>
          <p className="text-[13px] text-[#7AC49A] mt-1 mb-0">View and update your information</p>
        </div>
        <div className="flex items-center gap-3">
          {saved && (
            <span className="flex items-center gap-2 text-[12px] text-[#4CAF50] bg-[#E8F5E9] px-4 py-2 rounded-lg">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Saved!
            </span>
          )}
          {editing ? (
            <>
              <button
                onClick={handleCancel}
                className="text-[13px] text-[#888] bg-white border border-[#C8E6C9] px-4 py-2 rounded-lg font-serif cursor-pointer hover:bg-[#F0FAF4] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="text-[13px] text-white px-5 py-2 rounded-lg font-serif cursor-pointer hover:opacity-90 transition-opacity border-none"
                style={{ background: 'linear-gradient(135deg,#7AC49A,#A8E0C4)' }}
              >
                Save Changes
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-2 text-[13px] text-white px-5 py-2 rounded-lg font-serif cursor-pointer hover:opacity-90 transition-opacity border-none"
              style={{ background: 'linear-gradient(135deg,#7AC49A,#A8E0C4)' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Edit Profile
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 items-start">
        <div className="bg-white rounded-xl border border-[#C8E6C9] shadow-[0_2px_12px_rgba(122,196,154,0.07)] p-6 flex flex-col items-center text-center gap-4">
          <div className="w-20 h-20 rounded-full bg-[#C8E6C9] flex items-center justify-center text-[30px] font-bold text-[#7AC49A] font-serif">
            {(form.name.trim().charAt(0) || 'S').toUpperCase()}
          </div>
          <div>
            <p className="text-[16px] font-bold text-[#2d2d2d] m-0 font-serif">{form.name || 'Staff Member'}</p>
            <p className="text-[12px] text-[#aaa] m-0 mt-1">{form.email}</p>
          </div>

          <div className="w-full pt-4 border-t border-[#E8F5E9]">
            <p className="text-[11px] text-[#aaa] uppercase tracking-[0.1em] mb-3">Availability</p>
            <button
              onClick={() => editing && setForm(prev => ({ ...prev, isAvailable: !prev.isAvailable }))}
              className={`w-full py-2.5 rounded-lg text-[13px] font-serif border transition-all
                ${form.isAvailable
                  ? 'bg-[#E8F5E9] text-[#4CAF50] border-[#A5D6A7]'
                  : 'bg-[#FFEBEE] text-[#E53935] border-[#EF9A9A]'
                }
                ${editing ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
            >
              {form.isAvailable ? 'Available' : 'Unavailable'}
            </button>
          </div>

          <div className="w-full pt-4 border-t border-[#E8F5E9] grid grid-cols-2 gap-3">
            {[
              { label: 'Experience', value: `${form.experienceYears ?? 0} yrs` },
              { label: 'Working Days', value: form.WorkingDay.length ? getWorkingDayLabel(form.WorkingDay) : '--' },
            ].map(({ label, value }) => (
              <div key={label} className="bg-[#F0FAF4] rounded-lg p-3 text-center">
                <p className="text-[14px] font-bold text-[#7AC49A] m-0 font-serif">{value}</p>
                <p className="text-[10px] text-[#aaa] m-0 mt-0.5 uppercase tracking-[0.06em]">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-2 bg-white rounded-xl border border-[#C8E6C9] shadow-[0_2px_12px_rgba(122,196,154,0.07)] p-6">
          <h3 className="text-[14px] font-bold text-[#2d2d2d] mb-5 m-0 font-serif">Personal Information</h3>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-[12px] text-[#888] block mb-[6px] font-serif">Full Name</label>
              <input value={form.name} onChange={set('name')} disabled={!editing} className={inputCls(!editing)} />
              {fieldErrors.name && <p className="mt-1 text-[11px] text-[#E53935] m-0">{fieldErrors.name}</p>}
            </div>

            <div>
              <label className="text-[12px] text-[#888] block mb-[6px] font-serif">Phone</label>
              <input
                type="tel"
                inputMode="numeric"
                value={form.phonenumber}
                onChange={set('phonenumber')}
                disabled={!editing}
                className={`${inputCls(!editing)} font-numeric`}
              />
              {fieldErrors.phonenumber && <p className="mt-1 text-[11px] text-[#E53935] m-0">{fieldErrors.phonenumber}</p>}
            </div>

            <div>
              <label className="text-[12px] text-[#888] block mb-[6px] font-serif">Email <span className="text-[10px] text-[#ccc]">(cannot change)</span></label>
              <input value={form.email} disabled className={inputCls(true)} />
            </div>

            <div>
              <label className="text-[12px] text-[#888] block mb-[6px] font-serif">Date of Birth</label>
              <input type="date" value={form.dob} onChange={set('dob')} disabled={!editing} className={`${inputCls(!editing)} font-numeric`} />
              {fieldErrors.dob && <p className="mt-1 text-[11px] text-[#E53935] m-0">{fieldErrors.dob}</p>}
            </div>

            <div>
              <label className="text-[12px] text-[#888] block mb-[6px] font-serif">Gender</label>
              <select value={form.gender} onChange={set('gender')} disabled={!editing} className={inputCls(!editing)}>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="text-[12px] text-[#888] block mb-[6px] font-serif">Experience (years)</label>
              <input
                type="number"
                min="0"
                max="50"
                value={form.experienceYears}
                onChange={set('experienceYears')}
                disabled={!editing}
                className={`${inputCls(!editing)} font-numeric`}
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="text-[12px] text-[#888] block mb-[6px] font-serif">Address</label>
            <input value={form.address} onChange={set('address')} disabled={!editing} className={inputCls(!editing)} />
          </div>

          <div className="mb-5">
            <label className="text-[12px] text-[#888] block mb-[6px] font-serif">Bio</label>
            <textarea
              value={form.Bio}
              onChange={set('Bio')}
              disabled={!editing}
              rows={3}
              placeholder="Tell clients about yourself..."
              className={`${inputCls(!editing)} resize-none`}
            />
          </div>

          <div>
            <label className="text-[12px] text-[#888] block mb-[8px] font-serif">Working Days</label>
            <div className="flex gap-2 flex-wrap">
              {DAYS.map(({ key, label }) => {
                const active = form.WorkingDay.includes(key)

                return (
                  <button
                    key={key}
                    type="button"
                    disabled={!editing}
                    onClick={() => editing && setForm(prev => {
                      const isSelected = prev.WorkingDay.includes(key)
                      if (isSelected) {
                        return { ...prev, WorkingDay: prev.WorkingDay.filter(day => day !== key) }
                      }
                      if (prev.WorkingDay.length >= 6) return prev
                      return { ...prev, WorkingDay: [...prev.WorkingDay, key] }
                    })}
                    className={`px-4 py-2 rounded-lg text-[12px] font-serif border transition-all
                      ${active
                        ? 'bg-[#7AC49A] text-white border-[#7AC49A]'
                        : 'bg-white text-[#888] border-[#C8E6C9]'
                      }
                      ${editing && !active ? 'cursor-pointer hover:border-[#7AC49A] hover:text-[#7AC49A]' : ''}
                      ${!editing ? 'cursor-not-allowed opacity-70' : ''}`}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </StaffLayout>
  )
}

export default StaffProfile
