<template>
  <div class="mt-4 rounded-2xl border border-gray-100 bg-white p-5">
    <!-- En-tête du bloc -->
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-semibold text-gray-800">Suivi des mictions</h2>
    </div>

    <!-- Matrice 2x2 des boutons de redirection -->
    <div class="grid grid-cols-2 gap-3">
      <RouterLink
          v-for="card in dashboardCards"
          :key="card.id"
          :to="card.path"
          class="flex flex-col items-center justify-center gap-2 rounded-2xl border border-gray-100 bg-cyan-50 p-4 text-center transition hover:bg-cyan-100 active:scale-[0.97]"
      >
        <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm" :class="card.colorClass">
          <component :is="card.icon" :class="card.iconClass || 'h-8 w-8'" />
        </div>
        <span class="text-xs font-semibold text-gray-800">{{ card.title }}</span>
      </RouterLink>

    </div>

    <div class="grid grid-cols-1 gap-3">
      <RouterLink
          :to="{ name: 'history' }"
          class="mt-4 flex flex-col items-center justify-center gap-2 rounded-2xl border border-gray-100 bg-cyan-50 p-4 text-center transition hover:bg-cyan-100 active:scale-[0.97]"
      >
        <p class="text-xs text-gray-600">
          <span class="text-xs font-semibold text-gray-800">Historique</span>
        </p>
      </RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { h } from 'vue'
import { RouterLink } from 'vue-router'
import {formIdToDisplayName, formIdToRouteName} from "@/types/protocol.types.ts";

// Icône Image PNG Miction (taille h-10 w-10 + trait épaissi)
const IconMiction = () => h('img', {
  src: '/miction.png',
  alt: 'Miction',
  class: 'h-10 w-10 object-contain',
  style: 'filter: drop-shadow(0.4px 0 0 #000) drop-shadow(-0.4px 0 0 #000) drop-shadow(0 0.4px 0 #000) drop-shadow(0 -0.4px 0 #000);'
})

// Icône Goutte d'eau (reprise de Drink.vue)
const IconWater = h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
  h('path', { d: 'M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z' })
])

// Icône Tasse de café/thé (reprise de Drink.vue)
const IconCoffee = h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
  h('path', { d: 'M18 8h1a4 4 0 0 1 0 8h-1' }),
  h('path', { d: 'M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z' }),
  h('line', { x1: '6', y1: '1', x2: '6', y2: '4' }),
  h('line', { x1: '10', y1: '1', x2: '10', y2: '4' }),
  h('line', { x1: '14', y1: '1', x2: '14', y2: '4' })
])

// Icône Goutte barrée (Protection)
const IconProtection = h('svg', {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  'stroke-width': '2',
  'stroke-linecap': 'round',
  'stroke-linejoin': 'round'
}, [
  // Contour de la goutte
  h('path', { d: 'M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z' }),
  // Barre oblique (dépassement égalisé en haut à gauche et bas à droite)
  h('line', { x1: '4.5', y1: '4.5', x2: '21.2', y2: '21.2' })
])

// Cartes de la matrice 2x2
const dashboardCards = [
  {
    id: 'miction',
    title: 'Miction',
    path: '/miction',
    icon: IconMiction,
    iconClass: 'h-10 w-10',
    colorClass: 'text-black'
  },
  {
    id: 'leak',
    title: 'Fuite',
    path: '/leak',
    icon: IconWater,
    iconClass: 'h-8 w-8',
    colorClass: 'text-black'
  },
  {
    id: 'drink',
    title: 'Boisson',
    path: '/drink',
    icon: IconCoffee,
    iconClass: 'h-8 w-8',
    colorClass: 'text-black'
  },
  {
    id: 'protect',
    title: 'Protections',
    path: '/protect',
    icon: IconProtection,
    iconClass: 'h-8 w-8',
    colorClass: 'text-black'
  }
]
</script>
