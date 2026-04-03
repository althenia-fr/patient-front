import type { ApiResponse } from './api.types'

export interface Form {
  formId: string
}

export interface ProtocolWeek {
  id: number
  pecid: number
  patientUid: number
  weekNumber: number
  forms: Form[]
  weekStartDate: string
  weekEndDate: string
}

export interface ProtocolAgendaData {
  durationWeeks: number
  sessionDurationMin: number
  startDate: string
  sessionsDaily: number
  Protocol: ProtocolWeek[]
}

export interface ProtocolAgendaResponse extends ApiResponse<ProtocolAgendaData> {}

// Helper function to convert form ID to route name
export const formIdToRouteName = (formId: string): string => {
  const routeMap: Record<string, string> = {
    'USP': 'usp',
    'QUALIVEEN': 'qualiveen',
    'SATISFACTION': 'satisfaction',
    'PGI': 'pgi_i',
    'EVOLUTION_THERAPEUTIQUE': 'evaluation-evolution',
    'VOIDING_CALENDAR': 'mictionnel-calendar'
  }
  return routeMap[formId] || 'home'
}

// Helper function to get form display name
export const formIdToDisplayName = (formId: string): string => {
  const nameMap: Record<string, string> = {
    'USP': 'USP',
    'QUALIVEEN': 'Qualiveen',
    'SATISFACTION': 'Satisfaction',
    'PGI': 'PG-I',
    'EVOLUTION_THERAPEUTIQUE': 'Évolution thérapeutique',
    'VOIDING_CALENDAR': 'Calendrier mictionnel'
  }
  return nameMap[formId] || formId
}
