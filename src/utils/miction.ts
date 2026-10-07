import apiClient from "@/services/apiClient.ts";

export const getCurrentTime = () => {
    const now = new Date()
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    return `${hours}:${minutes}`
}


export const submitReport = async (payload: Record<string, any>) => {
    const response = await apiClient.post('/patient/miction/post', payload)
    return response
}
