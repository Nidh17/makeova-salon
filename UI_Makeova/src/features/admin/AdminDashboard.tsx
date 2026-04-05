import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from './AdminLayout'
import {
  approveLeave,
  formatDate,
  formatTime,
  getAllAppointments,
  getAllLeaves,
  type IAppointment,
  type ILeave,
  rejectLeave,
  STATUS_STYLE,
} from '@/api/AppointmentsApi'
import { getAllUsers } from '@/api/Userapi'
import { getAllServices } from '@/api/services/servicesApi'
import Pagination from '@/components/shared/Pagination'
import { SkeletonBlock, StatCardSkeletons, TableSkeleton } from '@/components/shared/Skeleton'
import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from '@/utils/pagination'

const LEAVE_STATUS_STYLE = {
  pending: 'bg-[#FFF8E1] text-[#FF9800]',
  approved: 'bg-[#E8F5E9] text-[#4CAF50]',
  rejected: 'bg-[#FFEBEE] text-[#E53935]',
} as const

const formatLeaveType = (type: ILeave['type']) =>
  type
    .replace(/_/g, ' ')
    .replace(/\b\w/g, letter => letter.toUpperCase())

const getLeaveRoleLabel = (leave: ILeave) => {
  if (!leave.staffId) return 'Team Member'
  if (typeof leave.staffId === 'string') return 'Team Member'

  const roleNames = Array.isArray((leave.staffId as unknown as { role?: Array<string | { name?: string }> }).role)
    ? ((leave.staffId as unknown as { role?: Array<string | { name?: string }> }).role ?? [])
        .map(role => (typeof role === 'string' ? role : role?.name || ''))
        .filter(Boolean)
        .map(role => role.toLowerCase())
    : []

  if (roleNames.includes('receptionist')) return 'Receptionist'
  if (roleNames.includes('staff')) return 'Provider'
  return 'Team Member'
}

interface DashboardData {
  totalAppointments: number
  todayAppointments: number
  totalRevenue: number
  monthRevenue: number
  activeStaff: number
  staffOnLeave: number
  totalServices: number
  pendingCount: number
  confirmedCount: number
  completedCount: number
  cancelledCount: number
  recentAppointments: IAppointment[]
  leaveRequests: ILeave[]
}

type DashboardTab = 'appointments' | 'leaves'

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<DashboardTab>('appointments')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [leavePage, setLeavePage] = useState(1)
  const [leavePageSize, setLeavePageSize] = useState(DEFAULT_PAGE_SIZE)
  const [leaveActionLoading, setLeaveActionLoading] = useState<string | null>(null)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchDashboard = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const [appointments, users, services, leaves, staffUsers] = await Promise.all([
        getAllAppointments({ page: 1, limit: 10 }),
        getAllUsers({ page: 1, limit: 10 }),
        getAllServices({ page: 1, limit: 10 }),
        getAllLeaves({ page: 1, limit: 100 }),
        getAllUsers({ page: 1, limit: 500, role: 'staff' }),
      ])

      const appointmentItems = appointments.items
      const userItems = users.items
      const serviceItems = services.items
      const leaveItems = leaves.items
      const allStaffItems = staffUsers.items

      const userLookup = new Map(userItems.map(user => [user._id, user]))

      const today = new Date().toDateString()
      const thisMonth = new Date().getMonth()
      const thisYear = new Date().getFullYear()

      const staffOnLeave = leaveItems.filter(leave => {
        const leaveDate = new Date(leave.date).toDateString()
        return leaveDate === today && leave.status === 'approved'
      }).length

      const totalRevenue = appointmentItems
        .filter(appointment => appointment.status === 'completed')
        .reduce((sum, appointment) => sum + appointment.totalPrice, 0)

      const monthRevenue = appointmentItems
        .filter(appointment => {
          const date = new Date(appointment.appointmentDate)
          return appointment.status === 'completed' && date.getMonth() === thisMonth && date.getFullYear() === thisYear
        })
        .reduce((sum, appointment) => sum + appointment.totalPrice, 0)

      const todayAppointments = appointmentItems.filter(
        appointment => new Date(appointment.appointmentDate).toDateString() === today
      ).length

      const pendingCount = appointmentItems.filter(appointment => appointment.status === 'pending').length
      const confirmedCount = appointmentItems.filter(appointment => appointment.status === 'confirmed').length
      const completedCount = appointmentItems.filter(appointment => appointment.status === 'completed').length
      const cancelledCount = appointmentItems.filter(appointment => appointment.status === 'cancelled').length

      const recentAppointments = [...appointmentItems]
        .sort((a, b) => new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime())
        .slice(0, 5)
        .map(appointment => {
          let populatedService = appointment.services

          if (typeof appointment.services === 'string') {
            populatedService = serviceItems.find(service => service._id === appointment.services) || appointment.services
          }

          return {
            ...appointment,
            services: populatedService,
          }
        })

      const leaveRequests = [...leaveItems]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .map(leave => {
          if (typeof leave.staffId !== 'string') return leave
          const matchedUser = userLookup.get(leave.staffId)
          return matchedUser ? { ...leave, staffId: matchedUser } : leave
        })

      setData({
        totalAppointments: appointmentItems.length,
        todayAppointments,
        totalRevenue,
        monthRevenue,
        activeStaff: allStaffItems.filter(staff => staff.isAvailable).length,
        staffOnLeave,
        totalServices: serviceItems.length,
        pendingCount,
        confirmedCount,
        completedCount,
        cancelledCount,
        recentAppointments,
        leaveRequests,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])

  useEffect(() => {
    setCurrentPage(1)
  }, [data?.recentAppointments.length, pageSize])

  useEffect(() => {
    setLeavePage(1)
  }, [data?.leaveRequests.length, leavePageSize])

  const handleLeaveAction = async (leaveId: string, action: 'approve' | 'reject') => {
    setLeaveActionLoading(leaveId)

    try {
      if (action === 'approve') {
        await approveLeave(leaveId)
        showToast('Leave approved successfully!')
      } else {
        await rejectLeave(leaveId)
        showToast('Leave rejected successfully!')
      }

      await fetchDashboard()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to update leave request', 'error')
    } finally {
      setLeaveActionLoading(null)
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="mb-7 space-y-2">
          <SkeletonBlock className="h-8 w-40" />
          <SkeletonBlock className="h-4 w-72" />
        </div>

        <div className="grid grid-cols-4 gap-5 mb-8">
          <StatCardSkeletons count={4} />
        </div>

        <div className="grid grid-cols-4 gap-4 mb-8">
          <StatCardSkeletons count={4} />
        </div>

        <TableSkeleton columns={6} rows={5} />
      </AdminLayout>
    )
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
          <p className="text-[13px] text-[#E53935] font-serif">{error}</p>
          <button
            onClick={fetchDashboard}
            className="text-[12px] text-[#C49A7A] border border-[#C49A7A] px-4 py-2 rounded-lg font-serif cursor-pointer bg-white hover:bg-[#FDF0EB] transition-colors"
          >
            Retry
          </button>
        </div>
      </AdminLayout>
    )
  }

  if (!data) return null

  const totalPages = Math.max(1, Math.ceil(data.recentAppointments.length / pageSize))
  const paginatedAppointments = data.recentAppointments.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  const leaveTotalPages = Math.max(1, Math.ceil(data.leaveRequests.length / leavePageSize))
  const paginatedLeaves = data.leaveRequests.slice((leavePage - 1) * leavePageSize, leavePage * leavePageSize)

  const statCards = [
    {
      label: 'Total Bookings',
      value: data.totalAppointments.toString(),
      sub: `${data.todayAppointments} today`,
      color: '#F5C8BC',
      path: '/admin/appointments',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C49A7A" strokeWidth="1.6" strokeLinecap="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      ),
    },
    {
      label: 'Total Revenue',
      value: `₹${data.totalRevenue.toLocaleString('en-IN')}`,
      sub: `₹${data.monthRevenue.toLocaleString('en-IN')} this month`,
      color: '#F5C8BC',
      path: '/admin/reports',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C49A7A" strokeWidth="1.6" strokeLinecap="round">
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      ),
    },
    {
      label: 'Active Providers',
      value: data.activeStaff.toString(),
      sub: `${data.staffOnLeave} on leave today`,
      color: '#F5C8BC',
      path: '/admin/staff',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C49A7A" strokeWidth="1.6" strokeLinecap="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      label: 'Services Listed',
      value: data.totalServices.toString(),
      sub: `${data.confirmedCount} confirmed appointments`,
      color: '#F5C8BC',
      path: '/admin/services',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C49A7A" strokeWidth="1.6" strokeLinecap="round">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
      ),
    },
  ]

  return (
    <AdminLayout>
      {toast && (
        <div
          className={`fixed top-5 right-5 z-[500] flex items-center gap-2.5 rounded-xl px-5 py-3.5 text-[13px] text-white shadow-lg font-serif ${
            toast.type === 'success' ? 'bg-[#4CAF50]' : 'bg-[#E53935]'
          }`}
        >
          {toast.msg}
        </div>
      )}

      <div className="mb-7">
        <h1 className="text-[22px] font-bold text-[#2d2d2d] m-0 font-serif">Dashboard</h1>
        <p className="text-[13px] text-[#aaa] mt-1 mb-0">Welcome back - here&apos;s what&apos;s happening today.</p>
      </div>

      <div className="grid grid-cols-4 gap-5 mb-8">
        {statCards.map(({ label, value, sub, icon, color, path }) => (
          <button
            key={label}
            onClick={() => navigate(path)}
            className="bg-white rounded-xl px-5 py-4 border border-[#F0DDD5] shadow-[0_2px_12px_rgba(196,154,122,0.08)] flex items-center gap-4 text-left cursor-pointer hover:shadow-[0_4px_20px_rgba(196,154,122,0.15)] transition-shadow min-h-[88px]"
          >
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: color }}>
              {icon}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[20px] font-bold text-[#2d2d2d] m-0 font-serif leading-none">{value}</p>
              <p className="text-[11px] text-[#aaa] mt-1 m-0">{label}</p>
              <p className="text-[11px] text-[#C49A7A] mt-1 m-0 truncate">{sub}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Pending', value: data.pendingCount, bg: '#FFF8E1', color: '#FF9800' },
          { label: 'Confirmed', value: data.confirmedCount, bg: '#E8F5E9', color: '#4CAF50' },
          { label: 'Completed', value: data.completedCount, bg: '#E3F2FD', color: '#1565C0' },
          { label: 'Cancelled', value: data.cancelledCount, bg: '#FFEBEE', color: '#E53935' },
        ].map(({ label, value, bg, color }) => (
          <div key={label} className="bg-white rounded-xl border border-[#F0DDD5] px-5 py-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
              <span className="text-[16px] font-bold font-serif" style={{ color }}>
                {value}
              </span>
            </div>
            <div>
              <p className="text-[13px] font-semibold text-[#2d2d2d] m-0 font-serif">{value}</p>
              <p className="text-[11px] text-[#aaa] m-0">{label} appointments</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[10px] border border-[#F0DDD5] shadow-[0_2px_12px_rgba(196,154,122,0.06)] overflow-hidden">
        <div className="px-6 py-[18px] border-b border-[#F0DDD5] flex items-center justify-between gap-4">
          <div>
            <h3 className="text-[15px] font-bold text-[#2d2d2d] m-0 font-serif">Activity Overview</h3>
            <p className="text-[12px] text-[#8D7B70] mt-1 mb-0 font-serif">
              Switch between recent appointments and leave approval tables
            </p>
          </div>
          {activeTab === 'appointments' ? (
            <button
              onClick={() => navigate('/admin/appointments')}
              className="bg-[#F5C8BC] border-none text-[#8B4A3A] text-[11px] px-4 py-[6px] rounded cursor-pointer font-serif hover:opacity-80 transition-opacity"
            >
              View All
            </button>
          ) : (
            <span className="text-[12px] text-[#C49A7A] bg-[#FDF0EB] px-3 py-1 rounded-full font-serif">
              {data.leaveRequests.filter(leave => leave.status === 'pending').length} pending
            </span>
          )}
        </div>

        <div className="px-6 pt-4 pb-3 border-b border-[#F5E7DE] bg-[#FFFCFA]">
          <div className="inline-flex rounded-xl border border-[#F0DDD5] bg-[#FDF6F2] p-1">
            {[
              { key: 'appointments' as const, label: 'Recent Appointments' },
              { key: 'leaves' as const, label: 'Leave Approvals' },
            ].map(tab => {
              const isActive = activeTab === tab.key

              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`rounded-[10px] px-4 py-2 text-[12px] font-semibold font-serif transition-all ${
                    isActive
                      ? 'bg-white text-[#8B4A3A] shadow-[0_3px_10px_rgba(196,154,122,0.15)]'
                      : 'text-[#9B8475] hover:text-[#8B4A3A]'
                  }`}
                >
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        {activeTab === 'appointments' ? (
          data.recentAppointments.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-[13px] text-[#aaa] font-serif m-0">No appointments yet.</p>
            </div>
          ) : (
            <>
              <div className="table-scroll-area">
                <table className="w-full border-collapse">
                <thead>
                  <tr className="table-scroll-head bg-[#FDF6F2]">
                    {['Client', 'Provider', 'Service', 'Date & Time', 'Price', 'Status'].map(header => (
                      <th
                        key={header}
                        className="px-6 py-3 text-left text-[11px] uppercase tracking-[0.1em] text-[#C49A7A] font-semibold font-sans"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginatedAppointments.map(appointment => {
                    const statusStyle = STATUS_STYLE[appointment.status]
                    const customerName = typeof appointment.userID === 'string' ? appointment.userID : appointment.userID?.name || 'NA'
                    const staffName = typeof appointment.staffID === 'string' ? appointment.staffID : appointment.staffID.name
                    const serviceName = typeof appointment.services === 'string' ? '—' : appointment.services?.name

                    return (
                      <tr key={appointment._id} className="border-t border-[#F9F0EC] hover:bg-[#FFFAF8] transition-colors">
                        <td className="px-6 py-[14px] text-[13px] text-[#2d2d2d] font-serif">{customerName}</td>
                        <td className="px-6 py-[14px] text-[13px] text-[#888]">{staffName}</td>
                        <td className="px-6 py-[14px] text-[13px] text-[#888]">{serviceName}</td>
                        <td className="px-6 py-[14px]">
                          <p className="text-[12px] font-semibold text-[#2d2d2d] m-0 font-serif">{formatDate(appointment.appointmentDate)}</p>
                          <p className="text-[11px] text-[#aaa] m-0">{formatTime(appointment.startTime)}</p>
                        </td>
                        <td className="px-6 py-[14px] text-[13px] font-bold text-[#C49A7A] font-serif">
                          ₹{appointment.totalPrice.toLocaleString('en-IN')}
                        </td>
                        <td className="px-6 py-[14px]">
                          <span className={`text-[11px] font-semibold px-[10px] py-[3px] rounded-full capitalize ${statusStyle.bg} ${statusStyle.text}`}>
                            {appointment.status}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
                </table>
              </div>

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={data.recentAppointments.length}
                pageSize={pageSize}
                itemLabel="recent appointments"
                onPageChange={setCurrentPage}
                onPageSizeChange={nextPageSize => {
                  setPageSize(nextPageSize)
                  setCurrentPage(1)
                }}
                pageSizeOptions={PAGE_SIZE_OPTIONS}
              />
            </>
          )
        ) : data.leaveRequests.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-[13px] text-[#aaa] font-serif m-0">No leave requests yet.</p>
          </div>
        ) : (
          <>
            <div className="table-scroll-area overflow-x-auto">
              <table className="w-full min-w-[980px] border-collapse">
                <thead>
                  <tr className="table-scroll-head bg-[#FDF6F2]">
                    {['Requested By', 'Role', 'Leave Type', 'Leave Date', 'Reason', 'Status', 'Action'].map(header => (
                      <th
                        key={header}
                        className="px-6 py-3 text-left text-[11px] uppercase tracking-[0.1em] text-[#C49A7A] font-semibold font-sans"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginatedLeaves.map(leave => {
                    const staff = typeof leave.staffId === 'string' ? null : leave.staffId
                    const staffName = typeof leave.staffId === 'string'
                      ? leave.staffId
                      : leave.staffId?.name || 'Unknown Team Member'
                    const roleLabel = getLeaveRoleLabel(leave)

                    return (
                      <tr key={leave._id} className="border-t border-[#F9F0EC] hover:bg-[#FFFAF8] transition-colors align-top">
                        <td className="px-6 py-[14px]">
                          <p className="m-0 text-[13px] font-bold text-[#2d2d2d] font-serif">{staffName}</p>
                          <p className="m-0 mt-1 text-[11px] text-[#8D7B70]">{staff?.email || 'No email available'}</p>
                        </td>
                        <td className="px-6 py-[14px]">
                          <span className="inline-flex rounded-full bg-[#FDF0EB] px-3 py-1 text-[11px] font-semibold text-[#C49A7A] font-serif">
                            {roleLabel}
                          </span>
                        </td>
                        <td className="px-6 py-[14px] text-[13px] text-[#2d2d2d] font-serif">{formatLeaveType(leave.type)}</td>
                        <td className="px-6 py-[14px]">
                          <p className="m-0 text-[12px] font-semibold text-[#2d2d2d] font-serif">{formatDate(leave.date)}</p>
                          <p className="m-0 mt-1 text-[11px] text-[#aaa] font-serif">Requested {formatDate(leave.createdAt)}</p>
                        </td>
                        <td className="px-6 py-[14px] text-[12px] text-[#666] max-w-[260px]">
                          <p className="m-0 whitespace-normal break-words">{leave.reason?.trim() || 'No reason shared'}</p>
                        </td>
                        <td className="px-6 py-[14px]">
                          <span
                            className={`rounded-full px-3 py-1 text-[11px] font-semibold font-serif capitalize ${LEAVE_STATUS_STYLE[leave.status]}`}
                          >
                            {leave.status}
                          </span>
                        </td>
                        <td className="px-6 py-[14px]">
                          {leave.status === 'pending' ? (
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleLeaveAction(leave._id, 'approve')}
                                disabled={leaveActionLoading === leave._id}
                                className="rounded-lg border border-[#4CAF50]/30 bg-[#E8F5E9] px-3 py-1.5 text-[11px] text-[#4CAF50] font-semibold font-serif cursor-pointer disabled:opacity-60"
                              >
                                {leaveActionLoading === leave._id ? 'Saving...' : 'Approve'}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleLeaveAction(leave._id, 'reject')}
                                disabled={leaveActionLoading === leave._id}
                                className="rounded-lg border border-[#E53935]/30 bg-[#FFEBEE] px-3 py-1.5 text-[11px] text-[#E53935] font-semibold font-serif cursor-pointer disabled:opacity-60"
                              >
                                {leaveActionLoading === leave._id ? 'Saving...' : 'Reject'}
                              </button>
                            </div>
                          ) : (
                            <span className="text-[11px] text-[#aaa] font-serif">Action completed</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={leavePage}
              totalPages={leaveTotalPages}
              totalItems={data.leaveRequests.length}
              pageSize={leavePageSize}
              itemLabel="leave requests"
              onPageChange={setLeavePage}
              onPageSizeChange={nextPageSize => {
                setLeavePageSize(nextPageSize)
                setLeavePage(1)
              }}
              pageSizeOptions={PAGE_SIZE_OPTIONS}
            />
          </>
        )}
      </div>
    </AdminLayout>
  )
}

export default AdminDashboard
