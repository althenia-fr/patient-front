<script setup lang="ts">
import { ref, computed } from 'vue'

const q = ref('')


const items = [
  { q: "Comment démarrer une séance TENS ?", a: "Positionnez l'appareil sur la cheville (nerf tibial postérieur), allumez-le, puis lancez le traitement de 20 minutes. Augmentez l'intensité jusqu'aux légers picotements sous le pied, puis redescendez au confort." },
  { q: "Où placer correctement l'appareil ?", a: "Sur la face interne de la cheville: l'électrode basse près de la malléole interne, l'appareil orienté vers le haut le long de la jambe." },
  { q: "Quelle intensité et quelle durée utiliser ?", a: "Le programme dure 20 minutes automatiquement. Augmentez l'intensité jusqu'à ressentir de légers fourmillements sous le pied (cela entraîne parfois une flexion du gros orteil). Quand vous atteignez ce seuil, redescendez l'intensité légèrement jusqu'à retrouver une sensation de confort." },
  { q: "Comment utiliser les électrodes autocollantes?", a: "Replacez les électrodes autocollantes après chaque séance sur leur support et conservez-les au frais (moins de 25°C; placez-les au réfrigérateur si nécessaire). Evitez les crêmes hydratantes ou les gels douche surgras sur la zone de la cheville où vous positionnez les électrodes. Remplacez-les au bout d'un mois d'utilisation ou si elles ne collent plus. L'assurance maladie prend en charge un pack annuel de 5 sachets d'électrodes (exception: en cas de traitement pour douleurs chroniques, 1 sachet tous les 15 jours pris en charge)." },
  { q: "Comment utiliser les électrodes avec gel conducteur?", a: "Nettoyez les électrodes à l'eau tiède et au savon après usage. Essuyez-les avec un tissu ou un papier absorbant. Remplacez-les si usées." },
  { q: "Avec les électrodes à gel conducteur, que faire si ça picote trop ou si les bips s'enchaînent ?", a: "Ajoutez un peu de gel conducteur, vérifiez le bon contact peau/électrodes et repositionnez l'appareil. En cas de déconnexion, l'intensité retombe à 0: relancez le réglage." },
  { q: "Comment entretenir l'appareil ?", a: "Ne pas le plonger dans l'eau. Rechargez l'appareil tous les 10 à 15 jours. Ne pas le recharger après chaque séance. Ne pas le charger en cours de séance." },
  { q: "Quelles sont les contre-indications ?", a: "Ne pas utiliser en cas de pacemaker/défibrillateur ou implant électronique, implant métallique proche, grossesse, peau lésée ou affection cutanée sur la zone. En cas de doute, consultez votre médecin." },
]
const filtered = computed(() => items.filter(i => i.q.toLowerCase().includes(q.value.toLowerCase())))
const open = ref<number | null>(0)
</script>

<template>
  <section class="mx-auto max-w-md px-4 py-6">
    <!-- Header like provided model -->
    <div class="mb-4">
      <h1 class="text-lg font-extrabold">Nous sommes là pour vous aider</h1>
      <p class="text-sm text-gray-500">Trouvez votre réponse ici ou contactez-nous.</p>
    </div>

    <!-- FAQ list -->
    <div class="space-y-2">
      <div v-for="(item, idx) in filtered" :key="idx" class="rounded-xl border border-gray-100 bg-white p-3 shadow-soft">
        <button class="flex w-full items-center justify-between text-left" @click="open = open===idx ? null : idx">
          <span class="font-semibold">{{ item.q }}</span>
          <span class="text-brand-primary">{{ open===idx ? '−' : '+' }}</span>
        </button>
        <p v-if="open===idx" class="mt-2 text-sm text-gray-600">{{ item.a }}</p>
      </div>
    </div>
    <div class="h-24"></div>
  </section>
</template>
