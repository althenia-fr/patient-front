<script setup lang="ts">
import {computed, ref} from 'vue'
import {useRouter} from "vue-router";
import {wrapLocalStorage} from "@/services/storage.service.ts";
import ProfileDocuments from "@/components/profile/ProfileDocuments.vue"
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

const dayOfWeekStartDate  = computed(()=>{
  let startDate = user.value.startDate
  if(startDate) return new Date(startDate).toLocaleDateString('fr-FR', { weekday: 'long' });
  else return null;
})

const startDate  = computed(()=>{
  let startDate2 = user.value.startDate
  if(startDate2) return new Date(startDate2).toLocaleDateString('fr-FR');
  else return null
})

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
        <div class="col-span-2">
          <div class="text-gray-500">Date de Naissance</div>
          <div class="mt-1 rounded-xl bg-brand-primary/5 px-3 py-2">{{ new Date(user.dob).toLocaleDateString('fr-FR') }}</div>
        </div>
        <div class="col-span-2" v-if="dayOfWeekStartDate">
          <div class="text-gray-500 text-justify">Votre traitement ayant commencé le <b>{{ dayOfWeekStartDate }}</b> {{ startDate }}, les semaines de traitement commencent le <b>{{ dayOfWeekStartDate }}</b></div>
        </div>
      </div>
    </div>

    <ProfileDocuments />

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
