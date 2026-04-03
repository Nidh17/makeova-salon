import React, { useState } from 'react'
import { useAppSelector } from '../../store'
import { selectUser }     from '../../store/slices/authSlice'
import api                from '../../api/axiosInstance'

interface ProfileFormProps {
  accentColor: string   // '#C49A7A' for admin, '#7A9EC4' for receptionist
  bgGradient:  string
}

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

const ProfileForm: React.FC<ProfileFormProps> = ({ accentColor, bgGradient }) => {
  const user = useAppSelector(selectUser)

  const [editing, setEditing] = useState(false)
  const [saved,   setSaved]   = useState(false)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [fieldErrors, setFieldErrors] = useState<{ phonenumber?: string; dob?: string }>({})

  const [form, setForm] = useState<{
    name:        string
    email:       string
    phonenumber: string
    gender:      string
    address:     string
    dob:         string
    Bio:         string
  }>({
    name:        user?.name        ?? '',
    email:       user?.email       ?? '',
    phonenumber: user?.phonenumber ?? '',
    gender:      user?.gender      ?? 'female',
    address:     user?.address     ?? '',
    dob:         user?.dob         ?? '',
    Bio:         user?.Bio         ?? '',
  })

  const set = (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const rawValue = e.target.value
      const nextValue = key === 'phonenumber'
        ? rawValue.replace(/\D/g, '').slice(0, 10)
        : key === 'name'
          ? rawValue.replace(NAME_PATTERN, '')
        : rawValue

      setFieldErrors(prev => ({ ...prev, [key]: undefined }))
      setForm(prev => ({ ...prev, [key]: nextValue }))
    }

  const handleSave = async () => {
    if (!user?._id) return
    const nextErrors: { phonenumber?: string; dob?: string } = {}

    if (!/^\d{10}$/.test(form.phonenumber.trim())) {
      nextErrors.phonenumber = 'Phone number must be exactly 10 digits'
    }

    if (!form.name.trim()) {
      setError('Full name is required')
      return
    }

    if (/\d/.test(form.name)) {
      setError('Full name cannot contain numbers')
      return
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

    setLoading(true)
    setError('')
    try {
      // PATCH /api/v1/user/updateuser/:id
      await api.patch(`/user/updateuser/${user._id}`, {
        name:        form.name,
        phonenumber: form.phonenumber,
        gender:      form.gender,
        address:     form.address,
        dob:         form.dob,
        Bio:         form.Bio,
      })
      setSaved(true)
      setEditing(false)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes.')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = (disabled: boolean) =>
    `w-full px-3 py-[10px] border rounded-[8px] text-[13px] font-serif outline-none transition-all
    ${disabled
      ? 'border-[#F0DDD5] bg-[#FDF6F2] text-[#aaa] cursor-not-allowed'
      : 'border-[#F0DDD5] bg-white text-[#2d2d2d] focus:border-[${accentColor}]'
    }`

  return (
    <div className="grid grid-cols-3 gap-6 items-start">

      {/* LEFT: Avatar card */}
      <div className="bg-white rounded-xl border border-[#F0DDD5] shadow-[0_2px_12px_rgba(196,154,122,0.07)] p-6 flex flex-col items-center text-center gap-4">

        {/* Avatar */}
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center text-[30px] font-bold text-white font-serif"
          style={{ background: bgGradient }}
        >
          {form.name.charAt(0).toUpperCase()}
        </div>

        <div>
          <p className="text-[16px] font-bold text-[#2d2d2d] m-0 font-serif">{form.name}</p>
          <p className="text-[12px] text-[#aaa] m-0 mt-1">{form.email}</p>
          {/* Role badge */}
          <span
            className="inline-block mt-2 text-[11px] px-3 py-1 rounded-full text-white font-semibold"
            style={{ background: bgGradient }}
          >
            {user?.role?.[0] && typeof user.role[0] !== 'string'
              ? (user.role[0] as { name: string }).name
              : 'Provider'
            }
          </span>
        </div>

        {/* Quick info */}
        <div className="w-full pt-4 border-t border-[#F9F0EC] space-y-3">
          {[
            { label: 'Phone',   value: form.phonenumber || '—' },
            { label: 'Gender',  value: form.gender ? form.gender.charAt(0).toUpperCase() + form.gender.slice(1) : '—' },
            { label: 'Address', value: form.address || '—' },
          ].map(({ label, value }) => (
            <div key={label} className="text-left">
              <p className="text-[10px] text-[#ccc] uppercase tracking-[0.08em] m-0">{label}</p>
              <p className="text-[13px] text-[#2d2d2d] font-serif m-0 truncate">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT: Form */}
      <div className="col-span-2 bg-white rounded-xl border border-[#F0DDD5] shadow-[0_2px_12px_rgba(196,154,122,0.07)] overflow-hidden">

        {/* Card header */}
        <div
          className="px-6 py-4 flex items-center justify-between"
          style={{ background: `${accentColor}18` }}
        >
          <h3 className="text-[15px] font-bold text-[#2d2d2d] m-0 font-serif">
            Personal Information
          </h3>
          <div className="flex items-center gap-3">
            {saved && (
              <span className="flex items-center gap-1.5 text-[12px] text-[#4CAF50] bg-[#E8F5E9] px-3 py-1.5 rounded-lg">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Saved!
              </span>
            )}
            {editing ? (
              <>
                <button
                  onClick={() => { setEditing(false); setError('') }}
                  className="text-[13px] text-[#888] bg-white border border-[#F0DDD5] px-4 py-2 rounded-lg font-serif cursor-pointer hover:bg-[#FDF6F2] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="text-[13px] text-white px-5 py-2 rounded-lg font-serif cursor-pointer hover:opacity-90 transition-opacity border-none disabled:opacity-60 flex items-center gap-2"
                  style={{ background: bgGradient }}
                >
                  {loading && (
                    <svg className="animate-spin" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                    </svg>
                  )}
                  Save Changes
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-2 text-[13px] text-white px-4 py-2 rounded-lg font-serif cursor-pointer hover:opacity-90 border-none transition-opacity"
                style={{ background: bgGradient }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                Edit Profile
              </button>
            )}
          </div>
        </div>

        <div className="p-6">

          {/* API error */}
          {error && (
            <div className="flex items-center gap-2 bg-[#FFEBEE] border border-[#EF9A9A] rounded-lg px-4 py-3 mb-5">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#E53935" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span className="text-[12px] text-[#E53935]">{error}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mb-4">

            {/* Name */}
            <div>
              <label className="text-[12px] text-[#888] block mb-[6px] font-serif">Full Name</label>
              <input
                value={form.name}
                onChange={set('name')}
                disabled={!editing}
                placeholder="Your full name"
                className={inputCls(!editing)}
                onFocus={e => editing && (e.target.style.borderColor = accentColor)}
                onBlur={e  => (e.target.style.borderColor = '#F0DDD5')}
              />
            </div>

            {/* Phone */}
            <div>
              <label className="text-[12px] text-[#888] block mb-[6px] font-serif">Phone</label>
              <input
                type="tel"
                inputMode="numeric"
                value={form.phonenumber}
                onChange={set('phonenumber')}
                disabled={!editing}
                placeholder="Phone number"
                className={`${inputCls(!editing)} font-numeric`}
                onFocus={e => editing && (e.target.style.borderColor = accentColor)}
                onBlur={e  => (e.target.style.borderColor = '#F0DDD5')}
              />
              {fieldErrors.phonenumber && <p className="mt-1 text-[11px] text-[#E53935] m-0">{fieldErrors.phonenumber}</p>}
            </div>

            {/* Email — read only always */}
            <div>
              <label className="text-[12px] text-[#888] block mb-[6px] font-serif">
                Email <span className="text-[10px] text-[#ccc]">(cannot change)</span>
              </label>
              <input
                value={form.email}
                disabled
                className={inputCls(true)}
              />
            </div>

            {/* DOB */}
            <div>
              <label className="text-[12px] text-[#888] block mb-[6px] font-serif">Date of Birth</label>
              <input
                type="date"
                value={form.dob}
                onChange={set('dob')}
                disabled={!editing}
                className={`${inputCls(!editing)} font-numeric`}
                onFocus={e => editing && (e.target.style.borderColor = accentColor)}
                onBlur={e  => (e.target.style.borderColor = '#F0DDD5')}
              />
              {fieldErrors.dob && <p className="mt-1 text-[11px] text-[#E53935] m-0">{fieldErrors.dob}</p>}
            </div>

            {/* Gender */}
            <div>
              <label className="text-[12px] text-[#888] block mb-[6px] font-serif">Gender</label>
              <select
                value={form.gender}
                onChange={set('gender')}
                disabled={!editing}
                className={inputCls(!editing)}
              >
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Address */}
            <div>
              <label className="text-[12px] text-[#888] block mb-[6px] font-serif">Address</label>
              <input
                value={form.address}
                onChange={set('address')}
                disabled={!editing}
                placeholder="Your address"
                className={inputCls(!editing)}
                onFocus={e => editing && (e.target.style.borderColor = accentColor)}
                onBlur={e  => (e.target.style.borderColor = '#F0DDD5')}
              />
            </div>
          </div>

          {/* Bio — full width */}
          <div>
            <label className="text-[12px] text-[#888] block mb-[6px] font-serif">Bio</label>
            <textarea
              value={form.Bio}
              onChange={set('Bio')}
              disabled={!editing}
              rows={3}
              placeholder="Write something about yourself..."
              className={`${inputCls(!editing)} resize-none`}
              onFocus={e => editing && (e.target.style.borderColor = accentColor)}
              onBlur={e  => (e.target.style.borderColor = '#F0DDD5')}
            />
          </div>

          {/* Change password hint */}
          <div className="mt-5 pt-5 border-t border-[#F9F0EC] flex items-center justify-between">
            <div>
              <p className="text-[13px] font-semibold text-[#2d2d2d] m-0 font-serif">Password</p>
              <p className="text-[12px] text-[#aaa] m-0 mt-0.5">Last changed — contact admin to reset</p>
            </div>
            <button
              disabled
              className="text-[12px] text-[#ccc] border border-[#F0DDD5] px-4 py-2 rounded-lg font-serif cursor-not-allowed bg-[#FDF6F2]"
            >
              Change Password
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileForm
