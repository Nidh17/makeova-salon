import React, { useState, useEffect } from 'react'
import AppointmentForm from '../appointments/AppointmentForm'
import AppointmentTable from '../appointments/AppointmentTable'
import ReceptionistLayout from './Receptionistlayout'
import { getAllAppointments, updateAppointmentStatus, type IAppointment } from '@/api/AppointmentsApi'
import { getTimeBlock, TIME_BLOCK_LABELS } from '../appointments/appointmentUtils'

const timeBlocks = Object.values(TIME_BLOCK_LABELS)

const getBlockIndex = (startTime: string) => {
  const block = getTimeBlock(startTime)
  return block === 'morning' ? 0 : block === 'afternoon' ? 1 : 2
}

const ReceptionistSchedule: React.FC = () => {
  const [appointments, setAppointments] = useState<IAppointment[]>([])
  const [showModal, setShowModal]       = useState(false)
  const [activeBlock, setActiveBlock]   = useState(0)
  const [loading, setLoading] = useState(true)

  // Fetch today's appointments
  useEffect(() => {
    const loadAppointments = async () => {
      try {
        setLoading(true)
        const allAppointments = await getAllAppointments({ page: 1, limit: 10 })
        
        // Filter for today's appointments
        const today = new Date().toDateString()
        const todayAppts = allAppointments.items.filter(apt => 
          new Date(apt.appointmentDate).toDateString() === today
        )

        setAppointments(todayAppts)
      } catch (error) {
        console.error('Failed to load appointments:', error)
      } finally {
        setLoading(false)
      }
    }
    loadAppointments()
  }, [])

  const handleSuccess = async () => {
    setShowModal(false)
    // Reload appointments
    try {
      const allAppointments = await getAllAppointments({ page: 1, limit: 10 })
      
      const today = new Date().toDateString()
      const todayAppts = allAppointments.items.filter(apt => 
        new Date(apt.appointmentDate).toDateString() === today
      )

      setAppointments(todayAppts)
    } catch (error) {
      console.error('Failed to reload appointments:', error)
    }
  }

  const cancelAppt = async (id: string) => {
    try {
      await updateAppointmentStatus(id, 'cancelled')
      setAppointments(prev => prev.map(a => a._id === id ? { ...a, status: 'cancelled' } : a))
    } catch (error) {
      console.error('Failed to cancel appointment:', error)
    }
  }
  
  const confirmAppt = async (id: string) => {
    try {
      await updateAppointmentStatus(id, 'confirmed')
      setAppointments(prev => prev.map(a => a._id === id ? { ...a, status: 'confirmed' } : a))
    } catch (error) {
      console.error('Failed to confirm appointment:', error)
    }
  }

  const completeAppt = async (id: string) => {
    try {
      await updateAppointmentStatus(id, 'completed')
      setAppointments(prev => prev.map(a => a._id === id ? { ...a, status: 'completed' } : a))
    } catch (error) {
      console.error('Failed to complete appointment:', error)
    }
  }

  const blockAppts = appointments.filter(a => getBlockIndex(a.startTime) === activeBlock)

  return (
    <ReceptionistLayout>

      {/* Header with stats */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-bold text-[#2d2d2d] m-0 font-serif">Today's Schedule</h1>
          <p className="text-[13px] text-[#aaa] mt-1 mb-0">{appointments.length} total · {appointments.filter(a => a.status === 'confirmed').length} confirmed</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 text-white text-[13px] font-semibold font-serif px-5 py-[10px] rounded-xl border-none cursor-pointer hover:opacity-90 transition-opacity shadow-[0_4px_14px_rgba(196,154,122,0.3)]"
          style={{ background: 'linear-gradient(135deg,#C49A7A,#E8B89A)' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New Appointment
        </button>
      </div>

      {/* Stat cards - Status summary */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total',     value: appointments.length, color: '#C49A7A', bg: '#FDF0EB' },
          { label: 'Confirmed', value: appointments.filter(a => a.status === 'confirmed').length, color: '#4CAF50', bg: '#E8F5E9' },
          { label: 'Pending',   value: appointments.filter(a => a.status === 'pending').length, color: '#FF9800', bg: '#FFF8E1' },
          { label: 'Cancelled', value: appointments.filter(a => a.status === 'cancelled').length, color: '#E53935', bg: '#FFEBEE' },
        ].map(({ label, value, color, bg }) => (
          <div key={label}
            className="bg-white rounded-xl border border-[#F0DDD5] px-4 py-3 flex items-center gap-3 cursor-pointer hover:shadow-md transition-shadow">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
              <span className="text-[15px] font-bold font-serif" style={{ color }}>{value}</span>
            </div>
            <p className="text-[11px] text-[#aaa] m-0 font-serif">{label}</p>
          </div>
        ))}
      </div>

      {/* Time block tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {timeBlocks.map((block, idx) => {
          const active = activeBlock === idx
          const count  = appointments.filter(a => getBlockIndex(a.startTime) === idx).length
          return (
            <button
              key={block}
              onClick={() => setActiveBlock(idx)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-[13px] font-serif cursor-pointer transition-all duration-200 font-medium
                ${active ? 'bg-[#C49A7A] text-white border-[#C49A7A] shadow-[0_2px_8px_rgba(196,154,122,0.2)]' : 'bg-white text-[#666] border-[#E0E0E0] hover:border-[#C49A7A] hover:text-[#C49A7A]'}`}
            >
              {block}
              <span className={`text-[11px] px-2 py-1 rounded-md font-semibold ${active ? 'bg-white/25 text-white' : 'bg-[#F5C8BC] text-[#C49A7A]'}`}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Appointment table */}
      <AppointmentTable
        appointments={blockAppts}
        loading={loading}
        onCancel={cancelAppt}
        onConfirm={confirmAppt}
        onComplete={completeAppt}
        showActions={true}
        actorRole="receptionist"
      />

      {/* Book Appointment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200] flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.2)] w-full max-w-[540px] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#F0DDD5] bg-gradient-to-r from-[#FDF6F2] to-white sticky top-0 z-10">
              <h3 className="text-[17px] font-bold text-[#2d2d2d] m-0 font-serif">New Appointment</h3>
              <button onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-[#FDF6F2] flex items-center justify-center border-none cursor-pointer text-[#999] hover:text-[#C49A7A] hover:bg-[#F5C8BC] transition-all">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="px-6 py-6">
              <AppointmentForm
                onSuccess={handleSuccess}
                onCancel={() => setShowModal(false)}
              />
            </div>
          </div>
        </div>
      )}
    </ReceptionistLayout>
  )
}

export default ReceptionistSchedule
