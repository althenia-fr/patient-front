import type { ApiResponse } from './api.types'

export interface PersonalEmergencyContact {
  id: string
  fullName: string
  relationship: string
  primaryPhone: string
  secondaryPhone?: string
  email?: string
  address?: {
    street: string
    city: string
    postalCode: string
    country: string
  }
  isPrimary: boolean
  createdAt: string
  updatedAt: string
}

export interface PecData {
  id: string
  userId: string
  emergencyContacts: PersonalEmergencyContact[]
  primaryPhysician?: {
    name: string
    phone: string
    email?: string
    address?: {
      street: string
      city: string
      postalCode: string
      country: string
    }
  }
  medicalNotes?: string
  allergies?: string[]
  medications?: string[]
  createdAt: string
  updatedAt: string
}

export interface GetPecResponse extends ApiResponse<PecData> {}

export interface UpdatePecRequest {
  emergencyContacts: PersonalEmergencyContact[]
  primaryPhysician?: {
    name: string
    phone: string
    email?: string
    address?: {
      street: string
      city: string
      postalCode: string
      country: string
    }
  }
  medicalNotes?: string
  allergies?: string[]
  medications?: string[]
}

export type UpdatePecResponse = ApiResponse<PecData>
