import axios, { type AxiosInstance, type AxiosError } from 'axios'
import { logError } from '@/utils/apiErrorHandler'
import { clearAuthState } from '@/utils/auth.utils'
import { API_ENDPOINTS, STORAGE_KEYS } from '@/types/api.types'
import type { RefreshTokenResponse } from '@/types/auth.types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://shamanic-oneiric-kourtney.ngrok-free.dev'

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
//    'ngrok-skip-browser-warning': 'true',
  },
  timeout: 10000,
})

apiClient.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Track if we're currently refreshing to avoid multiple refresh calls
let isRefreshing = false
let failedQueue: Array<{ resolve: Function; reject: Function }> = []

const processQueue = (error: any = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve()
    }
  })
  failedQueue = []
}

// Separate refresh token function to avoid circular dependency
export const refreshToken = async (): Promise<RefreshTokenResponse> => {
  try {
    const refreshToken = sessionStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)

    if (!refreshToken) {
      throw new Error('No refresh token available')
    }

    const response = await apiClient.post<RefreshTokenResponse>(API_ENDPOINTS.AUTH.REFRESH_TOKEN, {
      refreshToken,
    })

    if (response.data.success && response.data.data?.accessToken) {
      sessionStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.data.data.accessToken)

      if (response.data.data.refreshToken) {
        sessionStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.data.data.refreshToken)
      }

      // Store user data
      if (response?.data?.data?.userData) {
        sessionStorage.setItem(
          STORAGE_KEYS.ALTH_USER,
          JSON.stringify(response?.data?.data?.userData),
        )
      }

      return response.data
    }

    throw new Error('Token refresh failed')
  } catch (error: any) {
    logError('RefreshToken', error)

    // Clear tokens on refresh failure
    sessionStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
    sessionStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)

    throw error
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest: any = error.config
    const publicRoutes = ['/auth', '/reset-password', '/reset-password-error', '/signin', '/signup', '/forgot', '/consent']
    const isPublicRoute = publicRoutes.some((route) => window.location.pathname.startsWith(route)) || window.location.pathname === '/reset-password'

    // Don't try to refresh for public routes or refresh-token endpoint itself
    if (
      error.response?.status === 401 &&
      !isPublicRoute &&
      originalRequest.url !== API_ENDPOINTS.AUTH.REFRESH_TOKEN
    ) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then(() => {
            return apiClient(originalRequest)
          })
          .catch((err) => {
            return Promise.reject(err)
          })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        // Attempt to refresh the token
        await refreshToken()

        // Token refreshed successfully, process queued requests
        processQueue()
        isRefreshing = false

        // Retry the original request with new token
        return apiClient(originalRequest)
      } catch (refreshError) {
        // Refresh failed, clear auth and redirect to login
        processQueue(refreshError)
        isRefreshing = false
        clearAuthState()
        window.location.href = '/signin'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  },
)

export default apiClient
