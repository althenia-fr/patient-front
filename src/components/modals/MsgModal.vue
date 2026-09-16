<template>
  <Transition name="modal-fade">
    <div v-if="msgModal.isOpen" class="modal-overlay">

      <div class="modal-content">
        <h3 :class="txtDanger" :style="txtColor">{{ msgModal.title }}</h3>

        <p class="modal-message" style="text-align: justify;" v-html="msgModal.message"></p>

        <hr class="modal-divider" v-if="msgModal.buttonLabel1"/>

        <div class="modal-actions">
          <button
              v-if="msgModal.buttonLabel1"
              @click="msgModal.onclick1()"
              :class="['btn', btnDanger || 'btn-primary']"
              :disabled="msgModal.isButton1Disabled"
          >
            {{ msgModal.buttonLabel1 }}
          </button>

          <button
              v-if="msgModal.buttonLabel2"
              @click="msgModal.onclick2()"
              class="btn btn-secondary"
              :style="bkColor"
          >
            {{ msgModal.buttonLabel2 }}
          </button>
        </div>

      </div>

    </div>
  </Transition>
</template>

<script setup>
import { msgModal } from '@/utils/modals/msg-modal.ts';
import {computed} from "vue";

const btnDanger = computed(() => msgModal.danger?'btn-danger':'btn-primary')
const txtDanger = computed(() => msgModal.danger?'txt-danger':'')
const bkColor = computed(() => msgModal.button2Color?'background-color:'+msgModal.button2Color:'')
const txtColor = computed(() => msgModal.button2Color?'color:'+msgModal.button2Color:'')

</script>


<style scoped>
@import '@/assets/modal.css';
@import '@/assets/views.css';

</style>
