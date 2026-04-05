import React, { useCallback, useEffect, useState } from 'react'
import { useAppSelector } from '../../store'
import { selectUser } from '../../store/slices/authSlice'
import StaffLayout from './StaffLayout'
import {
  getAppointmentsByStaff,
  getLeavesByStaff,
  createLeave,
  deleteLeave,
  IAppointment,
  ILeave,
  LeaveType,
  LeaveStatus,
  formatDate,
  formatTime,
  STATUS_STYLE,
} from '@/api/AppointmentsApi'
import Pagination from '@/components/shared/Pagination'
import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from '@/utils/pagination'

const toStr = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function getWeekDates(base: Date): Date[] {
  const start = new Date(base)
  start.setDate(base.getDate() - base.getDay())
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    return d
  })
}

const safeGet = (obj: unknown, key: string, fallback = '-'): string => {
  try {
    if (!obj) return fallback
    if (typeof obj === 'string') return obj || fallback
    if (typeof obj === 'object' && key in obj) {
      const value = (obj as Record<string, unknown>)[key]
      return value !== null && value !== undefined && value !== '' ? String(value) : fallback
    }
    return fallback
  } catch {
    return fallback
  }
}

interface LeaveModalProps {
  staffId: string
  onClose: () => void
  onSuccess: () => void
}

const LEAVE_TYPES: { value: LeaveType; label: string; desc: string; icon: string }[] = [
  { value: 'full_day', label: 'Full Day', desc: 'Entire day off', icon: 'M' },
  { value: 'half_day_morning', label: 'Morning Half', desc: '9:00 AM - 1:00 PM', icon: 'AM' },
  { value: 'half_day_evening', label: 'Evening Half', desc: '1:00 PM - 8:00 PM', icon: 'PM' },
]

const LEAVE_STATUS_STYLE: Record<LeaveStatus, { bg: string; text: string; label: string }> = {
  pending: { bg: 'bg-[#FFF8E1]', text: 'text-[#FFA000]', label: 'Pending' },
  approved: { bg: 'bg-[#E8F5E9]', text: 'text-[#4CAF50]', label: 'Approved' },
  rejected: { bg: 'bg-[#FFEBEE]', text: 'text-[#E53935]', label: 'Rejected' },
}

const LeaveModal: React.FC<LeaveModalProps> = ({ staffId, onClose, onSuccess }) => {
  const today = toStr(new Date())
  const [date, setDate] = useState(today)
  const [type, setType] = useState<LeaveType>('full_day')
  const [reason, setReason] = useState('')
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  const handleSubmit = async () => {
    if (!date) {
      setErr('Please select a date.')
      return
    }

    setSaving(true)
    setErr('')
    try {
      await createLeave({ staffId, date, reason: reason.trim() || undefined, type })
      onSuccess()
    } catch (e: any) {
      setErr(e?.response?.data?.message || e?.message || 'Failed to apply leave')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="bg-gradient-to-r from-[#7AC49A] to-[#A8E0C4] px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[17px] font-bold text-white m-0 font-serif">Apply for Leave</h2>
              <p className="text-[12px] text-white/75 m-0 mt-0.5">Submit a leave request for admin approval</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white cursor-pointer hover:bg-white/30 transition-colors border-0"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 flex flex-col gap-5">
          <div>
            <label className="block text-[11px] uppercase tracking-[0.1em] text-[#7AC49A] font-semibold mb-2">
              Leave Date
            </label>
            <input
              type="date"
              min={today}
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full border border-[#C8E6C9] rounded-xl px-4 py-3 text-[13px] text-[#2d2d2d] font-serif focus:outline-none focus:border-[#7AC49A] focus:ring-2 focus:ring-[#7AC49A]/20 transition-all"
            />
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-[0.1em] text-[#7AC49A] font-semibold mb-2">
              Leave Type
            </label>
            <div className="flex flex-col gap-2">
              {LEAVE_TYPES.map(lt => (
                <button
                  key={lt.value}
                  onClick={() => setType(lt.value)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left cursor-pointer transition-all ${
                    type === lt.value
                      ? 'border-[#7AC49A] bg-[#E8F5E9]'
                      : 'border-[#E0E0E0] bg-white hover:border-[#C8E6C9] hover:bg-[#F0FAF4]'
                  }`}
                >
                  <span className="text-[13px] font-bold text-[#388E3C] min-w-[30px]">{lt.icon}</span>
                  <div className="flex-1">
                    <p className={`text-[13px] font-semibold m-0 font-serif ${type === lt.value ? 'text-[#388E3C]' : 'text-[#2d2d2d]'}`}>
                      {lt.label}
                    </p>
                    <p className="text-[11px] text-[#aaa] m-0">{lt.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-[0.1em] text-[#7AC49A] font-semibold mb-2">
              Reason <span className="text-[#aaa] normal-case tracking-normal font-normal">(optional)</span>
            </label>
            <textarea
              rows={3}
              placeholder="Add a reason for your leave request..."
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="w-full border border-[#C8E6C9] rounded-xl px-4 py-3 text-[13px] text-[#2d2d2d] font-serif resize-none focus:outline-none focus:border-[#7AC49A] focus:ring-2 focus:ring-[#7AC49A]/20 transition-all placeholder:text-[#ccc]"
            />
          </div>

          {err && (
            <div className="flex items-center gap-2 bg-[#FFEBEE] border border-[#FFCDD2] rounded-xl px-4 py-3">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E53935" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <p className="text-[12px] text-[#E53935] m-0">{err}</p>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-[#C8E6C9] text-[13px] text-[#7AC49A] font-serif cursor-pointer hover:bg-[#E8F5E9] transition-colors bg-white"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#7AC49A] to-[#5BAF82] text-[13px] text-white font-bold font-serif cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed border-0 shadow-[0_4px_14px_rgba(122,196,154,0.4)]"
            >
              {saving ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const AppointmentTable: React.FC<{ appointments: IAppointment[] }> = ({ appointments }) => (
  <div className="overflow-x-auto">
    <table className="min-w-full text-left">
      <thead className="bg-[#F6FBF7]">
        <tr>
          {['Time', 'Client', 'Service', 'Date', 'Amount', 'Status'].map(header => (
            <th key={header} className="px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#7AC49A]">
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {appointments.map(apt => {
          const statusStyle = STATUS_STYLE[apt.status] ?? STATUS_STYLE.pending
          return (
            <tr key={apt._id} className="border-t border-[#E8F5E9] hover:bg-[#F0FAF4] transition-colors">
              <td className="px-6 py-4 text-[13px] font-bold text-[#7AC49A] font-serif whitespace-nowrap">{formatTime(apt.startTime)}</td>
              <td className="px-6 py-4 text-[13px] text-[#2d2d2d] font-serif">{safeGet(apt.userID, 'name')}</td>
              <td className="px-6 py-4 text-[12px] text-[#666]">{safeGet(apt.services, 'name')}</td>
              <td className="px-6 py-4 text-[12px] text-[#666] whitespace-nowrap">{formatDate(apt.appointmentDate)}</td>
              <td className="px-6 py-4 text-[13px] font-bold text-[#2d2d2d] font-serif whitespace-nowrap">Rs.{apt.totalPrice.toLocaleString('en-IN')}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold capitalize ${statusStyle.bg} ${statusStyle.text}`}>
                  {apt.status}
                </span>
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  </div>
)

const LeaveTable: React.FC<{
  leaves: ILeave[]
  showAppliedDate?: boolean
  showActions?: boolean
  leaveActionLoading?: string | null
  onCancel?: (leaveId: string) => void
}> = ({ leaves, showAppliedDate = false, showActions = false, leaveActionLoading = null, onCancel }) => (
  <div className="overflow-x-auto">
    <table className="min-w-full text-left">
      <thead className="bg-[#F6FBF7]">
        <tr>
          {['Date', 'Type', 'Reason', 'Status', ...(showAppliedDate ? ['Applied On'] : []), ...(showActions ? ['Action'] : [])].map(header => (
            <th key={header} className="px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#7AC49A]">
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {leaves.map(lv => {
          const statusStyle = LEAVE_STATUS_STYLE[lv.status]
          return (
            <tr key={lv._id} className="border-t border-[#E8F5E9] hover:bg-[#F0FAF4] transition-colors">
              <td className="px-6 py-4 text-[13px] font-bold text-[#2d2d2d] font-serif whitespace-nowrap">{formatDate(lv.date)}</td>
              <td className="px-6 py-4 text-[12px] text-[#666] capitalize">{lv.type.replace(/_/g, ' ')}</td>
              <td className="px-6 py-4 text-[12px] text-[#666]">{lv.reason || '-'}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold ${statusStyle.bg} ${statusStyle.text}`}>
                  {statusStyle.label}
                </span>
              </td>
              {showAppliedDate && <td className="px-6 py-4 text-[12px] text-[#666] whitespace-nowrap">{formatDate(lv.createdAt)}</td>}
              {showActions && (
                <td className="px-6 py-4 whitespace-nowrap">
                  {lv.status === 'pending' ? (
                    <button
                      onClick={() => onCancel?.(lv._id)}
                      disabled={leaveActionLoading === lv._id}
                      className="border border-[#F5C8BC] bg-white px-3 py-1.5 rounded-lg text-[11px] text-[#E53935] font-serif cursor-pointer hover:bg-[#FFEBEE] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {leaveActionLoading === lv._id ? 'Cancelling...' : 'Cancel Request'}
                    </button>
                  ) : (
                    <span className="text-[12px] text-[#bbb]">-</span>
                  )}
                </td>
              )}
            </tr>
          )
        })}
      </tbody>
    </table>
  </div>
)

type Tab = 'dashboard' | 'schedule' | 'leaves'

const StaffDashboard: React.FC = () => {
  const user = useAppSelector(selectUser)
  const staffId = user?._id ?? ''

  const [tab, setTab] = useState<Tab>('dashboard')
  const [appointments, setAppointments] = useState<IAppointment[]>([])
  const [leaves, setLeaves] = useState<ILeave[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showLeaveModal, setShowLeaveModal] = useState(false)
  const [leaveActionLoading, setLeaveActionLoading] = useState<string | null>(null)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [todayPage, setTodayPage] = useState(1)
  const [schedulePage, setSchedulePage] = useState(1)
  const [leavePage, setLeavePage] = useState(1)
  const [appointmentPageSize, setAppointmentPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [leavePageSize, setLeavePageSize] = useState(DEFAULT_PAGE_SIZE)

  const today = new Date()
  const todayStr = toStr(today)
  const [weekBase, setWeekBase] = useState(new Date(today))
  const [selected, setSelected] = useState(todayStr)
  const weekDates = getWeekDates(weekBase)

  const fetchData = useCallback(async () => {
    if (!staffId) return

    setLoading(true)
    setError('')
    try {
      const [apts, lvs] = await Promise.all([
        getAppointmentsByStaff(staffId, { page: 1, limit: 100 }),
        getLeavesByStaff(staffId, { page: 1, limit: 100 }),
      ])
      setAppointments(apts.items)
      setLeaves(lvs.items)
    } catch (e: any) {
      setError(e?.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [staffId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const todayAppts = appointments
    .filter(a => new Date(a.appointmentDate).toDateString() === today.toDateString())
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())

  const confirmed = todayAppts.filter(a => a.status === 'confirmed').length
  const pending = todayAppts.filter(a => a.status === 'pending').length
  const completed = todayAppts.filter(a => a.status === 'completed').length
  const next = todayAppts.find(a => a.status === 'confirmed' || a.status === 'pending')

  const dayAppts = appointments
    .filter(a => new Date(a.appointmentDate).toDateString() === new Date(selected).toDateString())
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())

  const weekAppts = appointments.filter(a => weekDates.some(d => toStr(d) === toStr(new Date(a.appointmentDate))))
  const todayTotalPages = Math.max(1, Math.ceil(todayAppts.length / appointmentPageSize))
  const paginatedTodayAppts = todayAppts.slice((todayPage - 1) * appointmentPageSize, todayPage * appointmentPageSize)
  const scheduleTotalPages = Math.max(1, Math.ceil(dayAppts.length / appointmentPageSize))
  const paginatedDayAppts = dayAppts.slice((schedulePage - 1) * appointmentPageSize, schedulePage * appointmentPageSize)
  const sortedLeaves = [...leaves].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  const leaveTotalPages = Math.max(1, Math.ceil(sortedLeaves.length / leavePageSize))
  const paginatedLeaves = sortedLeaves.slice((leavePage - 1) * leavePageSize, leavePage * leavePageSize)

  useEffect(() => { setTodayPage(1) }, [appointmentPageSize, todayAppts.length])
  useEffect(() => { setSchedulePage(1) }, [appointmentPageSize, selected, dayAppts.length])
  useEffect(() => { setLeavePage(1) }, [leavePageSize, leaves.length])

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type })
    window.setTimeout(() => setToast(null), 2600)
  }

  const prevWeek = () => {
    const d = new Date(weekBase)
    d.setDate(d.getDate() - 7)
    setWeekBase(d)
  }

  const nextWeek = () => {
    const d = new Date(weekBase)
    d.setDate(d.getDate() + 7)
    setWeekBase(d)
  }

  const goToday = () => {
    setWeekBase(new Date(today))
    setSelected(todayStr)
  }

  const handleCancelLeave = async (leaveId: string) => {
    const leave = leaves.find(item => item._id === leaveId)
    if (!leave || leave.status !== 'pending') return
    if (!window.confirm('Cancel this pending leave request?')) return

    setLeaveActionLoading(leaveId)
    try {
      await deleteLeave(leaveId)
      setLeaves(prev => prev.filter(item => item._id !== leaveId))
      showToast('Leave request cancelled successfully!')
    } catch (e: any) {
      showToast(e?.response?.data?.message || e?.message || 'Failed to cancel leave request', 'error')
    } finally {
      setLeaveActionLoading(null)
    }
  }

  if (loading) {
    return (
      <StaffLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
          <div className="w-10 h-10 rounded-full border-[3px] border-[#C8E6C9] border-t-[#7AC49A] animate-spin" />
          <p className="text-[13px] text-[#aaa] font-serif">Loading your dashboard...</p>
        </div>
      </StaffLayout>
    )
  }

  if (error) {
    return (
      <StaffLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
          <p className="text-[13px] text-[#E53935] font-serif">{error}</p>
          <button onClick={fetchData} className="text-[12px] text-[#7AC49A] border border-[#7AC49A] px-4 py-2 rounded-lg font-serif cursor-pointer bg-white hover:bg-[#E8F5E9] transition-colors">
            Retry
          </button>
        </div>
      </StaffLayout>
    )
  }

  return (
    <StaffLayout>
      {toast && <div className={`fixed top-5 right-5 z-[500] flex items-center gap-2 px-4 py-3 rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.15)] text-white text-[12px] font-serif ${toast.type === 'success' ? 'bg-[#4CAF50]' : 'bg-[#E53935]'}`}>{toast.msg}</div>}
      {showLeaveModal && <LeaveModal staffId={staffId} onClose={() => setShowLeaveModal(false)} onSuccess={() => { setShowLeaveModal(false); fetchData(); setTab('leaves') }} />}

      <div className="flex items-start justify-between mb-7">
        <div>
          <h1 className="text-[22px] font-bold text-[#2d2d2d] m-0 font-serif">
            Good {today.getHours() < 12 ? 'Morning' : today.getHours() < 17 ? 'Afternoon' : 'Evening'},{' '}
            {user?.name?.split(' ')[0] ?? 'Provider'}
          </h1>
          <p className="text-[13px] text-[#7AC49A] mt-1 mb-0">
            {today.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <button onClick={() => setShowLeaveModal(true)} className="flex items-center gap-2 bg-gradient-to-r from-[#7AC49A] to-[#5BAF82] text-white text-[13px] font-bold font-serif px-5 py-2.5 rounded-xl cursor-pointer hover:opacity-90 transition-opacity border-0 shadow-[0_4px_14px_rgba(122,196,154,0.35)]">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="12" y1="18" x2="12" y2="12" />
            <line x1="9" y1="15" x2="15" y2="15" />
          </svg>
          Apply Leave
        </button>
      </div>

      <div className="flex gap-1 mb-6 bg-[#F0FAF4] rounded-xl p-1 w-fit">
        {([
          { key: 'dashboard', label: 'Dashboard' },
          { key: 'schedule', label: 'My Schedule' },
          { key: 'leaves', label: 'My Leaves' },
        ] as { key: Tab; label: string }[]).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-5 py-2 rounded-lg text-[13px] font-serif cursor-pointer transition-all border-0 ${tab === key ? 'bg-white text-[#388E3C] font-bold shadow-sm' : 'text-[#7AC49A] bg-transparent hover:text-[#388E3C]'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'dashboard' && (
        <>
          {next && (
            <div className="rounded-xl px-6 py-4 mb-6 flex items-center justify-between" style={{ background: 'linear-gradient(135deg,#7AC49A,#A8E0C4)' }}>
              <div>
                <p className="text-[11px] text-white/75 uppercase tracking-[0.12em] m-0 mb-1">Next Appointment</p>
                <p className="text-[16px] font-bold text-white m-0 font-serif">{safeGet(next.userID, 'name')}</p>
                <p className="text-[12px] text-white/80 m-0">{safeGet(next.services, 'name')} | {formatTime(next.startTime)}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
            </div>
          )}

          <div className="grid grid-cols-4 gap-4 mb-7">
            {[
              { label: 'Total Today', value: todayAppts.length, bg: 'bg-[#E8F5E9]', text: 'text-[#7AC49A]' },
              { label: 'Confirmed', value: confirmed, bg: 'bg-[#E8F5E9]', text: 'text-[#4CAF50]' },
              { label: 'Pending', value: pending, bg: 'bg-[#FFF8E1]', text: 'text-[#FFA000]' },
              { label: 'Completed', value: completed, bg: 'bg-[#EDE7F6]', text: 'text-[#7B1FA2]' },
            ].map(({ label, value, bg, text }) => (
              <div key={label} className="bg-white rounded-lg px-5 py-[18px] border border-[#C8E6C9] shadow-[0_2px_12px_rgba(122,196,154,0.08)] flex items-center gap-[14px]">
                <div className={`w-[42px] h-[42px] rounded-[10px] ${bg} flex items-center justify-center`}>
                  <span className={`text-[18px] font-bold font-serif ${text}`}>{value}</span>
                </div>
                <p className="text-[12px] text-[#aaa] m-0 leading-[1.4]">{label}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl border border-[#C8E6C9] overflow-hidden shadow-[0_2px_12px_rgba(122,196,154,0.06)]">
            <div className="px-6 py-4 border-b border-[#E8F5E9] flex items-center justify-between">
              <h3 className="text-[14px] font-bold text-[#2d2d2d] m-0 font-serif">Today's Appointments</h3>
              <span className="text-[12px] text-[#7AC49A] bg-[#E8F5E9] px-3 py-1 rounded-full">{todayAppts.length} total</span>
            </div>
            {todayAppts.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-[14px] text-[#aaa] m-0 font-serif">No appointments scheduled for today.</p>
              </div>
            ) : (
              <AppointmentTable appointments={paginatedTodayAppts} />
            )}
            {todayAppts.length > 0 && (
              <Pagination
                currentPage={todayPage}
                totalPages={todayTotalPages}
                totalItems={todayAppts.length}
                pageSize={appointmentPageSize}
                itemLabel="today's appointments"
                onPageChange={setTodayPage}
                onPageSizeChange={nextPageSize => {
                  setAppointmentPageSize(nextPageSize)
                  setTodayPage(1)
                }}
                pageSizeOptions={PAGE_SIZE_OPTIONS}
              />
            )}
          </div>

          {leaves.length > 0 && (
            <div className="mt-6 bg-white rounded-xl border border-[#C8E6C9] overflow-hidden shadow-[0_2px_12px_rgba(122,196,154,0.06)]">
              <div className="px-6 py-4 border-b border-[#E8F5E9] flex items-center justify-between">
                <h3 className="text-[14px] font-bold text-[#2d2d2d] m-0 font-serif">Recent Leave Requests</h3>
                <button onClick={() => setTab('leaves')} className="text-[12px] text-[#7AC49A] bg-[#E8F5E9] border-0 px-3 py-1 rounded-full cursor-pointer hover:bg-[#C8E6C9] transition-colors">
                  View All
                </button>
              </div>
              <LeaveTable leaves={sortedLeaves.slice(0, 3)} />
            </div>
          )}
        </>
      )}

      {tab === 'schedule' && (
        <>
          <div className="flex items-center justify-between mb-5">
            <p className="text-[13px] text-[#7AC49A] m-0">
              {MONTHS[weekDates[0].getMonth()]} {weekDates[0].getDate()} - {MONTHS[weekDates[6].getMonth()]} {weekDates[6].getDate()}, {weekDates[0].getFullYear()}
            </p>
            <div className="flex items-center gap-2">
              <button onClick={goToday} className="text-[12px] text-[#7AC49A] bg-[#E8F5E9] border border-[#C8E6C9] px-4 py-2 rounded-lg font-serif cursor-pointer hover:bg-[#C8E6C9] transition-colors">Today</button>
              {[prevWeek, nextWeek].map((fn, i) => (
                <button key={i} onClick={fn} className="w-9 h-9 flex items-center justify-center bg-white border border-[#C8E6C9] rounded-lg cursor-pointer text-[#7AC49A] hover:bg-[#E8F5E9] transition-colors">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                    <polyline points={i === 0 ? '15 18 9 12 15 6' : '9 18 15 12 9 6'} />
                  </svg>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3 mb-5">
            {[
              { label: 'This Week', value: weekAppts.length, bg: 'bg-[#E8F5E9]', color: 'text-[#7AC49A]' },
              { label: 'Confirmed', value: weekAppts.filter(a => a.status === 'confirmed').length, bg: 'bg-[#E8F5E9]', color: 'text-[#4CAF50]' },
              { label: 'Pending', value: weekAppts.filter(a => a.status === 'pending').length, bg: 'bg-[#FFF8E1]', color: 'text-[#FFA000]' },
              { label: 'Completed', value: weekAppts.filter(a => a.status === 'completed').length, bg: 'bg-[#EDE7F6]', color: 'text-[#7B1FA2]' },
            ].map(({ label, value, bg, color }) => (
              <div key={label} className="bg-white rounded-lg px-5 py-4 border border-[#C8E6C9] shadow-[0_2px_8px_rgba(122,196,154,0.07)] flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center`}>
                  <span className={`text-[17px] font-bold font-serif ${color}`}>{value}</span>
                </div>
                <p className="text-[12px] text-[#aaa] m-0">{label}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl border border-[#C8E6C9] mb-6 overflow-hidden shadow-[0_2px_12px_rgba(122,196,154,0.06)]">
            <div className="grid grid-cols-7">
              {weekDates.map((d, i) => {
                const str = toStr(d)
                const isToday = str === todayStr
                const isSelected = str === selected
                const dayCount = appointments.filter(a => new Date(a.appointmentDate).toDateString() === d.toDateString()).length

                return (
                  <button
                    key={i}
                    onClick={() => setSelected(str)}
                    className={`flex flex-col items-center py-4 border-r last:border-r-0 border-[#E8F5E9] cursor-pointer transition-all ${isSelected ? 'bg-[#7AC49A]' : isToday ? 'bg-[#E8F5E9]' : 'bg-white hover:bg-[#F0FAF4]'}`}
                  >
                    <span className={`text-[10px] uppercase tracking-[0.1em] mb-1 ${isSelected ? 'text-white/70' : 'text-[#aaa]'}`}>{DAYS[d.getDay()]}</span>
                    <span className={`text-[16px] font-bold font-serif ${isSelected ? 'text-white' : isToday ? 'text-[#7AC49A]' : 'text-[#2d2d2d]'}`}>{d.getDate()}</span>
                    {dayCount > 0 ? (
                      <span className={`mt-1.5 text-[10px] px-2 py-0.5 rounded-full font-semibold ${isSelected ? 'bg-white/30 text-white' : 'bg-[#C8E6C9] text-[#7AC49A]'}`}>{dayCount}</span>
                    ) : (
                      <span className="mt-1.5 h-[18px]" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[15px] font-bold text-[#2d2d2d] m-0 font-serif">{selected === todayStr ? "Today's Appointments" : `Appointments - ${formatDate(selected)}`}</h3>
            <span className="text-[12px] text-[#7AC49A] bg-[#E8F5E9] px-3 py-1 rounded-full">{dayAppts.length} appointment{dayAppts.length !== 1 ? 's' : ''}</span>
          </div>

          {dayAppts.length === 0 ? (
            <div className="bg-white rounded-xl border border-[#C8E6C9] p-12 text-center">
              <div className="w-14 h-14 rounded-full bg-[#E8F5E9] flex items-center justify-center mx-auto mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7AC49A" strokeWidth="1.6" strokeLinecap="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <p className="text-[14px] text-[#aaa] m-0 font-serif">No appointments scheduled for this day</p>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-xl border border-[#C8E6C9] overflow-hidden shadow-[0_2px_12px_rgba(122,196,154,0.06)] mb-4">
                <div className="px-6 py-4 border-b border-[#E8F5E9]">
                  <h3 className="text-[14px] font-bold text-[#2d2d2d] m-0 font-serif">Selected Day Schedule</h3>
                </div>
                <AppointmentTable appointments={paginatedDayAppts} />
              </div>
              <Pagination
                currentPage={schedulePage}
                totalPages={scheduleTotalPages}
                totalItems={dayAppts.length}
                pageSize={appointmentPageSize}
                itemLabel="selected day appointments"
                onPageChange={setSchedulePage}
                onPageSizeChange={nextPageSize => {
                  setAppointmentPageSize(nextPageSize)
                  setSchedulePage(1)
                }}
                pageSizeOptions={PAGE_SIZE_OPTIONS}
              />
            </>
          )}
        </>
      )}

      {tab === 'leaves' && (
        <>
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: 'Total Requests', value: leaves.length, bg: 'bg-[#E8F5E9]', color: 'text-[#7AC49A]' },
              { label: 'Approved', value: leaves.filter(l => l.status === 'approved').length, bg: 'bg-[#E8F5E9]', color: 'text-[#4CAF50]' },
              { label: 'Pending', value: leaves.filter(l => l.status === 'pending').length, bg: 'bg-[#FFF8E1]', color: 'text-[#FFA000]' },
            ].map(({ label, value, bg, color }) => (
              <div key={label} className="bg-white rounded-lg px-5 py-4 border border-[#C8E6C9] shadow-[0_2px_8px_rgba(122,196,154,0.07)] flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center`}>
                  <span className={`text-[17px] font-bold font-serif ${color}`}>{value}</span>
                </div>
                <p className="text-[12px] text-[#aaa] m-0">{label}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl border border-[#C8E6C9] overflow-hidden shadow-[0_2px_12px_rgba(122,196,154,0.06)]">
            <div className="px-6 py-4 border-b border-[#E8F5E9] flex items-center justify-between">
              <h3 className="text-[14px] font-bold text-[#2d2d2d] m-0 font-serif">My Leave Requests</h3>
              <button onClick={() => setShowLeaveModal(true)} className="flex items-center gap-1.5 bg-[#E8F5E9] border border-[#C8E6C9] text-[#388E3C] text-[12px] font-serif px-4 py-2 rounded-lg cursor-pointer hover:bg-[#C8E6C9] transition-colors">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                New Request
              </button>
            </div>

            {leaves.length === 0 ? (
              <div className="py-14 text-center">
                <div className="w-14 h-14 rounded-full bg-[#E8F5E9] flex items-center justify-center mx-auto mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7AC49A" strokeWidth="1.6" strokeLinecap="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="12" y1="18" x2="12" y2="12" />
                    <line x1="9" y1="15" x2="15" y2="15" />
                  </svg>
                </div>
                <p className="text-[14px] text-[#aaa] m-0 font-serif">No leave requests yet.</p>
                <button onClick={() => setShowLeaveModal(true)} className="mt-4 text-[12px] text-[#7AC49A] border border-[#C8E6C9] px-4 py-2 rounded-lg font-serif cursor-pointer hover:bg-[#E8F5E9] transition-colors bg-white">
                  Apply for Leave
                </button>
              </div>
            ) : (
              <LeaveTable leaves={paginatedLeaves} showAppliedDate showActions leaveActionLoading={leaveActionLoading} onCancel={handleCancelLeave} />
            )}

            {leaves.length > 0 && (
              <Pagination
                currentPage={leavePage}
                totalPages={leaveTotalPages}
                totalItems={leaves.length}
                pageSize={leavePageSize}
                itemLabel="leave requests"
                onPageChange={setLeavePage}
                onPageSizeChange={nextPageSize => {
                  setLeavePageSize(nextPageSize)
                  setLeavePage(1)
                }}
                pageSizeOptions={PAGE_SIZE_OPTIONS}
              />
            )}
          </div>
        </>
      )}
    </StaffLayout>
  )
}

export default StaffDashboard
