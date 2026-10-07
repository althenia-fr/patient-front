
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
    LIST_SESSIONS: '/patient/session/list',
    GET_SESSION: '/patient/session/get',
    CREATE_SESSION: '/patient/session/create',
    UPDATE_SESSION: '/patient/session/update',
  },
} as const

export const STORAGE_KEYS = {
  STIMEO_USER: 'stimeo_user',
  STIMEO_PROTOCOL : 'stimeo_protocol',
  STIMEO_SESSIONS : 'stimeo_sessions',
  STIMEO_FORMS : 'stimeo_forms',
} as const
