<script setup lang="ts">
import {ref, watch } from 'vue'
import { getAttestations, getMethod, setMethod } from '@/utils/caution'
import {useRouter} from "vue-router";
import {wrapLocalStorage} from "@/services/storage.service.ts";
const {user} = wrapLocalStorage()

const version = ref('v.'+import.meta.env.VITE_APP_VERSION || 'v.dev');

const router = useRouter()
async function doLogout(){ signOut(); router.replace({ name: 'login' }) }

let lock = false
function reloadSoftware()
{
  if(!lock)
  {
    lock=true;
    version.value = 'telechargement en cours...'
    setTimeout(() => {
      window.location.reload();
    }, 3000);
  }
}


const personalInfoOpen = ref(false)
const documentsOpen = ref(false)

const attestations = ref(getAttestations())
const selectedMethod = ref<'CB' | 'Chèque'>(getMethod())
watch(selectedMethod, (m) => setMethod(m))
function refreshAttestations() { attestations.value = getAttestations() }

function signOut() {
  localStorage.clear();
  user.value = null
}

</script>

<template>
  <section class="mx-auto w-full px-4 py-6 sm:max-w-md md:max-w-lg lg:max-w-xl">

    <!-- Informations personnelles -->
    <div class="card">
      <div class="flex items-center justify-between cursor-pointer" @click="personalInfoOpen = !personalInfoOpen">
        <div class="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <font-awesome-icon icon="fa-regular fa-user"/>
          Profil
        </div>
        <svg v-if="personalInfoOpen" viewBox="0 0 24 24" class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="18 15 12 9 6 15"></polyline>
        </svg>
        <svg v-else viewBox="0 0 24 24" class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>
      <div v-if="personalInfoOpen" class="mt-3 grid grid-cols-2 gap-3 text-sm">
        <div>
          <div class="text-gray-500">Prénom</div>
          <div class="mt-1 rounded-xl bg-brand-primary/5 px-3 py-2">{{ user.firstname }}</div>
        </div>
        <div>
          <div class="text-gray-500">Nom</div>
          <div class="mt-1 rounded-xl bg-brand-primary/5 px-3 py-2">{{ user.lastname }}</div>
        </div>
        <div class="col-span-2">
          <div class="text-gray-500">Email</div>
          <div class="mt-1 rounded-xl bg-brand-primary/5 px-3 py-2">{{ user.email }}</div>
        </div>
        <div class="col-span-2">
          <div class="text-gray-500">Téléphone</div>
          <div class="mt-1 rounded-xl bg-brand-primary/5 px-3 py-2">{{ user.mobile }}</div>
        </div>
      </div>
    </div>

    <!-- Protocole -->
    <!--div class="card mt-4">
      <div class="flex items-center justify-between cursor-pointer" @click="protocolOpen = !protocolOpen">
        <div class="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <font-awesome-icon icon="fa-regular fa-calendar"/>
          Protocole
        </div>
        <svg v-if="protocolOpen" viewBox="0 0 24 24" class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="18 15 12 9 6 15"></polyline>
        </svg>
        <svg v-else viewBox="0 0 24 24" class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>
      <div v-if="protocolOpen" class="mt-4 space-y-4 text-sm">
        <div>
          <div class="text-gray-500 mb-2">Date début de protocole</div>
          <div class="rounded-xl bg-brand-primary/5 px-3 py-2">{{ protocolStartDate }}</div>
        </div>
        <div>
          <div class="text-gray-500 mb-2">Durée initiale du protocole</div>
          <div class="flex items-end gap-2">
            <input
              v-model.number="protocolDuration"
              type="number"
              min="1"
              class="flex-1 rounded-xl bg-brand-primary/5 px-3 py-2 border-0 focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
            <div class="text-xs text-gray-500 pb-2">semaines</div>
          </div>
        </div>
        <div>
          <div class="text-gray-500 mb-2">Prolongation du protocole</div>
          <select
            v-model.number="protocolExtension"
            class="w-full rounded-xl bg-brand-primary/5 px-3 py-2 border-0 focus:outline-none focus:ring-2 focus:ring-brand-primary text-sm"
          >
            <option value="0">Aucune prolongation</option>
            <option value="4">4 semaines</option>
            <option value="6">6 semaines</option>
            <option value="8">8 semaines</option>
            <option value="12">12 semaines</option>
            <option value="16">16 semaines</option>
            <option value="20">20 semaines</option>
          </select>
        </div>
        <div>
          <div class="text-gray-500 mb-2">Nombre de séances quotidiennes</div>
          <select
            v-model.number="sessionCount"
            class="w-full rounded-xl bg-brand-primary/5 px-3 py-2 border-0 focus:outline-none focus:ring-2 focus:ring-brand-primary text-sm"
          >
            <option value="1">1 séance par jour</option>
            <option value="2">2 séances par jour</option>
          </select>
        </div>
        <div>
          <div class="text-gray-500 mb-2">Durée de la séance</div>
          <select
            v-model="sessionDuration"
            class="w-full rounded-xl bg-brand-primary/5 px-3 py-2 border-0 focus:outline-none focus:ring-2 focus:ring-brand-primary text-sm"
          >
            <option value="20">20 minutes</option>
            <option value="30">30 minutes</option>
            <option value="60">60 minutes</option>
          </select>
        </div>
        <div>
          <div class="text-gray-500 mb-2">Date Rendez vous de contrôle</div>
          <div class="rounded-xl bg-brand-primary/5 px-3 py-2">{{ checkupDate }}</div>
        </div>
        <div>
          <div class="text-gray-500 mb-2">Démarrage évaluation évolution thérapeutique</div>
          <select
            v-model.number="evaluationEvolutionStartWeek"
            class="w-full rounded-xl bg-brand-primary/5 px-3 py-2 border-0 focus:outline-none focus:ring-2 focus:ring-brand-primary text-sm"
          >
            <option value="4">À partir de la semaine 4</option>
            <option value="6">À partir de la semaine 6</option>
            <option value="8">À partir de la semaine 8</option>
          </select>
        </div>
        <div>
          <div class="text-gray-500 mb-2">Fréquence évaluation évolution thérapeutique</div>
          <select
            v-model="evaluationEvolutionFrequency"
            class="w-full rounded-xl bg-brand-primary/5 px-3 py-2 border-0 focus:outline-none focus:ring-2 focus:ring-brand-primary text-sm"
          >
            <option value="Hebdomadaire">Hebdomadaire</option>
            <option value="Bimensuel">Bimensuel</option>
            <option value="Mensuel">Mensuel</option>
          </select>
        </div>
        <div>
          <div class="text-gray-500 mb-2">Date appareil sommeil</div>
          <input
            v-model="deviceSleepDate"
            type="date"
            class="w-full rounded-xl bg-brand-primary/5 px-3 py-2 border-0 focus:outline-none focus:ring-2 focus:ring-brand-primary text-sm"
          />
        </div>
      </div>
    </div-->

    <!-- Matériel -->
    <!--div class="card mt-4">
      <div class="flex items-center justify-between cursor-pointer" @click="tensMaterialOpen = !tensMaterialOpen">
        <div class="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <font-awesome-icon icon="fa-solid fa-kit-medical"/>
          Dispositif Médical
        </div>
        <svg v-if="tensMaterialOpen" viewBox="0 0 24 24" class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="18 15 12 9 6 15"></polyline>
        </svg>
        <svg v-else viewBox="0 0 24 24" class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>
      <div v-if="tensMaterialOpen" class="mt-3 grid grid-cols-2 gap-3 text-sm">
        <div class="col-span-2">
          <div class="text-gray-500">Modèle d'appareil</div>
          <div class="mt-1 rounded-xl bg-orange-50 px-3 py-2 text-brand-primary underline underline-offset-2">{{ deviceModel }}</div>
        </div>
        <div class="col-span-2">
          <div class="text-gray-500">Numéro de série</div>
          <div class="mt-1 rounded-xl bg-orange-50 px-3 py-2">{{ deviceSerial }}</div>
        </div>
      </div>
    </div-->

    <!-- Documents -->
    <div class="card mt-4">
      <div class="flex items-center justify-between cursor-pointer" @click="documentsOpen = !documentsOpen">
        <div class="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <font-awesome-icon icon="fa-regular fa-folder"/>
          <p>Documents</p>
        </div>
        <svg v-if="documentsOpen" viewBox="0 0 24 24" class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="18 15 12 9 6 15"></polyline>
        </svg>
        <svg v-else viewBox="0 0 24 24" class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>
      <div v-if="documentsOpen" class="mt-3 space-y-3 text-sm">
        <div v-if="attestations.length" class="rounded-xl border border-gray-100 bg-white px-3 py-3">
          <div class="mb-2 flex items-center justify-between">
            <div class="text-gray-700 font-semibold">Attestations reçues</div>
            <button class="btn-secondary px-3 py-1" @click="refreshAttestations">Actualiser</button>
          </div>
          <ul class="space-y-2">
            <li v-for="att in attestations" :key="att.id" class="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
              <div class="min-w-0">
                <div class="truncate font-medium text-gray-800">{{ att.fileName }}</div>
                <div class="text-xs text-gray-500">{{ att.method }} • {{ new Date(att.uploadedAt).toLocaleDateString('fr-FR') }} • {{ (att.size/1024).toFixed(1) }} Ko</div>
              </div>
              <button class="btn-secondary px-3 py-1" @click="window.open(att.dataUrl, '_blank')">Voir</button>
            </li>
          </ul>
        </div>
        <div v-else class="rounded-xl border border-gray-100 bg-white px-3 py-3 text-gray-600">
          Aucune attestation déposée pour le moment.
        </div>
    </div>
    </div>




    <div class="card mt-4">
      <div class="flex items-center justify-between cursor-pointer" @click="reloadSoftware">
        <div class="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <font-awesome-icon icon="fa-solid fa-microchip"/>
          <p>Mise à jour logiciel</p>
        </div>
        <div class="text-gray-400">
          {{version}}
        </div>
      </div>
    </div>

    <!-- Log Out Button -->
    <div v-if="user" class="pb-12 mt-4">
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

    <div class="h-24"></div>

  </section>
</template>
