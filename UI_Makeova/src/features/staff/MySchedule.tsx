import React, { useEffect, useMemo, useState } from 'react'
import { useAppSelector } from '../../store'
import { selectUser } from '../../store/slices/authSlice'
import StaffLayout from './StaffLayout'
import {
  getAppointmentsByStaff,
  getLeavesByStaff,
  IAppointment,
  ILeave,
  TIME_SLOTS,
  formatTime,
} from '@/api/AppointmentsApi'
import { BUSINESS_HOUR_END, BUSINESS_HOUR_START, isOnLeave, isWorkingOnDate } from '@/features/appointments/appointmentUtils'

const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
const HEADER_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const SLOT_HEIGHT = 52
const TIME_COL_WIDTH = 82

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

function getAppointmentId(value: IAppointment['staffID'] | IAppointment['userID'] | null | undefined): string | null {
  if (!value) return null
  if (typeof value === 'string') return value
  return value._id ?? null
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

const MySchedule: React.FC = () => {
  const user = useAppSelector(selectUser)
  const today = new Date()

  const [weekBase, setWeekBase] = useState(new Date(today))
  const [appointments, setAppointments] = useState<IAppointment[]>([])
  const [leaves, setLeaves] = useState<ILeave[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadSchedule = async () => {
      if (!user?._id) return

      try {
        setLoading(true)
        setError('')
        const [appointmentResponse, leaveResponse] = await Promise.all([
          getAppointmentsByStaff(user._id, { page: 1, limit: 200 }),
          getLeavesByStaff(user._id, { page: 1, limit: 100 }),
        ])
        setAppointments(appointmentResponse.items)
        setLeaves(leaveResponse.items)
      } catch (loadError: any) {
        setError(loadError?.message || 'Failed to load schedule')
      } finally {
        setLoading(false)
      }
    }

    void loadSchedule()
  }, [user?._id])

  const weekDates = useMemo(() => getWeekDates(weekBase), [weekBase])
  const weekDateStrings = weekDates.map(date => toStr(date))
  const totalHeight = TIME_SLOTS.length * SLOT_HEIGHT

  const dayStates = useMemo(
    () =>
      weekDateStrings.map(date => ({
        date,
        isWorking: user ? isWorkingOnDate({ WorkingDay: user.WorkingDay }, date) : false,
        isLeave: user?._id ? isOnLeave(user._id, date, leaves) : false,
      })),
    [leaves, user, weekDateStrings]
  )

  const weekAppointments = useMemo(
    () =>
      appointments.filter(appointment => {
        const appointmentDate = toStr(new Date(appointment.appointmentDate))
        return weekDateStrings.includes(appointmentDate) && getAppointmentId(appointment.staffID) === user?._id
      }),
    [appointments, user?._id, weekDateStrings]
  )

  const calendarEvents = useMemo(
    () =>
      weekAppointments.flatMap(appointment => {
        const dayIndex = weekDateStrings.findIndex(date => new Date(appointment.appointmentDate).toDateString() === new Date(date).toDateString())
        if (dayIndex < 0) return []

        const dayDate = weekDateStrings[dayIndex]
        const start = new Date(appointment.startTime)
        const end = new Date(appointment.endTime)
        const visibleBlock = clampEventToBusinessHours(dayDate, start, end)
        if (!visibleBlock) return []
        const isCompleted = appointment.status === 'completed'

        return [{
          appointment,
          dayIndex,
          top: visibleBlock.top,
          height: visibleBlock.height,
          clippedBottom: visibleBlock.clippedBottom,
          classes: isCompleted
            ? 'bg-[#D9EAFD] border-[#7BAAF7] text-[#174EA6]'
            : 'bg-[#DCEBFF] border-[#5B9BFF] text-[#174EA6]',
        }]
      }),
    [weekAppointments, weekDateStrings]
  )

  const weekRangeLabel = `${MONTHS[weekDates[0].getMonth()]} ${weekDates[0].getDate()} - ${MONTHS[weekDates[6].getMonth()]} ${weekDates[6].getDate()}, ${weekDates[0].getFullYear()}`
  const availableCount = dayStates.filter(day => day.isWorking && !day.isLeave).length
  const blockedCount = dayStates.filter(day => !day.isWorking || day.isLeave).length

  const prevWeek = () => {
    const next = new Date(weekBase)
    next.setDate(next.getDate() - 7)
    setWeekBase(next)
  }

  const nextWeek = () => {
    const next = new Date(weekBase)
    next.setDate(next.getDate() + 7)
    setWeekBase(next)
  }

  const goToday = () => setWeekBase(new Date(today))

  return (
    <StaffLayout>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[22px] font-bold text-[#223126] m-0 font-serif">My Schedule</h1>
          <p className="text-[13px] text-[#7A9180] mt-1 mb-0">Weekly calendar view for provider availability and bookings</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={goToday}
            className="rounded-full border border-[#D8E5DB] bg-white px-4 py-2 text-[12px] font-semibold text-[#406B52] cursor-pointer hover:bg-[#F4FAF5] transition-colors"
          >
            Today
          </button>
          <button
            onClick={prevWeek}
            className="h-10 w-10 rounded-full border border-[#D8E5DB] bg-white text-[#406B52] cursor-pointer hover:bg-[#F4FAF5] transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            onClick={nextWeek}
            className="h-10 w-10 rounded-full border border-[#D8E5DB] bg-white text-[#406B52] cursor-pointer hover:bg-[#F4FAF5] transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="rounded-2xl border border-[#DCE8E0] bg-white px-5 py-4">
          <p className="m-0 text-[11px] uppercase tracking-[0.12em] text-[#8A9E90] font-semibold">Week</p>
          <p className="m-0 mt-2 text-[15px] font-bold text-[#223126] font-serif">{weekRangeLabel}</p>
        </div>
        <div className="rounded-2xl border border-[#DCE8E0] bg-white px-5 py-4">
          <p className="m-0 text-[11px] uppercase tracking-[0.12em] text-[#8A9E90] font-semibold">Open Days</p>
          <p className="m-0 mt-2 text-[15px] font-bold text-[#2E7D32] font-serif">{availableCount} days</p>
        </div>
        <div className="rounded-2xl border border-[#DCE8E0] bg-white px-5 py-4">
          <p className="m-0 text-[11px] uppercase tracking-[0.12em] text-[#8A9E90] font-semibold">Blocked Days</p>
          <p className="m-0 mt-2 text-[15px] font-bold text-[#E53935] font-serif">{blockedCount} days</p>
        </div>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-[#DCE8E0] bg-white p-12 text-center">
          <div className="mx-auto mb-3 h-7 w-7 rounded-full border-2 border-[#7AC49A] border-t-transparent animate-spin" />
          <p className="m-0 text-[13px] text-[#7A9180] font-serif">Loading calendar...</p>
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-[#FFD5D8] bg-white p-12 text-center">
          <p className="m-0 text-[14px] text-[#E53935] font-serif">{error}</p>
        </div>
      ) : (
        <div className="rounded-3xl border border-[#DCE8E0] bg-white overflow-hidden shadow-[0_2px_12px_rgba(122,196,154,0.05)]">
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
      )}
    </StaffLayout>
  )
}

export default MySchedule
