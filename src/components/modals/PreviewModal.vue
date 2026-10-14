<template>
  <Transition name="modal-fade">
    <div v-if="isOpen" class="modal-overlay">

      <div class="modal-content" style="max-width: 600px; width: 90%;">
        <h3>{{ documentTitle || 'Aperçu du document' }}</h3>

        <div class="modal-message preview-container">
          <!-- Image de prévisualisation -->
          <div class="image-wrapper">
            <img
                v-if="currentPreview"
                :src="currentPreview.previewUrl"
                alt="Aperçu de la page"
                class="preview-image"
            />
            <div v-else class="text-gray-500 py-10 text-center">
              Aperçu indisponible.
            </div>
          </div>

          <!-- Contrôles de pagination (visibles uniquement s'il y a plus d'une page) -->
          <div v-if="totalPages > 1" class="pagination-controls">
            <button
                @click="prevPage"
                class="nav-btn"
                :disabled="currentPageIndex === 0"
            >
              <font-awesome-icon icon="fa-solid fa-chevron-left"/>
            </button>

            <span class="page-indicator">
              Page {{ currentPreview?.page || (currentPageIndex + 1) }} sur {{ totalPages }}
            </span>

            <button
                @click="nextPage"
                class="nav-btn"
                :disabled="currentPageIndex === totalPages - 1"
            >
              <font-awesome-icon icon="fa-solid fa-chevron-right"/>
            </button>
          </div>
        </div>

        <hr class="modal-divider"/>

        <div class="modal-actions">
          <button @click="close" class="btn btn-primary">
            OK
          </button>
        </div>

      </div>

    </div>
  </Transition>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  documentTitle: {
    type: String,
    default: ''
  },
  previews: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['close']);

// Pagination state
const currentPageIndex = ref(0);

// Computed properties
const totalPages = computed(() => props.previews?.length || 0);
const currentPreview = computed(() => {
  if (totalPages.value > 0) {
    return props.previews[currentPageIndex.value];
  }
  return null;
});

// Navigation functions
function nextPage() {
  if (currentPageIndex.value < totalPages.value - 1) {
    currentPageIndex.value++;
  }
}

function prevPage() {
  if (currentPageIndex.value > 0) {
    currentPageIndex.value--;
  }
}

// Close and reset modal
function close() {
  currentPageIndex.value = 0; // Remise à zéro pour la prochaine ouverture
  emit('close');
}
</script>

<style scoped>
@import '@/assets/modal.css';
@import '@/assets/views.css';

.preview-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
}

.image-wrapper {
  width: 100%;
  min-height: 200px;
  max-height: 60vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}

.preview-image {
  max-width: 100%;
  max-height: 60vh;
  object-fit: contain;
}

.pagination-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  width: 100%;
}

.nav-btn {
  background-color: white;
  border: 1px solid #cbd5e1;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #475569;
  transition: all 0.2s;
}

.nav-btn:hover:not(:disabled) {
  background-color: #f1f5f9;
  color: #0f172a;
}

.nav-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background-color: #f8fafc;
}

.page-indicator {
  font-size: 0.875rem;
  font-weight: 500;
  color: #64748b;
}

/* Surcharge optionnelle si nécessaire pour la modal-actions héritée */
.modal-actions {
  justify-content: center; /* Centrer le bouton OK si souhaité */
}
</style>
