import {computed, reactive} from 'vue'
import { useSessionTracking } from './useSessionTracking'
import {sessionTrackingApi} from "@/services/sessionTracking.service.ts";

// Global timer state (singleton-like)

export const globalState = reactive(
    {
      running: false,
      sessionRemainingSec: 0,
      sessionMaxSec: 0,
      pstid: null as null | number,
      sessionNumber: null as null | number, // Track current session number
      interval: null as null | number,
      startTime: null as null | number,
      pausedTime: 0, // Total time spent paused
      lastPauseTime: 0, // When timer was last paused
    }
)


export function useGlobalTimer() {
  const { createSession, updateSession, getSessionByDate, sessions } = useSessionTracking()

  // Computed properties
  const isRunning = computed(() => globalState.running)
  const sessionRemainingSec =  computed(() => globalState.sessionRemainingSec)
  const sessionMaxSec = computed(() => globalState.sessionMaxSec)
  const progress = computed(() => {
    if (globalState.sessionMaxSec === 0) return 0
    return ((globalState.sessionMaxSec - globalState.sessionRemainingSec) / globalState.sessionMaxSec) * 100
  })

  const timeDisplay = computed(() => {
    const minutes = Math.floor(globalState.sessionRemainingSec / 60)
    const seconds = Math.floor(globalState.sessionRemainingSec % 60)
    const pad = (n: number) => n.toString().padStart(2, '0')
    return `${pad(minutes)}:${pad(seconds)}`
  })

  const hasActiveSession = computed(() => globalState.pstid !== null)

  // Initialize timer with protocol agenda and check for existing sessions
  const initializeTimer = (session: any) => {

    globalState.pstid = session.pstid
    globalState.sessionMaxSec = session.sessionMaxSec
    globalState.sessionNumber = session.sessionNumber || null
    globalState.sessionRemainingSec = Math.round(session.sessionRemainingSec)

  }

  // Start timer (create new or resume existing session)
  const startTimer = async (sessionNumber: number) => {

    function doStartTimer()
    {
      // Start the timer
      globalState.running = true
      globalState.startTime = Date.now()

      // Clear any existing interval
      if (globalState.interval) {
        clearInterval(globalState.interval)
      }

      // Start countdown
      globalState.interval = window.setInterval(() => {

        if (globalState.sessionRemainingSec > 0) {

          globalState.sessionRemainingSec -= 1

          if(globalState.sessionRemainingSec % 15===0)
          {
            let payload = {
              pstid: globalState.pstid,
              sessionRemainingSec: globalState.sessionRemainingSec,
            }
            sessionTrackingApi.updateSessionTracking(payload)  //we are updating on the fly, no need to wait for response
          }

        } else {
          // Timer completed
          endTimer()
        }
      }, 1000)
    }

    if (globalState.running) return

    try {
      // Check if we're resuming an existing session
      if (globalState.pstid) {
        doStartTimer();
      } else {
        // Create new session tracking entry
        const pecid = globalState.protocol?.pecid

        const payload = {
          pecid,
          //weekNumber: currentWeek,
          //sessionNumber : sessionNumber,
        }

        const createdSession = await createSession(payload)
        if (createdSession) {
          globalState.pstid = createdSession.pstid
          globalState.sessionNumber = createdSession.sessionNumber // Store the session number
          doStartTimer();
        }
      }

    } catch (error) {
      console.error('Failed to start global timer:', error)
    }
  }

  // Pause timer and update session tracking
  const pauseTimer = async () => {
    if (!globalState.running) return

    // Update UI state immediately
    globalState.running = false
    globalState.lastPauseTime = Date.now()

    // Clear interval immediately to stop timer
    if (globalState.interval) {
      clearInterval(globalState.interval)
      globalState.interval = null
    }

    // Update session tracking in background (don't block UI)
    if (globalState.pstid) {
      try {

        await updateSession({
          pstid: globalState.pstid,
          sessionRemainingSec: globalState.sessionRemainingSec,
        })

      } catch (error) {
        console.error('Failed to pause session tracking:', error)
        // Don't re-throw - timer should still pause in UI even if API fails
      }
    }
  }

  // Resume timer
  const resumeTimer = () => {
    if (globalState.running) return

    globalState.running = true

    // Resume countdown
    globalState.interval = window.setInterval(() => {
      if (globalState.sessionRemainingSec > 0) {
        globalState.sessionRemainingSec -= 1
      } else {
        // Timer completed
        endTimer()
      }
    }, 1000)
  }

  // End timer (completion or manual end)
  const endTimer = async () => {
    globalState.running = false

    // Clear interval
    if (globalState.interval) {
      clearInterval(globalState.interval)
      globalState.interval = null
    }

    // Update session tracking with 0 remaining time
    if (globalState.pstid) {
      try {
        await updateSession({
          pstid: globalState.pstid,
          sessionRemainingSec: 0, // Timer completed - set to 0 sec
        })
      } catch (error) {
        console.error('Failed to end session tracking:', error)
      }
    }

    // Reset timer state
    resetTimer()
  }

  // Reset timer state
  async function resetTimer() {

    let pecid = globalState.protocol?.pecid

    globalState.running = false
    globalState.sessionRemainingSec = globalState.sessionMaxSec
    globalState.pstid = null
    globalState.sessionNumber = null
    globalState.startTime = null
    globalState.pausedTime = 0
    globalState.lastPauseTime = null

    if (globalState.interval) {
      clearInterval(globalState.interval)
      globalState.interval = null
    }

    let sessions = await sessionTrackingApi.listSessionTracking(pecid)
    globalState.sessions = sessions

  }

  // Toggle between start/pause and resume
  const toggleTimer = async (sessionNumber: number) => {
    if (!globalState.pstid) {
      await startTimer(sessionNumber)
    } else if (globalState.running) {
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
      if (globalState.running && !globalState.interval) {
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
    sessionMaxSec,
    sessionRemainingSec,
    progress,
    timeDisplay,
    hasActiveSession,

    // Methods
    initializeTimer,
    startTimer,
    pauseTimer,
    resumeTimer,
    endTimer,
    resetTimer,
    toggleTimer,
    cleanup,
  }
}
