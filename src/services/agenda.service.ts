import { computed } from "vue";
import { wrapLocalStorage } from "@/services/storage.service.ts";

const { protocol } = wrapLocalStorage();

export const daysElapsed = computed(() => {
  if (protocol.value && protocol.value.startDate) {
    const date = protocol.value.startDate;
    const msPerDay = 24 * 60 * 60 * 1000;
    const startDay = new Date(
        new Date(date).getFullYear(),
        new Date(date).getMonth(),
        new Date(date).getDate()
    ).getTime();
    const today = new Date();
    const todayDay = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
    ).getTime();
    return Math.max(1, Math.floor((todayDay - startDay) / msPerDay) + 1);
  } else {
    return 1;
  }
});

export const currentWeek = computed(() => {
  return Math.ceil(daysElapsed.value / 7);
});

export function getAgendaForCurrentWeek(wk: number, forms: any[] = []): string[] {
  if (!Array.isArray(forms) || forms.length === 0) {
    return [];
  }

  const weekConfig =
      forms.find((w: any) => String(w.weekNumber) === String(wk)) || forms[wk - 1];

  if (!weekConfig || !Array.isArray(weekConfig.forms)) {
    return [];
  }

  return weekConfig.forms
      .filter((f: any) => !f.submissions || f.submissions.length === 0)
      .map((f: any) => f.formType);
}
