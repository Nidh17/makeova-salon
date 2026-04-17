import React from 'react'
import { ArrowDown, ArrowUp, Check, CheckCheck, ChevronDown, Pencil, Trash2, X } from 'lucide-react'
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
  onActionBlocked?: (message: string) => void
  onEdit?: (appointment: IAppointment) => void
  onDelete?: (appointment: IAppointment) => void
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
    card: 'border-[#EAD8CB] shadow-[0_12px_30px_rgba(196,154,122,0.10)]',
    head: 'bg-[linear-gradient(180deg,#FCF7F3_0%,#F8EFE8_100%)] border-[#EAD8CB]',
    headText: 'text-[#9D8777]',
    row: 'border-[#F4E8E0] hover:bg-[#FFFDFC]',
    emptyCard: 'border-[#F0DDD5] shadow-[0_2px_8px_rgba(196,154,122,0.05)]',
    emptyIconBg: 'bg-[#FDF0EB]',
    emptyIconStroke: '#C49A7A',
    title: 'text-[#2F2723]',
    body: 'text-[#6E625B]',
    price: 'text-[#C49A7A]',
    pagination: 'admin' as const,
  },
  receptionist: {
    card: 'border-[#E3CFD8] shadow-[0_12px_28px_rgba(155,92,116,0.10)]',
    head: 'bg-[linear-gradient(180deg,#FCF7F9_0%,#F8EEF3_100%)] border-[#E3CFD8]',
    headText: 'text-[#A68492]',
    row: 'border-[#F2E7EC] hover:bg-[#FFF9FC]',
    emptyCard: 'border-[#E3CFD8] shadow-[0_2px_8px_rgba(155,92,116,0.05)]',
    emptyIconBg: 'bg-[#F8EAF0]',
    emptyIconStroke: '#9B5C74',
    title: 'text-[#2f2228]',
    body: 'text-[#715864]',
    price: 'text-[#9B5C74]',
    pagination: 'receptionist' as const,
  },
}

const iconButtonBase = 'inline-flex h-9 w-9 items-center justify-center rounded-xl border cursor-pointer transition-all'

const AppointmentTable: React.FC<AppointmentTableProps> = ({
  appointments,
  loading = false,
  onCancel,
  onConfirm,
  onComplete,
  onActionBlocked,
  onEdit,
  onDelete,
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
  const [openStatusId, setOpenStatusId] = React.useState<string | null>(null)
  const [timeSort, setTimeSort] = React.useState<'asc' | 'desc'>('desc')
  const [deleteTarget, setDeleteTarget] = React.useState<IAppointment | null>(null)
  const statusDropdownRef = React.useRef<HTMLDivElement | null>(null)
  const isControlled = Boolean(pagination && controlledPage !== undefined && onPageChange)
  const currentPage: number = isControlled ? controlledPage ?? 1 : internalPage
  
  React.useEffect(() => {
    if (!isControlled) {
      setInternalPage(1)
    }
  }, [appointments.length, compact, isControlled, showActions, pageSize])

  const sortedAppointments = React.useMemo(() => {
    const sorted = [...appointments]
    sorted.sort((a, b) => {
      const first = new Date(a.startTime).getTime()
      const second = new Date(b.startTime).getTime()
      return timeSort === 'asc' ? first - second : second - first
    })
    return sorted
  }, [appointments, timeSort])

  const totalPages = isControlled
    ? Math.max(1, pagination?.totalPages || 1)
    : Math.max(1, Math.ceil(appointments.length / pageSize))
  const totalItems = isControlled ? pagination?.totalItems || appointments.length : appointments.length
  const effectivePageSize = isControlled ? pagination?.perPage || pageSize : pageSize
  const paginatedAppointments = isControlled
    ? sortedAppointments
    : sortedAppointments.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  const theme = TABLE_THEME[variant]

  React.useEffect(() => {
    if (!isControlled && currentPage > totalPages) {
      setInternalPage(totalPages)
    }
  }, [currentPage, isControlled, totalPages])

  React.useEffect(() => {
    setOpenStatusId(null)
  }, [appointments])

  React.useEffect(() => {
    if (deleteTarget && !appointments.some(item => item._id === deleteTarget._id)) {
      setDeleteTarget(null)
    }
  }, [appointments, deleteTarget])

  React.useEffect(() => {
    if (!openStatusId) return

    const handlePointerDown = (event: MouseEvent) => {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
        setOpenStatusId(null)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [openStatusId])

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
  const gridTemplateColumns = compact
    ? 'repeat(6, minmax(0, 1fr))'
    : 'minmax(180px,1.3fr) minmax(150px,1fr) minmax(160px,1.1fr) minmax(95px,0.7fr) minmax(92px,0.7fr) minmax(150px,1fr) minmax(170px,1.1fr) minmax(96px,0.55fr)'

  const handleCompleteClick = (appointment: IAppointment) => {
    const endTime = new Date(appointment.endTime).getTime()
    const now = Date.now()

    if (!Number.isNaN(endTime) && now < endTime) {
      onActionBlocked?.('Service is in progress. It will finish soon.')
      setOpenStatusId(null)
      return
    }

    onComplete?.(appointment._id)
    setOpenStatusId(null)
  }

  const handleDeleteConfirm = () => {
    if (!deleteTarget || !onDelete) return
    onDelete(deleteTarget)
    setDeleteTarget(null)
  }

  return (
    <div className={`bg-white rounded-[24px] overflow-hidden ${theme.card}`}>
      <div
        className={`table-scroll-head grid gap-5 px-7 py-4 border-b ${theme.head}`}
        style={{ gridTemplateColumns }}
      >
        {columns.map(col => (
          col === 'Time' ? (
            <button
              key={col}
              type="button"
              onClick={() => setTimeSort(current => current === 'asc' ? 'desc' : 'asc')}
              className={`inline-flex items-center gap-1.5 border-0 bg-transparent p-0 text-left text-[10px] font-bold uppercase tracking-[0.14em] cursor-pointer ${theme.headText}`}
              title={`Sort by time ${timeSort === 'asc' ? 'descending' : 'ascending'}`}
              aria-label={`Sort by time ${timeSort === 'asc' ? 'descending' : 'ascending'}`}
            >
              <span>{col}</span>
              {timeSort === 'asc' ? <ArrowUp size={12} strokeWidth={2.4} /> : <ArrowDown size={12} strokeWidth={2.4} />}
            </button>
          ) : (
            <span key={col} className={`text-[10px] font-bold uppercase tracking-[0.14em] ${theme.headText}`}>
              {col}
            </span>
          )
        ))}
      </div>

      <div className="table-scroll-area">
        {paginatedAppointments.map(apt => {
          const cfg = statusConfig[apt.status] || statusConfig.pending
          const actions = getAppointmentActions(apt.status, actorRole)
          const hasStatusOptions = Boolean(
            (onConfirm && actions.canConfirm) ||
            (onComplete && actions.canComplete) ||
            (onCancel && actions.canCancel)
          )
          const isStatusOpen = openStatusId === apt._id

          return (
            <div
              key={apt._id}
              className={`grid gap-5 px-7 py-4 border-b last:border-b-0 transition-colors items-center ${theme.row}`}
              style={{ gridTemplateColumns }}
            >
              <div>
                <p className={`text-[14px] font-semibold m-0 ${theme.title}`}>{getCustomerName(apt.userID)}</p>
              </div>

              <div>
                <p className={`text-[13px] m-0 ${theme.body}`}>{getStaffName(apt.staffID)}</p>
              </div>

              <div>
                <p className={`text-[13px] m-0 leading-[1.35] ${theme.body}`}>{getServiceName(apt.services)}</p>
              </div>

              {!compact && (
                <div>
                  <p className={`text-[13px] font-semibold m-0 ${theme.price}`}>Rs {getServicePrice(apt.services).toLocaleString()}</p>
                </div>
              )}

              <div>
                <p className={`text-[13px] m-0 ${theme.body}`}>{formatDateShort(apt.appointmentDate)}</p>
              </div>

              <div>
                <p className={`text-[13px] m-0 ${theme.body}`}>
                  {formatTime(apt.startTime)} - {formatTime(apt.endTime)}
                </p>
              </div>

              <div className="relative flex items-center min-w-0" ref={isStatusOpen ? statusDropdownRef : null}>
                {hasStatusOptions ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setOpenStatusId(current => current === apt._id ? null : apt._id)}
                      className={`inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-[11px] font-semibold border whitespace-nowrap transition-all ${cfg.bg} ${cfg.text} ${
                        isStatusOpen ? 'ring-2 ring-[#C49A7A]/15' : ''
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                      {cfg.label}
                      <ChevronDown size={14} strokeWidth={2.2} className={`transition-transform ${isStatusOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isStatusOpen && (
                      <div className="absolute top-full left-0 z-20 mt-2 min-w-[150px] rounded-2xl border border-[#EAD8CB] bg-white p-2 shadow-[0_16px_36px_rgba(47,39,35,0.12)]">
                        {onConfirm && actions.canConfirm && (
                          <button
                            type="button"
                            onClick={() => {
                              onConfirm(apt._id)
                              setOpenStatusId(null)
                            }}
                            className="flex w-full items-center gap-2 rounded-xl border border-transparent bg-white px-3 py-2 text-left text-[12px] font-medium text-[#2F9E44] cursor-pointer hover:bg-[#EAF8EC]"
                          >
                            <Check size={15} strokeWidth={2.2} />
                            Confirm
                          </button>
                        )}
                        {onComplete && actions.canComplete && (
                          <button
                            type="button"
                            onClick={() => {
                              handleCompleteClick(apt)
                            }}
                            className="flex w-full items-center gap-2 rounded-xl border border-transparent bg-white px-3 py-2 text-left text-[12px] font-medium text-[#1E6AD6] cursor-pointer hover:bg-[#EAF3FF]"
                          >
                            <CheckCheck size={15} strokeWidth={2.2} />
                            Complete
                          </button>
                        )}
                        {onCancel && actions.canCancel && (
                          <button
                            type="button"
                            onClick={() => {
                              onCancel(apt._id)
                              setOpenStatusId(null)
                            }}
                            className="flex w-full items-center gap-2 rounded-xl border border-transparent bg-white px-3 py-2 text-left text-[12px] font-medium text-[#D9485F] cursor-pointer hover:bg-[#FFF0F1]"
                          >
                            <X size={15} strokeWidth={2.2} />
                            Cancel
                          </button>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <span className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[11px] font-semibold border whitespace-nowrap ${cfg.bg} ${cfg.text}`}>
                    {apt.status === 'cancelled' ? <X size={14} strokeWidth={2.2} /> : <CheckCheck size={14} strokeWidth={2.2} />}
                    {actions.finalLabel || cfg.label}
                  </span>
                )}
              </div>

              {showActions && !compact && (
                <div className="flex items-center gap-1.5 justify-start xl:justify-end min-w-0 justify-self-start xl:justify-self-end">
                  {onEdit && (
                    <button
                      onClick={() => onEdit(apt)}
                      className={`${iconButtonBase} bg-white text-[#7B6657] border-[#DCCDBF] hover:bg-[#F5EEE8]`}
                      title="Edit appointment"
                      aria-label="Edit appointment"
                    >
                      <Pencil size={15} strokeWidth={2.2} />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => setDeleteTarget(apt)}
                      className={`${iconButtonBase} bg-white text-[#C54040] border-[#F0C1C1] hover:bg-[#FFF0F0]`}
                      title="Delete appointment"
                      aria-label="Delete appointment"
                    >
                      <Trash2 size={15} strokeWidth={2.2} />
                    </button>
                  )}
                  {!onEdit && !onDelete && (
                    <span className="text-[11px] font-semibold text-[#B8AAA2]">No actions</span>
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

      {deleteTarget && onDelete && (
        <div className="fixed inset-0 z-[320] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/35 backdrop-blur-[2px]" onClick={() => setDeleteTarget(null)} />
          <div className="relative w-full max-w-md rounded-[24px] border border-[#F0DDD5] bg-white p-6 shadow-[0_24px_64px_rgba(0,0,0,0.18)]">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF0F0] text-[#C54040]">
              <Trash2 size={20} strokeWidth={2.2} />
            </div>
            <h3 className="m-0 text-[18px] font-bold text-[#2d2d2d] font-serif">Delete Appointment?</h3>
            <p className="m-0 mt-2 text-[13px] leading-[1.6] text-[#7B6D65] font-serif">
              Do you want to delete this appointment for {getCustomerName(deleteTarget.userID)}?
            </p>
            <p className="m-0 mt-1 text-[12px] text-[#A18E84] font-serif">
              This action cannot be undone.
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="rounded-xl border border-[#E6D7CB] bg-white px-4 py-2.5 text-[12px] font-semibold text-[#7B6657] cursor-pointer transition-colors hover:bg-[#FCF7F3]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="rounded-xl border border-[#F0C1C1] bg-[#FFF0F0] px-4 py-2.5 text-[12px] font-semibold text-[#C54040] cursor-pointer transition-colors hover:bg-[#FFE4E4]"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
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
