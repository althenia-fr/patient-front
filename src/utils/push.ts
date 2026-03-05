export function isPushSupported() {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
}

export async function getSWRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (!isPushSupported()) return null
  try {
    const reg = await navigator.serviceWorker.getRegistration()
    return reg || null
  } catch {
    return null
  }
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i)
  return outputArray
}

export async function requestPermission() {
  if (!('Notification' in window)) return 'denied'
  const res = await Notification.requestPermission()
  return res
}

export function currentPermission() {
  return Notification.permission
}

export async function subscribeUser(vapidPublicKey: string) {
  const reg = await getSWRegistration()
  if (!reg) throw new Error('SW non disponible')
  const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) })
  localStorage.setItem('pushSubscription', JSON.stringify(sub))
  return sub
}

export async function unsubscribeUser() {
  const reg = await getSWRegistration()
  if (!reg) return false
  const sub = await reg.pushManager.getSubscription()
  if (!sub) return false
  const ok = await sub.unsubscribe()
  localStorage.removeItem('pushSubscription')
  return ok
}

export async function localTestNotification(title = 'Bravo !', body = '+10 points pour votre séance') {
  const reg = await getSWRegistration()
  if (reg) await reg.showNotification(title, { body, icon: '/favicon.ico', badge: '/favicon.ico' })
}
