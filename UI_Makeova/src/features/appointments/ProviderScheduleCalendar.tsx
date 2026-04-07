import React, { useEffect, useMemo, useState } from 'react'
import { IAppointment, ILeave, TIME_SLOTS, formatTime } from '@/api/AppointmentsApi'
import { IUser } from '@/types'
import { BUSINESS_HOUR_END, BUSINESS_HOUR_START, isOnLeave, isWorkingOnDate } from './appointmentUtils'

const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const SLOT_HEIGHT = 52
const TIME_COL_WIDTH = 82

type LeaveScope = 'providers' | 'team'

interface ProviderScheduleCalendarProps {
  title: string
  subtitle: string
  providers: IUser[]
  appointments: IAppointment[]
  leaves: ILeave[]
  leaveUsers?: IUser[]
  leaveScopeLabel: string
  leaveScope?: LeaveScope
  emptyMessage?: string
}

function toStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function getWeekDates(base: Date): Date[] {
  const start = new Date(base)
  start.setDate(base.getDate() - base.getDay())
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start)
    date.setDate(start.getDate() + index)
    return date
  })
}

function getSlotDate(date: string, time: string): Date {
  return new Date(`${date}T${time}:00`)
}

function getTimeLabel(time: string): string {
  return getSlotDate('2026-01-01', time).toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

function safeGet(obj: unknown, key: string, fallback = '-'): string {
  if (!obj) return fallback
  if (typeof obj === 'string') return obj || fallback
  if (typeof obj === 'object' && key in obj) {
    const value = (obj as Record<string, unknown>)[key]
    return value !== null && value !== undefined && value !== '' ? String(value) : fallback
  }
  return fallback
}

function getAppointmentUserId(value: IAppointment['staffID'] | IAppointment['userID'] | null | undefined): string | null {
  if (!value) return null
  if (typeof value === 'string') return value
  return value._id ?? null
}

function getLeaveUserId(value: ILeave['staffId'] | null | undefined): string | null {
  if (!value) return null
  if (typeof value === 'string') return value
  return value._id ?? null
}

function getRoleName(user: IUser | undefined): string {
  if (!user?.role?.length) return 'Team Member'
  const roleName = user.role[0]?.name?.toLowerCase()
  if (roleName === 'receptionist') return 'Receptionist'
  if (roleName === 'staff') return 'Provider'
  return 'Team Member'
}

function clampEventToBusinessHours(date: string, start: Date, end: Date): { top: number; height: number; clippedBottom: boolean } | null {
  const businessStart = new Date(`${date}T${BUSINESS_HOUR_START}:00`)
  const businessEnd = new Date(`${date}T${BUSINESS_HOUR_END}:00`)

  const visibleStart = new Date(Math.max(start.getTime(), businessStart.getTime()))
  const visibleEnd = new Date(Math.min(end.getTime(), businessEnd.getTime()))

  if (visibleEnd.getTime() <= visibleStart.getTime()) return null

  const minutesFromStart = (visibleStart.getTime() - businessStart.getTime()) / 60000
  const visibleMinutes = (visibleEnd.getTime() - visibleStart.getTime()) / 60000

  return {
    top: (minutesFromStart / 30) * SLOT_HEIGHT + 4,
    height: Math.max(SLOT_HEIGHT - 8, (visibleMinutes / 30) * SLOT_HEIGHT - 8),
    clippedBottom: end.getTime() > businessEnd.getTime(),
  }
}

const ProviderScheduleCalendar: React.FC<ProviderScheduleCalendarProps> = ({
  title,
  subtitle,
  providers,
  appointments,
  leaves,
  leaveUsers,
  leaveScopeLabel,
  leaveScope = 'providers',
  emptyMessage = 'No providers available right now.',
}) => {
  const today = new Date()
  const [weekBase, setWeekBase] = useState(new Date(today))
  const [selectedProviderId, setSelectedProviderId] = useState('')

  const sortedProviders = useMemo(
    () => [...providers].sort((a, b) => a.name.localeCompare(b.name)),
    [providers]
  )

  useEffect(() => {
    if (!sortedProviders.length) {
      setSelectedProviderId('')
      return
    }

    const stillExists = sortedProviders.some(provider => provider._id === selectedProviderId)
    if (!stillExists) setSelectedProviderId(sortedProviders[0]._id)
  }, [selectedProviderId, sortedProviders])

  const selectedProvider = sortedProviders.find(provider => provider._id === selectedProviderId) ?? sortedProviders[0]
  const weekDates = useMemo(() => getWeekDates(weekBase), [weekBase])
  const weekDateStrings = weekDates.map(date => toStr(date))
  const totalHeight = TIME_SLOTS.length * SLOT_HEIGHT
  const trackedLeaveUsers = leaveUsers && leaveUsers.length > 0 ? leaveUsers : sortedProviders
  const trackedLeaveIds = useMemo(() => new Set(trackedLeaveUsers.map(user => user._id)), [trackedLeaveUsers])

  const dayStates = useMemo(
    () =>
      weekDateStrings.map(date => ({
        date,
        isWorking: selectedProvider ? isWorkingOnDate({ WorkingDay: selectedProvider.WorkingDay }, date) : false,
        isLeave: selectedProvider ? isOnLeave(selectedProvider._id, date, leaves) : false,
      })),
    [leaves, selectedProvider, weekDateStrings]
  )

  const providerAppointments = useMemo(
    () =>
      appointments.filter(appointment => {
        const appointmentDate = toStr(new Date(appointment.appointmentDate))
        return (
          appointment.status !== 'cancelled' &&
          weekDateStrings.includes(appointmentDate) &&
          getAppointmentUserId(appointment.staffID) === selectedProvider?._id
        )
      }),
    [appointments, selectedProvider?._id, weekDateStrings]
  )

  const calendarEvents = useMemo(
    () =>
      providerAppointments.flatMap(appointment => {
        const dayIndex = weekDateStrings.findIndex(date => new Date(appointment.appointmentDate).toDateString() === new Date(date).toDateString())
        if (dayIndex < 0) return []

        const dayDate = weekDateStrings[dayIndex]
        const start = new Date(appointment.startTime)
        const end = new Date(appointment.endTime)
        const visibleBlock = clampEventToBusinessHours(dayDate, start, end)
        if (!visibleBlock) return []

        const classes =
          appointment.status === 'completed'
            ? 'bg-[#D9EAFD] border-[#7BAAF7] text-[#174EA6]'
            : appointment.status === 'pending'
              ? 'bg-[#FFF4DA] border-[#F6C76A] text-[#8A5300]'
              : 'bg-[#DCEBFF] border-[#5B9BFF] text-[#174EA6]'

        return [{
          appointment,
          dayIndex,
          top: visibleBlock.top,
          height: visibleBlock.height,
          clippedBottom: visibleBlock.clippedBottom,
          classes,
        }]
      }),
    [providerAppointments, weekDateStrings]
  )

  const visibleLeaves = useMemo(
    () =>
      leaves
        .filter(leave => {
          const userId = getLeaveUserId(leave.staffId)
          return userId ? trackedLeaveIds.has(userId) : false
        })
        .sort((a, b) => {
          const dateDiff = new Date(a.date).getTime() - new Date(b.date).getTime()
          if (dateDiff !== 0) return dateDiff
          if (a.status === b.status) return 0
          if (a.status === 'pending') return -1
          if (b.status === 'pending') return 1
          return 0
        }),
    [leaves, trackedLeaveIds]
  )

  const selectedProviderWeekCount = providerAppointments.length
  const selectedProviderApprovedLeaves = leaves.filter(
    leave => getLeaveUserId(leave.staffId) === selectedProvider?._id && leave.status === 'approved'
  ).length
  const weekRangeLabel = `${MONTHS[weekDates[0].getMonth()]} ${weekDates[0].getDate()} - ${MONTHS[weekDates[6].getMonth()]} ${weekDates[6].getDate()}, ${weekDates[0].getFullYear()}`

  if (!selectedProvider) {
    return (
      <div className="rounded-[28px] border border-[#E8DED6] bg-white p-10 text-center shadow-[0_8px_32px_rgba(120,92,74,0.06)]">
        <p className="m-0 text-[14px] text-[#8D7B70] font-serif">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="rounded-[28px] border border-[#E8DED6] bg-white shadow-[0_8px_32px_rgba(120,92,74,0.06)] overflow-hidden">
        <div className="border-b border-[#EFE6DE] px-6 py-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h3 className="m-0 text-[18px] font-bold text-[#2d2d2d] font-serif">{title}</h3>
              <p className="m-0 mt-1 text-[12px] text-[#8D7B70] font-serif">{subtitle}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setWeekBase(new Date(today))}
                className="rounded-full border border-[#D8E5DB] bg-white px-4 py-2 text-[12px] font-semibold text-[#406B52] cursor-pointer hover:bg-[#F4FAF5] transition-colors"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => {
                  const next = new Date(weekBase)
                  next.setDate(next.getDate() - 7)
                  setWeekBase(next)
                }}
                className="h-10 w-10 rounded-full border border-[#D8E5DB] bg-white text-[#406B52] cursor-pointer hover:bg-[#F4FAF5] transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => {
                  const next = new Date(weekBase)
                  next.setDate(next.getDate() + 7)
                  setWeekBase(next)
                }}
                className="h-10 w-10 rounded-full border border-[#D8E5DB] bg-white text-[#406B52] cursor-pointer hover:bg-[#F4FAF5] transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
          </div>

          <div className="mt-4 max-w-[320px]">
            <label className="mb-2 block text-[10px] uppercase tracking-[0.12em] text-[#8A9E90] font-semibold">
              Select Provider
            </label>
            <div className="relative">
              <select
                value={selectedProvider._id}
                onChange={event => setSelectedProviderId(event.target.value)}
                className="w-full appearance-none rounded-2xl border border-[#E8DED6] bg-white px-4 py-3 pr-10 text-[13px] font-semibold text-[#2D2D2D] font-serif outline-none transition-colors focus:border-[#1A73E8]"
              >
                {sortedProviders.map(provider => (
                  <option key={provider._id} value={provider._id}>
                    {provider.name}
                  </option>
                ))}
              </select>
              <svg
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#8D7B70]"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-[#EDF1EE] bg-[#FCFEFD] px-4 py-3">
              <p className="m-0 text-[10px] uppercase tracking-[0.12em] text-[#8A9E90] font-semibold">Week</p>
              <p className="m-0 mt-2 text-[14px] font-bold text-[#223126] font-serif">{weekRangeLabel}</p>
            </div>
            <div className="rounded-2xl border border-[#EDF1EE] bg-[#FCFEFD] px-4 py-3">
              <p className="m-0 text-[10px] uppercase tracking-[0.12em] text-[#8A9E90] font-semibold">Selected Provider</p>
              <p className="m-0 mt-2 text-[14px] font-bold text-[#223126] font-serif">{selectedProvider.name}</p>
            </div>
            <div className="rounded-2xl border border-[#EDF1EE] bg-[#FCFEFD] px-4 py-3">
              <p className="m-0 text-[10px] uppercase tracking-[0.12em] text-[#8A9E90] font-semibold">This Week</p>
              <p className="m-0 mt-2 text-[14px] font-bold text-[#223126] font-serif">{selectedProviderWeekCount} bookings</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div style={{ minWidth: `${TIME_COL_WIDTH + 7 * 170}px` }}>
            <div
              className="grid border-b border-[#E5ECE7]"
              style={{ gridTemplateColumns: `${TIME_COL_WIDTH}px repeat(7, minmax(170px, 1fr))` }}
            >
              <div className="bg-white" />
              {weekDates.map((date, index) => {
                const isToday = toStr(date) === toStr(today)
                const state = dayStates[index]
                return (
                  <div key={toStr(date)} className="py-4 text-center bg-white">
                    <p className={`m-0 text-[12px] font-semibold tracking-[0.08em] ${isToday ? 'text-[#1A73E8]' : 'text-[#5F6B63]'}`}>{DAYS[index]}</p>
                    <div className={`mx-auto mt-2 flex h-12 w-12 items-center justify-center rounded-full text-[18px] font-semibold ${isToday ? 'bg-[#1A73E8] text-white' : 'text-[#2d2d2d]'}`}>
                      {date.getDate()}
                    </div>
                    <p className={`m-0 mt-2 text-[10px] font-semibold ${state.isLeave || !state.isWorking ? 'text-[#E53935]' : 'text-[#2E7D32]'}`}>
                      {state.isLeave ? 'On Leave' : state.isWorking ? 'Open' : 'Closed'}
                    </p>
                  </div>
                )
              })}
            </div>

            <div className="relative" style={{ height: `${totalHeight}px` }}>
              <div
                className="absolute inset-0 grid"
                style={{ gridTemplateColumns: `${TIME_COL_WIDTH}px repeat(7, minmax(170px, 1fr))` }}
              >
                <div className="bg-white">
                  {TIME_SLOTS.map(time => (
                    <div
                      key={time}
                      className="border-b border-[#EEF2EF] pr-4 text-right text-[12px] text-[#5F6B63] font-medium"
                      style={{ height: `${SLOT_HEIGHT}px`, lineHeight: `${SLOT_HEIGHT}px` }}
                    >
                      {getTimeLabel(time)}
                    </div>
                  ))}
                </div>

                {weekDateStrings.map((date, dayIndex) => {
                  const state = dayStates[dayIndex]
                  const columnBg = state.isLeave || !state.isWorking ? 'bg-[#FFF8F8]' : 'bg-white'
                  const openTint = state.isWorking && !state.isLeave ? 'bg-[rgba(76,175,80,0.03)]' : ''

                  return (
                    <div key={date} className={`relative border-l border-[#EEF2EF] ${columnBg} ${openTint}`}>
                      {TIME_SLOTS.map(time => (
                        <div
                          key={`${date}-${time}`}
                          className="border-b border-[#EEF2EF]"
                          style={{ height: `${SLOT_HEIGHT}px` }}
                        />
                      ))}
                    </div>
                  )
                })}
              </div>

              <div
                className="absolute inset-0 grid pointer-events-none"
                style={{ gridTemplateColumns: `${TIME_COL_WIDTH}px repeat(7, minmax(170px, 1fr))` }}
              >
                <div />
                {weekDateStrings.map((date, dayIndex) => {
                  const state = dayStates[dayIndex]
                  return (
                    <div key={`overlay-${date}`} className="relative">
                      {state.isLeave || !state.isWorking ? (
                        <div className="absolute inset-x-3 top-3 rounded-xl bg-[#FFE9EA] px-3 py-2 text-[11px] font-semibold text-[#D93025]">
                          {state.isLeave ? 'Not available: leave' : 'Not available'}
                        </div>
                      ) : (
                        <div className="absolute inset-x-3 top-3 rounded-xl bg-[rgba(52,168,83,0.12)] px-3 py-2 text-[11px] font-semibold text-[#188038]">
                          Availability open
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              <div
                className="absolute inset-0 grid pointer-events-none"
                style={{ gridTemplateColumns: `${TIME_COL_WIDTH}px repeat(7, minmax(170px, 1fr))` }}
              >
                <div />
                {weekDateStrings.map((date, dayIndex) => (
                  <div key={`events-${date}`} className="relative">
                    {calendarEvents
                      .filter(event => event.dayIndex === dayIndex)
                      .map(event => (
                        <div
                          key={event.appointment._id}
                          className={`absolute left-2 right-2 overflow-hidden rounded-2xl border px-3 py-2 shadow-sm ${event.classes}`}
                          style={{ top: `${event.top}px`, height: `${event.height}px` }}
                        >
                          <p className="m-0 text-[12px] font-bold font-serif truncate">{safeGet(event.appointment.userID, 'name')}</p>
                          <p className="m-0 mt-1 text-[11px] font-serif truncate">{safeGet(event.appointment.services, 'name')}</p>
                          <p className="m-0 mt-1 text-[10px] font-semibold truncate">
                            {formatTime(event.appointment.startTime)} - {formatTime(event.appointment.endTime)}
                          </p>
                          {event.clippedBottom && (
                            <p className="m-0 mt-1 text-[10px] font-semibold truncate opacity-80">Continues after 8:00 PM</p>
                          )}
                        </div>
                      ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[28px] border border-[#E8DED6] bg-white shadow-[0_8px_32px_rgba(120,92,74,0.06)]">
        <div className="border-b border-[#EFE6DE] px-6 py-5">
          <h3 className="m-0 text-[16px] font-bold text-[#2d2d2d] font-serif">{leaveScopeLabel}</h3>
          <p className="m-0 mt-1 text-[12px] text-[#8D7B70] font-serif">
            {leaveScope === 'team' ? 'Providers and receptionists leave tracker' : 'Provider leave tracker'}
          </p>
        </div>

        <div className="px-6 py-5">
          <div className="rounded-2xl border border-[#EDF1EE] bg-[#FCFEFD] px-4 py-3">
            <p className="m-0 text-[10px] uppercase tracking-[0.12em] text-[#8A9E90] font-semibold">Approved Leaves</p>
            <p className="m-0 mt-2 text-[14px] font-bold text-[#223126] font-serif">{selectedProviderApprovedLeaves} for {selectedProvider.name}</p>
          </div>
        </div>

        {visibleLeaves.length === 0 ? (
          <div className="px-6 pb-6">
            <div className="rounded-2xl border border-dashed border-[#E8DED6] bg-[#FCF8F5] px-4 py-8 text-center">
              <p className="m-0 text-[12px] text-[#8D7B70] font-serif">No leave requests to show.</p>
            </div>
          </div>
        ) : (
          <div className="max-h-[760px] overflow-y-auto px-3 pb-4">
            <div className="space-y-3">
              {visibleLeaves.slice(0, 10).map(leave => {
                const userId = getLeaveUserId(leave.staffId)
                const matchedUser = trackedLeaveUsers.find(user => user._id === userId)
                const isApproved = leave.status === 'approved'
                const statusClasses =
                  leave.status === 'pending'
                    ? 'bg-[#FFF4DA] text-[#9B6A07]'
                    : leave.status === 'approved'
                      ? 'bg-[#E8F5E9] text-[#2E7D32]'
                      : 'bg-[#FFEBEE] text-[#C62828]'

                return (
                  <div key={leave._id} className="rounded-2xl border border-[#F1E5DC] bg-[#FFFCFA] px-4 py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="m-0 text-[13px] font-bold text-[#2d2d2d] font-serif">
                          {typeof leave.staffId === 'string' ? leave.staffId : leave.staffId.name}
                        </p>
                        <p className="m-0 mt-1 text-[11px] text-[#8D7B70] font-serif">
                          {getRoleName(matchedUser)} - {new Date(leave.date).toLocaleDateString('en-IN')}
                        </p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-[10px] font-semibold ${statusClasses}`}>
                        {leave.status}
                      </span>
                    </div>
                    <p className="m-0 mt-2 text-[11px] text-[#6D625A] font-serif capitalize">{leave.type.replace(/_/g, ' ')}</p>
                    {leave.reason && <p className="m-0 mt-2 text-[11px] text-[#9A8A80] font-serif">{leave.reason}</p>}
                    {isApproved && (
                      <p className="m-0 mt-2 text-[11px] text-[#2E7D32] font-serif">Calendar blocked for this date</p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProviderScheduleCalendar
