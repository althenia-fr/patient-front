import apiClient from "@/services/apiClient.ts";
import {API_ENDPOINTS} from "@/types/api.types.ts";
import {logError, prettyPrintErrorMsg} from "@/utils/apiErrorHandler.ts";
import type {ProtocolAgenda} from "@/types/protocol.types.ts";
import type {AuthData, LoginRequest} from "@/types/auth.types.ts";

export const api = {

    async login(data: LoginRequest): Promise<AuthData> {

            const response = await apiClient.post<AuthData>(API_ENDPOINTS.AUTH.LOGIN, data)
            return response.data

    },

    async getProtocolAgenda(): Promise<ProtocolAgenda> {

            const response = await apiClient.get<ProtocolAgenda>(API_ENDPOINTS.PROTOCOL.GET_AGENDA)
            return response.data;

    },

    async getProtocolKpi(): Promise<ProtocolAgenda> {

        const response = await apiClient.get<ProtocolAgenda>(API_ENDPOINTS.PROTOCOL.GET_KPI)
        return response.data;

    }

}
