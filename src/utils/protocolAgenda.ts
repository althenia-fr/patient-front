import { getOnboarding } from './onboarding'

export interface AgendaItem {
  week: number
  questionnaires: string[]
}

export function getEvaluationEvolutionWeeks(protocolDuration: number, frequency: string = 'Hebdomadaire', startWeek: number = 4): number[] {
  if (!protocolDuration) return []

  const weeks: number[] = []
  let step = 1

  switch (frequency) {
    case 'Hebdomadaire':
      step = 1
      break
    case 'Bimensuel':
      step = 2
      break
    case 'Mensuel':
      step = 4
      break
  }

  for (let week = startWeek; week <= protocolDuration; week += step) {
    weeks.push(week)
  }

  return weeks
}

export function getProtocolAgenda(protocolDuration?: number): AgendaItem[] {
  const onb = getOnboarding()
  const duration = protocolDuration || onb?.protocolDuration || 13
  const frequency = onb?.evaluationEvolutionFrequency || 'Hebdomadaire'
  const startWeek = onb?.evaluationEvolutionStartWeek || 4

  const agenda: AgendaItem[] = []

  if (!duration) return agenda

  const evaluationWeeks = getEvaluationEvolutionWeeks(duration, frequency, startWeek)

  for (let week = 1; week <= duration; week++) {
    const questionnaires: string[] = []

    // Week 1: USP + Qualiveen
    if (week === 1) {
      questionnaires.push('USP')
      questionnaires.push('Qualiveen')
    }

    // Weeks [4, 8, 12, 16, 20, 24]: Satisfaction + PG-I
    if ([4, 8, 12, 16, 20, 24].includes(week)) {
      questionnaires.push('Satisfaction')
      questionnaires.push('PG-I')
    }

    // Evolution Thérapeutique: Based on frequency and start week
    if (evaluationWeeks.includes(week)) {
      questionnaires.push('Evolution Thérapeutique')
    }

    // Calendrier Mictionnel
    if ([4, 8, 12].includes(week)) {
      questionnaires.push('Calendrier Mictionnel')
    }

    // Final week (S-1): USP + Qualiveen + Satisfaction + PG-I (if not already added)
    if (week === duration - 1) {
      if (!questionnaires.includes('USP')) questionnaires.push('USP')
      if (!questionnaires.includes('Qualiveen')) questionnaires.push('Qualiveen')
      if (!questionnaires.includes('Satisfaction')) questionnaires.push('Satisfaction')
      if (!questionnaires.includes('PG-I')) questionnaires.push('PG-I')
    }

    agenda.push({ week, questionnaires })
  }

  return agenda
}

export function getQuestionnairesForWeek(week: number, protocolDuration?: number): string[] {
  const agenda = getProtocolAgenda(protocolDuration)
  const item = agenda.find(a => a.week === week)
  return item ? item.questionnaires : []
}

export function getQuestionnairesForWeekExcludingCalendar(week: number, protocolDuration?: number): string[] {
  return getQuestionnairesForWeek(week, protocolDuration).filter(q => q !== 'Calendrier Mictionnel')
}
