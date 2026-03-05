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

interface MonthlyStats {
  month: string
  monthIndex: number
  year: number
  daysWithData: number
  avgMictionsPerDay: number
  avgVolumePerMiction: number
  totalVolumePerDay: number
  avgLeaksPerDay: number
  avgHydricPerDay: number
}

interface ChartDataPoint {
  label: string
  mictionsPerDay: number
  volumePerDay: number
  leaksPerDay: number
  hydricPerDay: number
  week: number
}

export function calculateMonthlyStats(results: DayResult[]): MonthlyStats[] {
  if (results.length === 0) {
    return []
  }

  // Group results by month
  const monthMap: Record<string, DayResult[]> = {}
  
  results.forEach(day => {
    const date = new Date(day.date)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    if (!monthMap[monthKey]) {
      monthMap[monthKey] = []
    }
    monthMap[monthKey].push(day)
  })

  // Calculate stats for each month
  const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']
  
  return Object.entries(monthMap).map(([monthKey, days]) => {
    const [year, month] = monthKey.split('-')
    const monthIndex = parseInt(month) - 1
    
    // Filter days with actual data (mictions recorded)
    const daysWithData = days.filter(d => d.mictions.length > 0).length
    
    // Calculate averages per day
    let totalMictions = 0
    let totalVolume = 0
    let totalLeaks = 0
    let totalHydric = 0
    let validDays = 0

    days.forEach(day => {
      if (day.mictions.length > 0) {
        validDays++
        totalMictions += day.mictions.length
        totalVolume += day.totalUrine
        totalLeaks += day.leaks.length
        totalHydric += day.hydricIntakes.reduce((sum, h) => sum + h.quantity, 0)
      }
    })

    const avgMictionsPerDay = validDays > 0 ? Math.round((totalMictions / validDays) * 10) / 10 : 0
    const avgVolumePerMiction = totalMictions > 0 ? Math.round((totalVolume / totalMictions) * 10) / 10 : 0
    const totalVolumePerDay = validDays > 0 ? Math.round((totalVolume / validDays) * 10) / 10 : 0
    const avgLeaksPerDay = validDays > 0 ? Math.round((totalLeaks / validDays) * 10) / 10 : 0
    const avgHydricPerDay = validDays > 0 ? Math.round((totalHydric / validDays) * 10) / 10 : 0

    return {
      month: monthNames[monthIndex],
      monthIndex,
      year: parseInt(year),
      daysWithData,
      avgMictionsPerDay,
      avgVolumePerMiction,
      totalVolumePerDay,
      avgLeaksPerDay,
      avgHydricPerDay,
    }
  })
}

export function calculateGlobalStats(results: DayResult[]): {
  avgMictionsPerDay: number
  avgVolumePerMiction: number
  avgLeaksPerDay: number
  avgHydricPerDay: number
  totalDaysWithData: number
} {
  if (results.length === 0) {
    return {
      avgMictionsPerDay: 0,
      avgVolumePerMiction: 0,
      avgLeaksPerDay: 0,
      avgHydricPerDay: 0,
      totalDaysWithData: 0,
    }
  }

  const daysWithData = results.filter(d => d.mictions.length > 0)
  
  if (daysWithData.length === 0) {
    return {
      avgMictionsPerDay: 0,
      avgVolumePerMiction: 0,
      avgLeaksPerDay: 0,
      avgHydricPerDay: 0,
      totalDaysWithData: 0,
    }
  }

  let totalMictions = 0
  let totalVolume = 0
  let totalLeaks = 0
  let totalHydric = 0

  daysWithData.forEach(day => {
    totalMictions += day.mictions.length
    totalVolume += day.totalUrine
    totalLeaks += day.leaks.length
    totalHydric += day.hydricIntakes.reduce((sum, h) => sum + h.quantity, 0)
  })

  return {
    avgMictionsPerDay: Math.round((totalMictions / daysWithData.length) * 10) / 10,
    avgVolumePerMiction: totalMictions > 0 ? Math.round((totalVolume / totalMictions) * 10) / 10 : 0,
    avgLeaksPerDay: Math.round((totalLeaks / daysWithData.length) * 10) / 10,
    avgHydricPerDay: Math.round((totalHydric / daysWithData.length) * 10) / 10,
    totalDaysWithData: daysWithData.length,
  }
}

export function getChartDataByWeek(results: DayResult[]): ChartDataPoint[] {
  if (results.length === 0) {
    return []
  }

  const chartData: ChartDataPoint[] = []
  let dayIndex = 0

  // Define collection periods: D1, D2, D3
  const collectionPeriods = [
    { demand: 1, week: 4 },
    { demand: 2, week: 8 },
    { demand: 3, week: 12 },
  ]

  collectionPeriods.forEach((period) => {
    // Each period has 4 days of collection
    for (let dayOfPeriod = 0; dayOfPeriod < 4; dayOfPeriod++) {
      const dayLabel = `D${period.demand}J${dayOfPeriod + 1}`

      // Get data for this specific day in the period
      const dayData = results.length > dayIndex ? results[dayIndex] : null
      dayIndex++

      if (dayData && dayData.mictions.length > 0) {
        const totalHydric = dayData.hydricIntakes.reduce((sum, h) => sum + h.quantity, 0)

        chartData.push({
          label: dayLabel,
          mictionsPerDay: dayData.mictions.length,
          volumePerDay: dayData.totalUrine,
          leaksPerDay: dayData.leaks.length,
          hydricPerDay: totalHydric,
          week: period.week,
        })
      } else {
        // Add empty data point to maintain structure
        chartData.push({
          label: dayLabel,
          mictionsPerDay: 0,
          volumePerDay: 0,
          leaksPerDay: 0,
          hydricPerDay: 0,
          week: period.week,
        })
      }
    }
  })

  return chartData
}
