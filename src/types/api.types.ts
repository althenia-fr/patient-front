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

// Session Tracking Types
export interface SessionTrackingItem {
  id: number
  date: string
  sessionTimeRemaining: number
  sessionStatus?: string
}

// For POST requests (creating new sessions - no id yet)
export interface SessionTrackingRequestItem {
  date: string
  sessionTimeRemaining: number
}

export interface SessionTrackingPayload {
  pecId: number
  weekNumber: number
  sessions: SessionTrackingRequestItem[]
}

export interface UpdateSessionTrackingPayload {
  id: number
  sessionTimeRemaining: number
}

export const API_ENDPOINTS = {
  AUTH: {
    SIGNUP: '/auth/signup',
    LOGIN: '/auth/login',
    PWDRESET: '/auth/pwdreset',
    PWDEDIT: '/auth/pwdedit',
    REFRESH_TOKEN: '/auth/refresh-token',
  },
  PEC: {
    GET_PEC: '/pec',
    UPDATE_PEC: '/pec',
  },
  PROTOCOL: {
    GET_AGENDA: '/patient/protocolAgenda/list',
  },
  SESSION_TRACKING: {
    GET_SESSIONS: '/patient/sessionTracking/list',
    CREATE_SESSIONS: '/patient/sessionTracking/add',
    UPDATE_SESSION: '/patient/sessionTracking/update',
  },
} as const

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  ALTH_USER: 'alth_user',
} as const
