import React, { useEffect, useState } from 'react'
import AppointmentForm from '../appointments/AppointmentForm'
import AppointmentTable from '../appointments/AppointmentTable'
import ReceptionistLayout from './Receptionistlayout'
import { getAllAppointments, updateAppointmentStatus, type IAppointment } from '@/api/AppointmentsApi'
import type { PaginationMeta } from '@/types'
import { createEmptyPagination, DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from '@/utils/pagination'

const EMPTY_PAGINATION: PaginationMeta = createEmptyPagination()

const ReceptionistBooking: React.FC = () => {
  const [bookings, setBookings] = useState<IAppointment[]>([])
  const [successMsg, setSuccessMsg] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [pagination, setPagination] = useState<PaginationMeta>(EMPTY_PAGINATION)

  const loadAppointments = async (page = currentPage, limit = pageSize) => {
    try {
      setLoading(true)
      const response = await getAllAppointments({ page, limit })
      setBookings(response.items)
      setPagination(response.pagination)
    } catch (error) {
      console.error('Failed to load appointments:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAppointments(1, pageSize)
  }, [pageSize])

  const handleSuccess = async () => {
    setSuccessMsg(true)
    setShowForm(false)
    setTimeout(() => setSuccessMsg(false), 3000)
    await loadAppointments(currentPage)
  }

  const cancelAppt = async (id: string) => {
    try {
      await updateAppointmentStatus(id, 'cancelled')
      setBookings(prev => prev.map(a => (a._id === id ? { ...a, status: 'cancelled' } : a)))
    } catch (error) {
      console.error('Failed to cancel appointment:', error)
    }
  }

  const confirmAppt = async (id: string) => {
    try {
      await updateAppointmentStatus(id, 'confirmed')
      setBookings(prev => prev.map(a => (a._id === id ? { ...a, status: 'confirmed' } : a)))
    } catch (error) {
      console.error('Failed to confirm appointment:', error)
    }
  }

  const completeAppt = async (id: string) => {
    try {
      await updateAppointmentStatus(id, 'completed')
      setBookings(prev => prev.map(a => (a._id === id ? { ...a, status: 'completed' } : a)))
    } catch (error) {
      console.error('Failed to complete appointment:', error)
    }
  }

  return (
    <ReceptionistLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-bold text-[#2d2d2d] m-0 font-serif">All Appointments</h1>
          <p className="text-[13px] text-[#aaa] mt-1 mb-0">
            {pagination.totalItems} total · page {pagination.currentPage} of {pagination.totalPages}
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
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

      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total', value: pagination.totalItems, color: '#C49A7A', bg: '#FDF0EB' },
          { label: 'Confirmed', value: bookings.filter(a => a.status === 'confirmed').length, color: '#4CAF50', bg: '#E8F5E9' },
          { label: 'Pending', value: bookings.filter(a => a.status === 'pending').length, color: '#FF9800', bg: '#FFF8E1' },
          { label: 'Cancelled', value: bookings.filter(a => a.status === 'cancelled').length, color: '#E53935', bg: '#FFEBEE' },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className="bg-white rounded-xl border border-[#F0DDD5] px-4 py-3 flex items-center gap-3 cursor-pointer hover:shadow-md transition-shadow">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
              <span className="text-[15px] font-bold font-serif" style={{ color }}>{value}</span>
            </div>
            <p className="text-[11px] text-[#aaa] m-0 font-serif">{label}</p>
          </div>
        ))}
      </div>

      {successMsg && (
        <div className="bg-[#E8F5E9] border border-[#81C784] rounded-xl px-4 py-3 mb-6 flex items-center gap-2.5 animate-in">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="2.4" strokeLinecap="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span className="text-[13px] text-[#2E7D32] font-serif font-medium">Appointment booked successfully!</span>
        </div>
      )}

      <AppointmentTable
        appointments={bookings}
        loading={loading}
        onCancel={cancelAppt}
        onConfirm={confirmAppt}
        onComplete={completeAppt}
        showActions={true}
        actorRole="receptionist"
        pageSize={pageSize}
        pagination={pagination}
        currentPage={currentPage}
        onPageChange={page => {
          setCurrentPage(page)
          loadAppointments(page)
        }}
        onPageSizeChange={nextPageSize => {
          setPageSize(nextPageSize)
          setCurrentPage(1)
        }}
        pageSizeOptions={PAGE_SIZE_OPTIONS}
      />

      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.2)] w-full max-w-[540px] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#F0DDD5] bg-gradient-to-r from-[#FDF6F2] to-white sticky top-0 z-10">
              <h3 className="text-[17px] font-bold text-[#2d2d2d] m-0 font-serif">Book New Appointment</h3>
              <button
                onClick={() => setShowForm(false)}
                className="w-8 h-8 rounded-full bg-[#FDF6F2] flex items-center justify-center border-none cursor-pointer text-[#999] hover:text-[#C49A7A] hover:bg-[#F5C8BC] transition-all"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="px-6 py-6">
              <AppointmentForm onSuccess={handleSuccess} onCancel={() => setShowForm(false)} />
            </div>
          </div>
        </div>
      )}
    </ReceptionistLayout>
  )
}

export default ReceptionistBooking
