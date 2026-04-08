import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ClipboardList } from 'lucide-react'
import AdminLayout from '../admin/AdminLayout'
import {
  deleteAppointment,
  formatDate,
  formatTime,
  getAllAppointments,
  getField,
  type AppointmentStatus,
  type IAppointment,
  updateAppointmentStatus,
} from '@/api/AppointmentsApi'
import AppointmentForm from './AppointmentForm'
import AppointmentTable from './AppointmentTable'
import StaffAvailabilityTable from './staffaviablitytable'
import { SkeletonBlock, StatCardSkeletons } from '@/components/shared/Skeleton'
import type { PaginationMeta } from '@/types'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { createEmptyPagination, DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from '@/utils/pagination'

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

const AdminAppointmentCalendar: React.FC = () => {
  const [appointments, setAppointments] = useState<IAppointment[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [tab, setTab] = useState<Tab>('appointments')
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | 'all'>('all')
  const [search, setSearch] = useState('')
  const [showBook, setShowBook] = useState(false)
  const [editingAppointment, setEditingAppointment] = useState<IAppointment | null>(null)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState<PaginationMeta>(EMPTY_PAGINATION)
  const pageSize = DEFAULT_PAGE_SIZE
  const debouncedSearch = useDebouncedValue(search)
  const hasLoadedOnceRef = useRef(false)
  const normalizedSearch = debouncedSearch.trim().toLowerCase()

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type })
    window.setTimeout(() => setToast(null), 3000)
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
    } catch (error) {
      console.error('Failed to load appointments:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [currentPage, debouncedSearch, pageSize, statusFilter])

  useEffect(() => {
    void fetchAll(currentPage)
  }, [currentPage, fetchAll])

  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearch, statusFilter, tab])

  const handleStatusChange = async (id: string, status: AppointmentStatus) => {
    try {
      await updateAppointmentStatus(id, status)
      setAppointments(prev => prev.map(item => item._id === id ? { ...item, status } : item))
      showToast(`Appointment ${status}!`)
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to update appointment', 'error')
    }
  }

  const handleDelete = async (appointment: IAppointment) => {
    try {
      await deleteAppointment(appointment._id)
      await fetchAll(currentPage, true)
      showToast('Appointment deleted successfully!')
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to delete appointment', 'error')
    }
  }

  const stats = {
    total: pagination.totalItems,
    pending: appointments.filter(item => item.status === 'pending').length,
    confirmed: appointments.filter(item => item.status === 'confirmed').length,
    completed: appointments.filter(item => item.status === 'completed').length,
    cancelled: appointments.filter(item => item.status === 'cancelled').length,
  }

  const filteredAppointments = useMemo(() => {
    if (!normalizedSearch) return appointments

    return appointments.filter(appointment => {
      const customerName = getField(appointment.userID as never, 'name').toLowerCase()
      const providerName = getField(appointment.staffID as never, 'name').toLowerCase()
      const serviceName = (typeof appointment.services === 'string' ? appointment.services : appointment.services?.name || '').toLowerCase()
      const statusName = appointment.status.toLowerCase()
      const dateValue = formatDate(appointment.appointmentDate).toLowerCase()
      const timeValue = formatTime(appointment.startTime).toLowerCase()

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
          {toast.msg}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-2">
            <SkeletonBlock className="h-7 w-40" />
            <SkeletonBlock className="h-3 w-36" />
          </div>
          <SkeletonBlock className="h-11 w-40 rounded-xl" />
        </div>
      ) : (
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-[22px] font-bold text-[#2d2d2d] m-0 font-serif">Appointments</h1>
            <p className="text-[13px] text-[#aaa] mt-1 mb-0">{stats.total} total · {stats.confirmed} confirmed {refreshing ? '· updating...' : ''}</p>
          </div>
          <button
            onClick={() => {
              setEditingAppointment(null)
              setShowBook(true)
            }}
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

      {loading ? (
        <div className="grid grid-cols-5 gap-3 mb-6">
          <StatCardSkeletons count={5} />
        </div>
      ) : (
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

      {!loading && (
        <div className="flex gap-2 mb-6">
          {(['appointments', 'availability'] as Tab[]).map(item => (
            <button
              key={item}
              onClick={() => setTab(item)}
              className={`px-5 py-[10px] rounded-xl text-[13px] capitalize font-serif border-2 cursor-pointer transition-all ${tab === item ? 'bg-[#C49A7A] text-white border-[#C49A7A]' : 'bg-white text-[#888] border-[#F0DDD5] hover:border-[#C49A7A]'}`}
            >
              {item === 'appointments' ? 'All Appointments' : 'Provider Availability'}
            </button>
          ))}
        </div>
      )}

      {tab === 'appointments' && !loading && (
        <>
          <div className="flex items-center gap-3 mb-5">
            <div className="relative flex-1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C49A7A" strokeWidth="1.8" className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                value={search}
                onChange={event => setSearch(event.target.value)}
                placeholder="Search by customer, provider, service..."
                className="w-full pl-9 pr-4 py-[10px] border-2 border-[#F0DDD5] rounded-xl text-[13px] outline-none focus:border-[#C49A7A] bg-white font-serif"
              />
            </div>
            {(['all', 'pending', 'confirmed', 'completed', 'cancelled'] as const).map(item => (
              <button
                key={item}
                onClick={() => setStatusFilter(item)}
                className={`px-4 py-[10px] rounded-xl text-[12px] capitalize font-serif border-2 cursor-pointer transition-all ${statusFilter === item ? 'bg-[#C49A7A] text-white border-[#C49A7A]' : 'bg-white text-[#888] border-[#F0DDD5] hover:border-[#C49A7A]'}`}
              >
                {item}
              </button>
            ))}
          </div>

          {filteredAppointments.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#F0DDD5] shadow-[0_2px_16px_rgba(196,154,122,0.08)] overflow-hidden py-16 text-center">
              <div className="mb-2 flex justify-center text-[#C49A7A]"><ClipboardList size={30} strokeWidth={1.8} /></div>
              <p className="text-[14px] font-bold text-[#2d2d2d] m-0 font-serif">No appointments found</p>
              <p className="text-[12px] text-[#aaa] mt-1 m-0">Try a different filter or book a new appointment</p>
            </div>
          ) : (
            <AppointmentTable
              appointments={visibleAppointments}
              onCancel={id => handleStatusChange(id, 'cancelled')}
              onConfirm={id => handleStatusChange(id, 'confirmed')}
              onComplete={id => handleStatusChange(id, 'completed')}
              onActionBlocked={message => showToast(message, 'error')}
              onEdit={appointment => {
                setEditingAppointment(appointment)
                setShowBook(true)
              }}
              onDelete={handleDelete}
              showActions={true}
              actorRole="admin"
              variant="admin"
              currentPage={currentPage}
              pageSize={isSearchMode ? pageSize : (pagination.perPage || pageSize)}
              pagination={{
                ...pagination,
                totalPages: isSearchMode ? filteredTotalPages : pagination.totalPages,
                totalItems: isSearchMode ? filteredAppointments.length : pagination.totalItems,
                perPage: isSearchMode ? pageSize : (pagination.perPage || pageSize),
              }}
              onPageChange={setCurrentPage}
              pageSizeOptions={PAGE_SIZE_OPTIONS}
            />
          )}
        </>
      )}

      {tab === 'availability' && (
        <StaffAvailabilityTable
          onBookForStaff={() => {
            setEditingAppointment(null)
            setShowBook(true)
          }}
        />
      )}

      {showBook && (
        <Modal
          title={editingAppointment ? 'Edit Appointment' : 'Book Appointment'}
          onClose={() => {
            setShowBook(false)
            setEditingAppointment(null)
          }}
          wide
        >
          <AppointmentForm
            appointment={editingAppointment}
            onSuccess={() => {
              const isEditing = Boolean(editingAppointment)
              setShowBook(false)
              setEditingAppointment(null)
              void fetchAll(currentPage, true)
              showToast(isEditing ? 'Appointment updated successfully!' : 'Appointment booked successfully!')
            }}
            onCancel={() => {
              setShowBook(false)
              setEditingAppointment(null)
            }}
          />
        </Modal>
      )}
    </AdminLayout>
  )
}

export default AdminAppointmentCalendar
