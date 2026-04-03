import type { IUser, IRole, IModuleAccess, IPermission, ModuleName, PermissionName, PortalType } from '../types'

export const getRoleName = (user: IUser | null): string | null => {
  if (!user?.role?.length) return null
  const r = user.role[0]
  return typeof r === 'string' ? null : (r as IRole).name?.toLowerCase() ?? null
}

export const hasPermission = (user: IUser | null, module: ModuleName, permission: PermissionName): boolean => {
  if (!user?.role?.length) return false
  return (user.role as IRole[]).some(role => {
    if (typeof role === 'string') return false
    const mod = role.moduleAccess?.find((m: IModuleAccess) => m.module === module)
    if (!mod) return false
    return mod.permission.some((p: IPermission | string) =>
      typeof p !== 'string' && (p as IPermission).name === permission
    )
  })
}

export const hasModuleAccess = (user: IUser | null, module: ModuleName): boolean => {
  if (!user?.role?.length) return false
  return (user.role as IRole[]).some(role =>
    typeof role !== 'string' && role.moduleAccess?.some((m: IModuleAccess) => m.module === module)
  )
}

// Determine which portal a user belongs to based on their role name
export const getPortalFromRole = (user: IUser | null): PortalType | null => {
  const role = getRoleName(user)
  if (!role) return null
  if (role.includes('admin'))        return 'admin'
  if (role.includes('receptionist')) return 'receptionist'
  if (role.includes('staff'))        return 'staff'
  return null
}

// Get login page URL for each portal
export const getPortalLoginPath = (portal: PortalType): string => {
  return `/${portal}/login`
}

// Get home path after login for each portal
export const getPortalHomePath = (portal: PortalType): string => {
  return `/${portal}`
}