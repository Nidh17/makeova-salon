import React from 'react'
import type { IAppointment } from '@/api/AppointmentsApi'
import type { PaginationMeta } from '@/types'
import {
  formatTime,
  getAppointmentActions,
  getCustomerName,
  getStaffName,
  getServiceName,
  getServicePrice,
  statusConfig,
  type AppointmentActorRole,
} from './appointmentUtils'
import Pagination from '@/components/shared/Pagination'
import { TableSkeleton } from '@/components/shared/Skeleton'
import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from '@/utils/pagination'

interface AppointmentTableProps {
  appointments: IAppointment[]
  loading?: boolean
  onCancel?: (id: string) => void
  onConfirm?: (id: string) => void
  onComplete?: (id: string) => void
  compact?: boolean
  showActions?: boolean
  actorRole?: AppointmentActorRole
  pageSize?: number
  pagination?: PaginationMeta
  currentPage?: number
  onPageChange?: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
  pageSizeOptions?: number[]
  variant?: 'admin' | 'receptionist'
}

const TABLE_THEME = {
  admin: {
    card: 'border-[#F0DDD5] shadow-[0_2px_16px_rgba(196,154,122,0.08)]',
    head: 'bg-[#FDF6F2] border-[#F0DDD5]',
    headText: 'text-[#aaa]',
    row: 'border-[#F9F0EC] hover:bg-[#FDFAF8]',
    emptyCard: 'border-[#F0DDD5] shadow-[0_2px_8px_rgba(196,154,122,0.05)]',
    emptyIconBg: 'bg-[#FDF0EB]',
    emptyIconStroke: '#C49A7A',
    title: 'text-[#2d2d2d]',
    body: 'text-[#666]',
    price: 'text-[#C49A7A]',
    pagination: 'admin' as const,
  },
  receptionist: {
    card: 'border-[#E3CFD8] shadow-[0_2px_16px_rgba(155,92,116,0.08)]',
    head: 'bg-[#FBF3F7] border-[#E3CFD8]',
    headText: 'text-[#B08E9B]',
    row: 'border-[#F2E7EC] hover:bg-[#FFF8FB]',
    emptyCard: 'border-[#E3CFD8] shadow-[0_2px_8px_rgba(155,92,116,0.05)]',
    emptyIconBg: 'bg-[#F8EAF0]',
    emptyIconStroke: '#9B5C74',
    title: 'text-[#2f2228]',
    body: 'text-[#715864]',
    price: 'text-[#9B5C74]',
    pagination: 'receptionist' as const,
  },
}

const AppointmentTable: React.FC<AppointmentTableProps> = ({
  appointments,
  loading = false,
  onCancel,
  onConfirm,
  onComplete,
  compact = false,
  showActions = true,
  actorRole = 'receptionist',
  pageSize = DEFAULT_PAGE_SIZE,
  pagination,
  currentPage: controlledPage,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = PAGE_SIZE_OPTIONS,
  variant = actorRole === 'receptionist' ? 'receptionist' : 'admin',
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
  const theme = TABLE_THEME[variant]

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
      <div className={`bg-white rounded-xl p-12 text-center ${theme.emptyCard}`}>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3 ${theme.emptyIconBg}`}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={theme.emptyIconStroke} strokeWidth="1.5" strokeLinecap="round">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </div>
        <p className={`text-[14px] m-0 font-serif ${theme.body}`}>No appointments found</p>
      </div>
    )
  }

  const columns = compact
    ? ['Customer', 'Provider', 'Service', 'Date', 'Time', 'Status']
    : ['Customer', 'Provider', 'Service', 'Price', 'Date', 'Time', 'Status', 'Actions']

  return (
    <div className={`bg-white rounded-2xl overflow-hidden ${theme.card}`}>
      <div
        className={`table-scroll-head grid gap-4 px-6 py-3 border-b ${theme.head}`}
        style={{ gridTemplateColumns: compact ? 'repeat(6, 1fr)' : 'repeat(8, 1fr)' }}
      >
        {columns.map(col => (
          <span key={col} className={`text-[11px] font-bold uppercase tracking-[0.08em] font-serif ${theme.headText}`}>
            {col}
          </span>
        ))}
      </div>

      <div className="table-scroll-area">
        {paginatedAppointments.map(apt => {
          const cfg = statusConfig[apt.status] || statusConfig.pending
          const actions = getAppointmentActions(apt.status, actorRole)

          return (
            <div
              key={apt._id}
              className={`grid gap-4 px-6 py-3.5 border-b last:border-b-0 transition-colors items-center ${theme.row}`}
              style={{ gridTemplateColumns: compact ? 'repeat(6, 1fr)' : 'repeat(8, 1fr)' }}
            >
              <div>
                <p className={`text-[13px] font-semibold m-0 font-serif ${theme.title}`}>{getCustomerName(apt.userID)}</p>
              </div>

              <div>
                <p className={`text-[13px] m-0 font-serif ${theme.body}`}>{getStaffName(apt.staffID)}</p>
              </div>

              <div>
                <p className={`text-[13px] m-0 font-serif capitalize ${theme.body}`}>{getServiceName(apt.services)}</p>
              </div>

              {!compact && (
                <div>
                  <p className={`text-[13px] font-semibold m-0 font-serif ${theme.price}`}>Rs {getServicePrice(apt.services).toLocaleString()}</p>
                </div>
              )}

              <div>
                <p className={`text-[13px] m-0 font-serif ${theme.body}`}>{formatDateShort(apt.appointmentDate)}</p>
              </div>

              <div>
                <p className={`text-[13px] m-0 font-serif ${theme.body}`}>
                  {formatTime(apt.startTime)} - {formatTime(apt.endTime)}
                </p>
              </div>

              <div>
                <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.text}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                  {cfg.label}
                </span>
              </div>

              {showActions && !compact && (
                <div className="flex gap-1.5 items-center justify-end">
                  {onConfirm && actions.canConfirm && (
                    <button
                      onClick={() => onConfirm(apt._id)}
                      className="text-[11px] font-semibold px-2.5 py-1.5 rounded-lg bg-[#E8F5E9] text-[#4CAF50] border border-[#4CAF50]/30 cursor-pointer hover:bg-[#4CAF50] hover:text-white transition-all font-serif"
                      title="Confirm appointment"
                    >
                      Confirm
                    </button>
                  )}
                  {onComplete && actions.canComplete && (
                    <button
                      onClick={() => onComplete(apt._id)}
                      className="text-[11px] font-semibold px-2.5 py-1.5 rounded-lg bg-[#E3F2FD] text-[#1565C0] border border-[#1565C0]/30 cursor-pointer hover:bg-[#1565C0] hover:text-white transition-all font-serif"
                      title="Complete appointment"
                    >
                      Complete
                    </button>
                  )}
                  {onCancel && actions.canCancel && (
                    <button
                      onClick={() => onCancel(apt._id)}
                      className="text-[11px] font-semibold px-2.5 py-1.5 rounded-lg bg-[#FFEBEE] text-[#E74C3C] border border-[#E74C3C]/30 cursor-pointer hover:bg-[#E74C3C] hover:text-white transition-all font-serif"
                      title="Cancel appointment"
                    >
                      Cancel
                    </button>
                  )}
                  {!actions.canConfirm && !actions.canCancel && !actions.canComplete && actions.isReadOnly && (
                    <span className={`rounded-lg px-2.5 py-1.5 text-[11px] font-semibold border font-serif ${
                      actions.finalLabel === 'Cancelled'
                        ? 'bg-[#FFEBEE] text-[#E53935] border-[#E53935]/20'
                        : 'bg-[#EEF7FF] text-[#1565C0] border-[#1565C0]/20'
                    }`}>
                      {actions.finalLabel || 'Done'}
                    </span>
                  )}
                  {!actions.canConfirm && !actions.canCancel && !actions.canComplete && !actions.isReadOnly && (
                    <span className="text-[11px] font-semibold text-[#B8AAA2] font-serif">No actions</span>
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
        variant={theme.pagination}
      />
    </div>
  )
}

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
