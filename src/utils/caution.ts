export type Attestation = {
  id: string
  method: 'CB' | 'Chèque' | 'Autre'
  fileName: string
  mime: string
  size: number
  dataUrl: string
  uploadedAt: string
}

const KEY = 'caution_attestations'

export function getAttestations(): Attestation[] {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Attestation[]) : []
  } catch {
    return []
  }
}

export function saveAttestations(list: Attestation[]) {
  localStorage.setItem(KEY, JSON.stringify(list))
}

export function addAttestation(input: {
  method: Attestation['method']
  fileName: string
  mime: string
  size: number
  dataUrl: string
}): Attestation {
  const att: Attestation = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    uploadedAt: new Date().toISOString(),
    ...input,
  }
  const list = getAttestations()
  list.unshift(att)
  saveAttestations(list)
  return att
}

export function removeAttestation(id: string) {
  const list = getAttestations().filter((a) => a.id !== id)
  saveAttestations(list)
}

const METHOD_KEY = 'caution_method'
export function getMethod(): 'CB' | 'Chèque' {
  const v = localStorage.getItem(METHOD_KEY)
  return v === 'Chèque' ? 'Chèque' : 'CB'
}
export function setMethod(m: 'CB' | 'Chèque') {
  localStorage.setItem(METHOD_KEY, m)
}
