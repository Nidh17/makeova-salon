import React from 'react'
import type { IAppointment } from '@/api/AppointmentsApi'

export type Appointment = IAppointment

interface AppointmentCardProps {
  appointment: IAppointment
  onCancel?: (id: string) => void
  onConfirm?: (id: string) => void
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({ appointment, onCancel, onConfirm }) => {
  const customer = typeof appointment.userID === 'string' ? appointment.userID : appointment.userID?.name || 'Unknown'
  const staff = typeof appointment.staffID === 'string' ? appointment.staffID : appointment.staffID?.name || 'Unassigned'
  const service = typeof appointment.services === 'string' ? appointment.services : appointment.services?.name || 'Service'
  const price = typeof appointment.services === 'string' ? 0 : appointment.services?.price || 0

  const statusColor: Record<string, string> = {
    pending: 'bg-[#FFF8E1] text-[#FF9800]',
    confirmed: 'bg-[#E8F5E9] text-[#4CAF50]',
    completed: 'bg-[#E3F2FD] text-[#1565C0]',
    cancelled: 'bg-[#FFEBEE] text-[#E74C3C]',
  }

  const statusBg = statusColor[appointment.status] || statusColor.pending

  const formatTime = (time: string): string => {
    if (!time) return '--:--'
    if (time.includes(':')) return time.substring(0, 5)
    const hours = Math.floor(Number(time) / 60)
    const mins = Number(time) % 60
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
  }

  const formatDate = (dateStr: string): string => {
    try {
      const date = new Date(dateStr)
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    } catch {
      return dateStr
    }
  }

  return (
    <div className="bg-white rounded-xl border border-[#F0DDD5] shadow-[0_2px_8px_rgba(196,154,122,0.05)] hover:shadow-[0_4px_12px_rgba(196,154,122,0.1)] transition-shadow p-4 h-full flex flex-col">
      {/* Header with status */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <p className="text-[13px] font-bold text-[#2d2d2d] m-0 font-serif">{customer}</p>
          <p className="text-[11px] text-[#aaa] m-0 mt-0.5">{staff}</p>
        </div>
        <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ml-2 ${statusBg}`}>
          {appointment.status}
        </span>
      </div>

      {/* Service & Price */}
      <div className="mb-3 pb-3 border-b border-[#F0DDD5]">
        <p className="text-[12px] text-[#666] m-0 mb-1 font-serif">{service}</p>
        <p className="text-[13px] font-bold text-[#C49A7A] m-0 font-serif">Rs {price.toLocaleString()}</p>
      </div>

      {/* Time & Date */}
      <div className="mb-3 pb-3 border-b border-[#F0DDD5]">
        <div className="flex items-center gap-2 text-[12px] text-[#666] m-0 font-serif mb-1">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
        </div>
        <div className="flex items-center gap-2 text-[12px] text-[#666] m-0 font-serif">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
          </svg>
          {formatDate(appointment.appointmentDate)}
        </div>
      </div>

      {/* Actions */}
      {(onCancel || onConfirm) && (
        <div className="flex gap-2 mt-auto">
          {onConfirm && appointment.status === 'pending' && (
            <button
              onClick={() => onConfirm(appointment._id)}
              className="flex-1 text-[11px] font-semibold px-3 py-2 rounded-lg bg-[#E8F5E9] text-[#4CAF50] border border-[#4CAF50]/30 cursor-pointer hover:bg-[#4CAF50] hover:text-white transition-all font-serif"
            >
              Confirm
            </button>
          )}
          {onCancel && appointment.status !== 'cancelled' && (
            <button
              onClick={() => onCancel(appointment._id)}
              className="flex-1 text-[11px] font-semibold px-3 py-2 rounded-lg bg-[#FFEBEE] text-[#E74C3C] border border-[#E74C3C]/30 cursor-pointer hover:bg-[#E74C3C] hover:text-white transition-all font-serif"
            >
              Cancel
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default AppointmentCard
