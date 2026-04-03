import { ApiResponse, PaginatedData, PaginationQuery } from "@/types"
import api from "./axiosInstance"


// ── Types matching your schemas ───────────────────────────
export interface IPermissionRef {
  _id:  string
  name: string
}

export interface IModuleAccess {
  module:     string
  permission: IPermissionRef[] | string[]
}

export interface IRole {
  _id:            string
  name:           string
  description:    string
  moduleAccess:   IModuleAccess[]
  canAssignRoles: string[]
  isDeleted:      boolean
  createdAt:      string
  updatedAt:      string
}

export interface IPermission {
  _id:         string
  name:        string
  description: string
  isDeleted:   boolean
  createdAt:   string
  updatedAt:   string
}

// ── Role API ──────────────────────────────────────────────
// GET  /api/v1/role/getall
export const getAllRoles = async ({ page = 1, limit = 10 }: PaginationQuery = {}): Promise<PaginatedData<IRole>> => {
  const { data } = await api.get<ApiResponse<PaginatedData<IRole>>>('/role/getall', {
    params: { page, limit },
  })
  return data.data
}

// GET  /api/v1/role/getbyid/:id
export const getRoleById = async (id: string): Promise<IRole> => {
  const { data } = await api.get<ApiResponse<IRole>>(`/role/getbyid/${id}`)
  return data.data
}

// POST /api/v1/role/create
export const createRole = async (body: {
  name:           string
  description:    string
  moduleAccess:   { module: string; permission: string[] }[]
  canAssignRoles: string[]
}): Promise<IRole> => {
  const { data } = await api.post<ApiResponse<IRole>>('/role/create', body)
  return data.data
}

// PATCH /api/v1/role/updaterole/:id
export const updateRole = async (id: string, body: Partial<{
  name:           string
  description:    string
  moduleAccess:   { module: string; permission: string[] }[]
  canAssignRoles: string[]
}>): Promise<IRole> => {
  const { data } = await api.patch<ApiResponse<IRole>>(`/role/updaterole/${id}`, body)
  return data.data
}

// PATCH /api/v1/role/deleterole/:id  (soft delete)
export const deleteRole = async (id: string): Promise<void> => {
  await api.patch(`/role/deleterole/${id}`)
}

// ── Permission API ────────────────────────────────────────
// GET  /api/v1/permission/getall
export const getAllPermissions = async ({ page = 1, limit = 10 }: PaginationQuery = {}): Promise<PaginatedData<IPermission>> => {
  const { data } = await api.get<ApiResponse<PaginatedData<IPermission>>>('/permission/getall', {
    params: { page, limit },
  })
  return data.data
}

// POST /api/v1/permission/create
export const createPermission = async (body: {
  name:        string
  description: string
}): Promise<IPermission> => {
  const { data } = await api.post<ApiResponse<IPermission>>('/permission/create', body)
  return data.data
}

// PATCH /api/v1/permission/update/:id
export const updatePermission = async (id: string, body: {
  name?:        string
  description?: string
}): Promise<IPermission> => {
  const { data } = await api.patch<ApiResponse<IPermission>>(`/permission/update/${id}`, body)
  return data.data
}

// DELETE /api/v1/permission/delete/:id  (hard delete)
export const deletePermission = async (id: string): Promise<void> => {
  await api.delete(`/permission/delete/${id}`)
}

// ── Modules list — match what you use in your DB ──────────
export const MODULES = [
  'user',
  'appointment',
  'customer',
  'service',
  'staff',
  'report',
  'role',
  'permission',
] as const

export type ModuleName = typeof MODULES[number]
