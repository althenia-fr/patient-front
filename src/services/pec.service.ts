import apiClient from './core/apiClient'
import { API_ENDPOINTS } from '@/types/api.types'
import { createApiError, logError, isNetworkError } from '@/utils/apiErrorHandler'
import type {
  GetPecResponse,
  UpdatePecRequest,
  UpdatePecResponse,
  PecData,
} from '@/types/pec.types'

export const pecApi = {
  /**
   * Get PEC (Personal Emergency Contact) data for the current user
   * @returns Promise<PecData> - The user's PEC data
   */
  async getPecData(): Promise<PecData> {
    try {
      const response = await apiClient.get<GetPecResponse>(API_ENDPOINTS.PEC.GET_PEC)

      if (response.data.success && response.data.data) {
        return response.data.data
      }

      throw new Error(response.data.message || 'Failed to fetch PEC data')
    } catch (error: any) {
      logError('GetPecData', error)

      const apiError = createApiError(error)

      if (isNetworkError(error)) {
        throw new Error(
          'Impossible de récupérer les données de contact d\'urgence. Veuillez vérifier votre connexion internet.',
        )
      }

      throw new Error(apiError.message)
    }
  },

  /**
   * Update PEC (Personal Emergency Contact) data for the current user
   * @param data - The PEC data to update
   * @returns Promise<PecData> - The updated PEC data
   */
  async updatePecData(data: UpdatePecRequest): Promise<PecData> {
    try {
      const response = await apiClient.put<UpdatePecResponse>(
        API_ENDPOINTS.PEC.UPDATE_PEC,
        data,
      )

      if (response.data.success && response.data.data) {
        return response.data.data
      }

      throw new Error(response.data.message || 'Failed to update PEC data')
    } catch (error: any) {
      logError('UpdatePecData', error)

      const apiError = createApiError(error)

      if (isNetworkError(error)) {
        throw new Error(
          'Impossible de mettre à jour les données de contact d\'urgence. Veuillez vérifier votre connexion internet.',
        )
      }

      throw new Error(apiError.message)
    }
  },

  /**
   * Add a new emergency contact to the user's PEC data
   * @param contact - The emergency contact to add
   * @returns Promise<PecData> - The updated PEC data
   */
  async addEmergencyContact(contact: UpdatePecRequest['emergencyContacts'][0]): Promise<PecData> {
    try {
      // First get current PEC data
      const currentData = await this.getPecData()
      
      // Add the new contact
      const updatedData: UpdatePecRequest = {
        emergencyContacts: [...currentData.emergencyContacts, contact],
        primaryPhysician: currentData.primaryPhysician,
        medicalNotes: currentData.medicalNotes,
        allergies: currentData.allergies,
        medications: currentData.medications,
      }

      return this.updatePecData(updatedData)
    } catch (error) {
      logError('AddEmergencyContact', error)
      throw error
    }
  },

  /**
   * Remove an emergency contact from the user's PEC data
   * @param contactId - The ID of the contact to remove
   * @returns Promise<PecData> - The updated PEC data
   */
  async removeEmergencyContact(contactId: string): Promise<PecData> {
    try {
      // First get current PEC data
      const currentData = await this.getPecData()
      
      // Remove the contact
      const updatedData: UpdatePecRequest = {
        emergencyContacts: currentData.emergencyContacts.filter(
          contact => contact.id !== contactId,
        ),
        primaryPhysician: currentData.primaryPhysician,
        medicalNotes: currentData.medicalNotes,
        allergies: currentData.allergies,
        medications: currentData.medications,
      }

      return this.updatePecData(updatedData)
    } catch (error) {
      logError('RemoveEmergencyContact', error)
      throw error
    }
  },

  /**
   * Update a specific emergency contact
   * @param contactId - The ID of the contact to update
   * @param contact - The updated contact data
   * @returns Promise<PecData> - The updated PEC data
   */
  async updateEmergencyContact(
    contactId: string,
    contact: Partial<UpdatePecRequest['emergencyContacts'][0]>,
  ): Promise<PecData> {
    try {
      // First get current PEC data
      const currentData = await this.getPecData()
      
      // Update the specific contact
      const updatedData: UpdatePecRequest = {
        emergencyContacts: currentData.emergencyContacts.map(c =>
          c.id === contactId ? { ...c, ...contact } : c,
        ),
        primaryPhysician: currentData.primaryPhysician,
        medicalNotes: currentData.medicalNotes,
        allergies: currentData.allergies,
        medications: currentData.medications,
      }

      return this.updatePecData(updatedData)
    } catch (error) {
      logError('UpdateEmergencyContact', error)
      throw error
    }
  },
}
