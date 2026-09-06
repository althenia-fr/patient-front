<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { authUser } from '@/utils/auth'
import { getWeekInfo } from '@/utils/protocol'
import {globalState, initGlobalState} from '@/composables/useGlobalTimer'
import router from "@/router";

const firstname = computed(() => {

  if(!authUser || !authUser.value || !authUser.value.user_metadata) router.replace({ name: 'login' })
  else
  {
    const firstname = authUser.value.user_metadata.firstname;
    return firstname.charAt(0).toUpperCase() + firstname.slice(1).toLowerCase()
  }
})


const week = computed(() => {
  return getWeekInfo(globalState.protocol)
})

//const unread = ref(0)
onMounted(() => {

  initGlobalState()

  /*
  const readUnread = () => {
    const v = Number(localStorage.getItem('unread_notifications') || '0')
    unread.value = Number.isNaN(v) ? 0 : v
  }
  readUnread()
  window.addEventListener('storage', readUnread)
  const id = window.setInterval(readUnread, 3000)
  onUnmounted(() => { window.removeEventListener('storage', readUnread); clearInterval(id) })

   */
})



</script>

<template>
  <div class="sticky z-[9998] bg-white backdrop-blur" style="top: env(safe-area-inset-top)">
    <div class="w-full mx-auto px-4 sm:max-w-md md:max-w-lg lg:max-w-xl">
      <div class="w-full bg-white p-3">
      <div class="flex items-start justify-between">
        <div class="flex items-center gap-3" style="justify-content: space-between; align-items: center; width: 100%">

            <div class="text-base font-bold whitespace-nowrap">Bonjour, {{ firstname }}</div>
            <div v-if="week" style="margin-left: auto; min-width: max-content" class="inline-flex items-center gap-2 rounded-full bg-brand-secondary/30 px-3 py-1 text-xs font-semibold text-gray-700 whitespace-nowrap">
              <!-- <svg viewBox="0 0 24 24" class="h-4 w-4" fill="currentColor" aria-hidden="true"><path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg> -->
              Semaine {{ week.current }}/{{ week.total }}
            </div>
        </div>

        <!--div class="flex items-center gap-6">
          <GlobalTimer />
        </div -->
      </div>
    </div>
  </div>
</div>
</template>
