<script setup lang="ts">
import { ref, computed } from 'vue'

const q = ref('')
const guideUrl = 'https://cdn.builder.io/o/assets%2Ff2976922c6674ae58e827df6ab219826%2Fedf2d560b16d4d6eaca377ed0ba0e7fa?alt=media&token=4406e633-2425-422e-bddd-9c623509127a&apiKey=f2976922c6674ae58e827df6ab219826'
const items = [
  { q: "Comment démarrer une séance TENS ?", a: "Positionnez l'appareil sur la cheville (nerf tibial postérieur), allumez-le, puis lancez le traitement de 20 minutes. Augmentez l'intensité jusqu'aux légers picotements sous le pied, puis redescendez au confort." },
  { q: "Où placer correctement l'appareil ?", a: "Sur la face interne de la cheville: l'électrode basse près de la malléole interne, l'appareil orienté vers le haut le long de la jambe. Serrez la sangle sans excès." },
  { q: "Quelle intensité et quelle durée utiliser ?", a: "Le programme dure 20 minutes automatiquement. Réglez l'intensité à votre niveau de confort (sans douleur). Les LED indiquent la plage atteinte." },
  { q: "Quand remplacer les électrodes et comment entretenir ?", a: "Nettoyez les électrodes à l'eau tiède 1 fois par semaine en usage quotidien. Remplacez-les si usées. Essuyez l'appareil après usage; ne pas le plonger dans l'eau." },
  { q: "Quelles sont les contre-indications ?", a: "Ne pas utiliser en cas de pacemaker/défibrillateur ou implant électronique, implant métallique proche, grossesse, peau lésée ou affection cutanée sur la zone. En cas de doute, consultez votre médecin." },
  { q: "Que faire si ça picote trop ou si les bips s'enchaînent ?", a: "Ajoutez un peu de gel conducteur, vérifiez le bon contact peau/électrodes et repositionnez l'appareil. En cas de déconnexion, l'intensité retombe à 0: relancez le réglage." },
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
