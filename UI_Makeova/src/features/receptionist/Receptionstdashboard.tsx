import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import ReceptionistLayout from './Receptionistlayout'
import AppointmentForm from '../appointments/AppointmentForm'
import AppointmentTable from '../appointments/AppointmentTable'
import ProviderScheduleCalendar from '../appointments/ProviderScheduleCalendar'
import { createUser, getAllUsers } from '@/api/Userapi'
import UserForm from '../admin/users/Userform'
import {
  createLeave,
  deleteLeave,
  getAllAppointments,
  getAllLeaves,
  getLeavesByStaff,
  updateAppointmentStatus,
  type IAppointment,
  type ILeave,
  type LeaveStatus,
  type LeaveType,
} from '@/api/AppointmentsApi'
import { getAppointmentStats } from '../appointments/appointmentUtils'
import { Hand } from 'lucide-react'
import { useAppSelector } from '@/store'
import { selectUser } from '@/store/slices/authSlice'
import { IUser } from '@/types'

const LEAVE_STATUS_STYLE: Record<LeaveStatus, { bg: string; text: string; label: string }> = {
  pending: { bg: 'bg-[#FFF8E1]', text: 'text-[#FFA000]', label: 'Pending' },
  approved: { bg: 'bg-[#E8F5E9]', text: 'text-[#4CAF50]', label: 'Approved' },
  rejected: { bg: 'bg-[#FFEBEE]', text: 'text-[#E53935]', label: 'Rejected' },
}

const LEAVE_TYPES: { value: LeaveType; label: string; desc: string }[] = [
  { value: 'full_day', label: 'Full Day', desc: 'Entire day off' },
  { value: 'half_day_morning', label: 'Morning Half', desc: '9:00 AM - 1:00 PM' },
  { value: 'half_day_evening', label: 'Evening Half', desc: '1:00 PM - 8:00 PM' },
]

const USER_FETCH_LIMIT = 1000

const toInputDate = (date = new Date()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

const LeaveRequestModal: React.FC<{
  userId: string
  onClose: () => void
  onSuccess: () => void
}> = ({ userId, onClose, onSuccess }) => {
  const today = toInputDate()
  const [date, setDate] = useState(today)
  const [type, setType] = useState<LeaveType>('full_day')
  const [reason, setReason] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!date) {
      setError('Please select a date.')
      return
    }

    setSaving(true)
    setError('')
    try {
      await createLeave({ staffId: userId, date, type, reason: reason.trim() || undefined })
      onSuccess()
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to submit leave request')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[220] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/35 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-[0_20px_60px_rgba(0,0,0,0.2)]">
        <div className="bg-gradient-to-r from-[#C49A7A] to-[#E8B89A] px-6 py-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="m-0 text-[17px] font-bold font-serif">Apply Leave</h3>
              <p className="m-0 mt-1 text-[12px] text-white/80">Submit your leave request for admin approval</p>
            </div>
            <button type="button" onClick={onClose} className="h-8 w-8 rounded-full border-0 bg-white/20 text-white cursor-pointer">
              x
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-4 p-6">
          <div>
            <label className="mb-2 block text-[11px] uppercase tracking-[0.08em] text-[#C49A7A] font-semibold">Leave Date</label>
            <input
              type="date"
              min={today}
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full rounded-xl border border-[#F0DDD5] px-4 py-3 text-[13px] font-serif outline-none focus:border-[#C49A7A]"
            />
          </div>

          <div>
            <label className="mb-2 block text-[11px] uppercase tracking-[0.08em] text-[#C49A7A] font-semibold">Leave Type</label>
            <div className="space-y-2">
              {LEAVE_TYPES.map(item => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setType(item.value)}
                  className={`w-full rounded-xl border px-4 py-3 text-left transition-colors ${
                    type === item.value ? 'border-[#C49A7A] bg-[#FDF6F2]' : 'border-[#F0DDD5] bg-white hover:border-[#C49A7A]'
                  }`}
                >
                  <p className="m-0 text-[13px] font-semibold text-[#2d2d2d] font-serif">{item.label}</p>
                  <p className="m-0 mt-1 text-[11px] text-[#8D7B70] font-serif">{item.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-[11px] uppercase tracking-[0.08em] text-[#C49A7A] font-semibold">Reason</label>
            <textarea
              rows={3}
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Reason for leave"
              className="w-full resize-none rounded-xl border border-[#F0DDD5] px-4 py-3 text-[13px] font-serif outline-none focus:border-[#C49A7A]"
            />
          </div>

          {error && <p className="m-0 text-[12px] text-[#E53935] font-serif">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-xl border-2 border-[#F0DDD5] bg-white py-3 text-[13px] text-[#888] font-serif cursor-pointer">
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving}
              className="flex-1 rounded-xl border-0 py-3 text-[13px] font-semibold text-white font-serif cursor-pointer disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg,#C49A7A,#E8B89A)' }}
            >
              {saving ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const ReceptionistDashboard: React.FC = () => {
  const navigate = useNavigate()
  const currentUser = useAppSelector(selectUser)
  const [appointments, setAppointments] = useState<IAppointment[]>([])
  const [teamLeaves, setTeamLeaves] = useState<ILeave[]>([])
  const [myLeaves, setMyLeaves] = useState<ILeave[]>([])
  const [showApptModal, setShowApptModal]       = useState(false)
  const [showCustomerModal, setShowCustomerModal] = useState(false)
  const [showLeaveModal, setShowLeaveModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [todayCount, setTodayCount] = useState(0)
  const [leaveLoading, setLeaveLoading] = useState(true)
  const [leaveActionLoading, setLeaveActionLoading] = useState<string | null>(null)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' | 'info' } | null>(null)
  const [providerUsers, setProviderUsers] = useState<IUser[]>([])
  const [calendarAppointments, setCalendarAppointments] = useState<IAppointment[]>([])

  const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ msg, type })
    window.setTimeout(() => setToast(null), 2600)
  }

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setLeaveLoading(true)
      const [allAppointments, allLeaves, staffUsers, receptionistLeaves] = await Promise.all([
        getAllAppointments({ page: 1, limit: 200 }),
        getAllLeaves({ page: 1, limit: 100 }),
        getAllUsers({ page: 1, limit: USER_FETCH_LIMIT, role: 'staff' }),
        currentUser?._id ? getLeavesByStaff(currentUser._id, { page: 1, limit: 100 }) : Promise.resolve({ items: [], pagination: { currentPage: 1, perPage: 10, totalItems: 0, totalPages: 1, hasNextPage: false, hasPreviousPage: false } }),
      ])

      const appointmentItems = allAppointments.items
      const leaveItems = allLeaves.items
      const providerList = staffUsers.items
      const receptionistLeaveItems = receptionistLeaves.items

      const today = new Date().toDateString()
      const todayAppts = appointmentItems.filter(apt =>
        new Date(apt.appointmentDate).toDateString() === today
      )

      const staffIds = new Set(providerList.map(user => user._id))

      setAppointments(todayAppts)
      setTodayCount(todayAppts.length)
      setProviderUsers(providerList)
      setCalendarAppointments(appointmentItems)
      setTeamLeaves(
        leaveItems
          .filter(leave => {
            const leaveUserId = typeof leave.staffId === 'string' ? leave.staffId : leave.staffId._id
            return staffIds.has(leaveUserId)
          })
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      )
      setMyLeaves(
        [...receptionistLeaveItems].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      )
    } catch (error) {
      console.error('Failed to load receptionist dashboard data:', error)
    } finally {
      setLoading(false)
      setLeaveLoading(false)
    }
  }

  // Fetch today's appointments
  useEffect(() => {
    loadDashboardData()
  }, [currentUser?._id])

  const handleApptSuccess = async () => {
    setShowApptModal(false)
    await loadDashboardData()
  }

  const cancelAppt = async (id: string) => {
    try {
      await updateAppointmentStatus(id, 'cancelled')
      setAppointments(prev => prev.map(a => a._id === id ? { ...a, status: 'cancelled' } : a))
    } catch (error) {
      console.error('Failed to cancel appointment:', error)
    }
  }
  
  const confirmAppt = async (id: string) => {
    try {
      await updateAppointmentStatus(id, 'confirmed')
      setAppointments(prev => prev.map(a => a._id === id ? { ...a, status: 'confirmed' } : a))
    } catch (error) {
      console.error('Failed to confirm appointment:', error)
    }
  }

  const completeAppt = async (id: string) => {
    try {
      await updateAppointmentStatus(id, 'completed')
      setAppointments(prev => prev.map(a => a._id === id ? { ...a, status: 'completed' } : a))
    } catch (error) {
      console.error('Failed to complete appointment:', error)
    }
  }

  const handleDeleteAppointment = () => {
    showToast('Please contact admin to delete this appointment.', 'info')
  }

  const handleCancelLeave = async (leaveId: string) => {
    const leave = myLeaves.find(item => item._id === leaveId)
    if (!leave || leave.status !== 'pending') return
    if (!window.confirm('Cancel this pending leave request?')) return

    setLeaveActionLoading(leaveId)
    try {
      await deleteLeave(leaveId)
      setMyLeaves(prev => prev.filter(item => item._id !== leaveId))
      showToast('Leave request cancelled successfully!')
    } catch (error: any) {
      showToast(error?.response?.data?.message || error?.message || 'Failed to cancel leave request', 'error')
    } finally {
      setLeaveActionLoading(null)
    }
  }

  const appointmentStats = getAppointmentStats(appointments)
  const upcomingTeamLeaves = useMemo(
    () => teamLeaves.filter(leave => new Date(leave.date).getTime() >= new Date(new Date().toDateString()).getTime()).slice(0, 6),
    [teamLeaves]
  )

  return (
    <ReceptionistLayout>
      {toast && (
        <div className={`fixed top-5 right-5 z-[500] flex items-center gap-2 px-4 py-3 rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.15)] text-white text-[12px] font-serif ${
          toast.type === 'success' ? 'bg-[#4CAF50]' : toast.type === 'error' ? 'bg-[#E53935]' : 'bg-[#9B5C74]'
        }`}>
          {toast.msg}
        </div>
      )}

      <div className="rounded-[34px] border border-[#e2d8d4] bg-[linear-gradient(180deg,#fbfbf9_0%,#f4f1ed_55%,#eeebe6_100%)] p-6 shadow-[0_16px_40px_rgba(31,41,51,0.08)]">
      {/* Greeting */}
      <div className="mb-6">
        <h1 className="flex items-center gap-2 text-[22px] font-bold text-[#2d2d2d] m-0 font-serif">
          Good Morning
          <Hand size={20} strokeWidth={2} className="text-[#C49A7A]" />
        </h1>
        <p className="text-[13px] text-[#aaa] mt-1 mb-0">Here's today's summary at Makeova Salon</p>
      </div>

      {/* Stat cards - Status summary */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: "Today's Bookings", value: todayCount, color: '#C49A7A', bg: '#FDF0EB' },
          { label: 'Confirmed', value: appointmentStats.confirmed, color: '#4CAF50', bg: '#E8F5E9' },
          { label: 'Pending', value: appointmentStats.pending, color: '#FF9800', bg: '#FFF8E1' },
          { label: 'Cancelled', value: appointmentStats.cancelled, color: '#E53935', bg: '#FFEBEE' },
        ].map(({ label, value, color, bg }) => (
          <div key={label}
            className="bg-white rounded-xl border border-[#F0DDD5] px-4 py-3 flex items-center gap-3 cursor-pointer hover:shadow-md transition-shadow">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
              <span className="text-[15px] font-bold font-serif" style={{ color }}>{value}</span>
            </div>
            <p className="text-[11px] text-[#aaa] m-0 font-serif">{label}</p>
          </div>
        ))}
      </div>

      {/* Quick action buttons */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setShowApptModal(true)}
          className="flex items-center gap-2 text-white text-[13px] font-semibold font-serif px-5 py-[10px] rounded-xl border-none cursor-pointer hover:opacity-90 transition-opacity shadow-[0_4px_14px_rgba(196,154,122,0.3)]"
          style={{ background: 'linear-gradient(135deg,#C49A7A,#E8B89A)' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New Appointment
        </button>
        <button
          onClick={() => setShowCustomerModal(true)}
          className="flex items-center gap-2 bg-white text-[#C49A7A] border-[1.5px] border-[#C49A7A] px-5 py-[10px] rounded-xl cursor-pointer text-[13px] font-serif font-semibold hover:bg-[#FDF6F2] transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
          </svg>
          Add Customer
        </button>
        <button
          onClick={() => setShowLeaveModal(true)}
          className="flex items-center gap-2 bg-white text-[#C49A7A] border-[1.5px] border-[#C49A7A] px-5 py-[10px] rounded-xl cursor-pointer text-[13px] font-serif font-semibold hover:bg-[#FDF6F2] transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="12" y1="18" x2="12" y2="12" />
            <line x1="9" y1="15" x2="15" y2="15" />
          </svg>
          Apply Leave
        </button>
        <button
          onClick={() => navigate('/receptionist/schedule')}
          className="flex items-center gap-2 bg-white text-[#888] border-2 border-[#F0DDD5] px-5 py-[10px] rounded-xl cursor-pointer text-[13px] font-serif font-semibold hover:border-[#C49A7A] hover:text-[#C49A7A] transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          View Schedule
        </button>
      </div>

      <div className="mb-6">
        <ProviderScheduleCalendar
          title="Provider Weekly Calendar"
          subtitle="Reception can check provider schedule, open days, booked time blocks, and approved leave before creating appointments."
          providers={providerUsers}
          appointments={calendarAppointments}
          leaves={teamLeaves}
          leaveScopeLabel="Provider Leave Tracker"
          emptyMessage="No providers found for the receptionist calendar."
        />
      </div>

      <div className="grid grid-cols-1 gap-6 mb-6 xl:grid-cols-2">
        <div className="bg-white rounded-2xl border border-[#F0DDD5] shadow-[0_2px_16px_rgba(196,154,122,0.08)] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#F0DDD5] flex items-center justify-between">
            <div>
              <h3 className="text-[15px] font-bold text-[#2d2d2d] m-0 font-serif">Provider Leave Status</h3>
              <p className="text-[12px] text-[#8D7B70] mt-1 mb-0 font-serif">Reception can track provider leave requests and approvals</p>
            </div>
          </div>
          {leaveLoading ? (
            <div className="py-10 text-center text-[13px] text-[#aaa] font-serif">Loading leave status...</div>
          ) : upcomingTeamLeaves.length === 0 ? (
            <div className="py-10 text-center text-[13px] text-[#aaa] font-serif">No provider leave requests available.</div>
          ) : (
            <div className="divide-y divide-[#F9F0EC]">
              {upcomingTeamLeaves.map(leave => {
                const badge = LEAVE_STATUS_STYLE[leave.status]
                const staffName = typeof leave.staffId === 'string' ? leave.staffId : leave.staffId.name
                return (
                  <div key={leave._id} className="px-6 py-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="m-0 text-[13px] font-bold text-[#2d2d2d] font-serif">{staffName}</p>
                      <p className="m-0 mt-1 text-[11px] text-[#8D7B70] font-serif capitalize">
                        {leave.type.replace(/_/g, ' ')} · {new Date(leave.date).toLocaleDateString('en-IN')}
                      </p>
                      {leave.reason && <p className="m-0 mt-1 text-[11px] text-[#aaa] font-serif">{leave.reason}</p>}
                    </div>
                    <span className={`text-[11px] font-semibold px-3 py-1 rounded-full ${badge.bg} ${badge.text}`}>
                      {badge.label}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-[#F0DDD5] shadow-[0_2px_16px_rgba(196,154,122,0.08)] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#F0DDD5] flex items-center justify-between">
            <div>
              <h3 className="text-[15px] font-bold text-[#2d2d2d] m-0 font-serif">My Leave Requests</h3>
              <p className="text-[12px] text-[#8D7B70] mt-1 mb-0 font-serif">Track approval status for your receptionist leave requests</p>
            </div>
          </div>
          {leaveLoading ? (
            <div className="py-10 text-center text-[13px] text-[#aaa] font-serif">Loading your leave requests...</div>
          ) : myLeaves.length === 0 ? (
            <div className="py-10 text-center text-[13px] text-[#aaa] font-serif">No leave requests submitted yet.</div>
          ) : (
            <div className="divide-y divide-[#F9F0EC]">
              {myLeaves.slice(0, 5).map(leave => {
                const badge = LEAVE_STATUS_STYLE[leave.status]
                return (
                  <div key={leave._id} className="px-6 py-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="m-0 text-[13px] font-bold text-[#2d2d2d] font-serif">{new Date(leave.date).toLocaleDateString('en-IN')}</p>
                      <p className="m-0 mt-1 text-[11px] text-[#8D7B70] font-serif capitalize">{leave.type.replace(/_/g, ' ')}</p>
                      {leave.reason && <p className="m-0 mt-1 text-[11px] text-[#aaa] font-serif">{leave.reason}</p>}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`text-[11px] font-semibold px-3 py-1 rounded-full ${badge.bg} ${badge.text}`}>
                        {badge.label}
                      </span>
                      {leave.status === 'pending' && (
                        <button
                          type="button"
                          onClick={() => handleCancelLeave(leave._id)}
                          disabled={leaveActionLoading === leave._id}
                          className="rounded-lg border border-[#F5C8BC] bg-white px-3 py-1.5 text-[11px] text-[#E53935] font-serif cursor-pointer hover:bg-[#FFEBEE] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {leaveActionLoading === leave._id ? 'Cancelling...' : 'Cancel Request'}
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Today's appointments section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[16px] font-bold text-[#2d2d2d] m-0 font-serif">Today's Appointments</h3>
          <button
            onClick={() => navigate('/receptionist/schedule')}
            className="text-[12px] text-[#C49A7A] bg-[#FDF0EB] border-none px-3 py-1.5 rounded-lg cursor-pointer font-semibold hover:bg-[#F5C8BC] transition-colors"
          >
            View All →
          </button>
        </div>

        {/* Appointments table */}
        <AppointmentTable
          appointments={appointments}
          loading={loading}
          onCancel={cancelAppt}
          onConfirm={confirmAppt}
          onComplete={completeAppt}
          onActionBlocked={message => showToast(message, 'info')}
          onDelete={handleDeleteAppointment}
          showActions={true}
          actorRole="receptionist"
          pageSize={10}
        />
      </div>

      {/* Book Appointment Modal */}
      {showApptModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.2)] w-full max-w-[540px] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#F0DDD5] bg-gradient-to-r from-[#FDF6F2] to-white sticky top-0 z-10">
              <h3 className="text-[17px] font-bold text-[#2d2d2d] m-0 font-serif">New Appointment</h3>
              <button onClick={() => setShowApptModal(false)}
                className="w-8 h-8 rounded-full bg-[#FDF6F2] flex items-center justify-center border-none cursor-pointer text-[#999] hover:text-[#C49A7A] hover:bg-[#F5C8BC] transition-all">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="px-6 py-6">
              <AppointmentForm
                onSuccess={handleApptSuccess}
                onCancel={() => setShowApptModal(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {showCustomerModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.2)] w-full max-w-[540px] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#F0DDD5] bg-gradient-to-r from-[#FDF6F2] to-white sticky top-0 z-10">
              <h3 className="text-[17px] font-bold text-[#2d2d2d] m-0 font-serif">Add Customer</h3>
              <button onClick={() => setShowCustomerModal(false)}
                className="w-8 h-8 rounded-full bg-[#FDF6F2] flex items-center justify-center border-none cursor-pointer text-[#999] hover:text-[#C49A7A] hover:bg-[#F5C8BC] transition-all">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="px-6 py-6">
              <UserForm
                mode="create"
                roleType="customer"
                onSubmit={async (data) => {
                  await createUser({
                    ...data,
                    isAvailable: true,
                    role: data.role?.filter(Boolean).length ? data.role : ['customer'],
                  })
                  setShowCustomerModal(false)
                }}
                onCancel={() => setShowCustomerModal(false)}
              />
            </div>
          </div>
        </div>
      )}

      {showLeaveModal && currentUser?._id && (
        <LeaveRequestModal
          userId={currentUser._id}
          onClose={() => setShowLeaveModal(false)}
          onSuccess={async () => {
            setShowLeaveModal(false)
            await loadDashboardData()
          }}
        />
      )}
      </div>
    </ReceptionistLayout>
  )
}

export default ReceptionistDashboard

