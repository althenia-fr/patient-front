<script setup lang="ts">
import { computed } from 'vue'
import { getOnboarding } from '@/utils/onboarding'
import {RouterLink, useRouter} from 'vue-router'
import {authUser, signOut} from "@/utils/auth.ts";

const ob = getOnboarding()
const facility = computed(() => ({
  name: ob.facility?.name || 'Centre Hospitalier Universitaire',
  address: ob.facility?.address || '123 Avenue de la République, 75001 Paris',
  doctor: ob.facility?.doctor || 'Dr. Marie BERNARD',
}))

const router = useRouter()
async function doLogout(){ await signOut(); router.replace({ name: 'login' }) }

const doctorContact = authUser.value.user_metadata.doctorContact;

</script>

<template>
  <section class="mx-auto w-full px-4 py-6 sm:max-w-md md:max-w-lg lg:max-w-xl pb-24">

    <!-- Support STIMEO (moved second) -->
    <div class="mb-6 rounded-2xl border border-gray-100 bg-white p-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2 text-gray-700 font-semibold">
          Aide STIMEO
        </div>
      </div>
      <div class="mt-2 space-y-2 text-sm">
        <div><font-awesome-icon class=" text-brand-primary" icon="fa-solid fa-phone"/> 0 801 270 111 (gratuit, lun–ven: 9h–17h)</div>
        <div><font-awesome-icon class=" text-brand-primary" icon="fa-regular fa-envelope"/> crp@stimeo.care</div>
      </div>
      <div class="mt-3 grid grid-cols-2 gap-3">
        <a href="tel:0801270111" class="btn-primary">Appeler</a>
        <a href="mailto:crp@stimeo.care" class="rounded-full bg-gray-50 px-4 py-2 text-center font-semibold text-gray-700">Email</a>
      </div>
    </div>

    <!-- Médecin prescripteur -->
    <div class="mb-6 rounded-2xl border border-gray-100 bg-white p-4">
      <div class="flex items-center gap-2 text-gray-700 font-semibold">
        <svg class="h-5 w-5 text-brand-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="7" r="4"/><path d="M6 21a6 6 0 0 1 12 0"/></svg>
        {{doctorContact.doctorName }}
      </div>
      <div class="mt-3 space-y-2 text-sm">
        <div class="font-semibold" v-if="doctorContact && doctorContact.siteName">{{doctorContact.siteName }}</div>
        <div class="flex items-center gap-2" v-if="doctorContact && doctorContact.address1"><svg class="h-4 w-4 text-brand-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 12-9 12S3 17 3 10a9 9 0 1 1 18 0Z"/><circle cx="12" cy="10" r="3"/></svg> {{doctorContact.address1 }}, {{doctorContact.postcode }} {{doctorContact.city }}</div>
        <div class="flex items-center gap-2" v-if="doctorContact && doctorContact.phone"> <font-awesome-icon class=" text-brand-primary" icon="fa-solid fa-phone"/> {{doctorContact.phone }}</div>
        <div class="flex items-center gap-2" v-if="doctorContact && doctorContact.email"><font-awesome-icon class=" text-brand-primary" icon="fa-regular fa-envelope"/> {{doctorContact.email }}</div>
      </div>
      <div class="mt-4 grid grid-cols-2 gap-3">
        <a :href="'tel:'+doctorContact.phone" class="btn-primary" v-if="doctorContact && doctorContact.phone">Appeler</a>
        <a :href="'mailto:'+doctorContact.email" class="rounded-full bg-gray-50 px-4 py-2 text-center font-semibold text-gray-700" v-if="doctorContact && doctorContact.email">Email</a>
      </div>
    </div>

    <!-- Aide (moved first) -->
    <div class="mb-6 rounded-2xl border border-gray-100 bg-white p-4">
      <div class="mb-3 font-semibold">Besoin d'aide ?</div>
      <div class="space-y-3 text-sm">
        <!--RouterLink :to="{ name: 'education' }" class="rounded-full bg-white px-4 py-2 border border-gray-100 flex items-center justify-center gap-2 w-full whitespace-nowrap">
          Guide d'utilisation
        </RouterLink>
        <RouterLink :to="{ name: 'education' }" class="rounded-full bg-white px-4 py-2 border border-gray-100 flex items-center justify-center gap-2 w-full whitespace-nowrap">
          Vidéos tutoriels
        </RouterLink-->
        <RouterLink :to="{ name: 'faq' }" class="rounded-full bg-white px-4 py-2 border border-gray-100 flex items-center justify-center gap-2 w-full whitespace-nowrap">
          Foire Aux Questions
        </RouterLink>
      </div>
    </div>

    <!-- Log Out Button -->
    <div v-if="authUser" class="pb-12">
      <button
          @click="doLogout"
          class="card flex w-full items-center justify-between !border-red-50 text-red-600 shadow-soft active:scale-[0.98] transition-all duration-200"
      >
        <div class="flex items-center gap-3">
          <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-500">
            <font-awesome-icon icon="right-from-bracket" class="text-xl text-red-500" />
          </div>
          <div>
            <span class="block font-bold text-base text-left">Déconnexion</span>
          </div>
        </div>
      </button>
    </div>

  </section>
</template>
