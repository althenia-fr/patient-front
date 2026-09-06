import apiClient from './core/apiClient'
import { API_ENDPOINTS } from '@/types/api.types'
import { createApiError, logError, isNetworkError } from '@/utils/apiErrorHandler'
import type {
  SessionTrackingItem,
} from '@/types/api.types'


export const sessionTrackingApi = {

  async listSessionTracking(pecid: number): Promise<SessionTrackingItem[]> {
    if (!pecid || isNaN(Number(pecid))) {
      // console.warn('getSessionTracking: pecid is missing or invalid:', pecid)
      return []
    }

    try {
      const response = await apiClient.get<any>(
        API_ENDPOINTS.SESSION_TRACKING.LIST_SESSIONS,
        { params: { pecid } }
      )

      return response.data

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

  async getSessionTracking(pecid: number, pstid: number): Promise<SessionTrackingItem | null> {

    try {
      const response = await apiClient.get<any>(
          API_ENDPOINTS.SESSION_TRACKING.GET_SESSION,
          { params: { pecid, pstid } }
      )

      return response.data

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
  async createSessionTracking(payload: any): Promise<SessionTrackingItem> {
    try {
      const response = await apiClient.post<any>(
        API_ENDPOINTS.SESSION_TRACKING.CREATE_SESSION,
        payload,
      )
      return response.data

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
  async updateSessionTracking(payload: any): Promise<SessionTrackingItem> {
    try {
      const response = await apiClient.put<any>(
        API_ENDPOINTS.SESSION_TRACKING.UPDATE_SESSION,
        payload,
      )
      return response.data;

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
