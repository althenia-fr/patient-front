<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'

const props = withDefaults(defineProps<{
  open: boolean
  title?: string
}>(), { title: 'Scanner le QR code' })
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'detected', value: string): void
}>()

const video = ref<HTMLVideoElement | null>(null)
const stream = ref<MediaStream | null>(null)
const running = ref(false)
const manual = ref('')
const supported = typeof (window as any).BarcodeDetector !== 'undefined'
let raf = 0
let detector: any

async function start() {
  if (!props.open) return
  if (!supported) return
  try {
    detector = new (window as any).BarcodeDetector({ formats: ['qr_code'] })
    stream.value = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
    if (video.value && stream.value) {
      video.value.srcObject = stream.value
      await video.value.play()
      running.value = true
      tick()
    }
  } catch {}
}

function stop() {
  running.value = false
  cancelAnimationFrame(raf)
  if (stream.value) {
    stream.value.getTracks().forEach(t => t.stop())
    stream.value = null
  }
}

async function tick() {
  if (!running.value || !video.value || !detector) return
  try {
    const codes = await detector.detect(video.value)
    if (codes && codes.length) {
      const val = codes[0].rawValue || ''
      emit('detected', val)
      close()
      return
    }
  } catch {}
  raf = requestAnimationFrame(tick)
}

function close() { stop(); emit('close') }
function associate() { if (manual.value.trim()) { emit('detected', manual.value.trim()); close() } }

watch(() => props.open, (v) => { if (v) start(); else stop() })

onMounted(() => { if (props.open) start() })
onUnmounted(stop)
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-[10000] grid place-items-center bg-black/40 p-4">
    <div class="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-4 shadow-soft">
      <div class="mb-2 text-lg font-semibold text-gray-900">{{ title }}</div>
      <div class="mb-2 overflow-hidden rounded-lg bg-gray-700">
        <video ref="video" class="block h-48 w-full object-cover" playsinline muted></video>
      </div>
      <p v-if="!supported" class="mb-2 text-xs text-gray-500">Le scan natif n’est pas disponible sur cet appareil. Saisissez le code manuellement.</p>
      <input v-model="manual" class="w-full rounded-xl border border-gray-300 p-3" placeholder="Code TENS" />
      <div class="mt-3 flex justify-end gap-2">
        <button class="rounded-full bg-gray-100 px-4 py-2 font-semibold" @click="close">Annuler</button>
        <button class="btn-primary" @click="associate">Associer</button>
      </div>
    </div>
  </div>
</template>
