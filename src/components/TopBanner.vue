<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { authUser } from '@/utils/auth'
import { getWeekInfo } from '@/utils/protocol'
import { getPoints, getMaxPoints } from '@/utils/gamification'
import { getOnboarding } from '@/utils/onboarding'
import { protocolApi } from '@/services/api'
import { useGlobalTimer } from '@/composables/useGlobalTimer'
import GlobalTimer from '@/components/GlobalTimer.vue'
import type { ProtocolAgendaData } from '@/types/protocol.types'

const firstName = computed(() => {
  const meta = authUser.value?.user_metadata || {}
  if (meta.firstName && String(meta.firstName).trim()) return String(meta.firstName)
  const email = authUser.value?.email || ''
  const raw = email.split('@')[0] || 'utilisateur'
  const base = raw.split(/[._-]/)[0] || raw
  return base.charAt(0).toUpperCase() + base.slice(1)
})

// Protocol agenda state
const protocolAgenda = ref<ProtocolAgendaData | null>(null)
const agendaLoading = ref(false)

// Global timer
const { initializeTimer } = useGlobalTimer()

// Fetch protocol agenda and initialize timer
const fetchProtocolAgenda = async () => {
  try {
    agendaLoading.value = true
    protocolAgenda.value = await protocolApi.getProtocolAgenda()
    
    // Initialize timer to check for existing sessions
    if (protocolAgenda.value) {
      const sessionDuration = protocolAgenda.value?.sessionDurationMin || getOnboarding()?.sessionDuration || 20
      await initializeTimer(protocolAgenda.value, sessionDuration)
    }
  } catch (error) {
    console.error('Failed to fetch protocol agenda in TopBanner:', error)
    // Continue with fallback data if API fails
  } finally {
    agendaLoading.value = false
  }
}

const week = computed(() => {
  if (protocolAgenda.value) {
    return getWeekInfo(protocolAgenda.value)
  }
  // Fallback to onboarding data
  return getWeekInfo()
})

// const protocolDuration = computed(() => {
//   // Use API data if available, otherwise fallback to onboarding
//   return protocolAgenda.value?.durationWeeks || getOnboarding()?.protocolDuration || 13
// })

// const sessionCount = computed(() => getOnboarding()?.sessionCount || 1)
// const points = computed(() => getPoints())
// const max = computed(() => getMaxPoints(protocolDuration.value, sessionCount.value))
// const pct = computed(() => (max.value ? points.value / max.value : 0))

// const tier = computed<'bronze' | 'silver' | 'gold'>(() => pct.value >= 0.66 ? 'gold' : pct.value >= 0.33 ? 'silver' : 'bronze')
// const star = computed(() => tier.value === 'gold' ? '#ffd54f' : tier.value === 'silver' ? '#c0c0c0' : '#cd7f32')

const unread = ref(0)
onMounted(() => {
  // Only fetch protocol agenda if user is authenticated
  if (authUser.value) {
    fetchProtocolAgenda()
  }
  
  const readUnread = () => {
    const v = Number(localStorage.getItem('unread_notifications') || '0')
    unread.value = Number.isNaN(v) ? 0 : v
  }
  readUnread()
  window.addEventListener('storage', readUnread)
  const id = window.setInterval(readUnread, 3000)
  onUnmounted(() => { window.removeEventListener('storage', readUnread); clearInterval(id) })
})
</script>

<template>
  <div class="sticky z-[9998] bg-brand-bg/90 backdrop-blur" style="top: env(safe-area-inset-top)">
    <div class="w-full px-0">
      <div class="w-full border border-gray-100 bg-white p-3">
      <div class="flex items-start justify-between">
        <div class="flex items-center gap-3">
          <RouterLink :to="{ name: 'notifications' }" class="relative grid h-9 w-9 place-items-center rounded-full bg-white text-gray-700 hover:bg-gray-50" :title="'Alertes'">
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            <span v-if="unread>0" class="absolute -top-1 -right-1 grid h-5 min-w-[1.25rem] place-items-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">{{ unread }}</span>
          </RouterLink>
          <div>
            <div class="text-base font-bold whitespace-nowrap">Bonjour, {{ firstName }}</div>
            <span class="inline-flex items-center gap-2 rounded-full bg-brand-secondary/30 px-3 py-1 text-xs font-semibold text-gray-700 whitespace-nowrap">
              <!-- <svg viewBox="0 0 24 24" class="h-4 w-4" fill="currentColor" aria-hidden="true"><path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg> -->
              Semaine {{ week.current }}/{{ week.total }}
            </span>
          </div>
        </div>
        <div class="flex items-center gap-6">
          <!-- Global Timer -->
          <GlobalTimer />
        </div>
      </div>
    </div>
  </div>
</div>
</template>
