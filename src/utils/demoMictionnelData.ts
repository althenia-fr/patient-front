import { getOnboarding } from './onboarding'

interface MictionData {
  time: string
  volume: number
  urge: 0 | 1 | 2 | 3
  particularities: string[]
  circumstances: string[]
  precautionDetails: string[]
}

interface LeakData {
  time: string
  intensity: '+' | '++' | '+++' | ''
  circumstances: string[]
  otherText: string
}

interface HydricIntakeEntry {
  time: string
  drinkType: string
  quantity: number
  otherDrink: string
}

interface DayResult {
  date: string
  mictions: MictionData[]
  leaks: LeakData[]
  hydricIntakes: HydricIntakeEntry[]
  totalUrine: number
  totalLeaks: number
}

const drinkTypes = ['Café', 'Thé', 'Eau', 'Eau gazeuse', 'Soda', 'Vin blanc', 'Bière']
const mictionParticularities = [
  'Jet urinaire interrompu ou miction en plusieurs fois ("stop-pipi")',
  'Nécessité de pousser pour déclencher le jet',
  'Nécessité de pousser pour éliminer les dernières gouttes',
  'Gouttes d\'urines résiduelles après le pipi',
]
const leakCircumstances = ['Toux', 'Marche', 'Petit effort', 'Effort moyen', 'Gros effort', 'Je n\'ai rien ressenti (insensible)']
const mictionCircumstances = ['N = Normal', 'P = Précaution', 'I = Imperiosité', 'D = Dysurie / miction difficile']
const precautionDetails = ['Envie forte', 'Lourdeur au bas ventre', 'Douleur au bas ventre', 'Sueurs froides', 'Tremblements']

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function getRandomTime(): string {
  const hours = String(getRandomInt(6, 23)).padStart(2, '0')
  const minutes = String(getRandomInt(0, 59)).padStart(2, '0')
  return `${hours}:${minutes}`
}

function generateMictions(dayIndex: number, weekIndex: number): MictionData[] {
  const mictionCount = getRandomInt(4, 8)
  const mictions: MictionData[] = []
  const baseTime = 6 * 60 // Start at 6 AM
  const availableMinutes = 17 * 60 // 6 AM to 11 PM

  for (let i = 0; i < mictionCount; i++) {
    const minuteOffset = Math.floor((availableMinutes / (mictionCount + 1)) * (i + 1))
    const hours = Math.floor((baseTime + minuteOffset) / 60)
    const minutes = (baseTime + minuteOffset) % 60
    const time = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`

    // Improve over time (reduce volume and urge as therapy progresses)
    const improvementFactor = Math.min(1, weekIndex / 26)
    const baseVolume = 300
    const baseUrge = 2

    const volume = Math.max(100, baseVolume - Math.round(improvementFactor * 150) + getRandomInt(-50, 50))
    const urge = Math.max(0, baseUrge - Math.round(improvementFactor * 1)) as 0 | 1 | 2 | 3

    // Add particularities with decreasing probability over time
    const hasParticularities = Math.random() < (0.3 - improvementFactor * 0.2)
    const particularities: string[] = []
    if (hasParticularities) {
      const count = getRandomInt(1, 2)
      for (let j = 0; j < count; j++) {
        const particular = mictionParticularities[getRandomInt(0, mictionParticularities.length - 1)]
        if (!particularities.includes(particular)) {
          particularities.push(particular)
        }
      }
    }

    // Add circumstances
    const circumstances: string[] = []
    const circumstanceProb = Math.random()
    if (circumstanceProb < 0.2) {
      circumstances.push('P = Précaution')
    } else if (circumstanceProb < 0.4) {
      circumstances.push('I = Imperiosité')
    } else if (circumstanceProb < 0.6) {
      circumstances.push('D = Dysurie / miction difficile')
    } else {
      circumstances.push('N = Normal')
    }

    // Add precaution details if precaution was selected
    const precautionDetails_selected: string[] = []
    if (circumstances.includes('P = Précaution')) {
      const count = getRandomInt(1, 3)
      for (let j = 0; j < count; j++) {
        const detail = precautionDetails[getRandomInt(0, precautionDetails.length - 1)]
        if (!precautionDetails_selected.includes(detail)) {
          precautionDetails_selected.push(detail)
        }
      }
    }

    mictions.push({
      time,
      volume,
      urge,
      particularities,
      circumstances,
      precautionDetails: precautionDetails_selected,
    })
  }

  return mictions
}

function generateLeaks(dayIndex: number, weekIndex: number): LeakData[] {
  // Leaks decrease over time (improvement with therapy)
  const improvementFactor = Math.min(1, weekIndex / 26)
  const leakProbability = Math.max(0.1, 0.5 - improvementFactor * 0.4)

  const leaks: LeakData[] = []
  if (Math.random() < leakProbability) {
    const leakCount = getRandomInt(0, Math.max(1, 3 - Math.round(improvementFactor * 2)))

    for (let i = 0; i < leakCount; i++) {
      const intensityRandom = Math.random()
      let intensity: '+' | '++' | '+++' | '' = ''
      if (improvementFactor < 0.5) {
        intensity = intensityRandom < 0.3 ? '+++' : intensityRandom < 0.6 ? '++' : '+'
      } else {
        intensity = intensityRandom < 0.4 ? '+' : intensityRandom < 0.9 ? '+' : ''
      }

      leaks.push({
        time: getRandomTime(),
        intensity,
        circumstances: [leakCircumstances[getRandomInt(0, leakCircumstances.length - 1)]],
        otherText: '',
      })
    }
  }

  return leaks
}

function generateHydricIntakes(dayIndex: number, weekIndex: number): HydricIntakeEntry[] {
  const intakeCount = getRandomInt(3, 6)
  const intakes: HydricIntakeEntry[] = []
  const baseTime = 6 * 60 // Start at 6 AM
  const availableMinutes = 17 * 60 // 6 AM to 11 PM

  for (let i = 0; i < intakeCount; i++) {
    const minuteOffset = Math.floor((availableMinutes / (intakeCount + 1)) * (i + 1))
    const hours = Math.floor((baseTime + minuteOffset) / 60)
    const minutes = (baseTime + minuteOffset) % 60
    const time = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`

    const drinkType = drinkTypes[getRandomInt(0, drinkTypes.length - 1)]
    const quantities = [100, 150, 200, 250, 330, 500]
    const quantity = quantities[getRandomInt(0, quantities.length - 1)]

    intakes.push({
      time,
      drinkType,
      quantity,
      otherDrink: '',
    })
  }

  return intakes
}

function generateDayData(date: string, dayIndex: number, weekIndex: number): DayResult {
  const mictions = generateMictions(dayIndex, weekIndex)
  const leaks = generateLeaks(dayIndex, weekIndex)
  const hydricIntakes = generateHydricIntakes(dayIndex, weekIndex)

  const totalUrine = mictions.reduce((sum, m) => sum + m.volume, 0)
  const totalLeaks = leaks.length

  return {
    date,
    mictions,
    leaks,
    hydricIntakes,
    totalUrine,
    totalLeaks,
  }
}

export function seedDemoMictionnelData() {
  const onb = getOnboarding()
  const protocolStartDate = onb?.protocolStartDate ? new Date(onb.protocolStartDate) : new Date()

  const allDayResults: DayResult[] = []

  // Define collection periods: S4 (28 days), S8 (56 days), S12 (84 days)
  const collectionPeriods = [
    { week: 4, startDay: 28, label: 'S4' },
    { week: 8, startDay: 56, label: 'S8' },
    { week: 12, startDay: 84, label: 'S12' },
  ]

  // Generate 4 days of data for each collection period
  collectionPeriods.forEach((period) => {
    for (let day = 0; day < 4; day++) {
      const currentDate = new Date(protocolStartDate)
      currentDate.setDate(currentDate.getDate() + period.startDay + day)
      const dateString = currentDate.toISOString().split('T')[0]

      const dayData = generateDayData(dateString, day, period.week - 1)
      allDayResults.push(dayData)
    }
  })

  // Save to localStorage
  try {
    localStorage.setItem('mictionnel_results', JSON.stringify(allDayResults))
    console.log('✅ Données Calendrier Mictionnel démonstration générées:', `${allDayResults.length} jours (3 périodes × 4 jours)`)
  } catch (error) {
    console.error('❌ Erreur lors de la sauvegarde des données Calendrier Mictionnel:', error)
  }
}

export function clearMictionnelData() {
  try {
    localStorage.removeItem('mictionnel_results')
    console.log('✅ Données Calendrier Mictionnel supprimées')
  } catch (error) {
    console.error('❌ Erreur lors de la suppression des données:', error)
  }
}
