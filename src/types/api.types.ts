
export interface SessionTrackingItem {
  pstid: number
  sessionDate: string
  sessionRemainingSec: number
  sessionMaxSec?: number
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
    GET_AGENDA: '/patient/protocol/agenda',
    GET_KPI: '/patient/protocol/kpi',
  },
  SESSION_TRACKING: {
    LIST_SESSIONS: '/patient/sessionTracking/list',
    GET_SESSION: '/patient/sessionTracking/get',
    CREATE_SESSION: '/patient/sessionTracking/create',
    UPDATE_SESSION: '/patient/sessionTracking/update',
  },
} as const

export const STORAGE_KEYS = {
  STIMEO_USER: 'stimeo_user',
  STIMEO_PROTOCOL : 'stimeo_protocol',
  STIMEO_SESSIONS : 'stimeo_sessions'
} as const
