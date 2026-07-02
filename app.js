import { WorkoutEngine } from './src/js/algorithms/workout-engine.js';
import { NutritionEngine } from './src/js/algorithms/nutrition-engine.js';
import { DB } from './src/js/store/db.js';

document.addEventListener('DOMContentLoaded', () => {
    // Tab Navigation Logic
    const navButtons = document.querySelectorAll('.nav-btn');
    const tabSections = document.querySelectorAll('.tab-section');

    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.id === 'wm-cancel') return;
            navButtons.forEach(b => { if (b.hasAttribute('data-tab')) b.classList.remove('active') });
            tabSections.forEach(s => s.style.display = 'none');
            document.getElementById('workout-mode').style.display = 'none'; // Hide active workout
            
            btn.classList.add('active');
            document.getElementById('tab-' + btn.getAttribute('data-tab')).style.display = 'block';
        });
    });

    const workoutEngine = new WorkoutEngine();
    
    // Seed Initial History
    let existingData = localStorage.getItem('workout_history');
    let parsedData = existingData ? JSON.parse(existingData) : {};
    
    if (!existingData) {
        DB.saveWorkout('2026-06-29', { type: 'HIIT', exercises: [{name: 'Tiro na Esteira', sets: '6 ciclos', reps: '40s/20s', load: '9km/h', notes: 'Fácil.'}] });
        DB.saveWorkout('2026-06-30', { type: 'PUSH', exercises: [{name: 'Supino Reto', sets: '3', reps: '12', load: '30kg/lado', notes: 'Falha.'}] });
    }

    // Determine Today's Workout based on completed count
    const history = JSON.parse(localStorage.getItem('workout_history') || '{}');
    const completedCount = Object.keys(history).length;
    const todayWorkoutType = workoutEngine.getNextWorkoutType(completedCount);
    
    document.querySelector('.training-today .badge-hybrid').textContent = todayWorkoutType;
    document.querySelector('.training-today .card-header h2').textContent = `Sequência: ${completedCount + 1}º Treino`;

    const renderHistory = () => {
        const historyContainer = document.querySelector('#tab-historico .card-body');
        const h = JSON.parse(localStorage.getItem('workout_history') || '{}');
        
        if (Object.keys(h).length === 0) {
            historyContainer.innerHTML = '<p class="rpe-status">Nenhum treino armazenado.</p>';
            return;
        }

        let html = '';
        const sortedDates = Object.keys(h).sort((a, b) => new Date(b) - new Date(a));
        
        sortedDates.forEach(date => {
            const w = h[date];
            let exercisesHtml = '';
            if (w.exercises && w.exercises.length > 0) {
                w.exercises.forEach(ex => {
                    exercisesHtml += `
                        <div class="exercise-card">
                            <div class="ex-header">
                                <span class="ex-name">${ex.name}</span>
                                <span class="ex-stats">${ex.sets}x${ex.reps} | ${ex.load || 'BW'}</span>
                            </div>
                            <div class="ex-notes" style="color:var(--text-primary)">Tags: ${ex.tags ? ex.tags.join(', ') : 'Nenhuma'}</div>
                            <div class="ex-notes" style="color:var(--secondary-color)">Ação (IA): ${workoutEngine.evaluateTags(ex.tags || []).recommendation}</div>
                            ${ex.notes ? `<div class="ex-notes">"${ex.notes}"</div>` : ''}
                        </div>
                    `;
                });
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

    const renderProgressionPlan = (workoutType) => {
        const h = JSON.parse(localStorage.getItem('workout_history') || '{}');
        const sortedDates = Object.keys(h).sort((a, b) => new Date(b) - new Date(a));
        
        let lastWorkout = null;
        for (let date of sortedDates) {
            if (h[date].type === workoutType && h[date].exercises) {
                lastWorkout = h[date];
                break;
            }
        }

        const container = document.querySelector('#tab-treino .card-body');
        const oldPlan = container.querySelector('.progression-plan');
        if (oldPlan) oldPlan.remove();

        if (lastWorkout) {
            let planHtml = `
                <div class="progression-plan">
                    <h3>🎯 Meta Baseada no Último Treino</h3>
                    <div class="exercise-list">
            `;
            
            lastWorkout.exercises.forEach(ex => {
                const aiAction = workoutEngine.evaluateTags(ex.tags || []).recommendation;
                planHtml += `
                    <div class="exercise-card">
                        <div class="ex-header">
                            <span class="ex-name">${ex.name}</span>
                            <span class="ex-stats" style="background: rgba(255, 51, 102, 0.2); color: var(--primary-color);">Feito: ${ex.sets}x${ex.reps} @ ${ex.load}</span>
                        </div>
                        <div class="ex-notes">Sugestão: ${aiAction}</div>
                    </div>
                `;
            });
            planHtml += `</div></div>`;
            container.insertAdjacentHTML('afterbegin', planHtml);
        }
    };

    renderHistory();
    renderProgressionPlan(todayWorkoutType);

    // Nutrition
    const nutritionEngine = new NutritionEngine(80, 20);
    const todayNutrition = nutritionEngine.calculateMacros(todayWorkoutType);
    const badgeCarb = document.querySelector('.badge-carb-low');
    const macroValues = document.querySelectorAll('.macro-item .value');
    
    if (badgeCarb && macroValues.length === 3) {
        badgeCarb.textContent = todayNutrition.type;
        if (todayNutrition.type === 'HIGH CARB') {
            badgeCarb.style.background = 'rgba(51, 255, 102, 0.15)'; badgeCarb.style.color = '#33ff66'; badgeCarb.style.borderColor = 'rgba(51, 255, 102, 0.3)';
        }
        macroValues[0].textContent = `${todayNutrition.macros.protein}g`;
        macroValues[1].textContent = `${todayNutrition.macros.carbs}g`;
        macroValues[2].textContent = `${todayNutrition.macros.fat}g`;
    }

    // Workout Mode Logic
    const wmContainer = document.getElementById('workout-mode');
    const wmCarousel = document.querySelector('.wm-carousel');
    const wmPrev = document.getElementById('wm-prev');
    const wmNext = document.getElementById('wm-next');
    const wmFinish = document.getElementById('wm-finish');
    let currentSlide = 0;
    let templateExercises = [];

    const updateWorkoutUI = () => {
        const slides = document.querySelectorAll('.wm-slide');
        slides.forEach((s, i) => {
            s.classList.toggle('active', i === currentSlide);
        });
        wmPrev.style.display = currentSlide === 0 ? 'none' : 'block';
        if (currentSlide === slides.length - 1) {
            wmNext.style.display = 'none';
            wmFinish.style.display = 'block';
        } else {
            wmNext.style.display = 'block';
            wmFinish.style.display = 'none';
        }
    };

    document.querySelector('.start-workout')?.addEventListener('click', () => {
        // Build Slides
        templateExercises = workoutEngine.getTemplateForType(todayWorkoutType);
        if(templateExercises.length === 0) return alert('Template vazio.');
        
        let slidesHtml = '';
        templateExercises.forEach((ex, idx) => {
            slidesHtml += `
            <div class="wm-slide" data-idx="${idx}">
                <h3 style="color: var(--primary-color); font-size: 1.5rem; font-family: var(--font-heading);">${idx + 1}. ${ex.name}</h3>
                <p style="color: var(--text-secondary); margin-bottom: 1rem;">Meta: ${ex.sets} séries x ${ex.reps}</p>
                
                <div class="input-row">
                    <div class="input-group">
                        <label>Carga Utilizada</label>
                        <input type="text" class="inp-load" placeholder="Ex: 30kg ou BW">
                    </div>
                </div>

                <div class="input-group" style="margin-top: 1.5rem;">
                    <label>Como foi a execução? (Múltipla Escolha)</label>
                    <div class="tag-group">
                        <div class="tag-chip" data-tag="facil">Estava Fácil</div>
                        <div class="tag-chip" data-tag="falha">Atingi Falha Téc.</div>
                        <div class="tag-chip" data-tag="cadencia">Boa Cadência</div>
                        <div class="tag-chip danger" data-tag="lombar">Dor Lombar</div>
                        <div class="tag-chip danger" data-tag="articulacao">Dor Articular</div>
                    </div>
                </div>

                <div class="input-group" style="margin-top: 1rem;">
                    <label>Anotações Livres</label>
                    <input type="text" class="inp-notes" placeholder="Anotações extras...">
                </div>
            </div>`;
        });
        
        wmCarousel.innerHTML = slidesHtml;
        
        // Bind Tag Clicks
        document.querySelectorAll('.tag-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                chip.classList.toggle('selected');
            });
        });

        tabSections.forEach(s => s.style.display = 'none');
        wmContainer.style.display = 'block';
        currentSlide = 0;
        updateWorkoutUI();
    });

    wmNext?.addEventListener('click', () => {
        currentSlide++;
        updateWorkoutUI();
    });

    wmPrev?.addEventListener('click', () => {
        currentSlide--;
        updateWorkoutUI();
    });

    document.getElementById('wm-cancel')?.addEventListener('click', () => {
        wmContainer.style.display = 'none';
        document.getElementById('tab-treino').style.display = 'block';
    });

    wmFinish?.addEventListener('click', () => {
        const slides = document.querySelectorAll('.wm-slide');
        let finalData = [];
        
        slides.forEach((s, idx) => {
            const exName = templateExercises[idx].name;
            const exSets = templateExercises[idx].sets;
            const exReps = templateExercises[idx].reps;
            const load = s.querySelector('.inp-load').value || 'Não informada';
            const notes = s.querySelector('.inp-notes').value;
            const selectedTags = Array.from(s.querySelectorAll('.tag-chip.selected')).map(t => t.getAttribute('data-tag'));
            
            finalData.push({
                name: exName, sets: exSets, reps: exReps, load, notes, tags: selectedTags
            });
        });

        DB.saveWorkout(new Date().toISOString().split('T')[0], {
            type: todayWorkoutType,
            exercises: finalData
        });
        
        alert('Treino Salvo com Sucesso! Seu histórico foi atualizado e o ciclo avançou.');
        window.location.reload(); // Reload to refresh dash states
    });
});
