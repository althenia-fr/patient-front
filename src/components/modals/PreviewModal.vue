<template>
  <Transition name="modal-fade">
    <!-- On ajoute la classe "preview-overlay" pour contrôler l'espacement externe -->
    <div v-if="isOpen" class="modal-overlay preview-overlay">

      <div class="modal-content custom-modal">
        <h3>{{ documentTitle || 'Aperçu du document' }}</h3>

        <div class="modal-message preview-container">

          <div class="image-scroll-wrapper">
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

const currentPageIndex = ref(0);

const totalPages = computed(() => props.previews?.length || 0);
const currentPreview = computed(() => {
  if (totalPages.value > 0) {
    return props.previews[currentPageIndex.value];
  }
  return null;
});

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

function close() {
  currentPageIndex.value = 0;
  emit('close');
}
</script>

<style scoped>
@import '@/assets/modal.css';
@import '@/assets/views.css';

/* 1. L'overlay gère l'espacement avec les bords de l'écran */
.preview-overlay {
  box-sizing: border-box;
  padding-bottom: 100px !important; /* Protège l'espace de ton footer de navigation */
  padding-top: 30px !important; /* Marge de respiration en haut */
}

/* 2. La modale prend tout l'espace restant */
.custom-modal {
  width: 80vw !important;
  max-width: 1200px !important;
  height: 100%; /* S'étire au maximum de l'espace autorisé par l'overlay */
  max-height: 100%;
  display: flex;
  flex-direction: column;
  padding-bottom: 1rem;
}

.preview-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
  flex-grow: 1;
  min-height: 0;
}

.image-scroll-wrapper {
  width: 100%;
  flex-grow: 1;
  overflow-y: auto;
  overflow-x: hidden;
  border: 1px solid var(--stimeo-border, #e2e8f0);
  border-radius: 6px;
  background-color: #ffffff;
}

.preview-image {
  width: 100%;
  height: auto;
  display: block;
}

.pagination-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  width: 100%;
  flex-shrink: 0;
}

.nav-btn {
  background-color: white;
  border: 1px solid #cbd5e1;
  border-radius: 50%;
  width: 36px;
  height: 36px;
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
  font-weight: 600;
  color: #64748b;
}

.modal-actions {
  justify-content: center;
  flex-shrink: 0;
  margin-top: 0;
}
</style>
