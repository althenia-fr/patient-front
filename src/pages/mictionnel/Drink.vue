<template>
  <div class="mx-auto w-full max-w-lg pt-5 pb-24">
    <div class="rounded-2xl border border-gray-100 bg-white p-5 space-y-5">

      <!-- En-tête explicatif -->
      <div class="text-center space-y-1">
        <p class="font-semibold text-gray-500">
         Prise de boisson
        </p>
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

      <!-- Liste des consommations -->
      <div class="space-y-3">
        <div
            v-for="item in drinkCategories"
            :key="item.key"
            class="flex items-center justify-between rounded-xl bg-gray-50/80 p-3 border border-gray-100 transition"
        >
          <!-- Libellé & Icône -->
          <div class="flex items-center gap-3">
            <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-50 text-cyan-600">
              <component :is="item.icon" class="h-5 w-5" />
            </div>
            <span class="text-xs font-semibold text-gray-800">{{ item.label }}</span>
          </div>

          <!-- Compteur - / + -->
          <div class="flex items-center gap-3 rounded-full bg-white px-2 py-1 border border-gray-200 shadow-sm">
            <button
                type="button"
                @click="decrement(item.key)"
                :disabled="drinks[item.key] <= 0"
                class="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition"
                aria-label="Diminuer"
            >
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>

            <span class="w-5 text-center text-sm font-bold text-gray-800">
              {{ drinks[item.key] }}
            </span>

            <button
                type="button"
                @click="increment(item.key)"
                :disabled="drinks[item.key] >= 10"
                class="flex h-7 w-7 items-center justify-center rounded-full bg-brand-primary text-white hover:bg-brand-primary/90 active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition"
                aria-label="Augmenter"
            >
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Bouton d'enregistrement -->
      <button
          type="button"
          @click="submitForm"
          :disabled="isSubmitting"
          class="w-full rounded-full bg-brand-primary py-3 text-sm font-semibold text-white transition active:scale-[0.98] disabled:opacity-50"
      >
        <span v-if="!isSubmitting">Enregistrer</span>
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
import { ref, reactive, h } from 'vue'
import {getCurrentTime, submitReport} from "@/utils/miction.ts";
import {msgModal} from "@/utils/modals/msg-modal.ts";
import router from "@/router";

const isSubmitting = ref(false)
const time = ref(getCurrentTime());
const resetToCurrentTime = () => {
  time.value = getCurrentTime()
}

// Clés réactives des consommations (initialisées à 0)
const drinks = reactive<Record<string, number>>({
  water: 0,
  sodaJuice: 0,
  coffeeTea: 0,
  alcohol: 0
})

const increment = (key: string) => {
  if (drinks[key] < 10) drinks[key]++
}

const decrement = (key: string) => {
  if (drinks[key] > 0) drinks[key]--
}

// Icônes SVG
const IconWater = h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
  h('path', { d: 'M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z' })
])

const IconSoda = h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
  h('path', { d: 'M8 2h8v2H8zM9 4v3l-2 3v11a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V10l-2-3V4' }),
  h('line', { x1: '12', y1: '11', x2: '12', y2: '17' })
])

const IconCoffee = h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
  h('path', { d: 'M18 8h1a4 4 0 0 1 0 8h-1' }),
  h('path', { d: 'M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z' }),
  h('line', { x1: '6', y1: '1', x2: '6', y2: '4' }),
  h('line', { x1: '10', y1: '1', x2: '10', y2: '4' }),
  h('line', { x1: '14', y1: '1', x2: '14', y2: '4' })
])

const IconAlcohol = h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
  h('path', { d: 'M8 22h8' }),
  h('path', { d: 'M12 15v7' }),
  h('path', { d: 'M12 15l7-8V3H5v4l7 8z' })
])

// Configurations des 4 catégories
const drinkCategories = [
  { key: 'water', label: "Verre d'eau", icon: IconWater },
  { key: 'sodaJuice', label: "Verre de soda ou jus", icon: IconSoda },
  { key: 'coffeeTea', label: "Tasse de café, thé", icon: IconCoffee },
  { key: 'alcohol', label: "Verre d'alcool", icon: IconAlcohol }
]


const submitForm = async () => {
  isSubmitting.value = true
  try {

    let formObj = {...drinks}
    const payload = {
      type: 'drink',
      time: time.value,
      payload: formObj,
    }

    const response = await submitReport(payload)
    let msg = "La boisson a bien été enregistrée"
    msgModal.show('Succès', msg, 'OK',function(){msgModal.defaultClose(); router.replace("/home")});

  } catch (error) {
    console.error('Erreur lors de la sauvegarde :', error)
  } finally {
    isSubmitting.value = false
  }
}


</script>
