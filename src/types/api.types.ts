export interface ApiResponse<T = any> {
  success: boolean
  message?: string
  data?: T
  error?: string
}

export interface ApiErrorResponse {
  success: false
  error: string
  code?: string
  statusCode?: number
  details?: any
}

export const API_ENDPOINTS = {
  AUTH: {
    SIGNUP: '/auth/signup',
    LOGIN: '/auth/login',
    PWDRESET: '/auth/pwdreset',
    PWDEDIT: '/auth/pwdedit',
    REFRESH_TOKEN: '/auth/refresh-token',
  },
} as const

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  ALTH_USER: 'alth_user',
} as const
