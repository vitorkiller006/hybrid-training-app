export const DB = {
    saveWorkout: (date, data) => {
        const history = JSON.parse(localStorage.getItem('workout_history') || '{}');
        history[date] = data;
        localStorage.setItem('workout_history', JSON.stringify(history));
    },
    getWorkout: (date) => {
        const history = JSON.parse(localStorage.getItem('workout_history') || '{}');
        return history[date] || null;
    },
    saveNutrition: (date, data) => {
        const history = JSON.parse(localStorage.getItem('nutrition_history') || '{}');
        history[date] = data;
        localStorage.setItem('nutrition_history', JSON.stringify(history));
    }
};
