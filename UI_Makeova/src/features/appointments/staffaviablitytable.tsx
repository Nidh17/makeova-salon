import React, { useEffect, useState } from 'react'

import type { IUser } from '../../types'
import { formatTime, getAllAppointments, getAllLeaves, type IAppointment, type ILeave } from '@/api/AppointmentsApi'
import { getAllUsers } from '@/api/Userapi'
import Pagination from '@/components/shared/Pagination'
import { TableSkeleton } from '@/components/shared/Skeleton'
import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from '@/utils/pagination'
import { getProviderAvailabilityStatus, getWorkingDayLabel } from './appointmentUtils'

const STATUS_CONFIG = {
  free: { label: 'Available', bg: 'bg-[#E8F5E9]', text: 'text-[#4CAF50]', dot: 'bg-[#4CAF50]' },
  busy: { label: 'Fully Booked', bg: 'bg-[#FFF8E1]', text: 'text-[#FF9800]', dot: 'bg-[#FF9800]' },
  leave: { label: 'On Leave', bg: 'bg-[#E3F2FD]', text: 'text-[#1565C0]', dot: 'bg-[#1565C0]' },
  offday: { label: 'Off Day', bg: 'bg-[#F3E5F5]', text: 'text-[#8E24AA]', dot: 'bg-[#8E24AA]' },
  unavailable: { label: 'Unavailable', bg: 'bg-[#F5F5F5]', text: 'text-[#aaa]', dot: 'bg-[#aaa]' },
}

interface StaffAvailabilityTableProps {
  onBookForStaff?: (staffId: string) => void
}

const StaffAvailabilityTable: React.FC<StaffAvailabilityTableProps> = ({ onBookForStaff }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [staffList, setStaffList] = useState<IUser[]>([])
  const [leaves, setLeaves] = useState<ILeave[]>([])
  const [appointments, setAppointments] = useState<IAppointment[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setLoading(true)

      try {
        const [users, leaveData, appointmentData] = await Promise.all([
          getAllUsers({ page: 1, limit: 500 }),
          getAllLeaves({ page: 1, limit: 500 }),
          getAllAppointments({ page: 1, limit: 1000 }),
        ])

        if (cancelled) return

        setStaffList(
          users.items.filter(user =>
            user.role.some(role => typeof role !== 'string' && role.name?.toLowerCase() === 'staff')
          )
        )
        setLeaves(leaveData.items)
        setAppointments(appointmentData.items)
      } catch {
        // Keep this screen resilient even when the API is noisy.
      } finally {
        if (!cancelled) {
          setLoading(false)
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
  }, [])

  const stats = {
    total: staffList.length,
    available: staffList.filter(staff => getProviderAvailabilityStatus(staff, date, leaves, appointments) === 'free').length,
    busy: staffList.filter(staff => getProviderAvailabilityStatus(staff, date, leaves, appointments) === 'busy').length,
    onLeave: staffList.filter(staff => getProviderAvailabilityStatus(staff, date, leaves, appointments) === 'leave').length,
    offDay: staffList.filter(staff => getProviderAvailabilityStatus(staff, date, leaves, appointments) === 'offday').length,
    unavailable: staffList.filter(staff => getProviderAvailabilityStatus(staff, date, leaves, appointments) === 'unavailable').length,
  }

  const getStaffAppointments = (staffId: string): IAppointment[] =>
    appointments.filter(appointment => {
      const appointmentStaffId = typeof appointment.staffID === 'string' ? appointment.staffID : appointment.staffID?._id
      const appointmentDate = new Date(appointment.appointmentDate).toDateString()
      const selectedDate = new Date(date).toDateString()

      return appointmentStaffId === staffId && appointmentDate === selectedDate && ['pending', 'confirmed'].includes(appointment.status)
    })

  const totalPages = Math.max(1, Math.ceil(staffList.length / pageSize))
  const paginatedStaff = staffList.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  useEffect(() => {
    setCurrentPage(1)
    setExpanded(null)
  }, [date, pageSize])

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-[18px] font-bold text-[#2d2d2d] m-0 font-serif">Provider Availability</h2>
          <p className="text-[12px] text-[#aaa] mt-0.5 mb-0">
            {new Date(date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <input
          type="date"
          value={date}
          onChange={event => setDate(event.target.value)}
          className="px-3 py-[9px] border-2 border-[#F0DDD5] rounded-xl text-[13px] font-serif outline-none focus:border-[#C49A7A] bg-white"
        />
      </div>

      <div className="grid grid-cols-5 gap-3 mb-5">
        {[
          { label: 'Total Providers', value: stats.total, color: '#C49A7A', bg: '#FDF0EB' },
          { label: 'Available', value: stats.available, color: '#4CAF50', bg: '#E8F5E9' },
          { label: 'Fully Booked', value: stats.busy, color: '#FF9800', bg: '#FFF8E1' },
          { label: 'On Leave', value: stats.onLeave, color: '#1565C0', bg: '#E3F2FD' },
          { label: 'Off Day', value: stats.offDay, color: '#8E24AA', bg: '#F3E5F5' },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className="bg-white rounded-xl border border-[#F0DDD5] px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
              <span className="text-[16px] font-bold font-serif" style={{ color }}>
                {value}
              </span>
            </div>
            <p className="text-[11px] text-[#aaa] m-0 font-serif">{label}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <TableSkeleton columns={7} rows={5} />
      ) : (
        <div className="bg-white rounded-2xl border border-[#F0DDD5] shadow-[0_2px_16px_rgba(196,154,122,0.08)] overflow-hidden">
          <div className="table-scroll-head grid px-6 py-3 bg-[#FDF6F2] border-b border-[#F0DDD5]" style={{ gridTemplateColumns: '48px 1fr 120px 130px 120px 100px 100px' }}>
            {['', 'Provider', 'Specialization', 'Working Day', 'Status', 'Bookings', 'Action'].map(header => (
              <span key={header} className="text-[11px] font-bold text-[#aaa] uppercase tracking-[0.08em] font-serif">
                {header}
              </span>
            ))}
          </div>

          {staffList.length === 0 && (
            <div className="py-16 text-center">
              <div className="text-[32px] mb-2">Sc</div>
              <p className="text-[13px] text-[#aaa] font-serif">No providers found</p>
            </div>
          )}

          <div className="table-scroll-area">
            {paginatedStaff.map(staff => {
              const status = getProviderAvailabilityStatus(staff, date, leaves, appointments)
              const config = STATUS_CONFIG[status]
              const staffAppointments = getStaffAppointments(staff._id)
              const isOpen = expanded === staff._id
              const specialization = typeof staff.specialization === 'string' ? staff.specialization : '—'

              return (
                <React.Fragment key={staff._id}>
                <div
                  className="grid items-center px-6 py-4 border-b border-[#F9F0EC] last:border-b-0 hover:bg-[#FDFAF8] transition-colors cursor-pointer"
                  style={{ gridTemplateColumns: '48px 1fr 120px 130px 120px 100px 100px' }}
                  onClick={() => setExpanded(isOpen ? null : staff._id)}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold text-white flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg,#C49A7A,#E8B89A)' }}
                  >
                    {staff.name.charAt(0).toUpperCase()}
                  </div>

                  <div>
                    <p className="text-[13px] font-bold text-[#2d2d2d] m-0 font-serif">{staff.name}</p>
                    <p className="text-[11px] text-[#aaa] m-0">{staff.email}</p>
                  </div>

                  <p className="text-[12px] text-[#666] font-serif m-0 capitalize">{specialization}</p>
                  <p className="text-[12px] text-[#666] font-serif m-0">{getWorkingDayLabel(staff.WorkingDay)}</p>

                  <div>
                    <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full ${config.bg} ${config.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
                      {config.label}
                    </span>
                  </div>

                  <div>
                    <span className="text-[13px] font-bold text-[#2d2d2d] font-serif">{staffAppointments.length}</span>
                    <span className="text-[11px] text-[#aaa] ml-1">/ day</span>
                  </div>

                  <div onClick={event => event.stopPropagation()}>
                    {status === 'free' && onBookForStaff && (
                      <button
                        onClick={() => onBookForStaff(staff._id)}
                        className="text-[11px] text-white px-3 py-1.5 rounded-lg border-none cursor-pointer hover:opacity-90 transition-opacity font-serif"
                        style={{ background: 'linear-gradient(135deg,#C49A7A,#E8B89A)' }}
                      >
                        Book
                      </button>
                    )}
                    {status === 'leave' && (
                      <span className="text-[11px] text-[#1565C0] bg-[#E3F2FD] px-2.5 py-1 rounded-full font-serif">Leave</span>
                    )}
                    {status === 'unavailable' && (
                      <span className="text-[11px] text-[#aaa] bg-[#F5F5F5] px-2.5 py-1 rounded-full font-serif">Inactive</span>
                    )}
                    {status === 'busy' && (
                      <span className="text-[11px] text-[#FF9800] bg-[#FFF8E1] px-2.5 py-1 rounded-full font-serif">Full</span>
                    )}
                    {status === 'offday' && (
                      <span className="text-[11px] text-[#8E24AA] bg-[#F3E5F5] px-2.5 py-1 rounded-full font-serif">Off Day</span>
                    )}
                  </div>
                </div>

                {isOpen && staffAppointments.length > 0 && (
                  <div className="px-6 py-3 bg-[#FDFAF8] border-b border-[#F0DDD5]">
                    <p className="text-[11px] text-[#aaa] uppercase tracking-[0.08em] mb-2 font-serif">Today's Schedule</p>
                    <div className="flex flex-col gap-1.5">
                      {staffAppointments.map(appointment => {
                        const customerName = typeof appointment.userID === 'string' ? appointment.userID : appointment.userID?.name || 'Unknown Customer'
                        const serviceName = typeof appointment.services === 'string' ? '—' : appointment.services?.name || 'Service'

                        return (
                          <div key={appointment._id} className="flex items-center gap-4 bg-white rounded-lg px-4 py-2.5 border border-[#F0DDD5]">
                            <span className="text-[12px] font-bold text-[#C49A7A] font-serif w-16">{formatTime(appointment.startTime)}</span>
                            <span className="text-[12px] text-[#2d2d2d] font-serif flex-1">{customerName}</span>
                            <span className="text-[11px] text-[#888] font-serif">{serviceName}</span>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-semibold capitalize ${
                                appointment.status === 'confirmed' ? 'bg-[#E8F5E9] text-[#4CAF50]' : 'bg-[#FFF8E1] text-[#FF9800]'
                              }`}
                            >
                              {appointment.status}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {isOpen && staffAppointments.length === 0 && (
                  <div className="px-6 py-3 bg-[#FDFAF8] border-b border-[#F0DDD5]">
                    <p className="text-[12px] text-[#aaa] font-serif m-0">No appointments scheduled for this day.</p>
                  </div>
                )}
                </React.Fragment>
              )
            })}
          </div>

          {staffList.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={staffList.length}
              pageSize={pageSize}
              itemLabel="providers"
              onPageChange={setCurrentPage}
              onPageSizeChange={nextPageSize => {
                setPageSize(nextPageSize)
                setCurrentPage(1)
              }}
              pageSizeOptions={PAGE_SIZE_OPTIONS}
            />
          )}
        </div>
      )}
    </div>
  )
}

export default StaffAvailabilityTable
