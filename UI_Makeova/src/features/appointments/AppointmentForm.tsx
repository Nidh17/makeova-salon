import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useAppSelector } from '../../store'
import { selectUser } from '../../store/slices/authSlice'
import type { IUser } from '../../types'
import { getAllServices, type IService } from '../../api/services/servicesApi'
import {
  createAppointment,
  getAllAppointments,
  getAllLeaves,
  TIME_SLOTS,
  type IAppointment,
  type ILeave,
} from '@/api/AppointmentsApi'
import { filterUsersByRole, getAllUsers } from '@/api/Userapi'
import { getBookedCount, getWorkingDayLabel, hasConflict, hasCustomerConflict, isOnLeave, isPastSlot, isWorkingOnDate } from './appointmentUtils'

interface BookAppointmentFormProps {
  onSuccess: () => void
  onCancel: () => void
  preStaffId?: string
}

interface PickerProps {
  label: string
  required?: boolean
  options: IUser[]
  selectedId: string
  query: string
  onQueryChange: (value: string) => void
  onSelect: (user: IUser) => void
  error?: string
  placeholder: string
  emptyMessage: string
  renderMeta?: (user: IUser) => string
}

const DetailPopover: React.FC<{
  user: IUser
  onClose: () => void
  bookedToday?: number
  isOnLeaveToday?: boolean
}> = ({ user, onClose, bookedToday, isOnLeaveToday }) => {
  const rows: Array<[string, string]> = [
    ['Phone', user.phonenumber || '--'],
    ['Email', user.email || '--'],
    ['Status', user.isAvailable ? 'Active' : 'Unavailable'],
  ]

  if (bookedToday !== undefined) {
    rows.splice(2, 0, ['Bookings Today', `${bookedToday}`])
  }

  if (isOnLeaveToday !== undefined) {
    rows.splice(3, 0, ['Leave Today', isOnLeaveToday ? 'On Leave' : 'Working'])
  }

  if (user.WorkingDay) {
    rows.push(['Working Days', getWorkingDayLabel(user.WorkingDay)])
  }

  return (
    <div
      className="absolute left-0 top-full z-50 mt-2 w-full rounded-2xl border border-[#F0DDD5] bg-white p-4 shadow-[0_12px_32px_rgba(196,154,122,0.18)]"
      onClick={e => e.stopPropagation()}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="m-0 text-[13px] font-bold text-[#2d2d2d] font-serif">{user.name}</p>
          <p className="m-0 mt-1 text-[11px] text-[#8D7B70] font-serif">Customer details from API</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="h-7 w-7 rounded-full border-none bg-[#FDF6F2] text-[#9E7E65] cursor-pointer"
        >
          x
        </button>
      </div>

      <div className="space-y-2 border-t border-[#F7ECE5] pt-3">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-3">
            <span className="text-[11px] text-[#8D7B70] font-serif">{label}</span>
            <span className="text-right text-[11px] font-semibold text-[#2d2d2d] font-serif">{value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const UserPicker: React.FC<PickerProps> = ({
  label,
  required,
  options,
  selectedId,
  query,
  onQueryChange,
  onSelect,
  error,
  placeholder,
  emptyMessage,
  renderMeta,
}) => {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase()
    if (!search) return options

    const matchesSelectedLabel = options.some(user =>
      user._id === selectedId && user.name?.trim().toLowerCase() === search
    )

    if (matchesSelectedLabel) return options

    return options.filter(user =>
      user.name?.toLowerCase().includes(search) ||
      user.email?.toLowerCase().includes(search) ||
      user.phonenumber?.includes(query.trim())
    )
  }, [options, query])

  return (
    <div ref={ref} className="relative">
      <label className="mb-[5px] block text-[12px] text-[#888] font-serif">
        {label}{required ? ' *' : ''}
      </label>

      <div className="relative">
        <input
          value={query}
          onChange={event => {
            onQueryChange(event.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className={`w-full rounded-[10px] border-2 bg-white px-3 py-[10px] pr-9 text-[13px] font-serif outline-none transition-all ${
            error ? 'border-[#EF9A9A]' : 'border-[#F0DDD5] focus:border-[#C49A7A]'
          }`}
          autoComplete="off"
        />
        <svg
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#C49A7A"
          strokeWidth="2"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>

      {open && (
        <div className="absolute top-full z-40 mt-2 max-h-[220px] w-full overflow-y-auto rounded-2xl border border-[#F0DDD5] bg-white shadow-[0_8px_24px_rgba(196,154,122,0.14)]">
          {filtered.length === 0 ? (
            <div className="px-4 py-4 text-center text-[12px] text-[#8D7B70] font-serif">{emptyMessage}</div>
          ) : (
            filtered.map(user => {
              const active = user._id === selectedId

              return (
                <button
                  key={user._id}
                  type="button"
                  onClick={() => {
                    onSelect(user)
                    setOpen(false)
                  }}
                  className={`flex w-full items-center justify-between gap-3 border-none px-3 py-3 text-left transition-colors cursor-pointer ${
                    active ? 'bg-[#FDF0EB]' : 'bg-white hover:bg-[#FDFAF8]'
                  }`}
                >
                  <div className="min-w-0">
                    <p className="m-0 truncate text-[12px] font-semibold text-[#2d2d2d] font-serif">{user.name}</p>
                    <p className="m-0 mt-1 truncate text-[10px] text-[#8D7B70] font-serif">
                      {renderMeta ? renderMeta(user) : user.phonenumber || user.email}
                    </p>
                  </div>
                  <span className="rounded-full bg-[#FDF6F2] px-2 py-1 text-[10px] text-[#9E7E65] font-serif">Select</span>
                </button>
              )
            })
          )}
        </div>
      )}

      {error && <p className="m-0 mt-1 text-[11px] text-[#E53935]">{error}</p>}
    </div>
  )
}

const BookAppointmentForm: React.FC<BookAppointmentFormProps> = ({ onSuccess, onCancel, preStaffId }) => {
  const currentUser = useAppSelector(selectUser)

  const [customers, setCustomers] = useState<IUser[]>([])
  const [staffList, setStaffList] = useState<IUser[]>([])
  const [services, setServices] = useState<IService[]>([])
  const [appointments, setAppointments] = useState<IAppointment[]>([])
  const [leaves, setLeaves] = useState<ILeave[]>([])
  const [dataLoading, setDataLoading] = useState(true)

  const [customerId, setCustomerId] = useState('')
  const [customerQuery, setCustomerQuery] = useState('')
  const [staffId, setStaffId] = useState('')
  const [staffQuery, setStaffQuery] = useState('')
  const [serviceId, setServiceId] = useState('')
  const [date, setDate] = useState('')
  const [slot, setSlot] = useState('')
  const [note, setNote] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [apiErr, setApiErr] = useState('')
  const [detailUser, setDetailUser] = useState<IUser | null>(null)

  const selectedService = services.find(service => service._id === serviceId)
  const selectedCustomer = customers.find(customer => customer._id === customerId)
  const selectedStaff = staffList.find(staff => staff._id === staffId)
  const duration = selectedService?.duration ?? 0
  const totalPrice = selectedService?.price ?? 0

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setDataLoading(true)
      setApiErr('')

      try {
        const [allUsers, serviceList, allAppointments, leaveList] = await Promise.all([
          getAllUsers({ page: 1, limit: 500 }),
          getAllServices({ page: 1, limit: 500 }),
          getAllAppointments({ page: 1, limit: 1000 }),
          getAllLeaves({ page: 1, limit: 500 }),
        ])

        const customerList = filterUsersByRole(allUsers.items, 'customer')
        const staffUsers = filterUsersByRole(allUsers.items, 'staff').filter(user => user.isAvailable)

        if (cancelled) return

        setCustomers(customerList)
        setStaffList(staffUsers)
        setServices(serviceList.items.filter(service => service.isActive))
        setAppointments(allAppointments.items)
        setLeaves(leaveList.items)

        if (preStaffId) {
          const matchedStaff = staffUsers.find(staff => staff._id === preStaffId)
          if (matchedStaff) {
            setStaffId(matchedStaff._id)
            setStaffQuery(matchedStaff.name)
          }
        }
      } catch (error) {
        if (!cancelled) {
          setApiErr(error instanceof Error ? error.message : 'Failed to load booking data')
        }
      } finally {
        if (!cancelled) {
          setDataLoading(false)
        }
      }
    }

    void load()
    const intervalId = window.setInterval(() => {
      void load()
    }, 30000)

    return () => {
      cancelled = true
      window.clearInterval(intervalId)
    }
  }, [preStaffId])

  const availableStaff = useMemo(() => {
    return staffList.filter(staff => {
      if (!date) return true
      if (!isWorkingOnDate(staff, date)) return false
      if (isOnLeave(staff._id, date, leaves)) return false
      return true
    })
  }, [date, leaves, staffList])

  const validate = (): boolean => {
    const nextErrors: Record<string, string> = {}

    if (!customerId) nextErrors.customerId = 'Select a customer from API data'
    if (!staffId) nextErrors.staffId = 'Select an available provider'
    if (!serviceId) nextErrors.serviceId = 'Select a service'
    if (!date) nextErrors.date = 'Select an appointment date'
    if (!slot) nextErrors.slot = 'Select a time slot'
    if (date && slot && isPastSlot(date, slot)) nextErrors.slot = 'This time slot has already passed'
    if (customerId && date && slot && duration > 0 && hasCustomerConflict(customerId, date, slot, appointments, duration)) {
      nextErrors.slot = 'This customer already has another appointment at this time'
    }
    if (staffId && date && slot && duration > 0 && hasConflict(staffId, date, slot, appointments, duration)) {
      nextErrors.slot = 'This provider is already booked for this time'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const getEndTime = (): string => {
    const start = new Date(`${date}T${slot}:00`)
    return new Date(start.getTime() + duration * 60000).toISOString()
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!validate() || !currentUser) return

    setLoading(true)
    setApiErr('')

    try {
      await createAppointment({
        userID: customerId,
        staffID: staffId,
        receptionistId: currentUser._id,
        services: serviceId,
        appointmentDate: new Date(date).toISOString(),
        startTime: new Date(`${date}T${slot}:00`).toISOString(),
        endTime: getEndTime(),
        totalPrice,
        note: note.trim() || undefined,
        status: 'pending',
      })

      onSuccess()
    } catch (error) {
      setApiErr(error instanceof Error ? error.message : 'Failed to book appointment')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = (error?: string) =>
    `w-full rounded-[10px] border-2 bg-white px-3 py-[10px] text-[13px] font-serif outline-none transition-all ${
      error ? 'border-[#EF9A9A]' : 'border-[#F0DDD5] focus:border-[#C49A7A]'
    }`

  if (dataLoading) {
    return (
      <div className="flex flex-col items-center gap-3 py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-[#F0DDD5] border-t-[#C49A7A]" />
        <p className="text-[13px] text-[#8D7B70] font-serif">Loading appointment data...</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5" onClick={() => setDetailUser(null)}>
      {apiErr && (
        <div className="flex items-center gap-2 rounded-xl border border-[#EF9A9A] bg-[#FFEBEE] px-4 py-3">
          <span className="text-[12px] text-[#E53935] font-serif">{apiErr}</span>
        </div>
      )}

      {/* <div className="rounded-2xl border border-[#F0DDD5] bg-[#FDF8F5] p-4">
        <p className="m-0 text-[12px] font-bold uppercase tracking-[0.08em] text-[#C49A7A] font-serif">API Booking</p>
        <p className="m-0 mt-2 text-[12px] text-[#8D7B70] font-serif">
          Customers, providers, and services now come from live API data only.
        </p>
      </div> */}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="relative" onClick={e => e.stopPropagation()}>
          <UserPicker
            label="Customer"
            required
            options={customers}
            selectedId={customerId}
            query={customerQuery}
            onQueryChange={value => {
              setCustomerQuery(value)
              if (selectedCustomer?.name !== value) {
                setCustomerId('')
              }
              setErrors(prev => ({ ...prev, customerId: '' }))
            }}
            onSelect={user => {
              setCustomerId(user._id)
              setCustomerQuery(user.name)
              setErrors(prev => ({ ...prev, customerId: '' }))
            }}
            error={errors.customerId}
            placeholder="Search customer by name, phone, or email"
            emptyMessage="No customer found. Create the customer first, then book the appointment."
          />

          {selectedCustomer && detailUser?._id === selectedCustomer._id && (
            <DetailPopover user={detailUser} onClose={() => setDetailUser(null)} />
          )}

          {selectedCustomer && (
            <button
              type="button"
              onClick={() => setDetailUser(selectedCustomer)}
              className="mt-2 border-none bg-transparent p-0 text-[11px] text-[#C49A7A] underline cursor-pointer font-serif"
            >
              View selected customer details
            </button>
          )}
        </div>

        <div>
          <label className="mb-[5px] block text-[12px] text-[#888] font-serif">Service *</label>
          <select
            value={serviceId}
            onChange={event => {
              setServiceId(event.target.value)
              setSlot('')
              setErrors(prev => ({ ...prev, serviceId: '' }))
            }}
            className={inputClass(errors.serviceId)}
          >
            <option value="">Select service</option>
            {services.map(service => (
              <option key={service._id} value={service._id}>
                {service.name} - Rs {service.price} ({service.duration} min)
              </option>
            ))}
          </select>
          {errors.serviceId && <p className="m-0 mt-1 text-[11px] text-[#E53935]">{errors.serviceId}</p>}
        </div>

        <div>
          <label className="mb-[5px] block text-[12px] text-[#888] font-serif">Date *</label>
          <input
            type="date"
            value={date}
            min={new Date().toISOString().split('T')[0]}
            onChange={event => {
              const nextDate = event.target.value
              setDate(nextDate)
              setSlot('')
              setErrors(prev => ({ ...prev, date: '' }))

              if (staffId && nextDate && isOnLeave(staffId, nextDate, leaves)) {
                setStaffId('')
                setStaffQuery('')
              }
            }}
            className={inputClass(errors.date)}
          />
          {errors.date && <p className="m-0 mt-1 text-[11px] text-[#E53935]">{errors.date}</p>}
        </div>

        <div className="relative" onClick={e => e.stopPropagation()}>
          <UserPicker
            label="Provider"
            required
            options={availableStaff}
            selectedId={staffId}
            query={staffQuery}
            onQueryChange={value => {
              setStaffQuery(value)
              if (selectedStaff?.name !== value) {
                setStaffId('')
                setSlot('')
              }
              setErrors(prev => ({ ...prev, staffId: '' }))
            }}
            onSelect={user => {
              setStaffId(user._id)
              setStaffQuery(user.name)
              setSlot('')
              setErrors(prev => ({ ...prev, staffId: '' }))
            }}
            error={errors.staffId}
            placeholder={date ? 'Search available provider' : 'Select a date first'}
            emptyMessage={date ? 'No provider is working or available on this date' : 'Select a date to load provider availability'}
            renderMeta={user => {
              const booked = date ? getBookedCount(user._id, date, appointments) : 0
              return date
                ? `${getWorkingDayLabel(user.WorkingDay)} · ${booked} booking(s)`
                : `${getWorkingDayLabel(user.WorkingDay)} · ${user.email}`
            }}
          />

          {selectedStaff && detailUser?._id === selectedStaff._id && (
            <DetailPopover
              user={detailUser}
              onClose={() => setDetailUser(null)}
              bookedToday={date ? getBookedCount(detailUser._id, date, appointments) : undefined}
              isOnLeaveToday={date ? isOnLeave(detailUser._id, date, leaves) : undefined}
            />
          )}

          {selectedStaff && (
            <button
              type="button"
              onClick={() => setDetailUser(selectedStaff)}
              className="mt-2 border-none bg-transparent p-0 text-[11px] text-[#C49A7A] underline cursor-pointer font-serif"
            >
              View selected provider details
            </button>
          )}
        </div>
      </div>

      {staffId && date && serviceId && (
        <div>
          <div className="mb-3 flex items-center justify-between gap-3">
            <label className="text-[12px] text-[#888] font-serif">Time Slot *</label>
            <span className="text-[11px] text-[#C49A7A] font-serif">{duration} min session</span>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
            {TIME_SLOTS.map(time => {
              const providerConflict = hasConflict(staffId, date, time, appointments, duration)
              const customerConflict = customerId ? hasCustomerConflict(customerId, date, time, appointments, duration) : false
              const pastSlot = isPastSlot(date, time)
              const blocked = providerConflict || customerConflict || pastSlot
              const selected = slot === time

              return (
                <button
                  key={time}
                  type="button"
                  disabled={blocked}
                  onClick={() => {
                    setSlot(time)
                    setErrors(prev => ({ ...prev, slot: '' }))
                  }}
                  className={`rounded-lg border-2 py-2 text-[12px] font-serif transition-all ${
                    blocked
                      ? 'cursor-not-allowed border-[#EF9A9A] bg-[#FFEBEE] text-[#E53935] opacity-70'
                      : selected
                        ? 'border-[#C49A7A] bg-[#C49A7A] text-white'
                        : 'border-[#F0DDD5] bg-white text-[#666] hover:border-[#C49A7A]'
                  }`}
                >
                  {time}
                </button>
              )
            })}
          </div>

          {(customerId || staffId) && (
            <p className="m-0 mt-2 text-[11px] text-[#8D7B70] font-serif">
              Available  slots
            </p>
          )}

          {errors.slot && <p className="m-0 mt-2 text-[11px] text-[#E53935]">{errors.slot}</p>}
        </div>
      )}

      {selectedCustomer && selectedStaff && selectedService && date && slot && (
        <div className="rounded-2xl border border-[#F0DDD5] bg-[#FDF6F2] p-4">
          <p className="m-0 mb-3 text-[12px] font-bold uppercase tracking-[0.08em] text-[#C49A7A] font-serif">Booking Summary</p>
          <div className="grid grid-cols-1 gap-2 text-[12px] text-[#2d2d2d] font-serif sm:grid-cols-2">
            <span>Customer: {selectedCustomer.name}</span>
            <span>Provider: {selectedStaff.name}</span>
            <span>Service: {selectedService.name}</span>
            <span>Amount: Rs {totalPrice.toLocaleString()}</span>
            <span>Date: {new Date(date).toLocaleDateString('en-IN')}</span>
            <span>Time: {slot}</span>
          </div>
        </div>
      )}

      <div>
        <label className="mb-[5px] block text-[12px] text-[#888] font-serif">Note</label>
        <textarea
          value={note}
          onChange={event => setNote(event.target.value)}
          rows={3}
          placeholder="Add booking notes if needed"
          className="w-full rounded-[10px] border-2 border-[#F0DDD5] bg-white px-3 py-[10px] text-[13px] font-serif outline-none transition-all focus:border-[#C49A7A] resize-none"
        />
      </div>

      <div className="flex flex-col gap-3 border-t border-[#F7ECE5] pt-4 sm:flex-row">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-xl border-2 border-[#F0DDD5] bg-white py-[11px] text-[13px] text-[#888] font-serif cursor-pointer hover:bg-[#FDF6F2]"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border-none py-[11px] text-[13px] font-semibold text-white font-serif cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg,#C49A7A,#E8B89A)' }}
        >
          {loading ? 'Booking...' : 'Book Appointment'}
        </button>
      </div>
    </form>
  )
}

export default BookAppointmentForm
