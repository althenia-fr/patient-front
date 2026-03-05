export interface Measure { id: string; date: string; systolic?: number; diastolic?: number; pain?: number; notes?: string; photoName?: string }
const KEY = 'measures'
function read(): Measure[] {
  try { const raw = localStorage.getItem(KEY); return raw ? (JSON.parse(raw) as Measure[]) : [] } catch { return [] }
}
function write(all: Measure[]) { localStorage.setItem(KEY, JSON.stringify(all)) }
export function listMeasures() { return read().sort((a,b)=> new Date(b.date).getTime()-new Date(a.date).getTime()) }
export function addMeasure(m: Omit<Measure,'id'|'date'> & { date?: string }) {
  const all = read()
  const item: Measure = { id: crypto.randomUUID(), date: m.date || new Date().toISOString(), systolic: m.systolic, diastolic: m.diastolic, pain: m.pain, notes: m.notes, photoName: m.photoName }
  all.push(item); write(all); return item
}
export function clearMeasures(){ write([]) }

export function getPainAverage(days = 14): number | null {
  const now = Date.now()
  const from = now - days * 24 * 60 * 60 * 1000
  const pains = listMeasures()
    .filter(m => typeof m.pain === 'number' && new Date(m.date).getTime() >= from)
    .map(m => m.pain as number)
  if (pains.length === 0) return null
  const avg = pains.reduce((a, b) => a + b, 0) / pains.length
  return Math.round(avg * 10) / 10
}
