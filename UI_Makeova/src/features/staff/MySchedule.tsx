import React, { useEffect, useState } from 'react'
import { useAppSelector } from '../../store'
import { selectUser } from '../../store/slices/authSlice'
import StaffLayout from './StaffLayout'
import {
  getAppointmentsByStaff,
  IAppointment,
  formatDate,
  formatTime,
  STATUS_STYLE,
} from '@/api/AppointmentsApi'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function getWeekDates(base: Date): Date[] {
  const start = new Date(base)
  start.setDate(base.getDate() - base.getDay())
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    return d
  })
}

function toStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
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

const AppointmentTable: React.FC<{ appointments: IAppointment[] }> = ({ appointments }) => (
  <div className="bg-white rounded-xl border border-[#C8E6C9] overflow-hidden shadow-[0_2px_12px_rgba(122,196,154,0.06)]">
    <div className="overflow-x-auto">
      <table className="min-w-full text-left">
        <thead className="bg-[#F6FBF7]">
          <tr>
            {['Time', 'Client', 'Service', 'Date', 'Amount', 'Status'].map(header => (
              <th
                key={header}
                className="px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#7AC49A]"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {appointments.map(apt => {
            const statusStyle = STATUS_STYLE[apt.status] ?? STATUS_STYLE.pending
            return (
              <tr key={apt._id} className="border-t border-[#E8F5E9] hover:bg-[#F0FAF4] transition-colors">
                <td className="px-5 py-4 text-[13px] font-bold text-[#7AC49A] font-serif whitespace-nowrap">
                  {formatTime(apt.startTime)}
                </td>
                <td className="px-5 py-4 text-[13px] text-[#2d2d2d] font-serif">
                  {safeGet(apt.userID, 'name')}
                </td>
                <td className="px-5 py-4 text-[12px] text-[#666]">
                  {safeGet(apt.services, 'name')}
                </td>
                <td className="px-5 py-4 text-[12px] text-[#666] whitespace-nowrap">
                  {formatDate(apt.appointmentDate)}
                </td>
                <td className="px-5 py-4 text-[13px] font-bold text-[#2d2d2d] font-serif whitespace-nowrap">
                  Rs.{apt.totalPrice.toLocaleString('en-IN')}
                </td>
                <td className="px-5 py-4 whitespace-nowrap">
                  <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold capitalize ${statusStyle.bg} ${statusStyle.text}`}>
                    {apt.status}
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  </div>
)

const MySchedule: React.FC = () => {
  const user = useAppSelector(selectUser)
  const today = new Date()
  const [weekBase, setWeekBase] = useState(new Date(today))
  const [selected, setSelected] = useState<string>(toStr(today))
  const [appointments, setAppointments] = useState<IAppointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadAppointments = async () => {
      if (!user?._id) return
      try {
        setLoading(true)
        setError('')
        const response = await getAppointmentsByStaff(user._id, { page: 1, limit: 100 })
        setAppointments(response.items)
      } catch (loadError: any) {
        console.error('Failed to load appointments:', loadError)
        setError(loadError?.message || 'Failed to load schedule')
      } finally {
        setLoading(false)
      }
    }

    loadAppointments()
  }, [user?._id])

  const weekDates = getWeekDates(weekBase)
  const prevWeek = () => {
    const d = new Date(weekBase)
    d.setDate(d.getDate() - 7)
    setWeekBase(d)
  }
  const nextWeek = () => {
    const d = new Date(weekBase)
    d.setDate(d.getDate() + 7)
    setWeekBase(d)
  }
  const goToday = () => {
    setWeekBase(new Date(today))
    setSelected(toStr(today))
  }

  const sortedAppointments = [...appointments].sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  )
  const dayAppts = sortedAppointments.filter(
    a => new Date(a.appointmentDate).toDateString() === new Date(selected).toDateString()
  )
  const todayStr = toStr(today)
  const weekAppts = appointments.filter(a =>
    weekDates.some(d => toStr(d) === toStr(new Date(a.appointmentDate)))
  )

  return (
    <StaffLayout>
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-[22px] font-bold text-[#2d2d2d] m-0 font-serif">My Schedule</h1>
          <p className="text-[13px] text-[#7AC49A] mt-1 mb-0">
            {MONTHS[weekDates[0].getMonth()]} {weekDates[0].getDate()} - {MONTHS[weekDates[6].getMonth()]} {weekDates[6].getDate()}, {weekDates[0].getFullYear()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={goToday}
            className="text-[12px] text-[#7AC49A] bg-[#E8F5E9] border border-[#C8E6C9] px-4 py-2 rounded-lg font-serif cursor-pointer hover:bg-[#C8E6C9] transition-colors"
          >
            Today
          </button>
          <button
            onClick={prevWeek}
            className="w-9 h-9 flex items-center justify-center bg-white border border-[#C8E6C9] rounded-lg cursor-pointer text-[#7AC49A] hover:bg-[#E8F5E9] transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            onClick={nextWeek}
            className="w-9 h-9 flex items-center justify-center bg-white border border-[#C8E6C9] rounded-lg cursor-pointer text-[#7AC49A] hover:bg-[#E8F5E9] transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: 'This Week', value: weekAppts.length, bg: 'bg-[#E8F5E9]', color: 'text-[#7AC49A]' },
          { label: 'Confirmed', value: weekAppts.filter(a => a.status === 'confirmed').length, bg: 'bg-[#E8F5E9]', color: 'text-[#4CAF50]' },
          { label: 'Pending', value: weekAppts.filter(a => a.status === 'pending').length, bg: 'bg-[#FFF8E1]', color: 'text-[#FFA000]' },
          { label: 'Completed', value: weekAppts.filter(a => a.status === 'completed').length, bg: 'bg-[#EDE7F6]', color: 'text-[#7B1FA2]' },
        ].map(({ label, value, bg, color }) => (
          <div
            key={label}
            className="bg-white rounded-lg px-5 py-4 border border-[#C8E6C9] shadow-[0_2px_8px_rgba(122,196,154,0.07)] flex items-center gap-3"
          >
            <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center`}>
              <span className={`text-[17px] font-bold font-serif ${color}`}>{value}</span>
            </div>
            <p className="text-[12px] text-[#aaa] m-0">{label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-[#C8E6C9] mb-6 overflow-hidden shadow-[0_2px_12px_rgba(122,196,154,0.06)]">
        <div className="grid grid-cols-7">
          {weekDates.map((d, i) => {
            const str = toStr(d)
            const isToday = str === todayStr
            const isSel = str === selected
            const dayCount = appointments.filter(a => new Date(a.appointmentDate).toDateString() === d.toDateString()).length
            return (
              <button
                key={i}
                onClick={() => setSelected(str)}
                className={`flex flex-col items-center py-4 border-r last:border-r-0 border-[#E8F5E9] cursor-pointer transition-all ${
                  isSel ? 'bg-[#7AC49A]' : isToday ? 'bg-[#E8F5E9]' : 'bg-white hover:bg-[#F0FAF4]'
                }`}
              >
                <span className={`text-[10px] uppercase tracking-[0.1em] mb-1 ${isSel ? 'text-white/70' : 'text-[#aaa]'}`}>
                  {DAYS[d.getDay()]}
                </span>
                <span className={`text-[16px] font-bold font-serif ${isSel ? 'text-white' : isToday ? 'text-[#7AC49A]' : 'text-[#2d2d2d]'}`}>
                  {d.getDate()}
                </span>
                {dayCount > 0 ? (
                  <span
                    className={`mt-1.5 text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      isSel ? 'bg-white/30 text-white' : 'bg-[#C8E6C9] text-[#7AC49A]'
                    }`}
                  >
                    {dayCount}
                  </span>
                ) : (
                  <span className="mt-1.5 h-[18px]" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[15px] font-bold text-[#2d2d2d] m-0 font-serif">
          {selected === todayStr ? "Today's Appointments" : `Appointments - ${formatDate(selected)}`}
        </h3>
        <span className="text-[12px] text-[#7AC49A] bg-[#E8F5E9] px-3 py-1 rounded-full">
          {dayAppts.length} appointment{dayAppts.length !== 1 ? 's' : ''}
        </span>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-[#C8E6C9] p-12 text-center">
          <div className="flex justify-center mb-3">
            <div className="w-6 h-6 border-2 border-[#7AC49A] border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-[13px] text-[#aaa] font-serif">Loading schedule...</p>
        </div>
      ) : error ? (
        <div className="bg-white rounded-xl border border-[#F5C8BC] p-12 text-center">
          <p className="text-[14px] text-[#E53935] m-0 font-serif">{error}</p>
        </div>
      ) : dayAppts.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#C8E6C9] p-12 text-center">
          <div className="w-14 h-14 rounded-full bg-[#E8F5E9] flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7AC49A" strokeWidth="1.6" strokeLinecap="round">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <p className="text-[14px] text-[#aaa] m-0 font-serif">No appointments scheduled for this day</p>
        </div>
      ) : (
        <AppointmentTable appointments={dayAppts} />
      )}
    </StaffLayout>
  )
}

export default MySchedule
