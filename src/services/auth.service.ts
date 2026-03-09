import apiClient, { refreshToken } from './core/apiClient'
import { API_ENDPOINTS, STORAGE_KEYS } from '@/types/api.types'
import { createApiError, logError, isNetworkError } from '@/utils/apiErrorHandler'
import type {
  SignUpRequest,
  LoginRequest,
  AuthResponse,
  PasswordResetRequest,
  PasswordEditRequest,
} from '@/types/auth.types'

export const authApi = {
  async signUp(data: SignUpRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>(API_ENDPOINTS.AUTH.SIGNUP, data)

      if (response.data.success) {
        return response.data
      }

      throw new Error(response.data.message || 'Signup failed')
    } catch (error: any) {
      logError('SignUp', error)

      const apiError = createApiError(error)

      if (isNetworkError(error)) {
        throw new Error(
          'Impossible de se connecter au serveur. Veuillez vérifier votre connexion internet.',
        )
      }

      throw new Error(apiError.message)
    }
  },

  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, data)

      if (response.data.success && response.data.data?.accessToken) {
        sessionStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.data.data.accessToken)

        // Store refresh token if provided
        if (response.data.data.refreshToken) {
          sessionStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.data.data.refreshToken)
        }

        // Store user data
        if (response?.data?.data?.userData) {
          sessionStorage.setItem(
            STORAGE_KEYS.ALTH_USER,
            JSON.stringify(response?.data?.data?.userData),
          )
        }

        return response.data
      }

      if (response.data.success) {
        console.warn('⚠️ Login successful but no token provided:', response.data.message)
        return response.data
      }

      throw new Error(response.data.message || 'Login failed')
    } catch (error: any) {
      logError('Login', error)

      const apiError = createApiError(error)

      if (isNetworkError(error)) {
        throw new Error(
          'Impossible de se connecter au serveur. Veuillez vérifier votre connexion internet.',
        )
      }

      throw new Error(apiError.message)
    }
  },

  refreshToken,

  async requestPasswordReset(data: PasswordResetRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>(API_ENDPOINTS.AUTH.PWDRESET, data)

      if (response.data.success) {
        return response.data
      }

      throw new Error(response.data.message || 'Password reset request failed')
    } catch (error: any) {
      logError('PasswordResetRequest', error)

      const apiError = createApiError(error)

      if (isNetworkError(error)) {
        throw new Error(
          'Impossible de se connecter au serveur. Veuillez vérifier votre connexion internet.',
        )
      }

      throw new Error(apiError.message)
    }
  },

  async resetPassword(data: PasswordEditRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>(API_ENDPOINTS.AUTH.PWDEDIT, data)
      if (response.data.success) {
        return response.data
      }

      throw new Error(response.data.message || 'Password reset failed')
    } catch (error: any) {
      logError('PasswordReset', error)

      const apiError = createApiError(error)

      if (isNetworkError(error)) {
        throw new Error(
          'Impossible de se connecter au serveur. Veuillez vérifier votre connexion internet.',
        )
      }

      throw new Error(apiError.message)
    }
  },
}
