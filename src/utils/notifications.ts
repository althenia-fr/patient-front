export function notify(message: string) {
  console.info('[notify]', message)
}

export function intelligentAlert(type: 'soin' | 'mesure', payload: unknown) {
  console.info('[intelligentAlert]', type, payload)
}
