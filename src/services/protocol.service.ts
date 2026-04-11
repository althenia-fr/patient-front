import apiClient from './core/apiClient'
import { API_ENDPOINTS } from '@/types/api.types'
import {createApiError, logError, isNetworkError, prettyPrintErrorMsg} from '@/utils/apiErrorHandler'
import type {
  ProtocolAgenda,
  Form,

} from '@/types/protocol.types'

export const protocolApi = {


  async getProtocolAgenda(): Promise<ProtocolAgenda> {
    try {
      const response = await apiClient.get<ProtocolAgenda>(
        API_ENDPOINTS.PROTOCOL.GET_AGENDA,
      )

      return response.data;


    } catch (error: any) {
      let errorMsg = prettyPrintErrorMsg(error.response)
      throw new Error(errorMsg)
    }
  },

  /**
   * Get forms for the current week
   * @param agendaData - The protocol agenda data
   * @param currentWeek - The current week number
   * @returns Form[] - Forms for the current week
   */
  getCurrentWeekForms(agendaData: ProtocolAgenda, currentWeek: number): Form[] {
    const currentWeekData = agendaData.protocol.find(week => week.weekNumber === currentWeek)
    return currentWeekData?.forms || []
  },

  /**
   * Get all upcoming forms
   * @param agendaData - The protocol agenda data
   * @param currentWeek - The current week number
   * @returns Array<{week: number, forms: Form[]}> - Upcoming forms with week numbers
   */
  getUpcomingForms(agendaData: ProtocolAgenda, currentWeek: number): Array<{week: number, forms: Form[]}> {
    return agendaData.protocol
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
  getProtocolDuration(agendaData: ProtocolAgenda): number {
    return agendaData.durationWeeks
  },

  /**
   * Get session duration in minutes
   * @param agendaData - The protocol agenda data
   * @returns number - Session duration
   */
  getSessionDuration(agendaData: ProtocolAgenda): number {
    return agendaData.sessionDurationMin
  },

  /**
   * Check if there are any forms for the current week
   * @param agendaData - The protocol agenda data
   * @param currentWeek - The current week number
   * @returns boolean - True if forms exist for current week
   */
  hasCurrentWeekForms(agendaData: ProtocolAgenda, currentWeek: number): boolean {
    return this.getCurrentWeekForms(agendaData, currentWeek).length > 0
  },
}
