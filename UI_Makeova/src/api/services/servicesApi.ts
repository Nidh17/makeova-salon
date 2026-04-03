import api from '../axiosInstance'
import type { ApiResponse, PaginatedData, PaginationQuery } from '../../types'

// ── Matches your Iservice schema exactly ─────────────────
export interface IService {
  _id:         string
  name:        string
  description: string
  price:       number
  duration:    number   // in minutes
  
  isActive:    boolean
}

export interface ServiceFormData {
  name:        string
  description: string
  price:       number | string
  duration:    number | string

  isActive:    boolean
}

export interface ServiceQuery extends PaginationQuery {
  search?: string
  isActive?: boolean
}

// GET  /api/v1/services/getall
export const getAllServices = async ({
  page = 1,
  limit = 10,
  search,
  isActive,
}: ServiceQuery = {}): Promise<PaginatedData<IService>> => {
  const { data } = await api.get<ApiResponse<PaginatedData<IService>>>('/service/getall', {
    params: { page, limit, search, isActive },
  })
  return data.data
}

// GET  /api/v1/services/getservice/:id
export const getServiceById = async (id: string): Promise<IService> => {
  const { data } = await api.get<ApiResponse<IService>>(`/service/getservice/${id}`)
  return data.data
}

// POST /api/v1/services/create
export const createService = async (body: ServiceFormData): Promise<IService> => {
  const { data } = await api.post<ApiResponse<IService>>('/service/create', {
    ...body,
    price:    Number(body.price),
    duration: Number(body.duration),
  })
  return data.data
}

// PATCH /api/v1/services/updateservice/:id
export const updateService = async (id: string, body: Partial<ServiceFormData>): Promise<IService> => {
  const { data } = await api.patch<ApiResponse<IService>>(`/service/updateservice/${id}`, {
    ...body,
    price:    body.price    !== undefined ? Number(body.price)    : undefined,
    duration: body.duration !== undefined ? Number(body.duration) : undefined,
  })
  return data.data
}

// DELETE /api/v1/services/deleteservice/:id
export const deleteService = async (id: string): Promise<void> => {
  await api.delete(`/service/deleteservice/${id}`)
}
