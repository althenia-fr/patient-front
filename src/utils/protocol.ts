import { getOnboarding } from '@/utils/onboarding'
import type { ProtocolAgenda } from '@/types/protocol.types'

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

export function getWeekInfo(protocol: any) {

  if (protocol) {
    const total = protocol.durationWeeks
    //startDate for demo pec might be unknown (if the medical device is not installed yet)
    const startDate = protocol.startDate?new Date(protocol.startDate):new Date()
    const today = new Date()
    const msPerDay = 24 * 60 * 60 * 1000
    const startDay = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()).getTime()
    const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()
    const days = Math.max(0, Math.floor((todayDay - startDay) / msPerDay))
    const current = Math.min(total, Math.max(1, Math.floor(days / 7) + 1))
    return { current, total }
  }
  else return null;

}

export function getNowParisDateYYYYMMDD() {
  const parts = new Intl.DateTimeFormat('en', {
    timeZone: 'Europe/Paris',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());

  const getPart = type => parts.find(p => p.type === type).value;

  return `${getPart('year')}-${getPart('month')}-${getPart('day')}`;
}

