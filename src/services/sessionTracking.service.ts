import apiClient from './core/apiClient'
import { API_ENDPOINTS } from '@/types/api.types'
import { createApiError, logError, isNetworkError } from '@/utils/apiErrorHandler'
import type {
  ApiResponse,
  SessionTrackingItem,
  SessionTrackingPayload,
  UpdateSessionTrackingPayload,
} from '@/types/api.types'

// Response types for the API calls
export interface GetSessionTrackingResponse extends ApiResponse<SessionTrackingItem[]> {}
export interface CreateSessionTrackingResponse extends ApiResponse<SessionTrackingItem[]> {}
export interface UpdateSessionTrackingResponse extends ApiResponse<SessionTrackingItem> {}

export const sessionTrackingApi = {
  /**
   * Get session tracking data for a specific PEC
   * @param pecId - The PEC ID
   * @returns Promise<SessionTrackingItem[]> - Array of session tracking items
   */
  async getSessionTracking(pecId: number): Promise<SessionTrackingItem[]> {
    try {
      const response = await apiClient.get<GetSessionTrackingResponse>(
        `${API_ENDPOINTS.SESSION_TRACKING.GET_SESSIONS}?pecId=${pecId}`,
      )

      // console.log('getSessionTracking response:', response);

      if (response.data.success && response.data.data) {
        return response.data.data
      }

      throw new Error(response.data.message || 'Failed to fetch session tracking data')
    } catch (error: any) {
      logError('GetSessionTracking', error)

      const apiError = createApiError(error)

      if (isNetworkError(error)) {
        throw new Error(
          'Impossible de récupérer les données de suivi des séances. Veuillez vérifier votre connexion internet.',
        )
      }

      throw new Error(apiError.message)
    }
  },

  /**
   * Create session tracking entries
   * @param payload - The session tracking payload
   * @returns Promise<SessionTrackingItem[]> - Array of created session tracking items
   */
  async createSessionTracking(payload: SessionTrackingPayload): Promise<SessionTrackingItem[]> {
    try {
      const response = await apiClient.post<CreateSessionTrackingResponse>(
        API_ENDPOINTS.SESSION_TRACKING.CREATE_SESSIONS,
        payload,
      )

      // console.log('createSessionTracking response:', response);

      if (response.data.success && response.data.data) {
        return response.data.data
      }

      throw new Error(response.data.message || 'Failed to create session tracking entries')
    } catch (error: any) {
      logError('CreateSessionTracking', error)

      const apiError = createApiError(error)

      if (isNetworkError(error)) {
        throw new Error(
          'Impossible de créer les entrées de suivi des séances. Veuillez vérifier votre connexion internet.',
        )
      }

      throw new Error(apiError.message)
    }
  },

  /**
   * Update a specific session tracking entry
   * @param payload - The update payload with id and sessionTimeRemaining
   * @returns Promise<SessionTrackingItem> - Updated session tracking item
   */
  async updateSessionTracking(payload: UpdateSessionTrackingPayload): Promise<SessionTrackingItem> {
    try {
      const response = await apiClient.put<UpdateSessionTrackingResponse>(
        API_ENDPOINTS.SESSION_TRACKING.UPDATE_SESSION,
        payload,
      )

      // console.log('updateSessionTracking response:', response);

      if (response.data.success && response.data.data) {
        return response.data.data
      }

      throw new Error(response.data.message || 'Failed to update session tracking entry')
    } catch (error: any) {
      logError('UpdateSessionTracking', error)

      const apiError = createApiError(error)

      if (isNetworkError(error)) {
        throw new Error(
          'Impossible de mettre à jour l\'entrée de suivi de séance. Veuillez vérifier votre connexion internet.',
        )
      }

      throw new Error(apiError.message)
    }
  },
}
