import axios from 'axios'
import type { InternalAxiosRequestConfig, AxiosError } from 'axios'

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

// ── Token helpers ─────────────────────────────────────────
export const getAccessToken  = (): string | null => localStorage.getItem('makeova_access_token')
export const getRefreshToken = (): string | null => localStorage.getItem('makeova_refresh_token')

export const setTokens = (access: string, refresh: string): void => {
  localStorage.setItem('makeova_access_token',  access)
  localStorage.setItem('makeova_refresh_token', refresh)
}

export const clearTokens = (): void => {
  localStorage.removeItem('makeova_access_token')
  localStorage.removeItem('makeova_refresh_token')
  localStorage.removeItem('makeova_user')
  localStorage.removeItem('makeova_portal')
}

// ── Check JWT expiry WITHOUT a library ────────────────────
// Returns true if token is expired or will expire in next 30 seconds
export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.exp * 1000 < Date.now() + 30_000   // 30s buffer
  } catch {
    return true   // treat invalid/malformed token as expired
  }
}

// ── Axios instance ────────────────────────────────────────
const api = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean
}

// ─────────────────────────────────────────────────────────
// Refresh queue
// Prevents multiple simultaneous refresh calls when many
// requests fire at the same time with an expired token
// ─────────────────────────────────────────────────────────
let isRefreshing = false
type QItem = { resolve: (token: string) => void; reject: (err: unknown) => void }
let waitingQueue: QItem[] = []

const resolveQueue = (newToken: string) => {
  waitingQueue.forEach(({ resolve }) => resolve(newToken))
  waitingQueue = []
}

const rejectQueue = (err: unknown) => {
  waitingQueue.forEach(({ reject }) => reject(err))
  waitingQueue = []
}

// ── The actual refresh call ───────────────────────────────
// Matches your backend: POST /api/v1/user/refresh-token
// Body: { refreshToken: string }
// Response: { code, message, data }
const parseRefreshResponse = (data: any): { accessToken: string; refreshToken: string } => {
  const newAccess =
    data?.data?.newAccessToken ??
    data?.data?.accessToken ??
    data?.accessToken ??
    data?.token

  const newRefresh =
    data?.data?.newRefreshToken ??
    data?.data?.refreshToken ??
    data?.refreshToken ??
    data?.refresh_token

  if (!newAccess || !newRefresh) {
    throw new Error('Invalid refresh response: tokens not found')
  }

  return { accessToken: newAccess, refreshToken: newRefresh }
}

const doRefresh = async (): Promise<string> => {
  const refreshToken = getRefreshToken()

  if (!refreshToken) {
    throw new Error('No refresh token available')
  }

  // Use plain axios (not the intercepted instance) to avoid infinite loop
  const { data } = await axios.post(
    `${BASE_URL}/api/v1/user/refresh-token`,
    { refreshToken },
    { headers: { 'Content-Type': 'application/json' } }
  )

  const { accessToken: newAccess, refreshToken: newRefresh } = parseRefreshResponse(data)

  // Save both new tokens
  setTokens(newAccess, newRefresh)

  return newAccess
}

const forceLogout = () => {
  clearTokens()
  // Only redirect if not already on login page
  if (!window.location.pathname.includes('/login')) {
    window.location.href = '/login'
  }
}

// ─────────────────────────────────────────────────────────
// REQUEST interceptor
// Proactively refresh token BEFORE sending if it's expired
// This avoids the wasted network call with an expired token
// ─────────────────────────────────────────────────────────
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    config.headers = config.headers ?? {}

    // Don't inject token for the refresh endpoint itself
    if (config.url?.includes('refresh-token') || config.url?.includes('login')) {
      return config
    }

    let accessToken = getAccessToken()

    // ── Proactive refresh: token is expired or about to expire ──
    if (accessToken && isTokenExpired(accessToken)) {

      if (isRefreshing) {
        // Another request is already refreshing — wait for it
        const newToken = await new Promise<string>((resolve, reject) => {
          waitingQueue.push({ resolve, reject })
        })
        config.headers.Authorization = `Bearer ${newToken}`
        return config
      }

      isRefreshing = true
      try {
        accessToken = await doRefresh()
        resolveQueue(accessToken)
      } catch (err) {
        rejectQueue(err)
        forceLogout()
        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }

    return config
  },
  (error: unknown) => Promise.reject(error)
)

// ─────────────────────────────────────────────────────────
// RESPONSE interceptor
// Handle 401 that slips through (race condition where token
// expired between the request check and server validation)
// ─────────────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const original = error.config as RetryableRequestConfig | undefined

    if (!original) {
      const serverMessage =
        (error.response?.data as { message?: string })?.message ??
        error.message ??
        'Something went wrong'

      return Promise.reject(new Error(serverMessage))
    }

    original.headers = original.headers ?? {}

    // Handle 401 — try to refresh once
    if (
      error.response?.status === 401 &&
      !original._retry &&
      !original.url?.includes('refresh-token') &&
      !original.url?.includes('login')
    ) {
      original._retry = true

      if (isRefreshing) {
        // Refresh already in progress — queue this retry
        return new Promise((resolve, reject) => {
          waitingQueue.push({
            resolve: (newToken) => {
              original.headers.Authorization = `Bearer ${newToken}`
              resolve(api(original))
            },
            reject,
          })
        })
      }

      isRefreshing = true
      try {
        const newToken = await doRefresh()
        resolveQueue(newToken)
        original.headers.Authorization = `Bearer ${newToken}`
        return api(original)   // retry the original failed request
      } catch (refreshErr) {
        rejectQueue(refreshErr)
        forceLogout()
        return Promise.reject(refreshErr)
      } finally {
        isRefreshing = false
      }
    }

    // For all other errors — extract clean message from your backend
    // Your backend returns: { code, message, data }
    const serverMessage =
      (error.response?.data as { message?: string })?.message ??
      error.message ??
      'Something went wrong'

    return Promise.reject(new Error(serverMessage))
  }
)

export default api
