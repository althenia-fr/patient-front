<script setup lang="ts">
const props = withDefaults(defineProps<{ open: boolean; title?: string; message?: string; streakDays?: number; progressDelta?: number }>(), {
  title: 'Bilan envoyé !',
  message: "Merci pour votre bilan hebdomadaire. Vos retours aident votre équipe médicale à optimiser votre traitement.",
  streakDays: 5,
  progressDelta: 2,
})
const emit = defineEmits<{ (e: 'close'): void }>()
</script>

<template>
  <Teleport to="body">
    <transition name="fade">
      <div v-if="props.open" class="fixed inset-0 z-[100] flex items-center justify-center">
        <div class="absolute inset-0 bg-black/30" @click="emit('close')" aria-hidden="true"></div>
        <div role="dialog" aria-modal="true" class="relative z-10 w-[92%] max-w-md rounded-2xl bg-white p-6 text-center shadow-soft">
          <div class="mx-auto mb-2 grid h-12 w-12 place-items-center rounded-xl bg-brand-primary/10 text-brand-primary">
            <svg viewBox="0 0 24 24" class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6 9 17l-5-5"/></svg>
          </div>
          <h3 class="text-xl font-extrabold text-gray-800">{{ props.title }}</h3>
          <p class="mx-auto mt-2 max-w-sm text-sm text-gray-600" v-html="props.message"></p>

          <div class="mx-auto mt-4 flex max-w-sm items-center justify-center gap-4 rounded-2xl bg-gray-50 p-3 text-sm">
            <div class="flex items-center gap-2 text-gray-700">
              <span class="text-yellow-600">★</span>
              <span>TENS: {{ props.streakDays }}</span>
            </div>
            <div class="h-4 w-px bg-gray-200"></div>
            <div class="flex items-center gap-2 text-gray-700">
              <span class="text-brand-primary">↗</span>
              <span>Progrès: +{{ props.progressDelta }}%</span>
            </div>
          </div>

          <button class="btn-primary mt-5 w-full" @click="emit('close')">Continuer</button>
          <p class="mt-3 text-xs text-gray-500">Vous êtes sur la bonne voie ! 💪</p>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,.fade-leave-active{ transition: opacity .2s ease }
.fade-enter-from,.fade-leave-to{ opacity: 0 }
</style>
