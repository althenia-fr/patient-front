<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { saveOnboarding, getOnboarding } from '@/utils/onboarding'

const router = useRouter()
const ob = getOnboarding()
const data = ob.facility || {}
const name = ref(data.name || 'Centre Hospitalier Universitaire')
const address = ref(data.address || '123 Avenue de la République, 75001 Paris')
const doctor = ref(data.doctor || 'Dr. Marie BERNARD')

// IDEL fields
const idelData = ob.idel || {}
const idelName = ref(idelData.name || 'Sophie MARTIN')
const idelRole = ref(idelData.role || 'Infirmière libérale')
const idelAddress = ref(idelData.address || 'Cabinet infirmier – 15 rue de la Santé')
const idelPhone = ref(idelData.phone || '06 12 34 56 78')
const idelNextVisit = ref(idelData.nextVisit || 'Mercredi 18 Décembre à 10h30')

function back(){ router.back() }
function next(){
  saveOnboarding({
    facility: { name: name.value, address: address.value, doctor: doctor.value },
    idel: { name: idelName.value, role: idelRole.value, address: idelAddress.value, phone: idelPhone.value, nextVisit: idelNextVisit.value },
  })
  router.push({ name: 'onb-device' })
}
</script>

<template>
  <section class="mx-auto max-w-3xl px-4 py-6">
    <div class="mb-4">
      <div class="h-2 w-full rounded-full bg-gray-200"><div class="h-2 w-2/3 rounded-full bg-brand-primary"></div></div>
      <div class="mt-2 text-xs text-gray-500">Configuration du protocole • Étape 2 sur 3</div>
    </div>

    <header class="mb-4 text-center">
      <div class="mx-auto grid h-10 w-10 place-items-center rounded-full bg-brand-primary/10 text-brand-primary">🏥</div>
      <h1 class="mt-2 text-lg font-bold">Établissement de santé</h1>
      <p class="text-xs text-gray-500">Informations sur votre équipe médicale</p>
    </header>

    <div class="space-y-3">
      <div class="rounded-xl border border-gray-100 bg-white p-4 shadow-soft">
        <div class="text-sm font-semibold text-gray-700">Établissement prescripteur</div>
        <input class="mt-2 w-full rounded-xl border border-gray-200 p-3 text-sm" v-model="name" placeholder="Nom de l’établissement" />
        <input class="mt-2 w-full rounded-xl border border-gray-200 p-3 text-sm" v-model="address" placeholder="Adresse" />
      </div>
      <div class="rounded-xl border border-gray-100 bg-white p-4 shadow-soft">
        <div class="text-sm font-semibold text-gray-700">Médecin prescripteur</div>
        <input class="mt-2 w-full rounded-xl border border-gray-200 p-3 text-sm" v-model="doctor" placeholder="Nom du médecin" />
      </div>
    </div>

    <div class="mt-6 flex items-center justify-between">
      <button class="text-sm text-gray-500" @click="back">Retour</button>
      <button class="btn-primary rounded-full px-6 py-3" @click="next">Suivant</button>
    </div>
  </section>
</template>
