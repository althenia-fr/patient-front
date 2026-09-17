import {ref} from "vue";
import {getNowParisDateYYYYMMDD} from "@/utils/protocol.ts";
import {STORAGE_KEYS} from "@/types/api.types.ts";
import {sessionTrackingApi} from "@/services/sessionTracking.service.ts";
import {api} from "@/services/api";


const user = ref(initUser());
const protocol = ref<any>(null);
const sessionRefresh = ref(0);

export function wrapLocalStorage() {

    return {
        protocol,user,
        setUser,setSessions,addSession, getSessions, sessionRefresh
    }
}

function setUser(newUser: any)
{
    localStorage.setItem(STORAGE_KEYS.STIMEO_USER,JSON.stringify(newUser));
    user.value = newUser
}

function setSessions(newSessions: any)
{
    const todayYYYYMMDD = getNowParisDateYYYYMMDD()
    localStorage.setItem(STORAGE_KEYS.STIMEO_SESSIONS + '_' + todayYYYYMMDD, JSON.stringify(newSessions));

    //session stored in localStorage to persist but localStorage is not reactive
    //hence we use sessionRefresh as a flag that computed functions need to subscribe to , to force refresh
    sessionRefresh.value++
}

function getSessions()
{
    const todayYYYYMMDD = getNowParisDateYYYYMMDD()
    let sessionJson = localStorage.getItem(STORAGE_KEYS.STIMEO_SESSIONS + '_' + todayYYYYMMDD);
    return sessionJson?JSON.parse(sessionJson):[]
}


function addSession(newSession : any)
{
    //make sure we drop the new session into the right day
    const todayYYYYMMDD = getNowParisDateYYYYMMDD()
    let sessionsJson = localStorage.getItem(STORAGE_KEYS.STIMEO_SESSIONS+'_'+todayYYYYMMDD);
    let sessions = sessionsJson?JSON.parse(sessionsJson):[]
    sessions.push({
        pstid: newSession.pstid,
        pecid: protocol.value.pecid,
        sessionRemainingSec: newSession.sessionRemainingSec,
        sessionMaxSec: newSession.sessionMaxSec,
        sessionNumber: newSession.sessionNumber,
        //we add a new session when it was just created after entering the timer page
        //hence not complete and available
        isCompleted: false ,
        isAvailable: true
    })

    setSessions(sessions)
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
    if(protocol.value && protocol.value.pecid) {
        try {
            const fetchedSessions = await sessionTrackingApi.listSessionTracking(protocol.value.pecid);
            if (fetchedSessions) setSessions(fetchedSessions)
        } catch(e) {
            console.error("Erreur fetch sessions", e)
        }
    }

}

