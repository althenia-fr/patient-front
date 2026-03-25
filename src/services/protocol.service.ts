import apiClient from './core/apiClient'
import { API_ENDPOINTS } from '@/types/api.types'
import { createApiError, logError, isNetworkError } from '@/utils/apiErrorHandler'
import type {
  ProtocolAgendaResponse,
  ProtocolAgendaData,
  ProtocolWeek,
  Form,
  formIdToRouteName,
  formIdToDisplayName,
} from '@/types/protocol.types'

export const protocolApi = {
  /**
   * Get protocol agenda for the current user
   * @returns Promise<ProtocolAgendaData> - The user's protocol agenda data
   */
  async getProtocolAgenda(): Promise<ProtocolAgendaData> {
    try {
      const response = await apiClient.get<ProtocolAgendaResponse>(
        API_ENDPOINTS.PROTOCOL.GET_AGENDA,
      )

      // console.log('response', response);

      if (response.data.success && response.data.data) {
        return response.data.data
      }

      throw new Error(response.data.message || 'Failed to fetch protocol agenda')
    } catch (error: any) {
      logError('GetProtocolAgenda', error)

      const apiError = createApiError(error)

      if (isNetworkError(error)) {
        throw new Error(
          'Impossible de récupérer l\'agenda du protocole. Veuillez vérifier votre connexion internet.',
        )
      }

      throw new Error(apiError.message)
    }
  },

  /**
   * Get forms for the current week
   * @param agendaData - The protocol agenda data
   * @param currentWeek - The current week number
   * @returns Form[] - Forms for the current week
   */
  getCurrentWeekForms(agendaData: ProtocolAgendaData, currentWeek: number): Form[] {
    const currentWeekData = agendaData.Protocol.find(week => week.weekNumber === currentWeek)
    return currentWeekData?.forms || []
  },

  /**
   * Get all upcoming forms
   * @param agendaData - The protocol agenda data
   * @param currentWeek - The current week number
   * @returns Array<{week: number, forms: Form[]}> - Upcoming forms with week numbers
   */
  getUpcomingForms(agendaData: ProtocolAgendaData, currentWeek: number): Array<{week: number, forms: Form[]}> {
    return agendaData.Protocol
      .filter(week => week.weekNumber > currentWeek)
      .map(week => ({
        week: week.weekNumber,
        forms: week.forms
      }))
  },

  /**
   * Get protocol duration in weeks
   * @param agendaData - The protocol agenda data
   * @returns number - Protocol duration
   */
  getProtocolDuration(agendaData: ProtocolAgendaData): number {
    return agendaData.durationWeeks
  },

  /**
   * Get session duration in minutes
   * @param agendaData - The protocol agenda data
   * @returns number - Session duration
   */
  getSessionDuration(agendaData: ProtocolAgendaData): number {
    return agendaData.sessionDurationMin
  },

  /**
   * Check if there are any forms for the current week
   * @param agendaData - The protocol agenda data
   * @param currentWeek - The current week number
   * @returns boolean - True if forms exist for current week
   */
  hasCurrentWeekForms(agendaData: ProtocolAgendaData, currentWeek: number): boolean {
    return this.getCurrentWeekForms(agendaData, currentWeek).length > 0
  },
}
