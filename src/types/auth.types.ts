import type { ApiResponse } from './api.types'

export interface PasswordEditRequest {
    email: string
    resetToken: string
    newPassword: string
    confirmPassword: string
}

export type AuthResponse = ApiResponse<AuthTokenData>

export type RefreshTokenResponse = ApiResponse<AuthTokenData>
