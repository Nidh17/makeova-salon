import type { IAppointment, ILeave } from '@/api/AppointmentsApi'
import type { IUser } from '@/types'

export type AppointmentActorRole = 'admin' | 'receptionist'

export const WORKING_DAY_OPTIONS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const

export const WORKING_DAY_LABELS: Record<(typeof WORKING_DAY_OPTIONS)[number], string> = {
  sun: 'Sunday',
  mon: 'Monday',
  tue: 'Tuesday',
  wed: 'Wednesday',
  thu: 'Thursday',
  fri: 'Friday',
  sat: 'Saturday',
}

export const statusConfig = {
  pending: { label: 'Pending', bg: 'bg-[#FFF8E1]', text: 'text-[#FF9800]', dot: 'bg-[#FF9800]' },
  confirmed: { label: 'Confirmed', bg: 'bg-[#E8F5E9]', text: 'text-[#4CAF50]', dot: 'bg-[#4CAF50]' },
  completed: { label: 'Completed', bg: 'bg-[#E3F2FD]', text: 'text-[#1565C0]', dot: 'bg-[#1565C0]' },
  cancelled: { label: 'Cancelled', bg: 'bg-[#FFEBEE]', text: 'text-[#E53935]', dot: 'bg-[#E53935]' },
}

export const getAppointmentActions = (
  status: IAppointment['status'],
  role: AppointmentActorRole
): { canConfirm: boolean; canCancel: boolean; isReadOnly: boolean } => {
  if (status === 'completed') {
    return { canConfirm: false, canCancel: false, isReadOnly: true }
  }

  if (role === 'admin') {
    if (status === 'pending') {
      return { canConfirm: true, canCancel: true, isReadOnly: false }
    }

    if (status === 'confirmed') {
      return { canConfirm: false, canCancel: true, isReadOnly: false }
    }
  }

  if (role === 'receptionist') {
    if (status === 'pending') {
      return { canConfirm: true, canCancel: true, isReadOnly: false }
    }
  }

  return { canConfirm: false, canCancel: false, isReadOnly: false }
}

export const getCustomerName = (userID: IAppointment['userID']): string =>
  typeof userID === 'string' ? userID : userID?.name || 'Unknown'

export const getStaffName = (staffID: IAppointment['staffID']): string =>
  typeof staffID === 'string' ? staffID : staffID?.name || 'Unassigned'

export const getServiceName = (services: IAppointment['services']): string =>
  typeof services === 'string' ? services : services?.name || 'Service'

export const getServicePrice = (services: IAppointment['services']): number =>
  typeof services === 'string' ? 0 : services?.price || 0

export const getServiceDuration = (services: IAppointment['services']): number =>
  typeof services === 'string' ? 0 : services?.duration || 0

export const formatTime = (timeStr: string): string => {
  if (!timeStr) return '--:--'

  try {
    const date = new Date(timeStr)
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
  } catch {
    return timeStr
  }
}

export const formatDate = (dateStr: string): string => {
  if (!dateStr) return '--'

  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return dateStr
  }
}

export const formatDateShort = (dateStr: string): string => {
  if (!dateStr) return '--'

  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  } catch {
    return dateStr
  }
}

export const getDayKeyFromDate = (date: string): (typeof WORKING_DAY_OPTIONS)[number] => {
  const parsed = new Date(date)
  return WORKING_DAY_OPTIONS[parsed.getDay()]
}

export const normalizeWorkingDays = (workingDay?: IUser['WorkingDay'] | string | string[]): string[] => {
  if (!workingDay) return []

  const values = Array.isArray(workingDay) ? workingDay : [workingDay]
  return values
    .map(day => day?.toLowerCase?.().trim?.() ?? '')
    .filter((day): day is string => Boolean(day))
}

export const getWorkingDayLabel = (workingDay?: IUser['WorkingDay'] | string | string[]): string => {
  const normalizedDays = normalizeWorkingDays(workingDay)
  if (normalizedDays.length === 0) return 'Not set'

  return normalizedDays
    .map(day => WORKING_DAY_LABELS[day as (typeof WORKING_DAY_OPTIONS)[number]] || day)
    .join(', ')
}

export const isWorkingOnDate = (provider: Pick<IUser, 'WorkingDay'>, date: string): boolean => {
  return normalizeWorkingDays(provider.WorkingDay).includes(getDayKeyFromDate(date))
}

const getUserRefId = (
  value: IAppointment['staffID'] | IAppointment['userID'] | ILeave['staffId'] | null | undefined
): string | null => {
  if (!value) return null
  if (typeof value === 'string') return value
  return value._id ?? null
}

export const isOnLeave = (staffId: string, date: string, leaves: ILeave[]): boolean => {
  return leaves.some(leave => {
    const leaveDate = new Date(leave.date).toDateString()
    const selectedDate = new Date(date).toDateString()
    const leaveStaffId = getUserRefId(leave.staffId)

    return leaveStaffId === staffId && leaveDate === selectedDate && leave.status === 'approved'
  })
}

export const getProviderAvailabilityStatus = (
  provider: Pick<IUser, '_id' | 'isAvailable' | 'WorkingDay'>,
  date: string,
  leaves: ILeave[],
  appointments: IAppointment[]
): 'leave' | 'offday' | 'unavailable' | 'free' | 'busy' => {
  if (!provider.isAvailable) return 'unavailable'
  if (!isWorkingOnDate(provider, date)) return 'offday'
  if (isOnLeave(provider._id, date, leaves)) return 'leave'

  const bookedCount = getBookedCount(provider._id, date, appointments)
  return bookedCount >= 3 ? 'busy' : 'free'
}

export const hasConflict = (
  staffId: string,
  date: string,
  slotTime: string,
  appointments: IAppointment[],
  serviceDuration: number
): boolean => {
  const slotStart = new Date(`${date}T${slotTime}:00`)
  const slotEnd = new Date(slotStart.getTime() + serviceDuration * 60000)

  return appointments.some(appointment => {
    const appointmentStaffId = getUserRefId(appointment.staffID)
    if (appointmentStaffId !== staffId) return false
    if (!['pending', 'confirmed'].includes(appointment.status)) return false

    const appointmentStart = new Date(appointment.startTime)
    const appointmentEnd = new Date(appointment.endTime)
    return slotStart < appointmentEnd && slotEnd > appointmentStart
  })
}

export const hasCustomerConflict = (
  customerId: string,
  date: string,
  slotTime: string,
  appointments: IAppointment[],
  serviceDuration: number
): boolean => {
  const slotStart = new Date(`${date}T${slotTime}:00`)
  const slotEnd = new Date(slotStart.getTime() + serviceDuration * 60000)

  return appointments.some(appointment => {
    const appointmentCustomerId = getUserRefId(appointment.userID)
    if (appointmentCustomerId !== customerId) return false
    if (!['pending', 'confirmed'].includes(appointment.status)) return false

    const appointmentStart = new Date(appointment.startTime)
    const appointmentEnd = new Date(appointment.endTime)
    return slotStart < appointmentEnd && slotEnd > appointmentStart
  })
}

export const isPastSlot = (date: string, slotTime: string): boolean => {
  if (!date || !slotTime) return false

  const slotStart = new Date(`${date}T${slotTime}:00`)
  if (Number.isNaN(slotStart.getTime())) return false

  return slotStart.getTime() < Date.now()
}

export const getBookedCount = (
  staffId: string,
  date: string,
  appointments: IAppointment[]
): number => {
  return appointments.filter(appointment => {
    const appointmentStaffId = getUserRefId(appointment.staffID)
    const appointmentDate = new Date(appointment.appointmentDate).toDateString()
    const selectedDate = new Date(date).toDateString()

    return appointmentStaffId === staffId && appointmentDate === selectedDate && ['pending', 'confirmed'].includes(appointment.status)
  }).length
}

export const getTodayAppointments = (appointments: IAppointment[]): IAppointment[] => {
  const today = new Date().toDateString()
  return appointments.filter(appointment => new Date(appointment.appointmentDate).toDateString() === today)
}

export const getAppointmentsByStatus = (
  appointments: IAppointment[],
  status: IAppointment['status']
): IAppointment[] => {
  return appointments.filter(appointment => appointment.status === status)
}

export const getAppointmentsByStaffId = (
  appointments: IAppointment[],
  staffId: string
): IAppointment[] => {
  return appointments.filter(appointment => getUserRefId(appointment.staffID) === staffId)
}

export const getAppointmentsByDate = (
  appointments: IAppointment[],
  date: string
): IAppointment[] => {
  const targetDate = new Date(date).toDateString()
  return appointments.filter(appointment => new Date(appointment.appointmentDate).toDateString() === targetDate)
}

export const getTimeBlock = (startTime: string): 'morning' | 'afternoon' | 'evening' => {
  try {
    const hour = new Date(startTime).getHours()
    if (hour >= 9 && hour < 12) return 'morning'
    if (hour >= 12 && hour < 16) return 'afternoon'
    return 'evening'
  } catch {
    return 'afternoon'
  }
}

export const TIME_BLOCK_LABELS = {
  morning: 'Morning (9am-12pm)',
  afternoon: 'Afternoon (12pm-4pm)',
  evening: 'Evening (4pm-8pm)',
}

export const getAppointmentStats = (appointments: IAppointment[]) => {
  return {
    total: appointments.length,
    confirmed: appointments.filter(appointment => appointment.status === 'confirmed').length,
    pending: appointments.filter(appointment => appointment.status === 'pending').length,
    cancelled: appointments.filter(appointment => appointment.status === 'cancelled').length,
    completed: appointments.filter(appointment => appointment.status === 'completed').length,
  }
}
