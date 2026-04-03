import React, { useState, useEffect } from 'react'
import { useAppSelector } from '../../store'
import { selectUser } from '../../store/slices/authSlice'
import StaffLayout from './StaffLayout'
import AppointmentCard, { Appointment } from '../appointments/AppointmentCard'
import { getAllAppointments } from '@/api/AppointmentsApi'
import { getAllServices } from '@/api/services/servicesApi'

// ── Helpers ──────────────────────────────────────────────
const DAYS   = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function getWeekDates(base: Date): Date[] {
  const start = new Date(base)
  start.setDate(base.getDate() - base.getDay())
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start); d.setDate(start.getDate() + i); return d
  })
}

function toStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

const MySchedule: React.FC = () => {
  const user    = useAppSelector(selectUser)
  const today   = new Date()
  const [weekBase, setWeekBase] = useState(new Date(today))
  const [selected, setSelected] = useState<string>(toStr(today))
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch staff appointments
  useEffect(() => {
    const loadAppointments = async () => {
      if (!user?._id) return
      try {
        setLoading(true)
        const allAppointments = await getAllAppointments({ page: 1, limit: 10 })
        const services = await getAllServices({ page: 1, limit: 10 })
        
        // Filter for current staff's appointments
        const staffAppts = allAppointments.items.filter(apt => {
          const staffId = typeof apt.staffID === 'string' ? apt.staffID : apt.staffID?._id
          return staffId === user._id
        })

        // Transform API data to Appointment format
        const transformed: Appointment[] = staffAppts.map(apt => {
          const service = services.items.find(s => s._id === apt.services)
          const customerName = typeof apt.userID === 'string' ? apt.userID : apt.userID?.name || 'Unknown'
          const startTime = new Date(apt.startTime)
          const endTime = new Date(apt.endTime)
          const duration = Math.round((endTime.getTime() - startTime.getTime()) / 60000)
          
          return {
            id: parseInt(apt._id || '0'),
            clientName: customerName,
            service: service?.name || 'Unknown Service',
            staffName: user.name || 'You',
            date: new Date(apt.appointmentDate).toLocaleDateString(),
            time: startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            duration: `${duration} min`,
            price: `₹${service?.price || '0'}`,
            status: (apt.status?.charAt(0).toUpperCase() + apt.status?.slice(1).toLowerCase()) as 'Confirmed' | 'Pending' | 'Cancelled',
          }
        })
        setAppointments(transformed)
      } catch (error) {
        console.error('Failed to load appointments:', error)
      } finally {
        setLoading(false)
      }
    }
    loadAppointments()
  }, [user?._id])

  const weekDates  = getWeekDates(weekBase)
  const prevWeek   = () => { const d = new Date(weekBase); d.setDate(d.getDate()-7); setWeekBase(d) }
  const nextWeek   = () => { const d = new Date(weekBase); d.setDate(d.getDate()+7); setWeekBase(d) }
  const goToday    = () => { setWeekBase(new Date(today)); setSelected(toStr(today)) }

  const dayAppts   = appointments.filter(a => new Date(a.date).toDateString() === new Date(selected).toDateString())
  const todayStr   = toStr(today)

  // Week summary counts
  const weekAppts  = appointments.filter(a =>
    weekDates.some(d => toStr(d) === new Date(a.date).toDateString().split(' ').slice(1).join('-'))
  )

  return (
    <StaffLayout>

      {/* Header */}
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-[22px] font-bold text-[#2d2d2d] m-0 font-serif">My Schedule</h1>
          <p className="text-[13px] text-[#7AC49A] mt-1 mb-0">
            {MONTHS[weekDates[0].getMonth()]} {weekDates[0].getDate()} – {MONTHS[weekDates[6].getMonth()]} {weekDates[6].getDate()}, {weekDates[0].getFullYear()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={goToday}
            className="text-[12px] text-[#7AC49A] bg-[#E8F5E9] border border-[#C8E6C9] px-4 py-2 rounded-lg font-serif cursor-pointer hover:bg-[#C8E6C9] transition-colors">
            Today
          </button>
          <button onClick={prevWeek}
            className="w-9 h-9 flex items-center justify-center bg-white border border-[#C8E6C9] rounded-lg cursor-pointer text-[#7AC49A] hover:bg-[#E8F5E9] transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <button onClick={nextWeek}
            className="w-9 h-9 flex items-center justify-center bg-white border border-[#C8E6C9] rounded-lg cursor-pointer text-[#7AC49A] hover:bg-[#E8F5E9] transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Week summary strip */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: 'This Week',  value: weekAppts.length,                                          bg: 'bg-[#E8F5E9]', color: 'text-[#7AC49A]' },
          { label: 'Confirmed',  value: weekAppts.filter(a => a.status==='Confirmed').length,      bg: 'bg-[#E8F5E9]', color: 'text-[#4CAF50]' },
          { label: 'Pending',    value: weekAppts.filter(a => a.status==='Pending').length,        bg: 'bg-[#FFF8E1]', color: 'text-[#FFA000]' },
          { label: 'Completed',  value: weekAppts.filter(a => a.status==='Completed').length,      bg: 'bg-[#EDE7F6]', color: 'text-[#7B1FA2]' },
        ].map(({ label, value, bg, color }) => (
          <div key={label} className="bg-white rounded-lg px-5 py-4 border border-[#C8E6C9] shadow-[0_2px_8px_rgba(122,196,154,0.07)] flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center`}>
              <span className={`text-[17px] font-bold font-serif ${color}`}>{value}</span>
            </div>
            <p className="text-[12px] text-[#aaa] m-0">{label}</p>
          </div>
        ))}
      </div>

      {/* Week calendar row */}
      <div className="bg-white rounded-xl border border-[#C8E6C9] mb-6 overflow-hidden shadow-[0_2px_12px_rgba(122,196,154,0.06)]">
        <div className="grid grid-cols-7">
          {weekDates.map((d, i) => {
            const str      = toStr(d)
            const isToday  = str === todayStr
            const isSel    = str === selected
            const dayCount = appointments.filter(a => new Date(a.date).toDateString() === d.toDateString()).length
            return (
              <button
                key={i}
                onClick={() => setSelected(str)}
                className={`flex flex-col items-center py-4 border-r last:border-r-0 border-[#E8F5E9] cursor-pointer transition-all
                  ${isSel ? 'bg-[#7AC49A]' : isToday ? 'bg-[#E8F5E9]' : 'bg-white hover:bg-[#F0FAF4]'}`}
              >
                <span className={`text-[10px] uppercase tracking-[0.1em] mb-1 ${isSel ? 'text-white/70' : 'text-[#aaa]'}`}>
                  {DAYS[d.getDay()]}
                </span>
                <span className={`text-[16px] font-bold font-serif ${isSel ? 'text-white' : isToday ? 'text-[#7AC49A]' : 'text-[#2d2d2d]'}`}>
                  {d.getDate()}
                </span>
                {dayCount > 0 && (
                  <span className={`mt-1.5 text-[10px] px-2 py-0.5 rounded-full font-semibold
                    ${isSel ? 'bg-white/30 text-white' : 'bg-[#C8E6C9] text-[#7AC49A]'}`}>
                    {dayCount}
                  </span>
                )}
                {dayCount === 0 && <span className="mt-1.5 h-[18px]" />}
              </button>
            )
          })}
        </div>
      </div>

      {/* Appointments for selected day */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[15px] font-bold text-[#2d2d2d] m-0 font-serif">
          {selected === todayStr ? "Today's Appointments" : `Appointments — ${selected}`}
        </h3>
        <span className="text-[12px] text-[#7AC49A] bg-[#E8F5E9] px-3 py-1 rounded-full">
          {dayAppts.length} appointment{dayAppts.length !== 1 ? 's' : ''}
        </span>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-[#C8E6C9] p-12 text-center">
          <div className="flex justify-center mb-3">
            <div className="w-6 h-6 border-2 border-[#7AC49A] border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-[13px] text-[#aaa] font-serif">Loading schedule...</p>
        </div>
      ) : dayAppts.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#C8E6C9] p-12 text-center">
          <div className="w-14 h-14 rounded-full bg-[#E8F5E9] flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7AC49A" strokeWidth="1.6" strokeLinecap="round">
              <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <p className="text-[14px] text-[#aaa] m-0 font-serif">No appointments scheduled for this day</p>
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
          {dayAppts.map(appt => (
            // ✅ Reusing AppointmentCard — read-only for staff
            <AppointmentCard key={appt.id} appointment={appt} />
          ))}
        </div>
      )}

    </StaffLayout>
  )
}

export default MySchedule
