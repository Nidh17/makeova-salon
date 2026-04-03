import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import AdminLayout from '../admin/AdminLayout'
import { AppointmentStatus, deleteAppointment, formatDate, formatTime, getAllAppointments, getField, IAppointment, STATUS_STYLE, updateAppointmentStatus } from '@/api/AppointmentsApi'
import StaffAvailabilityTable from './staffaviablitytable'
import BookAppointmentForm from './AppointmentForm'
import Pagination from '@/components/shared/Pagination'
import { SkeletonBlock, StatCardSkeletons, TableSkeleton } from '@/components/shared/Skeleton'
import type { PaginationMeta } from '@/types'
import { createEmptyPagination, DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from '@/utils/pagination'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'

const EMPTY_PAGINATION: PaginationMeta = createEmptyPagination()

const Modal: React.FC<{ title: string; onClose: () => void; children: React.ReactNode; wide?: boolean }> = ({ title, onClose, children, wide }) => (
  <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
    <div className={`relative z-10 bg-white rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.18)] w-full max-h-[92vh] overflow-y-auto ${wide ? 'max-w-[700px]' : 'max-w-[520px]'}`}>
      <div className="flex items-center justify-between px-6 py-5 border-b border-[#F0DDD5] sticky top-0 bg-white">
        <h3 className="text-[16px] font-bold text-[#2d2d2d] m-0 font-serif">{title}</h3>
        <button onClick={onClose} className="w-8 h-8 rounded-full bg-[#FDF6F2] flex items-center justify-center border-none cursor-pointer text-[#aaa] hover:text-[#C49A7A] transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  </div>
)

type Tab = 'appointments' | 'availability'

const AppointmentCalendar: React.FC = () => {
  const [appointments, setAppointments] = useState<IAppointment[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [tab, setTab] = useState<Tab>('appointments')
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | 'all'>('all')
  const [search, setSearch] = useState('')
  const [showBook, setShowBook] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState<PaginationMeta>(EMPTY_PAGINATION)
  const pageSize = DEFAULT_PAGE_SIZE
  const debouncedSearch = useDebouncedValue(search)
  const hasLoadedOnceRef = useRef(false)
  const normalizedSearch = debouncedSearch.trim().toLowerCase()

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchAll = useCallback(async (page = currentPage, preserveTable = hasLoadedOnceRef.current) => {
    if (preserveTable) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }

    try {
      const isSearching = debouncedSearch.trim().length > 0
      const response = await getAllAppointments({
        page: isSearching ? 1 : page,
        limit: isSearching ? 1000 : pageSize,
        search: undefined,
        status: statusFilter === 'all' ? undefined : statusFilter,
      })
      setAppointments(response.items)
      setPagination(response.pagination)
      hasLoadedOnceRef.current = true
    } catch (err) {
      console.error('Failed to load appointments:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [currentPage, debouncedSearch, pageSize, statusFilter])

  useEffect(() => {
    void fetchAll(currentPage)
  }, [currentPage, fetchAll])

  const handleStatusChange = async (id: string, status: AppointmentStatus) => {
    try {
      await updateAppointmentStatus(id, status)
      setAppointments(prev => prev.map(a => a._id === id ? { ...a, status } : a))
      showToast(`Appointment ${status}!`)
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to update', 'error')
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this appointment?')) return
    try {
      await deleteAppointment(id)
      setAppointments(prev => prev.filter(a => a._id !== id))
      showToast('Appointment deleted!')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to delete', 'error')
    }
  }

  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearch, statusFilter, tab])

  const stats = {
    total: pagination.totalItems,
    pending: appointments.filter(a => a.status === 'pending').length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    completed: appointments.filter(a => a.status === 'completed').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length,
  }

  const filteredAppointments = useMemo(() => {
    if (!normalizedSearch) return appointments

    return appointments.filter(apt => {
      const customerName = getField(apt.userID as any, 'name').toLowerCase()
      const providerName = getField(apt.staffID as any, 'name').toLowerCase()
      const serviceName = (typeof apt.services === 'string' ? apt.services : apt.services?.name || '').toLowerCase()
      const statusName = apt.status.toLowerCase()
      const dateValue = formatDate(apt.appointmentDate).toLowerCase()
      const timeValue = formatTime(apt.startTime).toLowerCase()

      return [customerName, providerName, serviceName, statusName, dateValue, timeValue]
        .some(value => value.includes(normalizedSearch))
    })
  }, [appointments, normalizedSearch])

  const isSearchMode = normalizedSearch.length > 0
  const filteredTotalPages = Math.max(1, Math.ceil(filteredAppointments.length / pageSize))
  const visibleAppointments = isSearchMode
    ? filteredAppointments.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : appointments

  return (
    <AdminLayout>
      {toast && (
        <div className={`fixed top-5 right-5 z-[500] flex items-center gap-2.5 px-5 py-3.5 rounded-xl shadow-lg text-white text-[13px] font-serif ${toast.type === 'success' ? 'bg-[#4CAF50]' : 'bg-[#E53935]'}`}>
          {toast.type === 'success'
            ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
            : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /></svg>
          }
          {toast.msg}
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-2">
            <SkeletonBlock className="h-7 w-40" />
            <SkeletonBlock className="h-3 w-36" />
          </div>
          <SkeletonBlock className="h-11 w-40 rounded-xl" />
        </div>
      )}
      {!loading && (
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-[22px] font-bold text-[#2d2d2d] m-0 font-serif">Appointments</h1>
            <p className="text-[13px] text-[#aaa] mt-1 mb-0">{stats.total} total · {stats.confirmed} confirmed {refreshing ? '· updating...' : ''}</p>
          </div>
          <button
            onClick={() => setShowBook(true)}
            className="flex items-center gap-2 text-white text-[13px] font-semibold font-serif px-5 py-[10px] rounded-xl border-none cursor-pointer hover:opacity-90 transition-opacity shadow-[0_4px_14px_rgba(196,154,122,0.3)]"
            style={{ background: 'linear-gradient(135deg,#C49A7A,#E8B89A)' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Book Appointment
          </button>
        </div>
      )}

      {loading && (
        <div className="grid grid-cols-5 gap-3 mb-6">
          <StatCardSkeletons count={5} />
        </div>
      )}
      {!loading && (
        <div className="grid grid-cols-5 gap-3 mb-6">
          {[
            { label: 'Total', value: stats.total, color: '#C49A7A', bg: '#FDF0EB' },
            { label: 'Pending', value: stats.pending, color: '#FF9800', bg: '#FFF8E1' },
            { label: 'Confirmed', value: stats.confirmed, color: '#4CAF50', bg: '#E8F5E9' },
            { label: 'Completed', value: stats.completed, color: '#1565C0', bg: '#E3F2FD' },
            { label: 'Cancelled', value: stats.cancelled, color: '#E53935', bg: '#FFEBEE' },
          ].map(({ label, value, color, bg }) => (
            <div
              key={label}
              onClick={() => setStatusFilter(label.toLowerCase() as AppointmentStatus | 'all')}
              className="bg-white rounded-xl border border-[#F0DDD5] px-4 py-3 flex items-center gap-3 cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
                <span className="text-[15px] font-bold font-serif" style={{ color }}>{value}</span>
              </div>
              <p className="text-[11px] text-[#aaa] m-0 font-serif">{label}</p>
            </div>
          ))}
        </div>
      )}

      {loading && (
        <div className="flex gap-2 mb-6">
          <SkeletonBlock className="h-11 w-44 rounded-xl" />
          <SkeletonBlock className="h-11 w-40 rounded-xl" />
        </div>
      )}
      {!loading && (
        <div className="flex gap-2 mb-6">
          {(['appointments', 'availability'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-[10px] rounded-xl text-[13px] capitalize font-serif border-2 cursor-pointer transition-all ${tab === t ? 'bg-[#C49A7A] text-white border-[#C49A7A]' : 'bg-white text-[#888] border-[#F0DDD5] hover:border-[#C49A7A]'}`}
            >
              {t === 'appointments' ? 'All Appointments' : 'Provider Availability'}
            </button>
          ))}
        </div>
      )}

      {tab === 'appointments' && (
        <>
          {loading && (
            <div className="flex items-center gap-3 mb-5">
              <SkeletonBlock className="h-11 flex-1 rounded-xl" />
              <SkeletonBlock className="h-11 w-16 rounded-xl" />
              <SkeletonBlock className="h-11 w-20 rounded-xl" />
              <SkeletonBlock className="h-11 w-20 rounded-xl" />
              <SkeletonBlock className="h-11 w-20 rounded-xl" />
              <SkeletonBlock className="h-11 w-20 rounded-xl" />
            </div>
          )}
          {!loading && (
            <div className="flex items-center gap-3 mb-5">
              <div className="relative flex-1">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C49A7A" strokeWidth="1.8" className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search by customer, provider, service..."
                  className="w-full pl-9 pr-4 py-[10px] border-2 border-[#F0DDD5] rounded-xl text-[13px] outline-none focus:border-[#C49A7A] bg-white font-serif"
                />
              </div>
              {(['all', 'pending', 'confirmed', 'completed', 'cancelled'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-4 py-[10px] rounded-xl text-[12px] capitalize font-serif border-2 cursor-pointer transition-all ${statusFilter === s ? 'bg-[#C49A7A] text-white border-[#C49A7A]' : 'bg-white text-[#888] border-[#F0DDD5] hover:border-[#C49A7A]'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <div className="bg-white rounded-2xl border border-[#F0DDD5] shadow-[0_2px_16px_rgba(196,154,122,0.08)] overflow-hidden">
            <div className="table-scroll-head grid px-6 py-3 bg-[#FDF6F2] border-b border-[#F0DDD5]" style={{ gridTemplateColumns: '1fr 1fr 1fr 130px 110px 110px 120px' }}>
              {['Customer', 'Provider', 'Service', 'Date & Time', 'Price', 'Status', 'Actions'].map(h => (
                <span key={h} className="text-[11px] font-bold text-[#aaa] uppercase tracking-[0.08em] font-serif">{h}</span>
              ))}
            </div>

            {loading && <TableSkeleton columns={7} rows={5} />}

            {!loading && filteredAppointments.length === 0 && (
              <div className="py-16 text-center">
                <div className="text-[32px] mb-2">📋</div>
                <p className="text-[14px] font-bold text-[#2d2d2d] m-0 font-serif">No appointments found</p>
                <p className="text-[12px] text-[#aaa] mt-1 m-0">Try a different filter or book a new appointment</p>
              </div>
            )}

            {!loading && (
              <div className="table-scroll-area">
                {visibleAppointments.map(apt => {
                  const st = STATUS_STYLE[apt.status]
                  return (
                    <div key={apt._id} className="grid items-center px-6 py-4 border-b border-[#F9F0EC] last:border-b-0 hover:bg-[#FDFAF8] transition-colors" style={{ gridTemplateColumns: '1fr 1fr 1fr 130px 110px 110px 120px' }}>
                  <div>
                    <p className="text-[13px] font-bold text-[#2d2d2d] m-0 font-serif truncate">{getField(apt.userID as any, 'name')}</p>
                    <p className="text-[11px] text-[#aaa] m-0">{getField(apt.userID as any, 'phonenumber')}</p>
                  </div>

                  <div>
                    <p className="text-[13px] text-[#666] m-0 font-serif truncate">{getField(apt.staffID as any, 'name')}</p>
                  </div>

                  <div>
                    <p className="text-[13px] text-[#666] m-0 font-serif truncate">
                      {(!apt.services || typeof apt.services === 'string') ? '—' : apt.services.name}
                    </p>
                    <p className="text-[11px] text-[#aaa] m-0">
                      {(!apt.services || typeof apt.services === 'string') ? '' : `${apt.services.duration}min`}
                    </p>
                  </div>

                  <div>
                    <p className="text-[12px] font-semibold text-[#2d2d2d] m-0 font-serif">{formatDate(apt.appointmentDate)}</p>
                    <p className="text-[11px] text-[#aaa] m-0">{formatTime(apt.startTime)}</p>
                  </div>

                  <div>
                    <span className="text-[13px] font-bold text-[#C49A7A] font-serif">₹{apt.totalPrice.toLocaleString()}</span>
                  </div>

                  <div>
                    <select
                      value={apt.status}
                      onChange={e => handleStatusChange(apt._id, e.target.value as AppointmentStatus)}
                      className={`text-[11px] font-semibold px-2 py-1 rounded-lg border-none cursor-pointer outline-none capitalize font-serif ${st.bg} ${st.text}`}
                    >
                      {(['pending', 'confirmed', 'completed', 'cancelled'] as AppointmentStatus[]).map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleStatusChange(apt._id, 'confirmed')}
                      disabled={apt.status === 'confirmed' || apt.status === 'completed'}
                      title="Confirm"
                      className="w-7 h-7 rounded-lg bg-[#E8F5E9] flex items-center justify-center border-none cursor-pointer hover:bg-[#C8E6C9] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                    </button>
                    <button
                      onClick={() => handleStatusChange(apt._id, 'cancelled')}
                      disabled={apt.status === 'cancelled' || apt.status === 'completed'}
                      title="Cancel"
                      className="w-7 h-7 rounded-lg bg-[#FFEBEE] flex items-center justify-center border-none cursor-pointer hover:bg-[#FFCDD2] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#E53935" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    </button>
                    <button
                      onClick={() => handleDelete(apt._id)}
                      title="Delete"
                      className="w-7 h-7 rounded-lg bg-[#F5F5F5] flex items-center justify-center border-none cursor-pointer hover:bg-[#E0E0E0] transition-colors"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2" strokeLinecap="round"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" /></svg>
                    </button>
                  </div>
                    </div>
                  )
                })}
              </div>
            )}

            {!loading && (isSearchMode ? filteredAppointments.length > 0 : pagination.totalItems > 0) && (
              <Pagination
                currentPage={currentPage}
                totalPages={isSearchMode ? filteredTotalPages : pagination.totalPages}
                totalItems={isSearchMode ? filteredAppointments.length : pagination.totalItems}
                pageSize={isSearchMode ? pageSize : (pagination.perPage || pageSize)}
                itemLabel="appointments"
                onPageChange={setCurrentPage}
                pageSizeOptions={PAGE_SIZE_OPTIONS}
              />
            )}
          </div>
        </>
      )}

      {tab === 'availability' && (
        <StaffAvailabilityTable
          onBookForStaff={() => {
            setShowBook(true)
          }}
        />
      )}

      {showBook && (
        <Modal title="Book Appointment" onClose={() => setShowBook(false)} wide>
          <BookAppointmentForm
            onSuccess={() => {
              setShowBook(false)
              void fetchAll(currentPage, true)
              showToast('Appointment booked successfully!')
            }}
            onCancel={() => setShowBook(false)}
          />
        </Modal>
      )}
    </AdminLayout>
  )
}

export default AppointmentCalendar
