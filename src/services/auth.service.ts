import apiClient, { refreshToken } from './core/apiClient'
import { API_ENDPOINTS, STORAGE_KEYS } from '@/types/api.types'
import { createApiError, logError, isNetworkError } from '@/utils/apiErrorHandler'
import type {
  AuthResponse,
  LoginRequest,
  PasswordEditRequest,
  PasswordResetRequest,
  SignUpRequest,
} from '@/types/auth.types'
import { authUser } from '@/utils/auth'

export const authApi = {
  async signUp(data: SignUpRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<any>(API_ENDPOINTS.AUTH.SIGNUP, data)

      // Handle plain string response
      if (typeof response.data === 'string') {
        authUser.value = { email: data.email, user_metadata: {} }
        return { success: true, message: response.data }
      }

      // Handle flat JSON response (direct fields)
      if (response.data && response.data.email) {
        authUser.value = {
          email: response.data.email,
          user_metadata: response.data,
        }
        return { success: true, data: response.data }
      }

      if (response.data && response.data.success) {
        if (response.data.data?.userData) {
          authUser.value = {
            email: response.data.data.userData.email,
            user_metadata: response.data.data.userData,
          }
        }
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
      const response = await apiClient.post<any>(API_ENDPOINTS.AUTH.LOGIN, data)

      // Handle plain string response
      if (typeof response.data === 'string') {
        authUser.value = { email: data.email, user_metadata: {} }
        return { success: true, message: response.data }
      }

      // Handle flat JSON response (direct fields like accessToken, email, etc.)
      if (response.data && response.data.accessToken) {
        sessionStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.data.accessToken)
        if (response.data.refreshToken) {
          sessionStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.data.refreshToken)
        }
        sessionStorage.setItem(STORAGE_KEYS.ALTH_USER, JSON.stringify(response.data))
        authUser.value = { email: response.data.email, user_metadata: response.data }
        return { success: true, data: response.data }
      }

      if (response.data.success && response.data.data?.accessToken) {
        sessionStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.data.data.accessToken)

        // Store refresh token if provided
        if (response.data.data.refreshToken) {
          sessionStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.data.data.refreshToken)
        }

        // Store user data
        if (response?.data?.data?.userData) {
          const userData = response.data.data.userData
          sessionStorage.setItem(STORAGE_KEYS.ALTH_USER, JSON.stringify(userData))
          authUser.value = { email: userData.email, user_metadata: userData }
        } else {
          authUser.value = { email: data.email, user_metadata: {} }
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
      console.log('[AuthService] Requesting password reset for:', data.email)
      const response = await apiClient.post<any>(API_ENDPOINTS.AUTH.PWDRESET, data)
      console.log('[AuthService] Password reset response:', response.data)

      // Handle plain string response from backend
      if (typeof response.data === 'string') {
        if (response.data.includes("Si l'adresse e-mail existe")) {
          return { success: true, message: response.data }
        }
        // If it's another string, check if it looks like a success message or an error
        return { success: true, message: response.data }
      }

      // Handle standard structured JSON response
      if (response.data && response.data.success) {
        return response.data
      }

      throw new Error(response.data?.message || 'Password reset request failed')
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
      const response = await apiClient.post<any>(API_ENDPOINTS.AUTH.PWDEDIT, data)
      console.log('[AuthService] Reset password response:', response.data)

      // Handle plain string response from backend
      if (typeof response.data === 'string') {
        return { success: true, message: response.data }
      }

      // Handle standard structured JSON response
      if (response.data && response.data.success) {
        return response.data
      }

      throw new Error(response.data?.message || 'Password reset failed')
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
