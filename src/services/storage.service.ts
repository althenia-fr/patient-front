import {ref} from "vue";
import {getNowParisDateYYYYMMDD} from "@/utils/protocol.ts";
import {STORAGE_KEYS} from "@/types/api.types.ts";
import {sessionTrackingApi} from "@/services/sessionTracking.service.ts";
import {api} from "@/services/api";


const user = ref(initUser());
const protocol = ref<any>(null);
const sessions = ref<any>(null);

export function wrapLocalStorage() {

    return {
        sessions,protocol,user,
        setUser
    }
}

function setUser(newUser: any)
{
    localStorage.setItem(STORAGE_KEYS.STIMEO_USER,JSON.stringify(newUser));
    user.value = newUser
}

function initUser(){
    const userJson = localStorage.getItem(STORAGE_KEYS.STIMEO_USER)
    if(userJson) return JSON.parse(userJson)
    else return null;
}


export async function syncStorageData() {
    // --- PROTOCOL ---
    let protocolDataJson = localStorage.getItem(STORAGE_KEYS.STIMEO_PROTOCOL);
    if (protocolDataJson) {
        protocol.value = JSON.parse(protocolDataJson);
    } else {
        // Si pas dans le storage, on fetch
        try {
            const fetchedProtocol = await api.getProtocolAgenda();
            if (fetchedProtocol) {
                localStorage.setItem(STORAGE_KEYS.STIMEO_PROTOCOL, JSON.stringify(fetchedProtocol));
                protocol.value = fetchedProtocol;
            }
        } catch (e) {
            console.error("Erreur lors du fetch du protocole", e)
        }
    }

    // --- SESSIONS ---
    const todayYYYYMMDD = getNowParisDateYYYYMMDD();
    let sessionsJson = localStorage.getItem(STORAGE_KEYS.STIMEO_SESSIONS + '_' + todayYYYYMMDD);
    if (sessionsJson) {
        sessions.value = JSON.parse(sessionsJson);
    } else {
        if(protocol.value && protocol.value.pecid) {
            try {
                const fetchedSessions = await sessionTrackingApi.listSessionTracking(protocol.value.pecid);
                if (fetchedSessions) {
                    localStorage.setItem(STORAGE_KEYS.STIMEO_SESSIONS + '_' + todayYYYYMMDD, JSON.stringify(fetchedSessions));
                    sessions.value = fetchedSessions;
                }
            } catch(e) {
                console.error("Erreur fetch sessions", e)
            }
        }
    }
}

