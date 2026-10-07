<template>
  <div class="mx-auto w-full max-w-lg pt-5 pb-24">
    <div class="rounded-2xl border border-gray-100 bg-white p-5 space-y-5">

      <!-- En-tête -->
      <div class="text-center space-y-1">
        <h3 class="text-base font-semibold text-gray-800">Nouvelle protection</h3>
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

      <!-- Champ de saisie du poids -->
      <div class="space-y-2 rounded-xl bg-gray-50/80 p-4 border border-gray-100">
        <label class="block text-xs font-semibold text-gray-700">
          Différence de poids de la protection souillée<span class="font-normal text-gray-400">(facultatif)</span>
        </label>

        <div class="flex items-center gap-2">
          <input
              type="number"
              v-model.number="form.weight"
              min="0"
              step="1"
              placeholder="Poids souillé - poids propre"
              class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-800 focus:border-brand-primary focus:outline-none"
          />
          <span class="text-xs font-bold text-gray-600 shrink-0">grammes</span>
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
import { ref, reactive } from 'vue'
import {getCurrentTime, submitReport} from "@/utils/miction.ts";
import {msgModal} from "@/utils/modals/msg-modal.ts";
import router from "@/router";

const isSubmitting = ref(false)
const time = ref(getCurrentTime());
const resetToCurrentTime = () => {
  time.value = getCurrentTime()
}

const form = reactive({
  weight: null as number | null
})

const submitForm = async () => {
  isSubmitting.value = true
  try {

    let formObj = {...form}
    const payload = {
      type: 'protect',
      time: time.value,
      payload: formObj,
    }

    const response = await submitReport(payload)
    let msg = "La protection a bien été enregistrée"
    msgModal.show('Succès', msg, 'OK',function(){msgModal.defaultClose(); router.replace("/home")});

  } catch (error) {
    console.error('Erreur lors de la sauvegarde :', error)
  } finally {
    isSubmitting.value = false
  }
}


</script>
