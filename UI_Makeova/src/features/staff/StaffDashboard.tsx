import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppSelector } from '../../store'
import { selectUser } from '../../store/slices/authSlice'
import StaffLayout from './StaffLayout'
import {
  createLeave,
  getAppointmentsByStaff,
  getLeavesByStaff,
  IAppointment,
  ILeave,
  LeaveStatus,
  LeaveType,
  formatDate,
  formatTime,
  STATUS_STYLE,
} from '@/api/AppointmentsApi'
import Pagination from '@/components/shared/Pagination'
import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from '@/utils/pagination'
import { isWorkingOnDate } from '@/features/appointments/appointmentUtils'

const toStr = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

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
              <td className="px-6 py-4 text-[13px] font-bold text-[#2d2d2d] font-serif whitespace-nowrap">Rs {apt.totalPrice.toLocaleString('en-IN')}</td>
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

const StaffDashboard: React.FC = () => {
  const navigate = useNavigate()
  const user = useAppSelector(selectUser)
  const staffId = user?._id ?? ''
  const today = new Date()
  const todayKey = toStr(today)

  const [appointments, setAppointments] = useState<IAppointment[]>([])
  const [leaves, setLeaves] = useState<ILeave[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showLeaveModal, setShowLeaveModal] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)

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
      setError(e?.message || 'Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }, [staffId])

  useEffect(() => {
    void fetchData()
  }, [fetchData])

  const todayAppointments = useMemo(
    () =>
      appointments
        .filter(a => new Date(a.appointmentDate).toDateString() === today.toDateString())
        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()),
    [appointments, today]
  )

  const nextAppointment = todayAppointments.find(a => ['pending', 'confirmed'].includes(a.status))
  const confirmed = todayAppointments.filter(a => a.status === 'confirmed').length
  const pending = todayAppointments.filter(a => a.status === 'pending').length
  const completed = todayAppointments.filter(a => a.status === 'completed').length
  const isWeekOffToday = user ? !isWorkingOnDate(user, todayKey) : false
  const totalPages = Math.max(1, Math.ceil(todayAppointments.length / pageSize))
  const paginatedAppointments = todayAppointments.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  const recentLeaves = [...leaves].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5)

  useEffect(() => {
    setCurrentPage(1)
  }, [pageSize, todayAppointments.length])

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type })
    window.setTimeout(() => setToast(null), 2600)
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
          <button onClick={() => void fetchData()} className="text-[12px] text-[#7AC49A] border border-[#7AC49A] px-4 py-2 rounded-lg font-serif cursor-pointer bg-white hover:bg-[#E8F5E9] transition-colors">
            Retry
          </button>
        </div>
      </StaffLayout>
    )
  }

  return (
    <StaffLayout>
      {toast && <div className={`fixed top-5 right-5 z-[500] flex items-center gap-2 px-4 py-3 rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.15)] text-white text-[12px] font-serif ${toast.type === 'success' ? 'bg-[#4CAF50]' : 'bg-[#E53935]'}`}>{toast.msg}</div>}
      {showLeaveModal && !isWeekOffToday && <LeaveModal staffId={staffId} onClose={() => setShowLeaveModal(false)} onSuccess={() => { setShowLeaveModal(false); void fetchData(); showToast('Leave request submitted successfully!') }} />}

      <div className="rounded-[34px] border border-[#d8e0db] bg-[linear-gradient(180deg,#fbfbf9_0%,#f2f5f1_55%,#ebefea_100%)] p-6 shadow-[0_16px_40px_rgba(31,41,51,0.08)]">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-7">
        <div>
          <h1 className="text-[22px] font-bold text-[#2d2d2d] m-0 font-serif">
            Good {today.getHours() < 12 ? 'Morning' : today.getHours() < 17 ? 'Afternoon' : 'Evening'}, {user?.name?.split(' ')[0] ?? 'Provider'}
          </h1>
          <p className="text-[13px] text-[#7AC49A] mt-1 mb-0">
            {today.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => navigate('/staff/schedule')}
            className="flex items-center gap-2 border border-[#C8E6C9] bg-white text-[#4A745C] text-[13px] font-bold font-serif px-5 py-2.5 rounded-xl cursor-pointer hover:bg-[#F0FAF4] transition-colors"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            Open My Schedule
          </button>
          {!isWeekOffToday ? (
            <button
              onClick={() => setShowLeaveModal(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-[#7AC49A] to-[#5BAF82] text-white text-[13px] font-bold font-serif px-5 py-2.5 rounded-xl cursor-pointer hover:opacity-90 transition-opacity border-0 shadow-[0_4px_14px_rgba(122,196,154,0.35)]"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="12" y1="18" x2="12" y2="12" />
                <line x1="9" y1="15" x2="15" y2="15" />
              </svg>
              Apply Leave
            </button>
          ) : (
            <div className="max-w-[320px] rounded-2xl border border-[#C8E6C9] bg-[linear-gradient(135deg,#F4FBF6,#E8F5E9)] px-4 py-3 shadow-[0_8px_24px_rgba(122,196,154,0.16)]">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#7AC49A] shadow-[0_4px_12px_rgba(122,196,154,0.2)]">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    <path d="M9 10h6" />
                    <path d="M9 14h3" />
                  </svg>
                </div>
                <div>
                  <p className="m-0 text-[12px] font-bold uppercase tracking-[0.12em] text-[#4A8F63]">Week Off Today</p>
                  <p className="m-0 mt-1 text-[13px] font-serif text-[#4A745C]">
                    Enjoy your scheduled day off. Leave requests are available only on working days.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {nextAppointment && (
        <div className="rounded-2xl px-6 py-5 mb-6 flex items-center justify-between" style={{ background: 'linear-gradient(135deg,#7AC49A,#A8E0C4)' }}>
          <div>
            <p className="text-[11px] text-white/75 uppercase tracking-[0.12em] m-0 mb-1">Next Appointment</p>
            <p className="text-[16px] font-bold text-white m-0 font-serif">{safeGet(nextAppointment.userID, 'name')}</p>
            <p className="text-[12px] text-white/85 m-0">{safeGet(nextAppointment.services, 'name')} | {formatTime(nextAppointment.startTime)}</p>
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
          { label: 'Total Today', value: todayAppointments.length, bg: 'bg-[#E8F5E9]', text: 'text-[#7AC49A]' },
          { label: 'Confirmed', value: confirmed, bg: 'bg-[#E8F5E9]', text: 'text-[#4CAF50]' },
          { label: 'Pending', value: pending, bg: 'bg-[#FFF8E1]', text: 'text-[#FFA000]' },
          { label: 'Completed', value: completed, bg: 'bg-[#E3F2FD]', text: 'text-[#1565C0]' },
        ].map(({ label, value, bg, text }) => (
          <div key={label} className="bg-white rounded-xl px-5 py-[18px] border border-[#C8E6C9] shadow-[0_2px_12px_rgba(122,196,154,0.08)] flex items-center gap-[14px]">
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
          <span className="text-[12px] text-[#7AC49A] bg-[#E8F5E9] px-3 py-1 rounded-full">{todayAppointments.length} total</span>
        </div>

        {todayAppointments.length === 0 ? (
          <div className="py-14 text-center">
            <p className="text-[14px] text-[#aaa] m-0 font-serif">No appointments scheduled for today.</p>
          </div>
        ) : (
          <>
            <AppointmentTable appointments={paginatedAppointments} />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={todayAppointments.length}
              pageSize={pageSize}
              itemLabel="today's appointments"
              onPageChange={setCurrentPage}
              onPageSizeChange={nextPageSize => {
                setPageSize(nextPageSize)
                setCurrentPage(1)
              }}
              pageSizeOptions={PAGE_SIZE_OPTIONS}
              variant="staff"
            />
          </>
        )}
      </div>

      <div className="mt-6 bg-white rounded-2xl border border-[#C8E6C9] overflow-hidden shadow-[0_2px_12px_rgba(122,196,154,0.06)]">
        <div className="px-6 py-4 border-b border-[#E8F5E9] flex items-center justify-between">
          <h3 className="text-[14px] font-bold text-[#2d2d2d] m-0 font-serif">Recent Leave Requests</h3>
          <span className="text-[12px] text-[#7AC49A] bg-[#E8F5E9] px-3 py-1 rounded-full">{leaves.length} total</span>
        </div>

        {recentLeaves.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-[14px] text-[#aaa] m-0 font-serif">No leave requests yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#E8F5E9]">
            {recentLeaves.map(leave => {
              const statusStyle = LEAVE_STATUS_STYLE[leave.status]
              return (
                <div key={leave._id} className="px-6 py-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="m-0 text-[13px] font-bold text-[#2d2d2d] font-serif">{formatDate(leave.date)}</p>
                    <p className="m-0 mt-1 text-[11px] text-[#7B8E80] font-serif capitalize">{leave.type.replace(/_/g, ' ')}</p>
                    {leave.reason && <p className="m-0 mt-1 text-[11px] text-[#aaa] font-serif">{leave.reason}</p>}
                  </div>
                  <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold ${statusStyle.bg} ${statusStyle.text}`}>
                    {statusStyle.label}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
      </div>
    </StaffLayout>
  )
}

export default StaffDashboard
