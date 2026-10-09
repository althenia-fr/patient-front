<template>
  <div class="mx-auto w-full max-w-lg pt-5 pb-24">
    <div class="rounded-2xl border border-gray-100 bg-white p-5 space-y-4">

      <!-- En-tête -->
      <div class="flex items-center justify-between border-b border-gray-100 pb-3">
        <h3 class="text-base font-semibold text-gray-800">Historique</h3>
      </div>

      <!-- Spinner de chargement -->
      <div v-if="isLoading && historyList.length === 0" class="flex justify-center py-8">
        <svg class="h-6 w-6 animate-spin text-brand-primary" viewBox="0 0 24 24" fill="none">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
        </svg>
      </div>

      <!-- État vide -->
      <div v-else-if="historyList.length === 0" class="py-8 text-center text-sm text-gray-400">
        Aucun enregistrement dans l'historique pour le moment.
      </div>

      <!-- Liste des enregistrements -->
      <div v-else class="space-y-2.5">
        <div
            v-for="item in historyList"
            :key="item.mid"
            class="flex items-center justify-between rounded-xl bg-gray-50/80 p-1 border border-gray-100 hover:border-gray-200 transition gap-3"
        >
          <!-- Icône + Infos + Date & Heure -->
          <div class="flex items-center gap-3 min-w-0">
            <!-- Vignette d'icône blanche comme sur le MictionDashboard -->
            <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-white shadow-xs border border-gray-100">
              <component :is="getTypeIcon(item.type)" />
            </div>

            <div class="space-y-0.5 min-w-0">
              <!-- Type & Détail -->
              <div class="flex items-center gap-1.5 flex-wrap">
                <span class="text-xs font-bold text-gray-800">
                  {{ getTypeLabel(item.type) }}
                </span>
                <span v-if="getItemDetails(item)" class="text-xs font-medium text-gray-500">
                  • {{ getItemDetails(item) }}
                </span>
              </div>

            </div>
          </div>


          <!-- Date et Heure sur chaque ligne -->
          <div class="flex items-center gap-1.5 text-xs text-gray-500">
            <i class="fa-regular fa-clock text-[10px] text-gray-400"></i>
            <span v-if="item.creation" class="font-semibold text-gray-700">{{ new Date(item.creation).toLocaleString() }}</span>
          </div>

          <!-- Bouton de suppression -->
          <button
              type="button"
              @click="deleteItem(item)"
              :disabled="deletingId === item.mid"
              class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700 active:scale-95 transition disabled:opacity-50"
              title="Supprimer cet enregistrement"
          >
            <i v-if="deletingId !== item.mid" class="fa-solid fa-trash-can text-sm"></i>
            <svg v-else class="h-4 w-4 animate-spin text-red-500" viewBox="0 0 24 24" fill="none">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
            </svg>
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, h } from 'vue'
import { msgModal } from '@/utils/modals/msg-modal'
import apiClient from "@/services/apiClient.ts";

interface HistoryItem {
  mid: number | string
  type: string
  time?: string
  date?: string
  payload?: any
  [key: string]: any
}

const historyList = ref<HistoryItem[]>([])
const isLoading = ref(false)
const deletingId = ref<number | string | null>(null)

// --- Icônes identiques à MictionDashboard.vue ---

// Icône Image PNG Miction
const IconMiction = () => h('img', {
  src: '/miction.png',
  alt: 'Miction',
  class: 'h-6 w-6 object-contain',
  style: 'filter: drop-shadow(0.4px 0 0 #000) drop-shadow(-0.4px 0 0 #000) drop-shadow(0 0.4px 0 #000) drop-shadow(0 -0.4px 0 #000);'
})

// Icône Goutte d'eau (Fuite)
const IconWater = () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', class: 'h-5 w-5 text-black' }, [
  h('path', { d: 'M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z' })
])

// Icône Tasse de café/thé (Boisson)
const IconCoffee = () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', class: 'h-5 w-5 text-black' }, [
  h('path', { d: 'M18 8h1a4 4 0 0 1 0 8h-1' }),
  h('path', { d: 'M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z' }),
  h('line', { x1: '6', y1: '1', x2: '6', y2: '4' }),
  h('line', { x1: '10', y1: '1', x2: '10', y2: '4' }),
  h('line', { x1: '14', y1: '1', x2: '14', y2: '4' })
])

// Icône Goutte barrée (Protection)
const IconProtection = () => h('svg', {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  'stroke-width': '2',
  'stroke-linecap': 'round',
  'stroke-linejoin': 'round',
  class: 'h-5 w-5 text-black'
}, [
  h('path', { d: 'M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z' }),
  h('line', { x1: '4.5', y1: '4.5', x2: '21.2', y2: '21.2' })
])

// Mapping des icônes selon le type d'événement
const getTypeIcon = (type: string) => {
  switch (type) {
    case 'miction': return IconMiction
    case 'leak':
    case 'fuite': return IconWater
    case 'drink':
    case 'boisson': return IconCoffee
    case 'protect':
    case 'protection': return IconProtection
    default: return IconMiction
  }
}

const getTypeLabel = (type: string) => {
  switch (type) {
    case 'miction': return 'Miction'
    case 'leak':
    case 'fuite': return 'Fuite'
    case 'drink':
    case 'boisson': return 'Boisson'
    case 'protect':
    case 'protection': return 'Protection'
    default: return type
  }
}

const getItemDetails = (item: HistoryItem) => {
  const p = item.payload || item
  if (item.type === 'miction' && p.volume) return `${p.volume} cl`
  if ((item.type === 'leak' || item.type === 'fuite') && p.importance) return `Importance ${p.importance}/3`
  if ((item.type === 'protect' || item.type === 'protection') && (p.weightGrams || p.weight)) return `${p.weightGrams || p.weight} g`
  if (item.type === 'drink' || item.type === 'boisson') {
    const total = (p.water || 0) + (p.sodaJuice || 0) + (p.coffeeTea || 0) + (p.alcohol || 0)
    return total > 0 ? `${total} verre(s)` : ''
  }
  return p.comments || p.remarks || ''
}

// Chargement des enregistrements
const fetchHistory = async () => {
  isLoading.value = true
  try {
    const response = await apiClient.get('/patient/miction/history')
    historyList.value = Array.isArray(response) ? response : (response.data || [])
  } catch (error) {
    console.error('Erreur lors du chargement de l\'historique :', error)
  } finally {
    isLoading.value = false
  }
}

// Suppression avec confirmation modal
const deleteItem = async (item: any ) => {
  let mid = item.mid
  msgModal.show(
      'Effacer un relevé',
      'Voulez-vous vraiment supprimer ce relevé '+getTypeLabel(item.type)+' du '+(new Date(item.creation).toLocaleString())+' ?',
      'Supprimer',
      async () => {
        msgModal.defaultClose()
        deletingId.value = item.mid
        try {
          await apiClient.post('/patient/miction/delete', { mid })
          historyList.value = historyList.value.filter(record => record.mid !== item.mid)
        } catch (error) {
          console.error('Erreur lors de la suppression :', error)
        } finally {
          deletingId.value = null
        }
      },
      'Annuler',
      msgModal.defaultClose,
      true
  )
}

onMounted(() => {
  fetchHistory()
})
</script>
