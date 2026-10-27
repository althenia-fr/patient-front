
const START_KEY = 'protocol_start'

export function getProtocolStart() {
  const v = localStorage.getItem(START_KEY)
  if (v) return new Date(v)
  const d = new Date()
  localStorage.setItem(START_KEY, d.toISOString())
  return d
}

export function getNowParisDateYYYYMMDD() {
  const parts = new Intl.DateTimeFormat('en', {
    timeZone: 'Europe/Paris',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());

  const getPart = type => parts.find(p => p.type === type).value;

  return `${getPart('year')}-${getPart('month')}-${getPart('day')}`;
}

