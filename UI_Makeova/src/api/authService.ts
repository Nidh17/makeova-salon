import api, { setTokens, clearTokens, getRefreshToken, getAccessToken } from './axiosInstance'
import type { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from '../types'

const authService = {

  // POST /api/v1/user/login
  // Backend returns: { code, message, data: { u, accessToken, refreshToken } }
  login: async (body: LoginRequest): Promise<LoginResponse> => {
    const { data } = await api.post<LoginResponse>('/user/login', body)
    const payload = data as any

    const accessToken =
      payload?.data?.accessToken ??
      payload?.data?.token ??
      payload?.accessToken ??
      payload?.token

    const refreshToken =
      payload?.data?.refreshToken ??
      payload?.data?.refresh_token ??
      payload?.refreshToken ??
      payload?.refresh_token

    const user = payload?.data?.u ?? payload?.data?.user ?? payload?.user

    if (!accessToken || !refreshToken) {
      throw new Error('Login response missing access/refresh tokens')
    }

    // Save tokens to localStorage
    setTokens(accessToken, refreshToken)

    // Save user object (without password)
    if (user) {
      localStorage.setItem('makeova_user', JSON.stringify(user))
    }

    return data
  },

  // POST /api/v1/user/register  (requires admin Bearer token)
  // Backend returns: { code, message, data: IUser }
  register: async (body: RegisterRequest): Promise<RegisterResponse> => {
    const { data } = await api.post<RegisterResponse>('/user/register', body)
    return data
  },

  // POST /api/v1/user/logout
  // Backend needs the refreshToken to delete the session
  logout: async (): Promise<void> => {
    const refreshToken = getRefreshToken()
    const accessToken = getAccessToken()
    try {
      // Send a few common token keys so logout works even if backend naming differs.
      if (refreshToken) {
        await api.post(
          '/user/logout',
          {
            refreshToken,
            refresh_token: refreshToken,
            token: refreshToken,
          },
          {
            headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
          }
        )
      }
    } finally {
      // Always clear local storage even if API fails
      clearTokens()
    }
  },
}

export default authService
