import { IService, ServiceFormData } from '@/api/services/servicesApi'
import React, { useState, useEffect } from 'react'


interface ServiceFormProps {
  mode:      'create' | 'edit'
  initial?:  IService
  onSubmit:  (data: ServiceFormData) => Promise<void>
  onCancel:  () => void
}

const EMPTY: ServiceFormData = {
  name:        '',
  description: '',
  price:       '',
  duration:    '',
  isActive:    true,
}

const ServiceForm: React.FC<ServiceFormProps> = ({ mode, initial, onSubmit, onCancel }) => {
  const [form,    setForm]    = useState<ServiceFormData>(EMPTY)
  const [errors,  setErrors]  = useState<Partial<Record<keyof ServiceFormData, string>>>({})
  const [loading, setLoading] = useState(false)
  const [apiErr,  setApiErr]  = useState('')

  // Populate form when editing
  useEffect(() => {
    if (initial) {
      setForm({
        name:        initial.name,
        description: initial.description,
        price:       String(initial.price),
        duration:    String(initial.duration),
        isActive:    initial.isActive,
      })
    } else {
      setForm(EMPTY)
    }
  }, [initial])

  const set = (key: keyof ServiceFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setErrors(p => ({ ...p, [key]: '' }))
      setApiErr('')
      setForm(p => ({
        ...p,
        [key]: e.type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : e.target.value,
      }))
    }

  const validate = (): boolean => {
    const e: typeof errors = {}
    if (!form.name.trim())                        e.name        = 'Name is required'
    if (!form.description.trim())                 e.description = 'Description is required'
    if (!form.price || isNaN(Number(form.price))) e.price       = 'Valid price is required'
    if (Number(form.price) <= 0)                  e.price       = 'Price must be greater than 0'
    if (!form.duration || isNaN(Number(form.duration))) e.duration = 'Valid duration is required'
    if (Number(form.duration) <= 0)               e.duration    = 'Duration must be greater than 0'
   
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

  const inputCls = (field: keyof ServiceFormData) =>
    `w-full px-3 py-[10px] border-2 rounded-[10px] text-[13px] text-[#2d2d2d] outline-none transition-all bg-white font-serif
    ${errors[field]
      ? 'border-[#EF9A9A] focus:border-[#E53935]'
      : 'border-[#F0DDD5] focus:border-[#C49A7A]'
    }`

  return (
    <form onSubmit={handleSubmit} noValidate>

      {apiErr && (
        <div className="flex items-center gap-2 bg-[#FFEBEE] border border-[#EF9A9A] rounded-xl px-4 py-3 mb-5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E53935" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span className="text-[12px] text-[#E53935]">{apiErr}</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">

        {/* Name */}
        <div className="col-span-2">
          <label className="text-[12px] text-[#888] block mb-[5px] font-serif">Service Name *</label>
          <input
            value={form.name as string}
            onChange={set('name')}
            placeholder="e.g. Gold Facial"
            className={inputCls('name')}
          />
          {errors.name && <p className="text-[11px] text-[#E53935] mt-1 m-0">{errors.name}</p>}
        </div>

        {/* Description */}
        <div className="col-span-2">
          <label className="text-[12px] text-[#888] block mb-[5px] font-serif">Description *</label>
          <textarea
            value={form.description as string}
            onChange={set('description')}
            placeholder="Describe what this service includes..."
            rows={3}
            className={`${inputCls('description')} resize-none`}
          />
          {errors.description && <p className="text-[11px] text-[#E53935] mt-1 m-0">{errors.description}</p>}
        </div>

        {/* Price */}
        <div>
          <label className="text-[12px] text-[#888] block mb-[5px] font-serif">Price (₹) *</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C49A7A] text-[13px] font-semibold pointer-events-none">₹</span>
            <input
              type="number"
              min="0"
              value={form.price as string}
              onChange={set('price')}
              placeholder="0"
              className={`${inputCls('price')} pl-7`}
            />
          </div>
          {errors.price && <p className="text-[11px] text-[#E53935] mt-1 m-0">{errors.price}</p>}
        </div>

        {/* Duration */}
        <div>
          <label className="text-[12px] text-[#888] block mb-[5px] font-serif">Duration (minutes) *</label>
          <div className="relative">
            <input
              type="number"
              min="0"
              value={form.duration as string}
              onChange={set('duration')}
              placeholder="60"
              className={`${inputCls('duration')} pr-12`}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-[#aaa] pointer-events-none">min</span>
          </div>
          {errors.duration && <p className="text-[11px] text-[#E53935] mt-1 m-0">{errors.duration}</p>}
        </div>

        {/* Image URL */}
        

        {/* isActive toggle */}
        <div className="col-span-2 flex items-center justify-between bg-[#FDF6F2] rounded-xl px-4 py-3 border border-[#F0DDD5]">
          <div>
            <p className="text-[13px] font-semibold text-[#2d2d2d] m-0 font-serif">Active Status</p>
            <p className="text-[11px] text-[#aaa] m-0 mt-0.5">Inactive services won't appear for booking</p>
          </div>
          <button
            type="button"
            onClick={() => setForm(p => ({ ...p, isActive: !p.isActive }))}
            className={`relative w-11 h-6 rounded-full transition-all duration-200 border-none cursor-pointer flex-shrink-0
              ${form.isActive ? 'bg-[#C49A7A]' : 'bg-[#E0E0E0]'}`}
          >
            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-200
              ${form.isActive ? 'left-[22px]' : 'left-0.5'}`} />
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-6 pt-5 border-t border-[#F9F0EC]">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-[11px] bg-white border-2 border-[#F0DDD5] text-[#888] text-[13px] font-serif rounded-xl cursor-pointer hover:bg-[#FDF6F2] transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-[11px] text-white text-[13px] font-semibold font-serif rounded-xl border-none cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          style={{ background: 'linear-gradient(135deg,#C49A7A,#E8B89A)' }}
        >
          {loading ? (
            <>
              <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
              {mode === 'create' ? 'Creating...' : 'Saving...'}
            </>
          ) : mode === 'create' ? '+ Create Service' : 'Save Changes'}
        </button>
      </div>
    </form>
  )
}

export default ServiceForm