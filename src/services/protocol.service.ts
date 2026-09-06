import apiClient from './core/apiClient'
import { API_ENDPOINTS } from '@/types/api.types'
import { prettyPrintErrorMsg } from '@/utils/apiErrorHandler'
import type {
  ProtocolAgenda,
} from '@/types/protocol.types'
import {globalState} from "@/composables/useGlobalTimer.ts";
import {computed} from "vue";


export const daysElapsed = computed(() => {
  const date = globalState.protocol?.agenda.startDate
  if (!date) return 1
  const msPerDay = 24*60*60*1000
  const startDay = new Date(new Date(date).getFullYear(), new Date(date).getMonth(), new Date(date).getDate()).getTime()
  const today = new Date(); const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()
  return Math.max(1, Math.floor((todayDay - startDay)/msPerDay) + 1)
})

export const currentWeek = computed(() => {
  return Math.ceil(daysElapsed.value / 7)
})

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


  getCurrentWeekForms(currentWeek: number): string[] {

    const currentWeekData = globalState.protocol?.agenda.find(week => week.weekNumber === currentWeek)
    return currentWeekData?.forms || []
  },

  /**
   * Get all upcoming forms
   * @param agendaData - The protocol agenda data
   * @param currentWeek - The current week number
   * @returns Array<{week: number, forms: string[]}> - Upcoming forms with week numbers
   */
  getUpcomingForms(agendaData: ProtocolAgenda, currentWeek: number): Array<{ week: number, forms: string[] }> {
    const protocol = agendaData?.protocol
    if (!Array.isArray(protocol)) return []
    return protocol
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
