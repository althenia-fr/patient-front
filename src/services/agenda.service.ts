import {computed} from "vue";

import {wrapLocalStorage} from "@/services/storage.service.ts";
const {protocol} = wrapLocalStorage()

export const daysElapsed = computed(() => {

  if(protocol.agenda && protocol.agenda.startDate)
  {
    const date = protocol.agenda.startDate
    const msPerDay = 24*60*60*1000
    const startDay = new Date(new Date(date).getFullYear(), new Date(date).getMonth(), new Date(date).getDate()).getTime()
    const today = new Date();
    const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()
    return Math.max(1, Math.floor((todayDay - startDay)/msPerDay) + 1)
  }
  else return 1;
})

export const currentWeek = computed(() => {
  return Math.ceil(daysElapsed.value / 7)
})


export function getCurrentWeekForms(currentWeek: number): string[]
{
  if(protocol.value && protocol.value.agenda) return protocol.value.agenda.find(week => week.weekNumber === currentWeek)
  else return []
}

