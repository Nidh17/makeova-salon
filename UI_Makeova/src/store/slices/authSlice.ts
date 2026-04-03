import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { IUser, PortalType } from '../../types'
import { getPortalFromRole, getRoleName } from '@/utils/Permission'

interface AuthState {
  user:            IUser | null
  accessToken:     string | null
  isAuthenticated: boolean       // true ONLY after backend verified
  isVerified:      boolean       // true once backend check is done
  roleName:        string | null
  portal:          PortalType | null
}

const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.exp * 1000 < Date.now()
  } catch {
    return true
  }
}

// On app load — read localStorage but mark as NOT verified yet
// isAuthenticated starts false until backend confirms
const load = (): AuthState => {
  try {
    const token  = localStorage.getItem('makeova_access_token')
    const raw    = localStorage.getItem('makeova_user')
    const portal = localStorage.getItem('makeova_portal') as PortalType | null
    const user   = raw ? (JSON.parse(raw) as IUser) : null

    // If token missing, expired, or no user → definitely not authenticated
    if (!token || isTokenExpired(token) || !user) {
      localStorage.removeItem('makeova_access_token')
      localStorage.removeItem('makeova_refresh_token')
      localStorage.removeItem('makeova_user')
      localStorage.removeItem('makeova_portal')
      return {
        user: null, accessToken: null,
        isAuthenticated: false, isVerified: true,  // verified = no need to check
        roleName: null, portal: null,
      }
    }

    // Token exists and not expired client-side
    // BUT isAuthenticated = false until backend confirms
    // isVerified = false means PrivateRoute will call backend
    return {
      user,
      accessToken:     token,
      isAuthenticated: false,   // ← NOT trusted yet
      isVerified:      false,   // ← backend check still needed
      roleName:        getRoleName(user) ?? portal,
      portal:          getPortalFromRole(user) ?? portal,
    }
  } catch {
    return {
      user: null, accessToken: null,
      isAuthenticated: false, isVerified: true,
      roleName: null, portal: null,
    }
  }
}

const authSlice = createSlice({
  name: 'auth',
  initialState: load(),
  reducers: {

    // Called after successful login — fully authenticated
    setCredentials: (
      state,
      action: PayloadAction<{ user: IUser; accessToken: string; portal: PortalType }>
    ) => {
      const { user, accessToken, portal } = action.payload
      state.user            = user
      state.accessToken     = accessToken
      state.isAuthenticated = true
      state.isVerified      = true   // just logged in = verified
      state.roleName        = getRoleName(user) ?? portal
      state.portal          = getPortalFromRole(user) ?? portal
    },

    // Called after backend confirms token is valid on app reload
    sessionVerified: (state) => {
      state.isAuthenticated = true
      state.isVerified      = true
    },

    // Called when backend rejects token or logout
    invalidateSession: (state) => {
      state.user            = null
      state.accessToken     = null
      state.isAuthenticated = false
      state.isVerified      = true
      state.roleName        = null
      state.portal          = null
      localStorage.removeItem('makeova_access_token')
      localStorage.removeItem('makeova_refresh_token')
      localStorage.removeItem('makeova_user')
      localStorage.removeItem('makeova_portal')
    },

    logout: (state) => {
      state.user            = null
      state.accessToken     = null
      state.isAuthenticated = false
      state.isVerified      = true
      state.roleName        = null
      state.portal          = null
    },
  },
})

export const {
  setCredentials,
  sessionVerified,
  invalidateSession,
  logout,
} = authSlice.actions

export default authSlice.reducer

export const selectUser        = (s: { auth: AuthState }) => s.auth.user
export const selectIsAuth      = (s: { auth: AuthState }) => s.auth.isAuthenticated
export const selectIsVerified  = (s: { auth: AuthState }) => s.auth.isVerified
export const selectRoleName    = (s: { auth: AuthState }) => s.auth.roleName
export const selectPortal      = (s: { auth: AuthState }) => s.auth.portal
export const selectToken       = (s: { auth: AuthState }) => s.auth.accessToken