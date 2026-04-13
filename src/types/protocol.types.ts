export interface Form {
  formId: string
}

export interface ProtocolWeek {
  id: number
  pecid: number
  patientUid: number
  weekNumber: number
  forms: string[]
  weekStartDate: string
  weekEndDate: string
}

export interface ProtocolAgenda {
  durationWeeks: number
  sessionDurationMin: number
  startDate: string
  sessionsDaily: number
  protocol: ProtocolWeek[]
}

// Helper function to convert form ID to route name
export const formIdToRouteName = (formId: string): string => {
  const routeMap: Record<string, string> = {
    'USP': 'usp',
    'QUALIVEEN': 'qualiveen',
    'SATISFACTION': 'satisfaction',
    'PGI': 'pgi_i',
    'EVOLUTION_THERAPEUTIQUE': 'evaluation_evolution',
    'VOIDING_CALENDAR': 'mictionnel'
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
