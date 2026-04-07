<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <div class="min-h-screen bg-[#f0e6f6] flex flex-col items-center justify-center p-4">
    <div class="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 relative overflow-hidden">
      <!-- Background subtle shapes -->
      <div class="absolute -top-10 -right-10 w-32 h-32 bg-brand-primary opacity-5 rounded-full"></div>
      
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-brand-primary mb-2" style="font-family: 'Comfortaa', cursive;">
          Althenia
        </h1>
        <h2 class="text-xl font-semibold text-gray-700">Installation Safari</h2>
      </div>

      <div class="space-y-8">
        <div class="flex items-start gap-4">
          <div class="flex-shrink-0 w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center font-bold">1</div>
          <div>
            <p class="text-gray-700 leading-relaxed">
              Sur la barre du bas de page, appuyez sur l'icône 
              <span class="inline-flex items-center justify-center bg-gray-100 rounded p-1 mx-1">
                <svg class="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
              </span>.
            </p>
          </div>
        </div>

        <div class="flex items-start gap-4">
          <div class="flex-shrink-0 w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center font-bold">2</div>
          <div>
            <p class="text-gray-700 leading-relaxed">
              Recherchez l'option <span class="font-bold">"Sur l'écran d'accueil"</span>, puis appuyez dessus.
            </p>
          </div>
        </div>

        <div class="flex items-start gap-4">
          <div class="flex-shrink-0 w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center font-bold">3</div>
          <div>
            <p class="text-gray-700 leading-relaxed">
              Appuyez sur <span class="font-bold text-brand-primary">Ajouter</span>.
            </p>
          </div>
        </div>

        <div class="flex items-start gap-4">
          <div class="flex-shrink-0 w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center font-bold">4</div>
          <div>
            <p class="text-gray-700 leading-relaxed">
              L'app est alors installée sur votre smartphone. Cherchez son icône et cliquez pour commencer.
            </p>
          </div>
        </div>
      </div>

      <div class="mt-10">
        <button @click="router.push('/signin')" class="w-full bg-gray-100 text-gray-600 rounded-2xl py-4 font-semibold hover:bg-gray-200 transition-colors">
          Retour à la connexion
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom styles if needed */
</style>
