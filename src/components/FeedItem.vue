<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  image: string
  title: string
  excerpt: string
  posted: string
  to?: any
  flat?: boolean
}

const props = defineProps<Props>()
const vote = ref<0 | -1 | 1>(0)

// Image rendering improvements
const imgSrc = ref<string>(props.image)
const fallback =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96"><defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#f3f4f6"/><stop offset="1" stop-color="#e5e7eb"/></linearGradient></defs><rect width="96" height="96" rx="12" fill="url(#g)"/><g fill="#9ca3af"><circle cx="36" cy="40" r="10"/><path d="M12 76c6-10 14-18 22-18s12 6 20 6 14-8 22-12 8 0 8 0v24z"/></g></svg>`
  )

function onImgError() {
  if (imgSrc.value !== fallback) imgSrc.value = fallback
}

watch(
  () => props.image,
  (v) => {
    imgSrc.value = v || fallback
  }
)

function upvote() {
  vote.value = vote.value === 1 ? 0 : 1
}
function downvote() {
  vote.value = vote.value === -1 ? 0 : -1
}
</script>

<template>
  <article :class="props.flat ? 'flex gap-4 py-4' : 'card flex gap-4'">
    <img :src="imgSrc" :alt="props.title" class="h-24 w-24 flex-none rounded-xl object-cover"
         loading="lazy" decoding="async" @error="onImgError" width="96" height="96" />
    <div class="min-w-0 flex-1">
      <h3 class="text-base font-bold text-brand-primary">{{ props.title }}</h3>
      <p class="mt-1 text-sm text-gray-600 dark:text-gray-300">{{ props.excerpt }}</p>
      <div class="mt-3 flex items-center justify-between text-xs text-gray-500">
        <div class="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 dark:border-gray-700 dark:bg-gray-800">
          <span class="font-semibold text-gray-700 dark:text-gray-200">Vote</span>
          <button type="button" @click="upvote" :aria-pressed="vote === 1" class="grid h-7 w-7 place-items-center rounded-full transition active:scale-95 text-brand-yellow"
            :class="vote === 1 ? 'bg-brand-yellow/20' : 'hover:bg-brand-yellow/10 dark:hover:bg-gray-700'">
            <svg viewBox="0 0 24 24" class="h-4 w-4" fill="currentColor" aria-hidden="true">
              <path d="M2 14h4v8H2z"/><path d="M22 10a2 2 0 0 0-2-2h-5.31l.95-4.58a1.5 1.5 0 0 0-2.69-1.12L9 9H6v13h11a2 2 0 0 0 2-1.72l1-8A2 2 0 0 0 22 10z"/>
            </svg>
          </button>
          <button type="button" @click="downvote" :aria-pressed="vote === -1" class="grid h-7 w-7 place-items-center rounded-full transition active:scale-95 text-brand-yellow"
            :class="vote === -1 ? 'bg-brand-yellow/20' : 'hover:bg-brand-yellow/10 dark:hover:bg-gray-700'">
            <svg viewBox="0 0 24 24" class="h-4 w-4" fill="currentColor" aria-hidden="true">
              <path d="M2 2h4v8H2z"/><path d="M22 14a2 2 0 0 1-2 2h-5.31l.95 4.58A1.5 1.5 0 0 1 13.95 22L9 15H6V2h11a2 2 0 0 1 2 1.72l1 8A2 2 0 0 1 22 14z"/>
            </svg>
          </button>
        </div>
        <div class="flex items-center gap-2">
          <RouterLink :to="props.to || { name: 'faq' }" :aria-label="`Ouvrir l'article: ${props.title}`" class="grid h-8 w-8 place-items-center rounded-full border border-brand-primary text-brand-primary hover:bg-brand-primary/10 transition">
            <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M14 3h7v7"/><path d="M10 14 21 3"/><path d="M21 14v7h-7"/><path d="M3 10l11 11"/>
            </svg>
          </RouterLink>
        </div>
      </div>
    </div>
  </article>
</template>
