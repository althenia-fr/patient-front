export type OnbData = {
  protocol?: { specialty?: string; weeks?: number; frequency?: string }
  facility?: { name?: string; address?: string; doctor?: string }
  idel?: { name?: string; role?: string; address?: string; phone?: string; nextVisit?: string }
  device?: { model?: string; serial?: string }
  protocolStartDate?: string
  protocolDuration?: number
  sessionCount?: number
  sessionDuration?: number
  evaluationEvolutionFrequency?: string
  evaluationEvolutionStartWeek?: number
  done?: boolean
}

const KEY = 'onboarding_data'

export function getOnboarding(): OnbData {
  try { const raw = localStorage.getItem(KEY); return raw ? (JSON.parse(raw) as OnbData) : {} } catch { return {} }
}
export function saveOnboarding(p: Partial<OnbData>) {
  const cur = getOnboarding()
  const next = { ...cur, ...p }
  localStorage.setItem(KEY, JSON.stringify(next))
}
export function onboardingDone() { return !!getOnboarding().done }
export function setOnboardingDone() { saveOnboarding({ done: true }) }
export function clearOnboarding() { localStorage.removeItem(KEY) }
