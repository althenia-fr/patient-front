import { getOnboarding } from '@/utils/onboarding'
import type { ProtocolAgendaData } from '@/types/protocol.types'

const START_KEY = 'protocol_start'

export function getProtocolStart() {
  const v = localStorage.getItem(START_KEY)
  if (v) return new Date(v)
  const d = new Date()
  localStorage.setItem(START_KEY, d.toISOString())
  return d
}

export function setProtocolStart(date: Date) {
  localStorage.setItem(START_KEY, date.toISOString())
}

export function getWeekInfo(protocolAgenda?: ProtocolAgendaData) {
  // If protocolAgenda is provided, use it; otherwise fall back to onboarding data
  if (protocolAgenda) {
    const total = protocolAgenda.durationWeeks
    const startDate = new Date(protocolAgenda.startDate)
    const today = new Date()
    const msPerDay = 24 * 60 * 60 * 1000
    const startDay = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()).getTime()
    const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()
    const days = Math.max(0, Math.floor((todayDay - startDay) / msPerDay))
    const current = Math.min(total, Math.max(1, Math.floor(days / 7) + 1))
    return { current, total }
  }
  
  // Fallback to original logic using onboarding data
  const onb = getOnboarding()
  const total = onb?.protocolDuration || onb?.protocol?.weeks || 13
  const startDate = onb?.protocolStartDate ? new Date(onb.protocolStartDate) : getProtocolStart()
  const today = new Date()
  const msPerDay = 24 * 60 * 60 * 1000
  const startDay = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()).getTime()
  const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()
  const days = Math.max(0, Math.floor((todayDay - startDay) / msPerDay))
  const current = Math.min(total, Math.max(1, Math.floor(days / 7) + 1))
  return { current, total }
}
