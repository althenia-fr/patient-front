import { ref } from "vue";
import { getNowParisDateYYYYMMDD } from "@/utils/protocol.ts";
import { STORAGE_KEYS } from "@/types/api.types.ts";
import { sessionTrackingApi } from "@/services/sessionTracking.service.ts";
import { api } from "@/services/api";
import apiClient from "@/services/apiClient.ts";

const FORMS_CACHE_TTL = 2 * 60 * 60 * 1000; // 2 heures en millisecondes[cite: 28]

const user = ref(initUser());
const protocol = ref<any>(null);
const sessionRefresh = ref(0);

export function wrapLocalStorage() {
    return {
        protocol,
        user,
        setUser,
        setSessions,
        addSession,
        getSessions,
        sessionRefresh,
        getForms,
    };
}

export function setUser(newUser: any) {
    localStorage.setItem(STORAGE_KEYS.STIMEO_USER, JSON.stringify(newUser));
    user.value = newUser;
}

function setSessions(newSessions: any) {
    const todayYYYYMMDD = getNowParisDateYYYYMMDD();
    localStorage.setItem(
        STORAGE_KEYS.STIMEO_SESSIONS + "_" + todayYYYYMMDD,
        JSON.stringify(newSessions)
    );
    sessionRefresh.value++;
}

function getSessions() {
    const todayYYYYMMDD = getNowParisDateYYYYMMDD();
    const sessionJson = localStorage.getItem(
        STORAGE_KEYS.STIMEO_SESSIONS + "_" + todayYYYYMMDD
    );
    return sessionJson ? JSON.parse(sessionJson) : [];
}

function addSession(newSession: any) {
    const todayYYYYMMDD = getNowParisDateYYYYMMDD();
    const sessionsJson = localStorage.getItem(
        STORAGE_KEYS.STIMEO_SESSIONS + "_" + todayYYYYMMDD
    );
    const sessions = sessionsJson ? JSON.parse(sessionsJson) : [];
    sessions.push({
        pstid: newSession.pstid,
        pecid: protocol.value.pecid,
        sessionRemainingSec: newSession.sessionRemainingSec,
        sessionMaxSec: newSession.sessionMaxSec,
        sessionNumber: newSession.sessionNumber,
        isCompleted: false,
        isAvailable: true,
    });

    setSessions(sessions);
}

export function setForms(formSubmissions: any[]) {
    localStorage.setItem(
        STORAGE_KEYS.STIMEO_FORMS,
        JSON.stringify({
            data: Array.isArray(formSubmissions) ? formSubmissions : [],
            expiry: Date.now() + FORMS_CACHE_TTL,
        })
    );
}

export async function getForms(): Promise<any[]> {
    const cachedData = localStorage.getItem(STORAGE_KEYS.STIMEO_FORMS);

    if (cachedData) {
        try {
            const parsed = JSON.parse(cachedData);
            if (Date.now() < parsed.expiry && Array.isArray(parsed.data)) {
                return parsed.data;
            }
        } catch (e) {
            console.warn("Erreur de lecture du cache JSON STIMEO_FORMS", e);
        }
    }

    const response = await apiClient.get("/patient/survey/list");
    const formSubmissions = Array.isArray(response.data) ? response.data : [];

    localStorage.setItem(
        STORAGE_KEYS.STIMEO_FORMS,
        JSON.stringify({
            data: formSubmissions,
            expiry: Date.now() + FORMS_CACHE_TTL,
        })
    );

    return formSubmissions;
}

function initUser() {
    const userJson = localStorage.getItem(STORAGE_KEYS.STIMEO_USER);
    if (userJson) return JSON.parse(userJson);
    else return null;
}

export async function syncStorageData() {
    // --- PROTOCOL ---
    const protocolDataJson = localStorage.getItem(STORAGE_KEYS.STIMEO_PROTOCOL);
    if (protocolDataJson) {
        protocol.value = JSON.parse(protocolDataJson);
    } else {
        try {
            const fetchedProtocol = await api.getProtocolAgenda();
            if (fetchedProtocol) {
                localStorage.setItem(
                    STORAGE_KEYS.STIMEO_PROTOCOL,
                    JSON.stringify(fetchedProtocol)
                );
                protocol.value = fetchedProtocol;
            }
        } catch (e) {
            console.error("Erreur lors du fetch du protocole", e);
        }
    }

    // --- SESSIONS ---
    if (protocol.value && protocol.value.pecid) {
        try {
            const fetchedSessions = await sessionTrackingApi.listSessionTracking(
                protocol.value.pecid
            );
            if (fetchedSessions) setSessions(fetchedSessions);
        } catch (e) {
            console.error("Erreur fetch sessions", e);
        }
    }
}
