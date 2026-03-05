import { getProtocolStart } from './protocol'

const KEY_PREFIX = 'coach_answer_'

const MESSAGES: string[] = [
  "Avez-vous réalisé votre séance de neurostimulation aujourd’hui ?",
  "Quelques dizaines de minutes peuvent faire la différence, avez-vous réalisé votre séance de neurostimulation aujourd’hui ?",
  "La régularité en neurostimulation est la clé. Avez-vous pensé à votre séance du jour ?",
  "Un geste régulier pour votre santé… Avez-vous pris le temps pour votre séance de neurostimulation aujourd’hui ?",
  "Continuer votre neurostimulation chaque jour, c’est investir dans votre équilibre. Avez-vous réalisé votre séance de neurostimulation aujourd’hui ?",
  "Votre séance de neurostimulation contribue activement à votre progression. Continuez ainsi, chaque jour compte. Avez-vous réalisé votre séance du jour ?",
]

export function getDailyCoachMessage(date: Date = new Date()): string {
  const start = getProtocolStart()
  const msPerDay = 24*60*60*1000
  const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime()
  const todayDay = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
  const daysSince = Math.max(0, Math.floor((todayDay - startDay)/msPerDay))
  return MESSAGES[daysSince % MESSAGES.length]
}

export function getTodayKey(date: Date = new Date()){
  const y = date.getFullYear()
  const m = String(date.getMonth()+1).padStart(2,'0')
  const d = String(date.getDate()).padStart(2,'0')
  return `${KEY_PREFIX}${y}-${m}-${d}`
}

export function getTodayCoachAnswer(): 'yes' | 'no' | null {
  try {
    const v = localStorage.getItem(getTodayKey())
    if (v === 'yes' || v === 'no') return v
    return null
  } catch { return null }
}

export function setTodayCoachAnswer(ans: 'yes'|'no'){
  try { localStorage.setItem(getTodayKey(), ans) } catch {}
}
