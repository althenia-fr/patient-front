
export interface QuestionnaireResult {
  id: string
  questionnaireName: string
  week: number
  date: string
  data: Record<string, any>
  timestamp: number
}

const RESULTS_KEY = 'questionnaire_results'

export function saveResult(questionnaireName: string, data: Record<string, any>, week?: number) {
  try {
    const results = getResults()
    const weekInfo = week || 1
    const now = new Date()

    const result: QuestionnaireResult = {
      id: `${questionnaireName}_${Date.now()}`,
      questionnaireName,
      week: weekInfo,
      date: now.toLocaleDateString('fr-FR'),
      data,
      timestamp: Date.now(),
    }

    results.push(result)
    localStorage.setItem(RESULTS_KEY, JSON.stringify(results))
    return result
  } catch (error) {
    console.error('Error saving result:', error)
    return null
  }
}

export function getResults(): QuestionnaireResult[] {
  try {
    const raw = localStorage.getItem(RESULTS_KEY)
    return raw ? JSON.parse(raw) as QuestionnaireResult[] : []
  } catch {
    return []
  }
}

