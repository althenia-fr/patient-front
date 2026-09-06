import {ref, computed, reactive} from 'vue'
import { useSessionTracking } from './useSessionTracking'
import {STORAGE_KEYS} from "@/types/api.types.ts";
import {protocolApi} from "@/services/protocol.service.ts";
import {sessionTrackingApi} from "@/services/sessionTracking.service.ts";

// Global timer state (singleton-like)
/*
export const globalState = {
  protocol: ref(null),
  running: ref(false),
  remaining: ref(0),
  totalDuration: ref(0),
  pstid: ref<number | null>(null),
  sessionNumber: ref<number | null>(null), // Track current session number
  interval: ref<number | null>(null),
  startTime: ref<number | null>(null),
  pausedTime: ref(0), // Total time spent paused
  lastPauseTime: ref<number | null>(null), // When timer was last paused
}*/

export const globalState = reactive(
    {
      protocol: null,
      running: false,
      remaining: 0,
      totalDuration: 0,
      pstid: null,
      sessionNumber: null, // Track current session number
      interval: null as null | number,
      startTime: null as null | number,
      pausedTime: 0, // Total time spent paused
      lastPauseTime: null, // When timer was last paused
      sessions: [] as any[],
    }
)

export const initGlobalState = async () => {
  try {

    let protocolData = null;
    let protocolDataJson = localStorage.getItem(STORAGE_KEYS.ALTH_PROTOCOL) //, JSON.stringify(allSavedResults.value))
    if(!protocolDataJson)
    {
      protocolData = await protocolApi.getProtocolAgenda()
      if(protocolData) localStorage.setItem(STORAGE_KEYS.ALTH_PROTOCOL,JSON.stringify(protocolData));
    }
    else protocolData = JSON.parse(protocolDataJson)

    globalState.protocol = protocolData

    let sessions = await sessionTrackingApi.listSessionTracking(protocolData.pecid)
    globalState.sessions = sessions

  } catch (error: any) {

    console.log(error.message)

  }
}


export function useGlobalTimer() {
  const { createSession, updateSession, getSessionByDate, sessions } = useSessionTracking()

  // Computed properties
  const isRunning = computed(() => globalState.running)
  const remainingTime = computed(() => globalState.remaining)
  const totalTime = computed(() => globalState.totalDuration)
  const progress = computed(() => {
    if (globalState.totalDuration === 0) return 0
    return ((globalState.totalDuration - globalState.remaining) / globalState.totalDuration) * 100
  })

  const timeDisplay = computed(() => {
    const minutes = Math.floor(globalState.remaining / 60)
    const seconds = Math.floor(globalState.remaining % 60)
    const pad = (n: number) => n.toString().padStart(2, '0')
    return `${pad(minutes)}:${pad(seconds)}`
  })

  const hasActiveSession = computed(() => globalState.pstid !== null)
  const canResumeSession = computed(() => {

    const today = new Date().toISOString().split('T')[0]
    const existingSession = getSessionByDate(today)

    // sessionTimeRemaining can be decimal minutes from API (e.g., 18.83)
    return existingSession !== undefined && existingSession.sessionTimeRemaining > 0
  })

  // Initialize timer with protocol agenda and check for existing sessions
  const initializeTimer = (session: any) => {

    globalState.pstid = session.pstid
    globalState.totalDuration = session.sessionTimeMax * 60
    globalState.sessionNumber = session.sessionNumber || null
    globalState.remaining = Math.round(session.sessionTimeRemaining * 60)

  }

  // Start timer (create new or resume existing session)
  const startTimer = async (sessionNumber: number = 1) => {

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
        if (globalState.remaining > 0) {
          globalState.remaining -= 1

          if(globalState.remaining % 30000===0)
          {

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
        // Resume existing session
        console.log('Resuming existing session:', globalState.pstid)
        doStartTimer();
      } else {
        // Create new session tracking entry
        const pecid = globalState.protocol?.pecid
        const currentWeek = Math.ceil(
          (Date.now() - new Date(globalState.protocol?.startDate).getTime()) /
          (7 * 24 * 60 * 60 * 1000)
        )

        const payload = {
          pecid,
          weekNumber: currentWeek,
          sessionNumber : sessionNumber,
        }

        const createdSession = await createSession(payload)
        console.log('createdSessions', createdSession);
        if (createdSession) {
          globalState.pstid = createdSession.pstid
          globalState.sessionNumber = sessionNumber // Store the session number
          console.log('Global session tracking created:', createdSession)
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
        // Save exact decimal minutes rounded to 2 decimal places
        const exactMinutes = Math.round((globalState.remaining / 60) * 100) / 100
        await updateSession({
          pstid: globalState.pstid,
          sessionTimeRemaining: exactMinutes,
          sessionNumber: globalState.sessionNumber || undefined
        })
        console.log('Global session tracking paused:', {
          pstid: globalState.pstid,
          sessionNumber: globalState.sessionNumber,
          remainingTime: exactMinutes,
          remainingSeconds: globalState.remaining
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
      if (globalState.remaining > 0) {
        globalState.remaining -= 1
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
          sessionTimeRemaining: 0, // Timer completed - set to 0 minutes
          sessionNumber: globalState.sessionNumber || undefined
        })
        console.log('Global session tracking ended:', {
          pstid: globalState.pstid,
          sessionNumber: globalState.sessionNumber,
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
    globalState.running = false
    globalState.remaining = globalState.totalDuration
    globalState.pstid = null
    globalState.sessionNumber = null
    globalState.startTime = null
    globalState.pausedTime = 0
    globalState.lastPauseTime = null

    if (globalState.interval) {
      clearInterval(globalState.interval)
      globalState.interval = null
    }
  }

  // Toggle between start/pause and resume
  const toggleTimer = async (sessionNumber: number = 1) => {
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
  }
}
