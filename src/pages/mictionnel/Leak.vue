<template>
  <div class="mx-auto w-full max-w-lg pt-5 pb-24">
    <div class="rounded-2xl border border-gray-100 bg-white p-5 space-y-4">

      <div class="text-center space-y-1">
        <h3 class="text-base font-semibold text-gray-800">Nouvelle Fuite</h3>
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

      <!-- 1. Importance de la fuite -->
      <div class="space-y-1.5">
        <label class="block text-sm font-semibold text-gray-800">Importance de la fuite</label>

        <div class="grid grid-cols-3 gap-2">
          <button
              v-for="level in importanceOptions"
              :key="level.value"
              type="button"
              @click="form.importance = level.value"
              class="flex flex-col items-center justify-center rounded-xl border p-2.5 text-center transition gap-1"
              :class="form.importance === level.value
              ? 'border-brand-primary bg-brand-primary/10 text-brand-primary font-semibold'
              : 'border-gray-100 bg-gray-50 text-gray-600 hover:bg-gray-100'"
          >
            <!-- Gouttes d'eau -->
            <div class="flex items-center gap-0.5">
              <svg
                  v-for="i in level.value"
                  :key="i"
                  viewBox="0 0 24 24"
                  class="h-4 w-4 fill-current"
              >
                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
              </svg>
            </div>
            <span class="text-xs font-medium leading-tight">{{ level.label }}</span>
          </button>
        </div>
      </div>

      <!-- 2. Circonstances : Matrice 2 x 2 -->
      <div class="space-y-1.5">
        <label class="block text-sm font-semibold text-gray-800">Circonstances</label>

        <div class="grid grid-cols-2 gap-2">
          <button
              v-for="opt in leakOptions"
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

      <!-- 3. Remarques sans restriction -->
      <div class="space-y-1">
        <label class="block text-sm font-semibold text-gray-800">Remarques</label>
        <textarea
            v-model="form.comments"
            rows="3"
            placeholder="odeur, couleur des urines, présence de sang..."
            class="w-full rounded-xl border border-gray-200 bg-gray-50 p-2.5 text-xs text-gray-800 placeholder-gray-400 focus:border-brand-primary focus:bg-white focus:outline-none resize-none"
        ></textarea>
      </div>

      <!-- Bouton d'enregistrement -->
      <button
          type="button"
          @click="submitForm"
          :disabled="isSubmitting || !isValid"
          class="w-full rounded-full bg-brand-primary py-3 text-sm font-semibold text-white transition active:scale-[0.98] disabled:opacity-50"
      >
        <span v-if="!isSubmitting">Enregistrer la fuite</span>
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
  importance:  null as number | null, // 1 = Légère / Gouttes, 2 = Modérée, 3 = Abondante
  circumstance: null as string | null,
  comments: ''
})

// 2. Condition de validation
const isValid = computed(() => {
  return form.circumstance !== null && form.importance !== null
})


// Options d'importance de la fuite
const importanceOptions = [
  { label: 'Gouttes', value: 1 },
  { label: 'Modérée', value: 2 },
  { label: 'Abondante', value: 3 }
]

// Icônes SVG
const IconCough = h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
  h('path', { d: 'M12 2a5 5 0 0 0-5 5v3a5 5 0 0 0 10 0V7a5 5 0 0 0-5-5z' }),
  h('path', { d: 'M19 10v1a7 7 0 0 1-14 0v-1' }),
  h('line', { x1: '12', y1: '18', x2: '12', y2: '22' })
])

const IconRun = h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
  h('path', { d: 'M13 4a2 2 0 1 0 0-4 2 2 0 0 0 0 4z' }),
  h('path', { d: 'M6 21l3-7 2 2v6' }),
  h('path', { d: 'M17 21l-3-4 1-5 4 2' }),
  h('path', { d: 'M4 11l4-1 4 3 5-3' })
])

const IconBell = h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
  h('path', { d: 'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9' }),
  h('path', { d: 'M13.73 21a2 2 0 0 1-3.46 0' })
])

const IconHelp = h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
  h('circle', { cx: '12', cy: '12', r: '10' }),
  h('path', { d: 'M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3' }),
  h('line', { x1: '12', y1: '17', x2: '12.01', y2: '17' })
])

// 4 Circonstances de fuite (Matrice 2x2)
const leakOptions = [
  {
    label: 'Toux',
    value: 'toux',
    icon: IconCough,
    explanation: "fuite survenue lors d'un effort de toux, d'éternuement ou d'un éclat de rire"
  },
  {
    label: 'Effort',
    value: 'effort',
    icon: IconRun,
    explanation: "fuite survenue lors d'un effort physique (port de charge, montée d'escaliers, sport...)"
  },
  {
    label: 'Urgence / envie pressante',
    value: 'urgency',
    icon: IconBell,
    explanation: "fuite précédée d'un besoin soudain et irrépressible d'uriner que vous n'avez pas pu retenir"
  },
  {
    label: 'Sans raison particulière',
    value: 'no_reason',
    icon: IconHelp,
    explanation: "fuite survenue passivement, sans sensation de besoin préalable ni effort particulier"
  }
]

const selectedOption = computed(() => {
  return leakOptions.find(opt => opt.value === form.circumstance)
})

const selectedOptionLabel = computed(() => selectedOption.value?.label || '')
const selectedExplanation = computed(() => selectedOption.value?.explanation || '')

const submitForm = async () => {
  if (!isValid.value) return
  isSubmitting.value = true
  try {

    let formObj = {...form}
    const payload = {
      type: 'leak',
      time: time.value,
      payload: formObj,
    }

    const response = await submitReport(payload)
    let msg = "La fuite a bien été enregistrée"
    msgModal.show('Succès', msg, 'OK',function(){msgModal.defaultClose(); router.replace("/home")});
  } catch (error) {
    console.error('Erreur lors de la sauvegarde :', error)
  } finally {
    isSubmitting.value = false
  }
}

</script>
