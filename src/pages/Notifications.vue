<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

interface Notif { id: number; title: string; text: string; type: 'warning' | 'info' | 'success' | 'danger'; time: string; to: any }
const items = ref<Notif[]>([
  { id: 1, title: 'Séance TENS ce matin', text: 'Votre séance du jour prévue à 10:00', type: 'warning', time: 'NOUV', to: { name: 'protocol-detail', params: { id: 1 } } },
  { id: 2, title: 'Bilan hebdomadaire', text: 'Nouveau bilan à remplir cette fin de semaine.', type: 'info', time: 'NOUV', to: { name: 'questionnaire-results' } },
  { id: 3, title: 'Séance réussie', text: 'Félicitations ! Séance terminée avec succès.', type: 'success', time: 'HIER', to: { name: 'protocol-results' } },
  { id: 4, title: 'Remplacement d’électrodes', text: 'Certains électrodes doivent être bientôt renouvelés (30%).', type: 'danger', time: '7j', to: { name: 'providers' } },
])

function markAllRead() {
  localStorage.setItem('unread_notifications', '0')
}

const router = useRouter()
function close(){ router.back() }

onMounted(() => {
  const count = items.value.filter(i => i.time === 'NOUV').length
  localStorage.setItem('unread_notifications', String(count))
})
</script>

<template>
  <section class="mx-auto max-w-md px-4 py-6">
    <div class="mb-2 flex items-center justify-between">
      <h2 class="text-xl font-bold">Notifications</h2>
      <div class="flex items-center gap-2">
        <button type="button" @click="markAllRead" class="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-700 shadow-soft hover:bg-gray-50">Marquer tout lu</button>
        <button type="button" @click="close" class="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-700 shadow-soft hover:bg-gray-50">Fermer</button>
      </div>
    </div>
    <div class="relative mt-5 flex flex-col h-6 sm:h-[200px]"></div>
    <div class="space-y-3">
      <RouterLink v-for="n in items" :key="n.id" :to="n.to" class="block rounded-2xl border p-4 shadow-soft no-underline"
           :class="{
             'border-gray-100 bg-white': true
           }">
        <div class="flex items-start justify-between gap-3">
          <div>
            <div class="font-semibold text-gray-800">{{ n.title }}</div>
            <div class="text-sm text-gray-600">{{ n.text }}</div>
          </div>
          <span class="rounded-full bg-white/70 px-2 py-1 text-xs font-semibold text-gray-600">{{ n.time }}</span>
        </div>
      </RouterLink>
    </div>
  </section>
</template>
