const KEY = 'gamification'

interface HistoryItem { id: string; date: string; reason: string; points: number }
interface State {
  points: number
  badges: string[]
  history: HistoryItem[]
}

function read(): State {
  try {
    const raw = localStorage.getItem(KEY)
    const s = raw ? (JSON.parse(raw) as any) : {}
    const points = typeof s.points === 'number' ? s.points : 0
    const badges = Array.isArray(s.badges) ? s.badges : []
    const history = Array.isArray(s.history) ? s.history : []
    return { points, badges, history }
  } catch {
    return { points: 0, badges: [], history: [] }
  }
}

function write(s: State) { localStorage.setItem(KEY, JSON.stringify(s)) }

export function getPoints() { return read().points }
export function getBadges() { return read().badges }
export function getHistory(): HistoryItem[] {
  const h = read().history
  return (Array.isArray(h) ? [...h] : []).sort((a,b)=> new Date(b.date).getTime()-new Date(a.date).getTime())
}

export const ACTION_POINTS = {
  sessionComplete: 10,
  questionnaire: 10,
  calendarEntry: 20,
  weeklyReport: 5,
  painNote: 1,
}

function uid() {
  try { return (crypto as any).randomUUID ? (crypto as any).randomUUID() : Math.random().toString(36).slice(2) } catch { return Math.random().toString(36).slice(2) }
}

export function addPoints(n: number, reason = 'Action') {
  const s = read()
  s.points += n
  s.history.push({ id: uid(), date: new Date().toISOString(), reason, points: n })
  const thresholds = [25, 50, 75, 100]
  for (const t of thresholds) {
    const badge = `${t}%`
    if (s.points >= t && !s.badges.includes(badge)) s.badges.push(badge)
  }
  write(s)
  return s
}

export function getMaxPoints(weeks = 13, sessionCount = 1, evaluationFrequency: string = 'Hebdomadaire', evaluationStartWeek: number = 4) {
  // Sessions: number of sessions per day * 7 days per week * weeks
  const sessions = sessionCount * weeks * 7 * ACTION_POINTS.sessionComplete

  // Questionnaires: USP, Qualiveen, Satisfaction, PG-I, Calendrier Mictionnel scheduled per protocol
  const questionnairesCount = calculateTotalQuestionnaires(weeks, evaluationFrequency, evaluationStartWeek)
  const questionnaires = questionnairesCount * ACTION_POINTS.questionnaire

  // Calendar entries: 3 months * 30 days (90 days estimated)
  // Or use actual count from calendar implementation (3 months * 4 days = 12 for demo, or 3 months = 90 days realistic)
  const calendarEntries = 90 * ACTION_POINTS.calendarEntry

  return sessions + questionnaires + calendarEntries
}

function calculateEvaluationEvolutionWeeks(protocolDuration: number, frequency: string = 'Hebdomadaire', startWeek: number = 4): number[] {
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

function calculateTotalQuestionnaires(protocolDuration: number, frequency: string = 'Hebdomadaire', startWeek: number = 4): number {
  let count = 0

  if (!protocolDuration) return count

  const evaluationWeeks = calculateEvaluationEvolutionWeeks(protocolDuration, frequency, startWeek)

  for (let week = 1; week <= protocolDuration; week++) {
    let weekCount = 0

    // Week 1: USP + Qualiveen
    if (week === 1) {
      weekCount += 2
    }

    // Weeks [4, 8, 12, 16, 20, 24]: Satisfaction + PG-I
    if ([4, 8, 12, 16, 20, 24].includes(week)) {
      weekCount += 2
    }

    // Evaluation Evolution weeks (dynamic based on frequency)
    if (evaluationWeeks.includes(week)) {
      weekCount += 1
    }

    // Weeks [4, 8, 12]: Calendrier Mictionnel
    if ([4, 8, 12].includes(week)) {
      weekCount += 1
    }

    // Final week (S-1): USP + Qualiveen + Satisfaction + PG-I (if not already added)
    if (week === protocolDuration - 1) {
      if (week !== 1) {
        if (![4, 8, 12, 16, 20, 24].includes(week)) {
          weekCount += 4
        } else {
          weekCount += 2
        }
      }
    }

    count += weekCount
  }

  return count
}

export function resetGamification() { write({ points: 0, badges: [], history: [] }) }

export function seedDemoIfEmpty(total = 75) {
  const s = read()
  if (s.points > 0 || s.history.length > 0) return
  const now = Date.now()
  const mk = (reason: string, pts: number, daysAgo: number) => ({ id: uid(), date: new Date(now - daysAgo*24*60*60*1000).toISOString(), reason, points: pts })
  s.history = [
    mk('Séance terminée', 10, 1),
    mk('Séance terminée', 10, 2),
    mk('Séance terminée', 10, 3),
    mk('Séance terminée', 10, 4),
    mk('Séance terminée', 10, 5),
    mk('Bilan hebdomadaire envoyé', 5, 6),
    mk('Notes de douleur', 1, 1),
    mk('Notes de douleur', 1, 2),
    mk('Notes de douleur', 1, 3),
    mk('Notes de douleur', 1, 4),
    mk('Notes de douleur', 1, 5),
  ]
  s.points = total
  const thresholds = [25, 50, 75, 100]
  s.badges = thresholds.filter(t => s.points >= t).map(t => `${t}%`)
  write(s)
}
