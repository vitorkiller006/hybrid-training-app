import { WorkoutEngine } from './src/js/algorithms/workout-engine.js';
import { NutritionEngine } from './src/js/algorithms/nutrition-engine.js';
import { DB } from './src/js/store/db.js';

document.addEventListener('DOMContentLoaded', () => {
    // Tab Navigation Logic
    const navButtons = document.querySelectorAll('.nav-btn');
    const tabSections = document.querySelectorAll('.tab-section');

    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            navButtons.forEach(b => b.classList.remove('active'));
            tabSections.forEach(s => s.style.display = 'none');
            btn.classList.add('active');
            document.getElementById('tab-' + btn.getAttribute('data-tab')).style.display = 'block';
        });
    });

    // Seed Initial History with structured data if empty or using old string format
    let existingData = localStorage.getItem('workout_history');
    let parsedData = existingData ? JSON.parse(existingData) : {};
    
    // Reset se estiver no formato antigo de string (para aplicar a nova UI)
    if (!existingData || (parsedData['2026-06-29'] && typeof parsedData['2026-06-29'].notes === 'string' && !parsedData['2026-06-29'].exercises)) {
        DB.saveWorkout('2026-06-29', {
            type: 'PUSH',
            exercises: [
                { name: 'Supino Reto', sets: '3', reps: '12', load: '30kg/lado', notes: 'Cadência 2s excêntrica. Isolamento total.' },
                { name: 'Peck Deck', sets: '3', reps: '15', load: '45kg', notes: 'Sem inércia.' },
                { name: 'Abdominal Solo', sets: '3', reps: '12', load: 'BW', notes: 'Giro do quadril (retroversão pélvica). Falha na 10a rep (Série 2).' },
                { name: 'Cardio HIIT (Esteira)', sets: '6 ciclos', reps: '40s/20s', load: '9km/h', notes: 'Alta intensidade.' }
            ]
        });
        DB.saveWorkout('2026-06-30', {
            type: 'LEGS FULL',
            exercises: [
                { name: 'Leg Press 45º', sets: '4', reps: '12-15', load: '50kg/lado', notes: 'Foco no quadríceps e amplitude máxima. Falha percebida na 11a rep.' },
                { name: 'Stiff com Halteres', sets: '2', reps: '10/4', load: '10kg/lado', notes: 'Abortado por segurança. Ativação lombar.' },
                { name: 'Cadeira Flexora', sets: '3', reps: '12', load: '40kg', notes: 'Substituição de emergência. 3s de excêntrica. RPE 9.' },
                { name: 'Panturrilha Máquina', sets: '2', reps: '12/9', load: '30kg->25kg', notes: 'Falha metabólica aguda.' },
                { name: 'Abdominal Máquina', sets: '3', reps: '15-20', load: '5kg', notes: 'Crunch sentado. 3s retorno. RPE 9.' }
            ]
        });
    }

    const renderHistory = () => {
        const historyContainer = document.querySelector('#tab-historico .card-body');
        const history = JSON.parse(localStorage.getItem('workout_history') || '{}');
        
        if (Object.keys(history).length === 0) {
            historyContainer.innerHTML = '<p class="rpe-status">Nenhum treino armazenado no IndexedDB ainda.</p>';
            return;
        }

        let html = '';
        const sortedDates = Object.keys(history).sort((a, b) => new Date(b) - new Date(a));
        
        sortedDates.forEach(date => {
            const w = history[date];
            let exercisesHtml = '';
            if (w.exercises && w.exercises.length > 0) {
                w.exercises.forEach(ex => {
                    exercisesHtml += `
                        <div class="exercise-card">
                            <div class="ex-header">
                                <span class="ex-name">${ex.name}</span>
                                <span class="ex-stats">${ex.sets}x${ex.reps} | ${ex.load}</span>
                            </div>
                            ${ex.notes ? `<div class="ex-notes">"${ex.notes}"</div>` : ''}
                        </div>
                    `;
                });
            } else {
                // Fallback for older entries without structured exercises
                exercisesHtml = `<p style="color: var(--text-secondary); font-size: 0.9rem;">${w.notes || ''}</p>`;
            }

            html += `
            <div class="history-item">
                <div class="history-date">
                    <span>${w.type}</span>
                    <span class="badge badge-info">${date}</span>
                </div>
                <div class="exercise-list">
                    ${exercisesHtml}
                </div>
            </div>`;
        });
        
        historyContainer.innerHTML = html;
    };

    // Progression Plan (Meta de Treino baseada no último treino do mesmo tipo)
    const renderProgressionPlan = (workoutType) => {
        const history = JSON.parse(localStorage.getItem('workout_history') || '{}');
        const sortedDates = Object.keys(history).sort((a, b) => new Date(b) - new Date(a));
        
        // Acha o último treino do mesmo tipo
        let lastWorkout = null;
        for (let date of sortedDates) {
            if (history[date].type === workoutType && history[date].exercises) {
                lastWorkout = history[date];
                break;
            }
        }

        const container = document.querySelector('#tab-treino .card-body');
        
        if (lastWorkout) {
            let planHtml = `
                <div class="progression-plan">
                    <h3>🎯 Meta de Hoje (Progressão vs Semana Passada)</h3>
                    <p style="color:var(--text-secondary); font-size:0.9rem; margin-bottom: 1rem;">Aqui está o que você fez no seu último treino de <strong>${workoutType}</strong>. Tente superar uma repetição ou melhorar a execução/cadência com a mesma carga!</p>
                    <div class="exercise-list">
            `;
            
            lastWorkout.exercises.forEach(ex => {
                planHtml += `
                    <div class="exercise-card">
                        <div class="ex-header">
                            <span class="ex-name">${ex.name}</span>
                            <span class="ex-stats" style="background: rgba(255, 51, 102, 0.2); color: var(--primary-color);">Bater: ${ex.sets}x${ex.reps} @ ${ex.load}</span>
                        </div>
                        <div class="ex-notes">Cuidado anterior: ${ex.notes}</div>
                    </div>
                `;
            });
            planHtml += `</div></div>`;
            
            // Inserir antes do botão Iniciar
            const oldPlan = container.querySelector('.progression-plan');
            if (oldPlan) oldPlan.remove();
            container.insertAdjacentHTML('afterbegin', planHtml);
        }
    };

    // Initialize UI
    renderHistory();
    
    // Current Context
    const todayWorkoutType = 'PUSH'; // Simulando que hoje é dia de PUSH novamente para testar a progressão
    renderProgressionPlan(todayWorkoutType);

    // Update Nutrition Engine
    const nutritionEngine = new NutritionEngine(80, 20);
    const todayNutrition = nutritionEngine.calculateMacros(todayWorkoutType);
    
    const badgeCarb = document.querySelector('.badge-carb-low');
    const macroValues = document.querySelectorAll('.macro-item .value');
    
    if (badgeCarb && macroValues.length === 3) {
        badgeCarb.textContent = todayNutrition.type;
        if (todayNutrition.type === 'HIGH CARB') {
            badgeCarb.style.background = 'rgba(51, 255, 102, 0.15)';
            badgeCarb.style.color = '#33ff66';
            badgeCarb.style.borderColor = 'rgba(51, 255, 102, 0.3)';
        }
        macroValues[0].textContent = `${todayNutrition.macros.protein}g`;
        macroValues[1].textContent = `${todayNutrition.macros.carbs}g`;
        macroValues[2].textContent = `${todayNutrition.macros.fat}g`;
    }

    const startWorkoutBtn = document.querySelector('.start-workout');
    if (startWorkoutBtn) {
        startWorkoutBtn.addEventListener('click', () => {
            alert('Sessão iniciada! Foco na meta estipulada no plano de progressão.');
        });
    }
});
