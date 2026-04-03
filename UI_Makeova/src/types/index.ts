// ── API response wrapper (matches your backend) ───────────
export interface ApiResponse<T> {
  code:    number
  message: string
  data:    T
}

export interface PaginationMeta {
  currentPage: number
  perPage: number
  totalItems: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface PaginatedData<T> {
  items: T[]
  pagination: PaginationMeta
}

export interface PaginationQuery {
  page?: number
  limit?: number
}

// ── Portal types ──────────────────────────────────────────
export type PortalType = 'admin' | 'receptionist' | 'staff'

// ── Permission & Role ─────────────────────────────────────
export interface IPermission {
  description: string
  _id:         string
  name:        string   // 'create' | 'read' | 'update' | 'delete'
  isDeleted:   boolean
}

export interface IModuleAccess {
  module:     string
  permission: IPermission[] | string[]   // handles both populated & unpopulated (ObjectId refs)
}

export interface IRole {
  _id:            string
  name:           string
  moduleAccess:   IModuleAccess[]
  description:    string
  canAssignRoles: string[]   // roles this role is allowed to assign
}

// ── User (matches your MongoDB schema) ───────────────────
export interface IUser {
  _id:              string
  name:             string
  email:            string
  phonenumber:      string
  gender:           'male' | 'female' | 'other'
  profileImg?:      string
  address:          string
  dob?:             string
  role:             IRole[]
  specialization?:  string
  experienceYears?: number
  isAvailable:      boolean
  Bio?:             string
  WorkingDay?:      ('sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat')[] | 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat'
  createdAt:        string
  createdBy?:       string
}

// ── Auth types ────────────────────────────────────────────
export interface LoginRequest {
  email:    string
  password: string
}

export interface LoginResponseData {
  u:            IUser
  accessToken:  string
  refreshToken: string
}

export type LoginResponse    = ApiResponse<LoginResponseData>
export type RegisterResponse = ApiResponse<IUser>

export interface RegisterRequest {
  name:        string
  email:       string
  password:    string
  phonenumber: string
  gender:      'male' | 'female' | 'other'
  address:     string
  role:        string[]
}

// ── Module constants ──────────────────────────────────────
// ✅ Array (not object) — supports .forEach / .filter / .map
export const MODULES = [
  'user',
  'appointment',
  'customer',
  'service',
  'staff',
  'report',
] as const

export type ModuleName     = typeof MODULES[number]
export type PermissionName = 'create' | 'read' | 'update' | 'delete'
