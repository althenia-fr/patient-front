type Callback = () => void

const KEY_CONF = 'reminders.conf'
let timer: number | null = null

export interface ReminderConf { enabled: boolean; hour: number; minute: number }

export function readConf(): ReminderConf {
  try { const raw = localStorage.getItem(KEY_CONF); return raw ? (JSON.parse(raw) as ReminderConf) : { enabled: false, hour: 9, minute: 0 } } catch { return { enabled: false, hour: 9, minute: 0 } }
}
export function writeConf(c: ReminderConf) { localStorage.setItem(KEY_CONF, JSON.stringify(c)) }

function nextOccurrence(conf: ReminderConf) {
  const now = new Date()
  const next = new Date()
  next.setHours(conf.hour, conf.minute, 0, 0)
  if (next <= now) next.setDate(next.getDate() + 1)
  return next.getTime() - now.getTime()
}

export function startScheduler(cb: Callback) {
  const conf = readConf()
  if (timer) window.clearTimeout(timer)
  if (!conf.enabled) return
  const delay = nextOccurrence(conf)
  timer = window.setTimeout(() => {
    cb()
    startScheduler(cb)
  }, delay)
}

export function stopScheduler() {
  if (timer) window.clearTimeout(timer)
  timer = null
}
