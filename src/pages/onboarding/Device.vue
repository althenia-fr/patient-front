<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import GamificationModal from '@/components/GamificationModal.vue'
import QRScannerModal from '@/components/QRScannerModal.vue'
import { saveOnboarding, setOnboardingDone, getOnboarding } from '@/utils/onboarding'

const router = useRouter()
const device = getOnboarding().device || {}
const model = ref(device.model || '')
const serial = ref(device.serial || '')
const show = ref(false)
const scanOpen = ref(false)

const models = [
  'STIMEO PRO – SP-2024',
  'STIMEO CLASSIC – SC-2024',
  'STIMEO MINI – SM-2024',
]

function back(){ router.back() }
function finish(){
  const finalModel = model.value || device.model || ''
  const today = new Date().toISOString().split('T')[0]
  saveOnboarding({ device: { model: finalModel, serial: serial.value }, protocolStartDate: today })
  setOnboardingDone()
  show.value = true
}

function onDetected(val: string){
  try {
    const obj = JSON.parse(val)
    if (obj?.serial) serial.value = String(obj.serial)
    if (obj?.model) model.value = String(obj.model)
    if (!obj?.serial && typeof val === 'string') serial.value = val
  } catch {
    serial.value = val
  }
}
function goHome(){ show.value = false; router.replace({ name: 'home' }) }
</script>

<template>
  <GamificationModal :open="show" @close="goHome" title="Configuration terminée !" message="Votre profil est maintenant configuré.<br />Bienvenue dans&nbsp; STIMEO+ !" />
  <section class="mx-auto max-w-3xl px-4 py-6">
    <div class="mb-4">
      <div class="h-2 w-full rounded-full bg-gray-200"><div class="h-2 w-full rounded-full bg-brand-primary"></div></div>
      <div class="mt-2 text-xs text-gray-500"><p>Configuration du protocole • Étape 2 sur 2</p></div>
    </div>

    <header class="mb-4 text-center">
      <div class="mx-auto grid h-10 w-10 place-items-center rounded-full bg-brand-primary/10 text-brand-primary">⚡</div>
      <h1 class="mt-2 text-lg font-bold">Matériel TENS</h1>
      <p class="text-xs text-gray-500">Configuration de votre appareil</p>
    </header>

    <div class="space-y-3">
      <div class="rounded-xl border border-gray-100 bg-white p-4 shadow-soft">
        <div class="text-sm font-semibold text-gray-700">Numéro de série</div>
        <div class="mt-3 flex flex-col gap-2">
          <button type="button" class="btn-secondary" @click="scanOpen=true">Scanner le QR code du TENS</button>
          <input v-model="serial" class="w-full rounded-xl border border-gray-200 p-3 text-sm" placeholder="SN123456789" />
        </div>
        <p class="mt-1 text-xs text-gray-500">Si le scan n’est pas disponible, saisissez le code manuellement.</p>
      </div>
    </div>

    <div class="mt-6 flex items-center justify-between">
      <button class="text-sm text-gray-500" @click="back">Retour</button>
      <button class="btn-primary" :disabled="!serial" @click="finish">Terminer</button>
    </div>
    <QRScannerModal :open="scanOpen" title="Scanner le QR code du TENS" @close="scanOpen=false" @detected="onDetected" />
  </section>
</template>
