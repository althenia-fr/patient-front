export interface Session { id: string; date: string; durationSec: number }
const KEY = 'sessions'
function read(): Session[] { try { const raw = localStorage.getItem(KEY); return raw ? (JSON.parse(raw) as Session[]) : [] } catch { return [] } }
function write(all: Session[]) { localStorage.setItem(KEY, JSON.stringify(all)) }
export function addSession(s: Omit<Session,'id'|'date'> & { date?: string }) {
  const all = read()
  const id = (globalThis as any).crypto?.randomUUID ? (globalThis as any).crypto.randomUUID() : Math.random().toString(36).slice(2)
  const item: Session = { id, date: s.date || new Date().toISOString(), durationSec: s.durationSec }
  all.push(item); write(all); return item
}
export function listSessions() { return read().sort((a,b)=> new Date(b.date).getTime()-new Date(a.date).getTime()) }
export function listSessionsInRange(from: Date, to: Date) { const f=from.getTime(), t=to.getTime(); return listSessions().filter(s=>{ const d=new Date(s.date).getTime(); return d>=f && d<=t }) }
