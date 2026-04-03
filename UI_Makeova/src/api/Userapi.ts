import { ApiResponse, IRole, IUser, PaginatedData, PaginationQuery } from "@/types"
import api from "./axiosInstance"


// ── Role type ─────────────────────────────────────────────
export type UserRoleType = 'staff' | 'receptionist' | 'customer'

// ── Role config — name must match exactly what's in your DB ─
// Role ObjectIds are fetched dynamically from backend
// This maps role type → role name string stored in DB
export const ROLE_NAME_MAP: Record<UserRoleType, string> = {
  staff:         'staff',
  receptionist:  'receptionist',
  customer:      'customer',
}

// IUser and IRole imported from '../../types'

// ── Form data for create/edit ─────────────────────────────
export interface UserFormData {
  name:             string
  email:            string
  password:         string
  phonenumber:      string
  gender:           string   // 'male' | 'female' | 'other' | '' — use string for form compatibility
  address:          string
  dob?:             string
  profileImg?:      string   // ← added
  specialization?:  string
  experienceYears?: string   // string in form, converted to number on API call
  isAvailable:      boolean
  Bio?:             string
  WorkingDay?:      string[]
  role:             string[]
}

export interface UserQuery extends PaginationQuery {
  search?: string
  role?: string
  isAvailable?: boolean
}

const isObjectId = (value: string): boolean => /^[a-fA-F0-9]{24}$/.test(value)

// ── Fetch all roles from backend ──────────────────────────
// GET /api/v1/roles/getall  (or whatever your roles endpoint is)
// Returns all roles so we can find the ObjectId by name dynamically
export interface IRoleDoc {
  _id:  string
  name: string
}

// ── Fallback role cache for when backend filters roles by authorization ─
// When receptionist calls /role/getall, backend may not return all roles
// Store found roles in localStorage so they persist across sessions
const ROLE_CACHE_KEY = 'makeova_role_cache'

const getRoleFromCache = (roleName: string): string | null => {
  try {
    const cache = JSON.parse(localStorage.getItem(ROLE_CACHE_KEY) || '{}')
    return cache[roleName] || null
  } catch {
    return null
  }
}

const cacheRole = (roleName: string, roleId: string): void => {
  try {
    const cache = JSON.parse(localStorage.getItem(ROLE_CACHE_KEY) || '{}')
    cache[roleName] = roleId
    localStorage.setItem(ROLE_CACHE_KEY, JSON.stringify(cache))
  } catch { /* ignore cache errors */ }
}

export const getAllRoles = async ({ page = 1, limit = 100 }: PaginationQuery = {}): Promise<PaginatedData<IRoleDoc>> => {
  const { data } = await api.get<ApiResponse<PaginatedData<IRoleDoc>>>('/role/getall', {
    params: { page, limit },
  })
  const roles = data.data.items
  // Cache whichever roles we got, for fallback
  roles.forEach(r => cacheRole(r.name, r._id))
  return data.data
}

const resolveRoleIds = async (roles: string[]): Promise<string[]> => {
  const cleaned = roles.map(role => role.trim()).filter(Boolean)
  if (cleaned.length === 0) return []

  try {
    const { items: availableRoles } = await getAllRoles({ page: 1, limit: 100 })

    return cleaned.map(role => {
      if (isObjectId(role)) return role

      const matched = availableRoles.find(r => r.name.toLowerCase() === role.toLowerCase())
      if (matched?._id) return matched._id

      return getRoleFromCache(role.toLowerCase()) || role
    })
  } catch {
    return cleaned.map(role => {
      if (isObjectId(role)) return role
      return getRoleFromCache(role.toLowerCase()) || role
    })
  }
}

// ── GET all users — filtered client-side by role name ─────
// Your backend returns ALL users — we filter by role name
// GET /api/v1/user/getalluser
export const getAllUsers = async ({
  page = 1,
  limit = 10,
  search,
  role,
  isAvailable,
}: UserQuery = {}): Promise<PaginatedData<IUser>> => {
  const { data } = await api.get<ApiResponse<PaginatedData<IUser>>>('/user/getalluser', {
    params: { page, limit, search, role, isAvailable },
  })
  return data.data
}

// ── Exported helper to get role from cache (fallback for receptionist) ──
// If backend filters roles by authorization, this ensures we have the role ID
export const getCachedRoleId = (roleName: string): string | null => {
  return getRoleFromCache(roleName)
}

// ── Filter users by role name (after fetching all) ────────
export const filterUsersByRole = (users: IUser[], roleName: string): IUser[] => {
  return users.filter(u => {
    if (!u.role || u.role.length === 0) return false
    return u.role.some(r => {
      if (typeof r === 'string') return false   // not populated
      return (r as IRole).name?.toLowerCase() === roleName.toLowerCase()
    })
  })
}

// ── GET user by id ────────────────────────────────────────
// GET /api/v1/user/getbyid/:id
export const getUserById = async (id: string): Promise<IUser> => {
  const { data } = await api.get<ApiResponse<IUser>>(`/user/getbyid/${id}`)
  return data.data
}

// ── CREATE user ───────────────────────────────────────────
// POST /api/v1/user/register
// role[] is array of role ObjectIds
export const createUser = async (body: UserFormData): Promise<IUser> => {
  const resolvedRoles = await resolveRoleIds(body.role)

  // Required fields — always sent
  const payload: Record<string, unknown> = {
    name:        body.name.trim(),
    email:       body.email.trim().toLowerCase(),
    password:    body.password,
    phonenumber: body.phonenumber.trim(),
    gender:      body.gender,
    address:     body.address.trim(),
    role:        resolvedRoles.length ? resolvedRoles : body.role.filter(Boolean),
    isAvailable: body.isAvailable,
  }

  // Optional fields — only add if they have real values
  // Empty strings would fail zod validation (e.g. z.enum fails on "")
  if (body.dob?.trim())         payload.dob  = body.dob.trim()
  if (body.Bio?.trim())         payload.Bio  = body.Bio.trim()
  if (body.profileImg?.trim())  payload.profileImg = body.profileImg.trim()

  // WorkingDay — only send if valid enum value
  if (body.WorkingDay?.length) {
    payload.WorkingDay = body.WorkingDay
  }

  // specialization — only send if valid 24-char ObjectId
  if (body.specialization && /^[a-fA-F0-9]{24}$/.test(body.specialization)) {
    payload.specialization = body.specialization
  }

  // experienceYears — convert to number, skip if empty
  if (body.experienceYears !== undefined && body.experienceYears !== '') {
    const num = Number(body.experienceYears)
    if (!isNaN(num) && num >= 0) payload.experienceYears = num
  }

  const { data } = await api.post<ApiResponse<IUser>>('/user/register', payload)
  return data.data
}

// ── UPDATE user ───────────────────────────────────────────
// PATCH /api/v1/user/updateuser/:id
export const updateUser = async (id: string, body: Partial<UserFormData>): Promise<IUser> => {
  // Build payload with ONLY fields that have real values
  // Empty strings, undefined, null are excluded — they would fail backend zod validation
  // updateUserValidation = userValidation.partial() — optional but still validated if present
  const payload: Record<string, unknown> = {}

  if (body.name?.trim())        payload.name        = body.name.trim()
  if (body.phonenumber?.trim()) payload.phonenumber = body.phonenumber.trim()
  if (body.address?.trim())     payload.address     = body.address.trim()
  if (body.Bio?.trim())         payload.Bio         = body.Bio.trim()
  if (body.dob?.trim())         payload.dob         = body.dob.trim()

  // Enums — only send if non-empty string (empty string fails z.enum)
  if (body.gender && body.gender !== '') payload.gender = body.gender
  if (body.WorkingDay?.length) payload.WorkingDay = body.WorkingDay

  // Boolean — always safe to send
  if (body.isAvailable !== undefined) payload.isAvailable = body.isAvailable

  // Number — convert string → number, skip if empty
  if (body.experienceYears !== undefined && body.experienceYears !== '') {
    const num = Number(body.experienceYears)
    if (!isNaN(num) && num >= 0) payload.experienceYears = num
  }

  // ObjectId ref — only send if valid 24-char hex
  if (body.specialization && /^[a-fA-F0-9]{24}$/.test(body.specialization)) {
    payload.specialization = body.specialization
  }

  // profileImg — only send if valid URL-like string
  if (body.profileImg?.trim()) payload.profileImg = body.profileImg.trim()

  // NEVER send these on update:
  // password — not in updateUserValidation scope (use separate change-password endpoint)
  // email    — unique field, backend should reject changes
  // role     — role change should be a separate admin action
  // createdBy, createdAt — server-side fields

  const { data } = await api.patch<ApiResponse<IUser>>(`/user/updateuser/${id}`, payload)
  return data.data
}

// ── DELETE user ───────────────────────────────────────────
// DELETE /api/v1/user/delete/:id
export const deleteUser = async (id: string): Promise<void> => {
  await api.delete(`/user/delete/${id}`)
}
