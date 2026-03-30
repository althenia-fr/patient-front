import { ref, computed, readonly } from 'vue'
import { sessionTrackingApi } from '@/services/sessionTracking.service'
import type { SessionTrackingItem, SessionTrackingPayload, UpdateSessionTrackingPayload } from '@/types/api.types'

export function useSessionTracking() {
  // State
  const sessions = ref<SessionTrackingItem[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Computed properties
  const hasSessions = computed(() => sessions.value.length > 0)
  const sessionsCount = computed(() => sessions.value.length)

  // Get sessions for a specific PEC
  const fetchSessions = async (pecId: number) => {
    try {
      loading.value = true
      error.value = null
      sessions.value = await sessionTrackingApi.getSessionTracking(pecId)
      // console.log('Sessions fetched successfully:', sessions.value)
    } catch (err: any) {
      console.error('Failed to fetch sessions:', err)
      error.value = err.message || 'Impossible de charger les sessions'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Create new session tracking entries
  const createSessions = async (payload: SessionTrackingPayload) => {
    try {
      loading.value = true
      error.value = null
      const newSessions = await sessionTrackingApi.createSessionTracking(payload)
      sessions.value = [...sessions.value, ...newSessions]
      // console.log('Sessions created successfully:', newSessions)
      return newSessions
    } catch (err: any) {
      console.error('Failed to create sessions:', err)
      error.value = err.message || 'Impossible de créer les sessions'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Update a specific session
  const updateSession = async (payload: UpdateSessionTrackingPayload) => {
    try {
      loading.value = true
      error.value = null
      const updatedSession = await sessionTrackingApi.updateSessionTracking(payload)
      
      // Update the session in the local state
      const index = sessions.value.findIndex(session => 
        // Assuming we can match by date or some other identifier
        // This might need adjustment based on your actual data structure
        session.date === updatedSession.date
      )
      
      if (index !== -1) {
        sessions.value[index] = updatedSession
      }
      
      // console.log('Session updated successfully:', updatedSession)
      return updatedSession
    } catch (err: any) {
      console.error('Failed to update session:', err)
      error.value = err.message || 'Impossible de mettre à jour la session'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Get session by date
  const getSessionByDate = (date: string): SessionTrackingItem | undefined => {
    return sessions.value.find(session => session.date === date)
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
    fetchSessions,
    createSessions,
    updateSession,
    getSessionByDate,
    clearSessions,
  }
}
