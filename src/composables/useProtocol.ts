import { ref, computed } from 'vue'
import { getOnboarding, saveOnboarding } from '@/utils/onboarding'

const updateSignal = ref(0)

function triggerUpdate() {
  updateSignal.value += 1
}

export function useProtocol() {
  const protocolDuration = computed({
    get: () => {
      updateSignal.value
      return getOnboarding()?.protocolDuration || 13
    },
    set: (value: number) => {
      const onb = getOnboarding()
      onb.protocolDuration = value
      saveOnboarding(onb)
      triggerUpdate()
    }
  })

  const checkupDate = computed(() => {
    updateSignal.value
    const date = getOnboarding()?.protocolStartDate
    if (!date) return '—'
    const startDate = new Date(date)
    const checkDate = new Date(startDate)
    const duration = protocolDuration.value
    checkDate.setDate(checkDate.getDate() + duration * 7)
    return checkDate.toLocaleDateString('fr-FR')
  })

  return {
    protocolDuration,
    checkupDate
  }
}
