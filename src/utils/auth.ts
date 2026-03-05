import { shallowRef } from 'vue'

export const authUser = shallowRef<any | null>(null)

const USERS_KEY = 'mock_users'
const CURRENT_KEY = 'mock_current_user_email'

type User = { email: string; password: string; user_metadata?: Record<string, any> }

function readUsers(): User[] {
  try {
    const raw = localStorage.getItem(USERS_KEY)
    return raw ? (JSON.parse(raw) as User[]) : []
  } catch { return [] }
}
function writeUsers(users: User[]) { localStorage.setItem(USERS_KEY, JSON.stringify(users)) }

export async function initAuth() {
  const email = localStorage.getItem(CURRENT_KEY) || sessionStorage.getItem(CURRENT_KEY)
  if (!email) { authUser.value = null; return }
  const user = readUsers().find(u => u.email === email) || null
  authUser.value = user ? { email: user.email, user_metadata: user.user_metadata || {} } : null
}

export async function signUp(email: string, password: string, metadata: Record<string, any> = {}) {
  const users = readUsers()
  if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) throw new Error('Un compte existe déjà avec cet email')
  const user: User = { email, password, user_metadata: metadata }
  users.push(user)
  writeUsers(users)
  localStorage.setItem(CURRENT_KEY, email)
  authUser.value = { email, user_metadata: metadata }
  return authUser.value
}

export async function signIn(email: string, password: string, remember = true) {
  const users = readUsers()
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password)
  if (!user) throw new Error('Identifiants incorrects')
  if (remember) localStorage.setItem(CURRENT_KEY, user.email)
  else sessionStorage.setItem(CURRENT_KEY, user.email)
  authUser.value = { email: user.email, user_metadata: user.user_metadata || {} }
  return authUser.value
}

export async function signOut() {
  localStorage.removeItem(CURRENT_KEY)
  sessionStorage.removeItem(CURRENT_KEY)
  authUser.value = null
}

export async function recover(email: string) {
  const exists = readUsers().some(u => u.email.toLowerCase() === email.toLowerCase())
  if (!exists) throw new Error('Email introuvable')
  return true
}

export function updateUserMetadata(meta: Record<string, any>) {
  const email = localStorage.getItem(CURRENT_KEY)
  if (!email) return
  const users = readUsers()
  const idx = users.findIndex(u => u.email === email)
  if (idx === -1) return
  users[idx].user_metadata = { ...(users[idx].user_metadata || {}), ...meta }
  writeUsers(users)
  authUser.value = { email, user_metadata: users[idx].user_metadata }
}

export function isAdmin() {
  const ADMIN_EMAILS = ['greggcourbet@gmail.com']
  return authUser.value && ADMIN_EMAILS.includes(authUser.value.email?.toLowerCase())
}

// Legacy helpers kept as no-ops to avoid UI errors
export function getIdentityUrl() { return '/.netlify/identity' }
export function setIdentityUrl(_url: string) { /* no-op in mock mode */ }
