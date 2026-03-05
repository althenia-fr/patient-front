export function saveConsent(accepted: boolean) {
  localStorage.setItem('consent', accepted ? '1' : '0')
}

export function hasConsent() {
  return localStorage.getItem('consent') === '1'
}
