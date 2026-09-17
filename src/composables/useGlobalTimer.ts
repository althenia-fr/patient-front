import {computed, reactive} from 'vue'
import { useSessionTracking } from './useSessionTracking'
import {sessionTrackingApi} from "@/services/sessionTracking.service.ts";

import {wrapLocalStorage} from "@/services/storage.service.ts";
import {msgModal} from "@/utils/modals/msg-modal.ts";
import router from "@/router";
const {protocol, setSessions, addSession} = wrapLocalStorage()

// Global timer state (singleton-like)

export const globalState = reactive(
    {
      running: false,
      sessionRemainingSec: 0,
      sessionMaxSec: 0,
      pstid: null as null | number,
      sessionNumber: null as null | number, // Track current session number
      interval: null as null | number,
    }
)


export function useGlobalTimer() {
  const { createSession, updateSession } = useSessionTracking()

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

  const initializeTimer = (session: any) => {

    globalState.pstid = session.pstid
    globalState.sessionMaxSec = session.sessionMaxSec
    globalState.sessionNumber = session.sessionNumber || null
    globalState.sessionRemainingSec = Math.round(session.sessionRemainingSec)

  }

  function doStartTimer()
  {
    // Start the timer
    globalState.running = true

    // Clear any existing interval
    if (globalState.interval) {
      clearInterval(globalState.interval)
      globalState.interval = null
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

      }
      else endTimer()

    }, 1000)
  }



  const timerOn = async (sessionNumber: number) => {

    if (globalState.running) return

    try {
      // Check if we're resuming an existing session
      if (globalState.pstid) {
        doStartTimer();
      } else {
        // Create new session tracking entry
        const pecid = protocol.pecid

        const payload = {
          pecid,
          //weekNumber: currentWeek,
          //sessionNumber : sessionNumber,
        }

        const createdSession = await createSession(payload)
        if (createdSession) {
          globalState.pstid = createdSession.pstid
          globalState.sessionNumber = createdSession.sessionNumber // Store the session number
          addSession(createdSession)
          doStartTimer();
        }
      }

    } catch (error) {
      console.error('Failed to start global timer:', error)
    }
  }

  // Pause timer and update session tracking
  const timerOff = async () => {
    if (!globalState.running) return

    // Update UI state immediately
    globalState.running = false

    // Clear interval immediately to stop timer
    if (globalState.interval) {
      clearInterval(globalState.interval)
      globalState.interval = null
    }

    // Update session tracking in background (don't block UI)
    if (globalState.pstid) {
      try {

        let listSessions = await updateSession({
          pstid: globalState.pstid,
          sessionRemainingSec: globalState.sessionRemainingSec,
        })
        //use setter to make sure we handle day change correctly
        setSessions(listSessions)

      } catch (error) {
        console.error('Failed to pause session tracking:', error)
        // Don't re-throw - timer should still pause in UI even if API fails
      }
    }
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
        let listSessions = await updateSession({
          pstid: globalState.pstid,
          sessionRemainingSec: 0, // Timer completed - set to 0 sec
        })
        //use setter to make sure we handle day change correctly
        setSessions(listSessions)
      } catch (error) {
        console.error('Failed to end session tracking:', error)
      }
    }

    // Reset timer state
    globalState.running = false
    globalState.sessionRemainingSec = globalState.sessionMaxSec
    globalState.pstid = null
    globalState.sessionNumber = null

    let msg = "Vous venez de finir la séance.<br/><br/>Les premiers résultats mettent souvent plus d'un mois pour apparaître.<br/><br/>Persévérez sans vous décourager, la régularité paye toujours à la fin."
    msgModal.show('Félicitation', msg, 'OK',msgModal.defaultClose);
    router.replace("/home")

  }


  // Toggle between start/pause and resume
  const toggleTimer = async (sessionNumber: number) => {

    if (globalState.running) {
      await timerOff()
    }
    else {
      await timerOn(sessionNumber)
    }

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
    toggleTimer,
  }
}
