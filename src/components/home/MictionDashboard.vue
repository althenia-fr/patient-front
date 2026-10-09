<template>
  <div class="mt-4 rounded-2xl border border-gray-100 bg-white p-5 relative overflow-hidden">

    <!-- Surimpression : Icône Info avec chargement -->
    <div
        v-if="disabled"
        class="absolute inset-0 z-10 flex items-center justify-center bg-white/30 backdrop-blur-[1px]"
    >
      <button
          type="button"
          @click="showDisabledInfo"
          :disabled="isLoadingInfo"
          class="flex h-18 w-18 items-center justify-center rounded-full bg-white/90 text-gray-400 shadow-md border border-gray-300 hover:scale-105 hover:text-gray-900 hover:border-gray-400 active:scale-95 transition cursor-pointer disabled:opacity-50"
          title="Information"
      >
        <i v-if="!isLoadingInfo"
           class="fa-solid fa-circle-info"
           style="font-size: 100px"></i>
        <svg v-else
             class="h-8 w-8 animate-spin text-gray-500"
             viewBox="0 0 24 24"
             fill="none">
          <circle class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"></circle>
          <path class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"></path>
        </svg>
      </button>
    </div>

    <!-- Conteneur du dashboard : effet grisé, opacité et désactivation des clics -->
    <div :class="{ 'grayscale opacity-50 pointer-events-none select-none': disabled }">

      <!-- En-tête du bloc -->
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-gray-800">Suivi urologique</h2>
      </div>

      <p class="text-xs text-gray-600 mb-4 text-justify"
         v-if="!disabled">
        Cette semaine, faites vos relevés pendant 3 jours, de façon précise et complète. Les jours peuvent être choisis
        à votre convenance et pas forcément consécutifs.
        Des relevés bien faits fournissent une information précieuse à votre médecin.
      </p>

      <!-- Matrice 2x2 des boutons de redirection -->
      <div class="grid grid-cols-2 gap-3">
        <RouterLink
            v-for="card in dashboardCards"
            :key="card.id"
            :to="card.path"
            class="flex flex-col items-center justify-center gap-2 rounded-2xl border border-gray-100 bg-cyan-50 p-4 text-center transition hover:bg-cyan-100 active:scale-[0.97]"
        >
          <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm"
               :class="card.colorClass">
            <component :is="card.icon"
                       :class="card.iconClass || 'h-8 w-8'"/>
          </div>
          <span class="text-xs font-semibold text-gray-800">{{ card.title }}</span>
        </RouterLink>
      </div>

      <div class="grid grid-cols-1 gap-3">
        <RouterLink
            :to="{ name: 'history' }"
            class="mt-4 flex flex-col items-center justify-center gap-2 rounded-2xl border border-gray-100 bg-cyan-50 p-4 text-center transition hover:bg-cyan-100 active:scale-[0.97]"
        >
          <p class="text-xs text-gray-600">
            <span class="text-xs font-semibold text-gray-800">Historique</span>
          </p>
        </RouterLink>
      </div>

    </div>

  </div>
</template>

<script setup
        lang="ts">
import {ref, h} from 'vue'
import {RouterLink} from 'vue-router'
import {msgModal} from '@/utils/modals/msg-modal'
import apiClient from "@/services/apiClient"
import {currentWeek, getAgendaForCurrentWeek} from "@/services/agenda.service.ts";
import {formIdToDisplayName} from "@/types/protocol.types.ts";

const disabled = ref(true)
const isLoadingInfo = ref(false)


let currentWeekAgenda = getAgendaForCurrentWeek(currentWeek.value)
if (currentWeekAgenda && currentWeekAgenda.forms && currentWeekAgenda.forms.length > 0) {
  for (let i = 0; i < currentWeekAgenda.forms.length; i++) {
    let form = currentWeekAgenda.forms[i]
    let calendarName = formIdToDisplayName(form)
    const upperName = calendarName.toUpperCase()
    if (upperName === 'MICTION') disabled.value = false;
  }
}


const showDisabledInfo = async () => {
  if (isLoadingInfo.value) return
  isLoadingInfo.value = true

  try {
    const response = await apiClient.get('/patient/miction/info')
    const data = response.data || response

    let msg = "Les relevés urologiques permettent de fournir à votre médecin des informations précieuses sur l'évolution du traitement.<br/><br/>"
    msg += "Les relevés s'effectuent lors de la 1ere semaine de traitement"
    if (data.followUpApt) msg += ", juste avant le rdv de suivi prévu autour du " + (new Date(data.followUpApt).toLocaleDateString())
    msg += " et à la fin du traitement ("+data.durationWeeks+" semaines). "
    msg+= "<br/><br/>"
    if(data.nextMictionDate)
    {
      msg += "Les prochains relevés seront à faire à partir du "
          +(new Date(data.nextMictionDate).toLocaleDateString())
          +" pour préparer "+(data.nextMictionWeekTrueForFollowupFalseForEndOfTreatment?"le rdv de suivi.":"le rdv de fin de traitement.")
    }
    else
    {
      msg+="Tous les relevés nécessaires ont été faits."
    }

    msgModal.show(
        'Information',
        msg,
        'OK',
        msgModal.defaultClose
    )
  } catch (error) {

    msgModal.show(
        'Erreur',
        'Impossible de récupérer les informations sur le calendrier',
        'OK',
        msgModal.defaultClose
    )
  } finally {
    isLoadingInfo.value = false
  }
}

// Icônes
const IconMiction = () => h('img', {
  src: '/miction.png',
  alt: 'Miction',
  class: 'h-10 w-10 object-contain',
  style: 'filter: drop-shadow(0.4px 0 0 #000) drop-shadow(-0.4px 0 0 #000) drop-shadow(0 0.4px 0 #000) drop-shadow(0 -0.4px 0 #000);'
})

const IconWater = h('svg', {viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2'}, [
  h('path', {d: 'M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z'})
])

const IconCoffee = h('svg', {viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2'}, [
  h('path', {d: 'M18 8h1a4 4 0 0 1 0 8h-1'}),
  h('path', {d: 'M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z'}),
  h('line', {x1: '6', y1: '1', x2: '6', y2: '4'}),
  h('line', {x1: '10', y1: '1', x2: '10', y2: '4'}),
  h('line', {x1: '14', y1: '1', x2: '14', y2: '4'})
])

const IconProtection = h('svg', {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  'stroke-width': '2',
  'stroke-linecap': 'round',
  'stroke-linejoin': 'round'
}, [
  h('path', {d: 'M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z'}),
  h('line', {x1: '4.5', y1: '4.5', x2: '21.2', y2: '21.2'})
])

const dashboardCards = [
  {
    id: 'miction',
    title: 'Miction',
    path: '/miction',
    icon: IconMiction,
    iconClass: 'h-10 w-10',
    colorClass: 'text-black'
  },
  {
    id: 'leak',
    title: 'Fuite',
    path: '/leak',
    icon: IconWater,
    iconClass: 'h-8 w-8',
    colorClass: 'text-black'
  },
  {
    id: 'drink',
    title: 'Boisson',
    path: '/drink',
    icon: IconCoffee,
    iconClass: 'h-8 w-8',
    colorClass: 'text-black'
  },
  {
    id: 'protect',
    title: 'Protections',
    path: '/protect',
    icon: IconProtection,
    iconClass: 'h-8 w-8',
    colorClass: 'text-black'
  }
]
</script>
