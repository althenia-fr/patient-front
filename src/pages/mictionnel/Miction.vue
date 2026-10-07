<template>
  <div class="mx-auto w-full max-w-lg pt-5 pb-24">
    <div class="rounded-2xl border border-gray-100 bg-white p-5 space-y-4">

      <div class="text-center space-y-1">
        <h3 class="text-base font-semibold text-gray-800">Nouvelle miction</h3>
      </div>

      <!-- Saisie de l'heure -->
      <div class="flex items-center justify-between gap-3 rounded-xl bg-gray-50/80 p-3 border border-gray-100">
        <label class="text-sm font-semibold text-gray-800 whitespace-nowrap">Heure de l'évènement'</label>
        <div class="flex items-center gap-2">
          <input
              type="time"
              v-model="time"
              class="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-base font-semibold text-gray-800 focus:border-brand-primary focus:outline-none"
          />
          <button
              type="button"
              @click="resetToCurrentTime"
              class="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 active:scale-95 transition"
              title="Remettre à l'heure actuelle"
          >
            <i class="fa-solid fa-rotate text-sm"></i>
          </button>
        </div>
      </div>

      <!-- 1. Volume compact : Titre + Input centilitres + Verre animé -->
      <div class="flex items-center justify-between gap-3 rounded-xl bg-gray-50/80 p-3 border border-gray-100">
        <div class="flex items-center gap-3 flex-1">
          <label class="text-sm font-semibold text-gray-800 whitespace-nowrap">Volume</label>
          <div class="flex items-center gap-2 flex-1 max-w-[210px]">
            <input
                type="number"
                v-model.number="form.volume"
                min="1"
                max="100"
                placeholder="1 - 100"
                class="w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-base font-semibold text-gray-800 focus:border-brand-primary focus:outline-none"
            />
            <span class="text-xs font-bold text-gray-600">centilitres</span>
          </div>
        </div>

        <!-- Illustration verre d'eau rempli de 1 à 100% -->
        <div class="flex items-center gap-2 shrink-0">
          <span class="text-xs font-medium text-gray-400">{{ fillPercentage }}%</span>
          <div class="h-10 w-8 relative flex items-end justify-center rounded-b-lg border-2 border-red-300 bg-red-50/30 overflow-hidden">
            <div
                class="w-full bg-red-400/80 transition-all duration-300"
                :style="{ height: fillPercentage + '%' }"
            ></div>
          </div>
        </div>
      </div>

      <!-- 2. Circonstances : Matrice 3 x 2 -->
      <div class="space-y-1.5">
        <label class="block text-sm font-semibold text-gray-800">Circonstances</label>

        <div class="grid grid-cols-2 gap-2">
          <button
              v-for="opt in mictionOptions"
              :key="opt.value"
              type="button"
              @click="form.circumstance = opt.value"
              class="flex items-center gap-2.5 rounded-xl border p-2.5 text-left transition"
              :class="form.circumstance === opt.value
              ? 'border-brand-primary bg-brand-primary/10 text-brand-primary font-semibold'
              : 'border-gray-100 bg-gray-50 text-gray-600 hover:bg-gray-100'"
          >
            <component :is="opt.icon" class="h-5 w-5 shrink-0" />
            <span class="text-xs font-medium leading-tight">{{ opt.label }}</span>
          </button>

          <!-- 6ème cellule vide (Matrice 3x2) -->
          <div class="rounded-xl border border-dashed border-gray-100 bg-gray-50/30"></div>
        </div>

        <!-- Encadré explicatif du guide pratique -->
        <div v-if="selectedExplanation" class="mt-2 rounded-xl bg-cyan-50/80 p-3 text-xs text-cyan-900 border border-cyan-100 flex items-start gap-2">
          <svg class="h-4 w-4 text-cyan-600 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="16" x2="12" y2="12"/>
            <line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
          <div>
            <span class="font-semibold">{{ selectedOptionLabel }} : </span>
            <span>{{ selectedExplanation }}</span>
          </div>
        </div>
      </div>

      <!-- 3. Remarques sans restriction de caractères -->
      <div class="space-y-1">
        <label class="block text-sm font-semibold text-gray-800">Remarque</label>
        <textarea
            v-model="form.remarks"
            rows="3"
            placeholder="odeur, couleur des urines, présence de sang..."
            class="w-full rounded-xl border border-gray-200 bg-gray-50 p-2.5 text-xs text-gray-800 placeholder-gray-400 focus:border-brand-primary focus:bg-white focus:outline-none resize-none"
        ></textarea>
      </div>

      <!-- Bouton d'enregistrement -->
      <button
          type="button"
          @click="submitForm"
          :disabled="isSubmitting || !isValidVolume"
          class="w-full rounded-full bg-brand-primary py-3 text-sm font-semibold text-white transition active:scale-[0.98] disabled:opacity-50"
      >
        <span v-if="!isSubmitting">Enregistrer la miction</span>
        <span v-else class="flex items-center justify-center gap-2">
          <svg class="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
          </svg>
          Enregistrement...
        </span>
      </button>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, h } from 'vue'
import {getCurrentTime, submitReport} from "@/utils/miction.ts";
import {msgModal} from "@/utils/modals/msg-modal.ts";
import router from "@/router";

const isSubmitting = ref(false)
const time = ref(getCurrentTime());
const resetToCurrentTime = () => {
  time.value = getCurrentTime()
}

const form = reactive({
  volume: null as number | null,
  unit: 'centilitres',
  circumstance: 'normal',
  remarks: ''
})


const fillPercentage = computed(() => {
  if (!form.volume || form.volume < 1) return 0
  return Math.min(100, Math.max(0, Math.round(form.volume)))
})

const isValidVolume = computed(() => {
  return form.volume !== null && form.volume >= 1 && form.volume <= 100
})

// Icônes SVG
const IconCheck = h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
  h('path', { d: 'M20 6L9 17l-5-5' })
])

const IconShield = h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
  h('path', { d: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' })
])

const IconBell = h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
  h('path', { d: 'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9' }),
  h('path', { d: 'M13.73 21a2 2 0 0 1-3.46 0' })
])

const IconAlert = h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
  h('path', { d: 'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z' }),
  h('line', { x1: '12', y1: '9', x2: '12', y2: '13' }),
  h('line', { x1: '12', y1: '17', x2: '12.01', y2: '17' })
])

const IconFlask = h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
  h('path', { d: 'M10 2v7.52L4.26 19.5A2 2 0 0 0 6 22h12a2 2 0 0 0 1.74-2.5L14 9.52V2' }),
  h('line', { x1: '8.5', y1: '2', x2: '15.5', y2: '2' })
])

const mictionOptions = [
  {
    label: 'Normal',
    value: 'normal',
    icon: IconCheck,
    explanation: "vous avez une envie normale d'uriner"
  },
  {
    label: 'Précaution',
    value: 'precaution',
    icon: IconShield,
    explanation: "vous n'avez pas envie d'uriner, mais vous êtes allé aux toilettes par précaution (ex: avant de sortir ou par peur de ne pas trouver de toilettes)"
  },
  {
    label: 'Urgence / envie pressante',
    value: 'urgency',
    icon: IconBell,
    explanation: "besoin pressant d'uriner qu'il n'est pas possible de différer, de survenue brutale (parfois déclenchée par le bruit de l'eau, le froid...)"
  },
  {
    label: 'Miction difficile',
    value: 'difficult',
    icon: IconAlert,
    explanation: "difficultés à vider la vessie lors d'une miction (faiblesse du jet, miction par poussées)"
  },
  {
    label: 'Volume sondé',
    value: 'volume_sonde',
    icon: IconFlask,
    explanation: "volume d'urine récupéré suite à un sondage urinaire"
  }
]

const selectedOption = computed(() => {
  return mictionOptions.find(opt => opt.value === form.circumstance)
})

const selectedOptionLabel = computed(() => selectedOption.value?.label || '')
const selectedExplanation = computed(() => selectedOption.value?.explanation || '')

const submitForm = async () => {
  if (!isValidVolume.value) return
  isSubmitting.value = true
  try {

    let formObj = {...form}
    const payload = {
      type: 'miction',
      time: time.value,
      payload: formObj,
    }

    const response = await submitReport(payload)
    let msg = "La miction a bien été enregistrée"
    msgModal.show('Succès', msg, 'OK',function(){msgModal.defaultClose(); router.replace("/home")});

  } catch (error) {
    console.error('Erreur lors de la sauvegarde :', error)
  } finally {
    isSubmitting.value = false
  }
}

</script>
