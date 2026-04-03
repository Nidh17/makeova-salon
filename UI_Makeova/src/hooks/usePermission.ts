import { getRoleName, hasModuleAccess, hasPermission } from '@/utils/Permission'
import { useAppSelector } from '../store'
import { selectUser }      from '../store/slices/authSlice'
import type { ModuleName, PermissionName } from '../types'

export const usePermission = () => {
  const user = useAppSelector(selectUser)
  return {
    can:       (module: ModuleName, perm: PermissionName) => hasPermission(user, module, perm),
    canAccess: (module: ModuleName)                       => hasModuleAccess(user, module),
    isAdmin:        getRoleName(user) === 'admin',
    isReceptionist: getRoleName(user) === 'receptionist',
    isStaff:        getRoleName(user) === 'staff',
    roleName:       getRoleName(user),
    user,
  }
}