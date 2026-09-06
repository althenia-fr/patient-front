
export interface SessionTrackingItem {
  pstid: number
  sessionDate: string
  sessionTimeRemaining: number
  sessionTimeMax?: number
  sessionNumber?: number
}

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/patient/login',
  },
  PEC: {
    GET_PEC: '/pec',
    UPDATE_PEC: '/pec',
  },
  PROTOCOL: {
    GET_AGENDA: '/patient/protocolAgenda/get',
  },
  SESSION_TRACKING: {
    LIST_SESSIONS: '/patient/sessionTracking/list',
    GET_SESSION: '/patient/sessionTracking/get',
    CREATE_SESSION: '/patient/sessionTracking/create',
    UPDATE_SESSION: '/patient/sessionTracking/update',
  },
} as const

export const STORAGE_KEYS = {
  ALTH_USER: 'alth_user',
  ALTH_PROTOCOL : 'alth_protocol'
} as const
