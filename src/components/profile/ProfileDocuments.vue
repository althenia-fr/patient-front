<script setup lang="ts">
import { ref, onMounted } from 'vue'
import apiClient from "@/services/apiClient.ts";
import PreviewModal from "@/components/modals/PreviewModal.vue";

const documentsOpen = ref(false)
const documents = ref([])

// --- Gestion de la modale de prévisualisation ---
const isPreviewModalOpen = ref(false)
const selectedDocumentTitle = ref('')
const selectedPreviews = ref([])

function openPreview(doc: any) {
  selectedDocumentTitle.value = doc.metadata || 'Document'

  // On s'assure de trier les pages dans le bon ordre (si besoin)
  let sortedPreviews = (doc.previews || []).slice().sort((a, b) => a.page - b.page)
  selectedPreviews.value = sortedPreviews

  isPreviewModalOpen.value = true
}
// ----------------------------------------------

const fetchDocs = async () => {
  try {
    const response = await apiClient.get('/patient/doc/list')
    documents.value = response.data?.data || response.data || []
  } catch (e) {
    console.error('Failed to fetch docs', e)
  }
}

function openDocument(url: string) {
  window.open(url, '_blank')
}

onMounted(() => {
  fetchDocs()
})
</script>

<template>
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
      <div v-if="documents.length" class="rounded-xl border border-gray-100 bg-white px-3 py-3">
        <ul class="space-y-2">
          <li v-for="doc in documents" :key="doc.sdid" class="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">

            <div class="min-w-0">
              <div class="truncate font-medium text-gray-800">{{doc.metadata }}</div>
              <div class="text-xs text-gray-500">{{ doc.docTypeLabel }} • {{ new Date(doc.creation).toLocaleDateString('fr-FR') }}</div>
            </div>

            <!-- Nouveau conteneur pour aligner les boutons Voir & Télécharger -->
            <div class="flex gap-2 shrink-0 ml-2">
              <button
                  v-if="doc.previews && doc.previews.length > 0"
                  class="btn-secondary px-3 py-1"
                  @click="openPreview(doc)">
                Voir
              </button>

              <button
                  class="btn-secondary px-3 py-1"
                  @click="openDocument(doc.docUrl)">
                Télécharger
              </button>
            </div>

          </li>
        </ul>
      </div>
      <div v-else class="rounded-xl border border-gray-100 bg-white px-3 py-3 text-gray-600">
        Aucun document pour le moment...
      </div>
    </div>
  </div>

  <!-- Intégration de la modale de prévisualisation -->
  <PreviewModal
      :is-open="isPreviewModalOpen"
      :document-title="selectedDocumentTitle"
      :previews="selectedPreviews"
      @close="isPreviewModalOpen = false"
  />

</template>
