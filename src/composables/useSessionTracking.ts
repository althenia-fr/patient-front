import { ref, computed, readonly } from 'vue'
import { sessionTrackingApi } from '@/services/sessionTracking.service'
import type { SessionTrackingItem } from '@/types/api.types'
import {msgModal} from '@/utils/modals/msg-modal.ts';

export function useSessionTracking() {
  // State
  const sessions = ref<SessionTrackingItem[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Computed properties
  const hasSessions = computed(() => sessions.value.length > 0)
  const sessionsCount = computed(() => sessions.value.length)

  // Create new session tracking entries
  const createSession = async (payload: any) => {
    try {
      loading.value = true
      error.value = null
      const newSession = await sessionTrackingApi.createSessionTracking(payload)
      sessions.value.push({pstid: newSession.pstid, sessionDate: newSession.sessionDate, sessionRemainingSec: newSession.sessionRemainingSec, sessionNumber:newSession.sessionNumber})
      return newSession
    } catch (error: any) {

      let err = error.message
      console.error("Erreur:",err );
      msgModal.show('Erreur', err, 'OK',msgModal.defaultClose);

    } finally {
      loading.value = false
    }

  }

  // Update a specific session
  const updateSession = async (payload: any) => {
    try {
      loading.value = true
      error.value = null
      const updatedSession = await sessionTrackingApi.updateSessionTracking(payload)

      // Update the session in the local state
      const index = sessions.value.findIndex(session =>
        // Assuming we can match by date or some other identifier
        // This might need adjustment based on your actual data structure
        session.sessionDate === updatedSession.sessionDate
      )

      if (index !== -1) {
        sessions.value[index] = updatedSession
      }

      // console.log('Session updated successfully:', updatedSession)
      return updatedSession
    } catch (error: any) {
      let err = error.message
      console.error("Erreur:",err );
      msgModal.show('Erreur', err, 'OK',msgModal.defaultClose);
    } finally {
      loading.value = false
    }
  }

  // Get session by date
  const getSessionByDate = (sessionDate: string): SessionTrackingItem | undefined => {
    // Convert sessions to array properly (same fix as in Home.vue)
    const sessionsArray = Array.isArray(sessions.value)
      ? sessions.value
      : Object.values(sessions.value || {}) as SessionTrackingItem[]

    return sessionsArray.find((session: SessionTrackingItem) => session.sessionDate === sessionDate)
  }

  // Clear sessions (useful for logout or PEC change)
  const clearSessions = () => {
    sessions.value = []
    error.value = null
  }

  return {
    // State
    sessions: readonly(sessions),
    loading: readonly(loading),
    error: readonly(error),

    // Computed
    hasSessions,
    sessionsCount,

    // Methods
    createSession,
    updateSession,
    getSessionByDate,
    clearSessions,
  }
}
