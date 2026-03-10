import apiClient, { refreshToken } from './core/apiClient'
import { API_ENDPOINTS, STORAGE_KEYS } from '@/types/api.types'
import { createApiError, logError, isNetworkError } from '@/utils/apiErrorHandler'
import type {
  AuthResponse,
  PasswordEditRequest,
} from '@/types/auth.types'

export const authApi = {

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
