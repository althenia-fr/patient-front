<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Card from '@/components/Card.vue'

interface Provider { id:number; name:string; role:string; contact:string }
const providers: Provider[] = [
  { id:1, name:'Dr. Martin', role:'Médecin', contact:'martin@exemple.fr' },
  { id:2, name:'Sophie Durand', role:'Kinésithérapeute', contact:'s.durand@exemple.fr' },
]

interface Msg { id:string; from:'me'|'pro'; text:string; at:string }
const msgs = ref<Msg[]>([])
const input = ref('')

function read(){ try { return JSON.parse(localStorage.getItem('chat')||'') as Msg[] } catch { return [] } }
function write(v: Msg[]){ localStorage.setItem('chat', JSON.stringify(v)) }

onMounted(()=>{ msgs.value = read() })

function send(){
  if(!input.value.trim()) return
  const m: Msg = { id: crypto.randomUUID(), from:'me', text: input.value, at: new Date().toISOString() }
  msgs.value = [...msgs.value, m]
  write(msgs.value)
  input.value = ''
}
</script>

<template>
  <section class="mx-auto max-w-md px-4 py-6">
    <h2 class="mb-3 text-xl font-bold">Intervenants</h2>

    <Card title="Équipe">
      <div class="divide-y">
        <div v-for="p in providers" :key="p.id" class="flex items-center justify-between py-2 text-sm">
          <div>
            <div class="font-semibold">{{ p.name }}</div>
            <div class="text-gray-500">{{ p.role }}</div>
          </div>
          <a class="text-brand-primary font-semibold" :href="`mailto:${p.contact}`">Contacter</a>
        </div>
      </div>
    </Card>

    <Card class="mt-4" title="Messagerie (démo)">
      <div class="h-60 overflow-y-auto rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
        <div v-for="m in msgs" :key="m.id" class="mb-2">
          <div :class="m.from==='me' ? 'text-right' : 'text-left'">
            <span class="inline-block max-w-[80%] rounded-2xl px-3 py-2 text-sm" :class="m.from==='me' ? 'bg-brand-primary text-white' : 'bg-white dark:bg-gray-700'">{{ m.text }}</span>
          </div>
        </div>
      </div>
      <div class="mt-2 flex gap-2">
        <input v-model="input" class="flex-1 rounded-xl border border-gray-200 p-3 text-sm" placeholder="Écrire un message…" />
        <button class="btn-primary" @click="send">Envoyer</button>
      </div>
    </Card>
  </section>
</template>
