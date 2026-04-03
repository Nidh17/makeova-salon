import type { ApiResponse, PaginatedData, PaginationQuery } from "@/types"
import api from "./axiosInstance"

// ── Types ─────────────────────────────────────────────────
export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled'
export type LeaveType         = 'full_day' | 'half_day_morning' | 'half_day_evening'
export type LeaveStatus       = 'pending' | 'approved' | 'rejected'

export interface IPopulatedUser {
  _id:         string
  name:        string
  email:       string
  phonenumber?: string
  isAvailable?: boolean
  WorkingDay?:  string | string[]
}

export interface IPopulatedService {
  _id:      string
  name:     string
  price:    number
  duration: number
}

export interface IAppointment {
  _id:            string
  userID:         IPopulatedUser | string
  staffID:        IPopulatedUser | string
  receptionistId: IPopulatedUser | string
  services:       IPopulatedService | string
  appointmentDate: string
  startTime:      string
  endTime:        string
  totalPrice:     number
  status:         AppointmentStatus
  note?:          string
  createdAt?:     string
}

export interface ILeave {
  _id:        string
  staffId:    IPopulatedUser | string
  date:       string
  reason?:    string
  type:       LeaveType
  status:     LeaveStatus
  approvedBy?: IPopulatedUser | string
  createdAt:  string
}

// ── Create appointment body ───────────────────────────────
export interface CreateAppointmentBody {
  userID:          string   // customer ObjectId
  staffID:         string   // staff ObjectId
  receptionistId:  string   // logged-in receptionist/admin ObjectId
  services:        string   // service ObjectId
  appointmentDate: string   // ISO date string
  startTime:       string   // ISO datetime string
  endTime:         string   // ISO datetime string
  totalPrice:      number
  note?:           string
  status?:         AppointmentStatus
}

export interface AppointmentQuery extends PaginationQuery {
  search?: string
  status?: AppointmentStatus
}

// ─────────────────────────────────────────────────────────
// Appointment API
// ─────────────────────────────────────────────────────────

// GET /api/v1/appointment/getall
export const getAllAppointments = async ({
  page = 1,
  limit = 10,
  search,
  status,
}: AppointmentQuery = {}): Promise<PaginatedData<IAppointment>> => {
  const { data } = await api.get<ApiResponse<PaginatedData<IAppointment>>>('/appointment/getall', {
    params: { page, limit, search, status },
  })
  return data.data
}

// GET /api/v1/appointment/getbyid/:id
export const getAppointmentById = async (id: string): Promise<IAppointment> => {
  const { data } = await api.get<ApiResponse<IAppointment>>(`/appointment/getbyid/${id}`)
  return data.data
}

// GET /api/v1/appointment/getbystaff/:staffId
export const getAppointmentsByStaff = async (staffId: string, { page = 1, limit = 10 }: PaginationQuery = {}): Promise<PaginatedData<IAppointment>> => {
  const { data } = await api.get<ApiResponse<PaginatedData<IAppointment>>>(`/appointment/getbystaff/${staffId}`, {
    params: { page, limit },
  })
  return data.data
}

// GET /api/v1/appointment/getbydate/:date
export const getAppointmentsByDate = async (date: string): Promise<IAppointment[]> => {
  const { data } = await api.get<ApiResponse<IAppointment[]>>(`/appointment/getbydate/${date}`)
  return data.data
}

// POST /api/v1/appointment/create
export const createAppointment = async (body: CreateAppointmentBody): Promise<IAppointment> => {
  const { data } = await api.post<ApiResponse<IAppointment>>('/appointment/create', body)
  return data.data
}

// PATCH /api/v1/appointment/update/:id
export const updateAppointment = async (id: string, body: Partial<CreateAppointmentBody>): Promise<IAppointment> => {
  const { data } = await api.patch<ApiResponse<IAppointment>>(`/appointment/update/${id}`, body)
  return data.data
}

// PATCH /api/v1/appointment/updatestatus/:id
export const updateAppointmentStatus = async (id: string, status: AppointmentStatus): Promise<IAppointment> => {
  const { data } = await api.patch<ApiResponse<IAppointment>>(`/appointment/updatestatus/${id}`, { status })
  return data.data
}

// DELETE /api/v1/appointment/deletebyid/:id
export const deleteAppointment = async (id: string): Promise<void> => {
  await api.delete(`/appointment/deletebyid/${id}`)
}

// ─────────────────────────────────────────────────────────
// Leave API
// ─────────────────────────────────────────────────────────

// GET /api/v1/leave/getall
export const getAllLeaves = async ({ page = 1, limit = 10 }: PaginationQuery = {}): Promise<PaginatedData<ILeave>> => {
  const { data } = await api.get<ApiResponse<PaginatedData<ILeave>>>('/leave/getall', {
    params: { page, limit },
  })
  return data.data
}

// GET /api/v1/leave/getbystaff/:staffId
export const getLeavesByStaff = async (staffId: string, { page = 1, limit = 10 }: PaginationQuery = {}): Promise<PaginatedData<ILeave>> => {
  const { data } = await api.get<ApiResponse<PaginatedData<ILeave>>>(`/leave/getbystaff/${staffId}`, {
    params: { page, limit },
  })
  return data.data
}

// POST /api/v1/leave/create
export const createLeave = async (body: {
  staffId: string; date: string; reason?: string; type: LeaveType
}): Promise<ILeave> => {
  const { data } = await api.post<ApiResponse<ILeave>>('/leave/create', body)
  return data.data
}

// PATCH /api/v1/leave/approve/:id
export const approveLeave = async (id: string): Promise<ILeave> => {
  const { data } = await api.patch<ApiResponse<ILeave>>(`/leave/approve/${id}`)
  return data.data
}

// PATCH /api/v1/leave/reject/:id
export const rejectLeave = async (id: string): Promise<ILeave> => {
  const { data } = await api.patch<ApiResponse<ILeave>>(`/leave/reject/${id}`)
  return data.data
}

// DELETE /api/v1/leave/delete/:id
export const deleteLeave = async (id: string): Promise<void> => {
  await api.delete(`/leave/delete/${id}`)
}

// ─────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────

// Get display name safely from populated or string field
export const getField = (field: IPopulatedUser | string | undefined | null, key: keyof IPopulatedUser): string => {
  if (field === null || field === undefined) return '—'
  if (typeof field === 'string') return field.trim() || '—'
  return String(field[key] ?? '—')
}

// Time slots for appointment booking (9am - 8pm, 30 min intervals)
export const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00', '19:30', '20:00',
]

// Format date for display
export const formatDate = (d: string): string =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

// Format time for display
export const formatTime = (d: string): string =>
  new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })

// Status color mapping
export const STATUS_STYLE: Record<AppointmentStatus, { bg: string; text: string; dot: string }> = {
  pending:   { bg: 'bg-[#FFF8E1]', text: 'text-[#FFA000]', dot: 'bg-[#FFA000]' },
  confirmed: { bg: 'bg-[#E8F5E9]', text: 'text-[#4CAF50]', dot: 'bg-[#4CAF50]' },
  completed: { bg: 'bg-[#E3F2FD]', text: 'text-[#1565C0]', dot: 'bg-[#1565C0]' },
  cancelled: { bg: 'bg-[#FFEBEE]', text: 'text-[#E53935]', dot: 'bg-[#E53935]' },
}



