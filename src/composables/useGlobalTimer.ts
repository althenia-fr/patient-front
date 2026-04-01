import { ref, computed, onUnmounted, watch } from 'vue'
import { useSessionTracking } from './useSessionTracking'
import type { ProtocolAgendaData } from '@/types/protocol.types'

// Global timer state (singleton-like)
const globalState = {
  isInitialized: false,
  running: ref(false),
  remaining: ref(0),
  totalDuration: ref(0),
  sessionId: ref<number | null>(null),
  protocolAgenda: ref<ProtocolAgendaData | null>(null),
  interval: ref<number | null>(null),
  startTime: ref<number | null>(null),
  pausedTime: ref(0), // Total time spent paused
  lastPauseTime: ref<number | null>(null), // When timer was last paused
}

export function useGlobalTimer() {
  const { createSessions, updateSession, fetchSessions, getSessionByDate, sessions } = useSessionTracking()

  // Computed properties
  const isRunning = computed(() => globalState.running.value)
  const remainingTime = computed(() => globalState.remaining.value)
  const totalTime = computed(() => globalState.totalDuration.value)
  const progress = computed(() => {
    if (globalState.totalDuration.value === 0) return 0
    return ((globalState.totalDuration.value - globalState.remaining.value) / globalState.totalDuration.value) * 100
  })
  
  const timeDisplay = computed(() => {
    const minutes = Math.floor(globalState.remaining.value / 60)
    const seconds = Math.floor(globalState.remaining.value % 60)
    const pad = (n: number) => n.toString().padStart(2, '0')
    return `${pad(minutes)}:${pad(seconds)}`
  })

  const hasActiveSession = computed(() => globalState.sessionId.value !== null)
  const canResumeSession = computed(() => {
    // Check if there's an existing session for today that can be resumed
    if (!globalState.protocolAgenda.value) return false
    
    const today = new Date().toISOString().split('T')[0]
    const existingSession = getSessionByDate(today)
    
    // sessionTimeRemaining can be decimal minutes from API (e.g., 18.83)
    return existingSession !== undefined && existingSession.sessionTimeRemaining > 0
  })

  // Check if a specific session number can be started
  const canStartSession = (sessionNumber: number) => {
    if (!globalState.protocolAgenda.value) return false
    
    const today = new Date().toISOString().split('T')[0]
    const todaySessions = sessions.value.filter(session => session.date === today)
    
    // Session 1 can always be started if not completed
    if (sessionNumber === 1) {
      const session1 = todaySessions.find(s => s.sessionNumber === 1)
      return !session1 || session1.sessionTimeRemaining > 0
    }
    
    // For session 2+, check if previous session is completed
    const previousSession = todaySessions.find(s => s.sessionNumber === sessionNumber - 1)
    const currentSession = todaySessions.find(s => s.sessionNumber === sessionNumber)
    
    const isPreviousCompleted = previousSession && previousSession.sessionTimeRemaining <= 0
    const isCurrentCompleted = currentSession && currentSession.sessionTimeRemaining <= 0
    
    return isPreviousCompleted && !isCurrentCompleted
  }

  // Initialize timer with protocol agenda and check for existing sessions
  const initializeTimer = async (protocolAgenda: ProtocolAgendaData, sessionDurationMinutes: number, forceReinitialize = false) => {
    // Don't reinitialize if timer is already running and we're not forcing it
    if (globalState.isInitialized && globalState.running.value && !forceReinitialize) {
      console.log('Timer already running, skipping reinitialization')
      return
    }
    
    globalState.protocolAgenda.value = protocolAgenda
    globalState.totalDuration.value = sessionDurationMinutes * 60
    
    // Only reset remaining time if timer is not running or if forcing reinitialize
    if (!globalState.running.value || forceReinitialize) {
      globalState.remaining.value = sessionDurationMinutes * 60
    }
    
    globalState.isInitialized = true
    
    // Fetch existing sessions to check for resumable sessions
    try {
      if (protocolAgenda.Protocol?.length > 0) {
        const pecId = protocolAgenda.Protocol[0].pecId
        await fetchSessions(pecId)
        
        // Check if there's an existing session for today
        const today = new Date().toISOString().split('T')[0]
        const existingSession = getSessionByDate(today)
        
        if (existingSession && existingSession.sessionTimeRemaining > 0) {
          // Set up timer to resume existing session
          // Handle both decimal minutes and integer minutes from API
          // Only update if timer is not currently running
          if (!globalState.running.value || forceReinitialize) {
            globalState.sessionId.value = existingSession.id
            globalState.remaining.value = Math.round(existingSession.sessionTimeRemaining * 60)
            console.log('Found resumable session:', existingSession)
            console.log('Converted', existingSession.sessionTimeRemaining, 'minutes to', globalState.remaining.value, 'seconds')
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch existing sessions:', error)
    }
  }

  // Start timer (create new or resume existing session)
  const startTimer = async (sessionNumber: number = 1) => {
    if (!globalState.isInitialized || !globalState.protocolAgenda.value) {
      console.error('Timer not initialized')
      return
    }

    if (globalState.running.value) return // Already running

    try {
      // Check if we're resuming an existing session
      if (globalState.sessionId.value) {
        // Resume existing session
        console.log('Resuming existing session:', globalState.sessionId.value)
      } else {
        // Create new session tracking entry
        const pecId = globalState.protocolAgenda.value.Protocol[0].pecId
        const currentWeek = Math.ceil(
          (Date.now() - new Date(globalState.protocolAgenda.value.startDate).getTime()) / 
          (7 * 24 * 60 * 60 * 1000)
        )
        
        const payload = {
          pecId,
          weekNumber: currentWeek,
          sessions: [
            {
              date: new Date().toISOString().split('T')[0],
              sessionTimeRemaining: Math.round((globalState.totalDuration.value / 60) * 100) / 100,
              sessionNumber
            }
          ]
        }
        
        const createdSessions = await createSessions(payload)
        console.log('createdSessions', createdSessions);
        if (createdSessions?.length > 0) {
          globalState.sessionId.value = createdSessions[0].id
          console.log('Global session tracking created:', createdSessions[0])
        }
      }

      // Start the timer
      globalState.running.value = true
      globalState.startTime.value = Date.now()
      
      // Clear any existing interval
      if (globalState.interval.value) {
        clearInterval(globalState.interval.value)
      }
      
      // Start countdown
      globalState.interval.value = window.setInterval(() => {
        if (globalState.remaining.value > 0) {
          globalState.remaining.value -= 1
        } else {
          // Timer completed
          endTimer()
        }
      }, 1000)

    } catch (error) {
      console.error('Failed to start global timer:', error)
    }
  }

  // Pause timer and update session tracking
  const pauseTimer = async () => {
    if (!globalState.running.value) return
    
    // Update UI state immediately
    globalState.running.value = false
    globalState.lastPauseTime.value = Date.now()
    
    // Clear interval immediately to stop timer
    if (globalState.interval.value) {
      clearInterval(globalState.interval.value)
      globalState.interval.value = null
    }

    // Update session tracking in background (don't block UI)
    if (globalState.sessionId.value) {
      try {
        // Save exact decimal minutes rounded to 2 decimal places
        const exactMinutes = Math.round((globalState.remaining.value / 60) * 100) / 100
        await updateSession({
          id: globalState.sessionId.value,
          sessionTimeRemaining: exactMinutes
        })
        console.log('Global session tracking paused:', { 
          id: globalState.sessionId.value, 
          remainingTime: exactMinutes,
          remainingSeconds: globalState.remaining.value
        })
      } catch (error) {
        console.error('Failed to pause session tracking:', error)
        // Don't re-throw - timer should still pause in UI even if API fails
      }
    }
  }

  // Resume timer
  const resumeTimer = () => {
    if (globalState.running.value) return
    if (!globalState.isInitialized) return

    globalState.running.value = true
    
    // Resume countdown
    globalState.interval.value = window.setInterval(() => {
      if (globalState.remaining.value > 0) {
        globalState.remaining.value -= 1
      } else {
        // Timer completed
        endTimer()
      }
    }, 1000)
  }

  // End timer (completion or manual end)
  const endTimer = async () => {
    globalState.running.value = false
    
    // Clear interval
    if (globalState.interval.value) {
      clearInterval(globalState.interval.value)
      globalState.interval.value = null
    }

    // Update session tracking with 0 remaining time
    if (globalState.sessionId.value) {
      try {
        await updateSession({
          id: globalState.sessionId.value,
          sessionTimeRemaining: 0 // Timer completed - set to 0 minutes
        })
        console.log('Global session tracking ended:', { 
          id: globalState.sessionId.value, 
          remainingTime: 0
        })
      } catch (error) {
        console.error('Failed to end session tracking:', error)
      }
    }

    // Reset timer state
    resetTimer()
  }

  // Reset timer state
  const resetTimer = () => {
    globalState.running.value = false
    globalState.remaining.value = globalState.totalDuration.value
    globalState.sessionId.value = null
    globalState.startTime.value = null
    globalState.pausedTime.value = 0
    globalState.lastPauseTime.value = null
    
    if (globalState.interval.value) {
      clearInterval(globalState.interval.value)
      globalState.interval.value = null
    }
  }

  // Toggle between start/pause and resume
  const toggleTimer = async (sessionNumber: number = 1) => {
    if (!globalState.sessionId.value) {
      await startTimer(sessionNumber)
    } else if (globalState.running.value) {
      await pauseTimer()
    } else {
      resumeTimer()
    }
  }

  // Cleanup on component unmount (only if no other components are using it)
  const cleanup = () => {
    // Note: We don't automatically cleanup on unmount since timer should persist
    // Timer will be cleaned up when explicitly ended or when page refreshes
  }

  // Watch for page visibility changes to handle tab switching
  const handleVisibilityChange = () => {
    if (document.hidden) {
      // Tab is hidden, timer continues running (no action needed)
    } else {
      // Tab is visible, ensure timer is still running if it was running
      if (globalState.running.value && !globalState.interval.value) {
        resumeTimer()
      }
    }
  }

  // Add visibility change listener
  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', handleVisibilityChange)
  }

  return {
    // State
    isRunning,
    remainingTime,
    totalTime,
    progress,
    timeDisplay,
    hasActiveSession,
    canResumeSession,
    
    // Methods
    initializeTimer,
    startTimer,
    pauseTimer,
    resumeTimer,
    endTimer,
    resetTimer,
    toggleTimer,
    cleanup,
    canStartSession,
  }
}
