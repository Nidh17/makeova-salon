import React from 'react'
import type { IAppointment } from '@/api/AppointmentsApi'
import type { PaginationMeta } from '@/types'
import { formatTime, getCustomerName, getStaffName, getServiceName, getServicePrice, statusConfig } from './appointmentUtils'
import Pagination from '@/components/shared/Pagination'
import { TableSkeleton } from '@/components/shared/Skeleton'
import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from '@/utils/pagination'

interface AppointmentTableProps {
  appointments: IAppointment[]
  loading?: boolean
  onCancel?: (id: string) => void
  onConfirm?: (id: string) => void
  compact?: boolean // For admin/reports view
  showActions?: boolean
  pageSize?: number
  pagination?: PaginationMeta
  currentPage?: number
  onPageChange?: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
  pageSizeOptions?: number[]
}

const AppointmentTable: React.FC<AppointmentTableProps> = ({
  appointments,
  loading = false,
  onCancel,
  onConfirm,
  compact = false,
  showActions = true,
  pageSize = DEFAULT_PAGE_SIZE,
  pagination,
  currentPage: controlledPage,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = PAGE_SIZE_OPTIONS,
}) => {
  const [internalPage, setInternalPage] = React.useState(1)
  const isControlled = Boolean(pagination && controlledPage !== undefined && onPageChange)
  const currentPage: number = isControlled ? controlledPage ?? 1 : internalPage

  React.useEffect(() => {
    if (!isControlled) {
      setInternalPage(1)
    }
  }, [appointments.length, compact, isControlled, showActions, pageSize])

  const totalPages = isControlled
    ? Math.max(1, pagination?.totalPages || 1)
    : Math.max(1, Math.ceil(appointments.length / pageSize))
  const totalItems = isControlled ? pagination?.totalItems || appointments.length : appointments.length
  const effectivePageSize = isControlled ? pagination?.perPage || pageSize : pageSize
  const paginatedAppointments = isControlled
    ? appointments
    : appointments.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  React.useEffect(() => {
    if (!isControlled && currentPage > totalPages) {
      setInternalPage(totalPages)
    }
  }, [currentPage, isControlled, totalPages])

  if (loading) {
    return <TableSkeleton columns={compact ? 6 : 8} rows={5} compact={compact} />
  }

  if (appointments.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-[#F0DDD5] shadow-[0_2px_8px_rgba(196,154,122,0.05)] p-12 text-center">
        <div className="w-12 h-12 rounded-lg bg-[#FDF0EB] flex items-center justify-center mx-auto mb-3">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C49A7A" strokeWidth="1.5" strokeLinecap="round">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </div>
        <p className="text-[14px] text-[#999] m-0 font-serif">No appointments found</p>
      </div>
    )
  }

  const columns = compact
    ? ['Customer', 'Provider', 'Service', 'Date', 'Time', 'Status']
    : ['Customer', 'Provider', 'Service', 'Price', 'Date', 'Time', 'Status', 'Actions']

  return (
    <div className="bg-white rounded-2xl border border-[#F0DDD5] shadow-[0_2px_16px_rgba(196,154,122,0.08)] overflow-hidden">
      {/* Table header */}
      <div className="table-scroll-head grid gap-4 px-6 py-3 bg-[#FDF6F2] border-b border-[#F0DDD5]" style={{
        gridTemplateColumns: compact ? 'repeat(6, 1fr)' : 'repeat(8, 1fr)'
      }}>
        {columns.map(col => (
          <span key={col} className="text-[11px] font-bold text-[#aaa] uppercase tracking-[0.08em] font-serif">
            {col}
          </span>
        ))}
      </div>

      {/* Table rows */}
      <div className="table-scroll-area">
        {paginatedAppointments.map(apt => {
          const cfg = statusConfig[apt.status] || statusConfig.pending
          return (
            <div
              key={apt._id}
              className="grid gap-4 px-6 py-3.5 border-b border-[#F9F0EC] last:border-b-0 hover:bg-[#FDFAF8] transition-colors items-center"
              style={{ gridTemplateColumns: compact ? 'repeat(6, 1fr)' : 'repeat(8, 1fr)' }}
            >
            {/* Customer */}
            <div>
              <p className="text-[13px] font-semibold text-[#2d2d2d] m-0 font-serif">{getCustomerName(apt.userID)}</p>
            </div>

            {/* Staff */}
            <div>
              <p className="text-[13px] text-[#666] m-0 font-serif">{getStaffName(apt.staffID)}</p>
            </div>

            {/* Service */}
            <div>
              <p className="text-[13px] text-[#666] m-0 font-serif capitalize">{getServiceName(apt.services)}</p>
            </div>

            {/* Price */}
            {!compact && (
              <div>
                <p className="text-[13px] font-semibold text-[#C49A7A] m-0 font-serif">Rs {getServicePrice(apt.services).toLocaleString()}</p>
              </div>
            )}

            {/* Date */}
            <div>
              <p className="text-[13px] text-[#666] m-0 font-serif">{formatDateShort(apt.appointmentDate)}</p>
            </div>

            {/* Time */}
            <div>
              <p className="text-[13px] text-[#666] m-0 font-serif">
                {formatTime(apt.startTime)} - {formatTime(apt.endTime)}
              </p>
            </div>

            {/* Status */}
            <div>
              <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                {cfg.label}
              </span>
            </div>

            {/* Actions */}
            {showActions && !compact && (
              <div className="flex gap-1.5 items-center justify-end">
                {onConfirm && apt.status === 'pending' && (
                  <button
                    onClick={() => onConfirm(apt._id)}
                    className="text-[11px] font-semibold px-2.5 py-1.5 rounded-lg bg-[#E8F5E9] text-[#4CAF50] border border-[#4CAF50]/30 cursor-pointer hover:bg-[#4CAF50] hover:text-white transition-all font-serif"
                    title="Confirm appointment"
                  >
                    ✓
                  </button>
                )}
                {onCancel && apt.status !== 'cancelled' && (
                  <button
                    onClick={() => onCancel(apt._id)}
                    className="text-[11px] font-semibold px-2.5 py-1.5 rounded-lg bg-[#FFEBEE] text-[#E74C3C] border border-[#E74C3C]/30 cursor-pointer hover:bg-[#E74C3C] hover:text-white transition-all font-serif"
                    title="Cancel appointment"
                  >
                    ✕
                  </button>
                )}
              </div>
            )}
            </div>
          )
        })}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={effectivePageSize}
        itemLabel="appointments"
        onPageChange={isControlled ? onPageChange! : setInternalPage}
        onPageSizeChange={onPageSizeChange}
        pageSizeOptions={pageSizeOptions}
      />
    </div>
  )
}

// Short date formatter helper
function formatDateShort(dateStr: string): string {
  if (!dateStr) return '--'
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  } catch {
    return dateStr
  }
}

export default AppointmentTable
