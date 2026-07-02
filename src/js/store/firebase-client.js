import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBs9EImcbIygv6z30hlMUliq9rTYa57Mjo",
    authDomain: "one-hybrid-app.firebaseapp.com",
    projectId: "one-hybrid-app",
    storageBucket: "one-hybrid-app.firebasestorage.app",
    messagingSenderId: "793979894853",
    appId: "1:793979894853:web:4202c8e0675bbab6c5372c",
    measurementId: "G-J8NSJ586SC"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export const CloudSync = {
    pullDown: async (username) => {
        try {
            const userDoc = doc(db, "users", username);
            const snapshot = await getDoc(userDoc);
            
            if (snapshot.exists()) {
                const data = snapshot.data();
                
                // Sobrescrever o LocalStorage com os dados da nuvem
                if (data.workout_history) {
                    localStorage.setItem(`${username}_workout_history`, JSON.stringify(data.workout_history));
                }
                if (data.nutrition_history) {
                    localStorage.setItem(`${username}_nutrition_history`, JSON.stringify(data.nutrition_history));
                }
                if (data.cycle_phase) {
                    localStorage.setItem(`${username}_cycle_phase`, data.cycle_phase);
                }
                console.log(`[CloudSync] Sucesso ao puxar dados de ${username}`);
            } else {
                console.log(`[CloudSync] Nenhum dado na nuvem para ${username}. Primeiro acesso.`);
            }
        } catch (error) {
            console.error("[CloudSync] Falha ao puxar da nuvem (Offline?): ", error);
            // Se falhar (offline), o aplicativo continua usando o localStorage tranquilamente!
        }
    },

    pushUp: async (username) => {
        try {
            const workout_history = JSON.parse(localStorage.getItem(`${username}_workout_history`) || '{}');
            const nutrition_history = JSON.parse(localStorage.getItem(`${username}_nutrition_history`) || '{}');
            const cycle_phase = localStorage.getItem(`${username}_cycle_phase`) || 'folicular';

            const userDoc = doc(db, "users", username);
            await setDoc(userDoc, {
                workout_history,
                nutrition_history,
                cycle_phase,
                last_sync: new Date().toISOString()
            });
            console.log(`[CloudSync] Backup enviado com sucesso para ${username}`);
        } catch (error) {
            console.error("[CloudSync] Falha ao enviar para nuvem (Será sincronizado depois): ", error);
        }
    }
};
