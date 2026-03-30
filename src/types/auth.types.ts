import type { ApiResponse } from './api.types'

export interface User {
    id: string
    firstName: string
    lastName: string
    email: string
    phone: string
    designation: string
    role?: string
}

export interface SignUpRequest {
    firstname: string
    lastname: string
    email: string
    mobile: string
    password: string
    confirmPassword: string
    service: string
    admin: boolean
    role: string
    rpps: number
    url: string
    app: string
}

export interface LoginRequest {
    email: string
    password: string
}

export interface PasswordResetRequest {
    email: string
}

export interface PasswordEditRequest {
    email: string
    resetToken: string
    password: string
    confirm: string
}

export interface UserData {
    uid: number
    confirmed: string
    email: string
    msisdn: number
    admin: boolean
    firstname: string
    lastname: string
    role: string
    service: string
    creation: string
}

export interface AuthData {
    userData: UserData
    accessToken: string
    refreshToken: string
    tokenType: string
    expiresIn: number
}

export interface RefreshTokenData {
    userData: UserData
    accessToken: string
    refreshToken: string
    tokenType: string
    expiresIn: number
}

export type AuthResponse = ApiResponse<AuthData>

export type RefreshTokenResponse = ApiResponse<AuthData>
