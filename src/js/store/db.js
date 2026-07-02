import { CloudSync } from './firebase-client.js';

export const DB = {
    _getKey: (baseKey) => {
        const user = localStorage.getItem('active_user') || 'default';
        return `${user}_${baseKey}`;
    },
    saveWorkout: (date, data) => {
        const key = DB._getKey('workout_history');
        const history = JSON.parse(localStorage.getItem(key) || '{}');
        history[date] = data;
        localStorage.setItem(key, JSON.stringify(history));
        CloudSync.pushUp(localStorage.getItem('active_user'));
    },
    getWorkout: (date) => {
        const key = DB._getKey('workout_history');
        const history = JSON.parse(localStorage.getItem(key) || '{}');
        return history[date] || null;
    },
    saveNutrition: (date, data) => {
        const key = DB._getKey('nutrition_history');
        const history = JSON.parse(localStorage.getItem(key) || '{}');
        history[date] = data;
        localStorage.setItem(key, JSON.stringify(history));
        CloudSync.pushUp(localStorage.getItem('active_user'));
    },
    saveCyclePhase: (phase) => {
        const key = DB._getKey('cycle_phase');
        localStorage.setItem(key, phase);
        CloudSync.pushUp(localStorage.getItem('active_user'));
    },
    getCyclePhase: () => {
        const key = DB._getKey('cycle_phase');
        return localStorage.getItem(key) || 'folicular';
    }
};
