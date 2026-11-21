<template>
  <section class="mx-auto w-full px-4 pt-5 pb-24 sm:max-w-md md:max-w-lg lg:max-w-xl">
    <!-- En-tête avec retour -->
    <div class="mb-4 flex items-center gap-3">
      <button
          type="button"
          @click="router.back()"
          class="flex h-10 w-10 items-center justify-center rounded-2xl border border-gray-100 bg-white text-gray-700 hover:bg-gray-50 active:scale-95 transition cursor-pointer"
          aria-label="Retour"
      >
        <i class="fa-solid fa-arrow-left"></i>
      </button>
      <div>
        <h1 class="text-lg font-semibold text-gray-800">Séances sans chrono</h1>
        <p class="text-xs text-gray-500">Indiquez les séances réalisées pour lesquelles vous aviez oublié de lancer le chrono</p>
      </div>
    </div>

    <!-- Liste des 15 derniers jours -->
    <div class="rounded-2xl border border-gray-100 bg-white p-5">
      <div v-if="isLoading" class="flex justify-center py-8">
        <i class="fas fa-spinner fa-spin text-cyan-600 text-xl"></i>
      </div>

      <div v-else class="space-y-2.5">
        <div
            v-for="day in last15Days"
            :key="day.dateKey"
            class="flex items-center justify-between rounded-xl border border-gray-100 bg-cyan-50/60 px-3.5 py-3"
        >
          <!-- Date du jour -->
          <div class="flex flex-col">
            <span class="text-sm font-semibold text-gray-800 capitalize">
              {{ day.label }}
            </span>
            <span v-if="day.badge" class="text-[11px] font-medium text-cyan-700">
              {{ day.badge }}
            </span>
          </div>

          <!-- Contrôles - / compteur / + -->
          <div class="flex items-center gap-3">
            <button
                type="button"
                @click="decrementSession(day.dateKey)"
                :disabled="getCount(day.dateKey) <= 0 || isPending(day.dateKey)"
                class="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-100 active:scale-95 transition cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
                aria-label="Retirer une séance"
            >
              <i class="fa-solid fa-minus text-xs"></i>
            </button>

            <span class="w-6 text-center text-sm font-bold text-gray-800">
              {{ getCount(day.dateKey) }}
            </span>

            <button
                type="button"
                @click="incrementSession(day.dateKey)"
                :disabled="isPending(day.dateKey)"
                class="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-600 text-white hover:bg-cyan-700 active:scale-95 transition cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
                aria-label="Ajouter une séance"
            >
              <i class="fa-solid fa-plus text-xs"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import apiClient from "@/services/apiClient";
import { msgModal } from "@/utils/modals/msg-modal";
import {wrapLocalStorage} from "@/services/storage.service.ts";

const {setSessions} = wrapLocalStorage()

interface DayItem {
  dateKey: string; // Format YYYY-MM-DD
  label: string;   // Ex: "vendredi 20 novembre"
  badge?: string;  // Ex: "Aujourd'hui" / "Hier"
}

const router = useRouter();
const isLoading = ref(true);
const sessionsByDate = ref<Record<string, number>>({});
const pendingDates = ref<Record<string, boolean>>({});

// Formate une Date locale en YYYY-MM-DD sans décalage UTC
const toLocalDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Génère les 15 derniers jours (J à J-14)
const last15Days = computed<DayItem[]>(() => {
  const days: DayItem[] = [];
  const today = new Date();
  const formatter = new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  for (let i = 0; i < 15; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);

    let badge: string | undefined;
    if (i === 0) badge = "Aujourd'hui";
    else if (i === 1) badge = "Hier";

    days.push({
      dateKey: toLocalDateKey(d),
      label: formatter.format(d),
      badge,
    });
  }

  return days;
});

const getCount = (dateKey: string): number => sessionsByDate.value[dateKey] || 0;
const isPending = (dateKey: string): boolean => !!pendingDates.value[dateKey];

// Chargement initial des séances des 15 derniers jours
const fetchSessions = async () => {
  isLoading.value = true;
  try {
    const response = await apiClient.get("/patient/session/history", {
      params: { days: 15 },
    });
    const list = response.data || [];

    const counts: Record<string, number> = {};
    if (Array.isArray(list)) {
      list.forEach((session: any) => {

        if(session.status==='DECLARED' || session.status==='COMPLETED')
        {
          const rawDate = session.sessionDate ;
          if (rawDate) {
            const key = toLocalDateKey(new Date(rawDate));
            counts[key] = (counts[key] || 0) + (session.count ?? 1);
          }
        }

      });
    }
    sessionsByDate.value = counts;
  } catch (error) {
    console.error("Erreur lors du chargement des séances", error);
    msgModal.show(
        "Erreur",
        "Impossible de récupérer l'historique des séances.",
        "OK",
        msgModal.defaultClose
    );
  } finally {
    isLoading.value = false;
  }
};

// Ajouter une séance (+1)
const incrementSession = async (dateKey: string) => {
  if (isPending(dateKey)) return;
  pendingDates.value[dateKey] = true;

  const data = { date: dateKey };

  try {
    const response = await apiClient.post("/patient/session/plus", data);
    sessionsByDate.value[dateKey] = getCount(dateKey) + 1;
    handleUpdateSessionList(response.data);
  } catch (error) {
    console.error("Erreur lors de l'ajout de la séance", error);
    msgModal.show(
        "Erreur",
        "Impossible d'enregistrer cette séance.",
        "OK",
        msgModal.defaultClose
    );
  } finally {
    pendingDates.value[dateKey] = false;
  }
};

function handleUpdateSessionList(dbSessions: any[]) {
  if (!Array.isArray(dbSessions)) return;

  const cacheSessions = dbSessions.map((dbSession) => ({
    pstid: dbSession.pstid,
    pecid: dbSession.pecid,
    sessionRemainingSec: dbSession.sessionRemainingSec,
    sessionMaxSec: dbSession.sessionMaxSec,
    sessionNumber: dbSession.sessionNumber,
    sessionDate: dbSession.sessionDate,
    isCompleted: dbSession.isCompleted,
    isAvailable: dbSession.sessionRemainingSec > 0
  }));

  setSessions(cacheSessions);
}

// Retirer une séance (-1)
const decrementSession = async (dateKey: string) => {
  if (isPending(dateKey) || getCount(dateKey) <= 0) return;
  pendingDates.value[dateKey] = true;

  const data = { date: dateKey };

  try {
    const response = await apiClient.post("/patient/session/minus", data);
    sessionsByDate.value[dateKey] = Math.max(0, getCount(dateKey) - 1);
    handleUpdateSessionList(response.data);
  } catch (error) {
    console.error("Erreur lors de la suppression de la séance", error);
    msgModal.show(
        "Erreur",
        "Impossible de retirer cette séance.",
        "OK",
        msgModal.defaultClose
    );
  } finally {
    pendingDates.value[dateKey] = false;
  }
};

onMounted(() => {
  fetchSessions();
});
</script>
