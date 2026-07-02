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
    
    // Seed Initial History with CORRECT DATES and NEW STRUCTURE (Per-Set Tracking)
    let existingData = localStorage.getItem('workout_history');
    let parsedData = existingData ? JSON.parse(existingData) : {};
    
    // Reset se estiver usando a estrutura velha (sem arrays em sets)
    if (!existingData || (parsedData['2026-06-30'] === undefined) || (parsedData['2026-06-30'] && typeof parsedData['2026-06-30'].exercises[0].sets === 'string')) {
        DB.saveWorkout('2026-06-30', {
            type: 'PUSH',
            exercises: [
                { name: 'Supino Reto', sets: [{ reps: 12, load: '30kg' }, { reps: 10, load: '30kg' }, { reps: 8, load: '30kg' }], tags: ['falha'], notes: 'Isolamento total.' },
                { name: 'Peck Deck', sets: [{ reps: 15, load: '45kg' }, { reps: 12, load: '45kg' }], tags: ['cadencia'], notes: 'Sem inércia.' }
            ]
        });
        DB.saveWorkout('2026-07-01', {
            type: 'LEGS FULL',
            exercises: [
                { name: 'Leg Press 45º', sets: [{ reps: 15, load: '50kg' }, { reps: 12, load: '50kg' }], tags: ['falha'], notes: 'Foco no quadríceps.' },
                { name: 'Stiff', sets: [{ reps: 10, load: '10kg' }], tags: ['lombar'], notes: 'Abortado por segurança.' }
            ]
        });
    }

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
                    let setsHtml = '';
                    if (Array.isArray(ex.sets)) {
                        ex.sets.forEach((set, i) => {
                            setsHtml += `<div style="font-size: 0.85rem; color: #ccc; margin-left: 1rem; border-left: 2px solid var(--border-color); padding-left: 0.5rem; margin-bottom: 0.2rem;">Série ${i+1}: <strong>${set.reps} reps</strong> @ ${set.load}</div>`;
                        });
                    }
                    
                    exercisesHtml += `
                        <div class="exercise-card">
                            <div class="ex-header" style="margin-bottom: 0.5rem;">
                                <span class="ex-name">${ex.name}</span>
                            </div>
                            ${setsHtml}
                            <div class="ex-notes" style="color:var(--text-primary); margin-top: 0.5rem;">Tags: ${ex.tags ? ex.tags.join(', ') : 'Nenhuma'}</div>
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
                const topSet = Array.isArray(ex.sets) && ex.sets.length > 0 ? ex.sets[0] : { reps: '?', load: '?' };
                
                planHtml += `
                    <div class="exercise-card">
                        <div class="ex-header">
                            <span class="ex-name">${ex.name}</span>
                            <span class="ex-stats" style="background: rgba(255, 51, 102, 0.2); color: var(--primary-color);">Top Set: ${topSet.reps}x @ ${topSet.load}</span>
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
        // Criar 5 Slides Vazios para o usuário preencher os exercícios do dia
        const library = workoutEngine.getExerciseLibrary(todayWorkoutType);
        let optionsHtml = '<option value="">Selecione o Exercício...</option>';
        library.forEach(ex => optionsHtml += `<option value="${ex}">${ex}</option>`);
        
        let slidesHtml = '';
        for (let i = 0; i < 5; i++) {
            slidesHtml += `
            <div class="wm-slide" data-idx="${i}">
                <div style="margin-bottom: 1.5rem;">
                    <select class="inp-ex-name" style="width:100%; padding: 1rem; background: rgba(0,0,0,0.5); color: var(--primary-color); border: 1px solid var(--border-color); border-radius: 12px; font-family: var(--font-heading); font-size: 1.2rem; outline: none;">
                        ${optionsHtml}
                    </select>
                </div>
                
                <div class="sets-container">
                    <!-- Lines injected here -->
                </div>
                <button class="nav-btn btn-add-set" style="width: 100%; text-align: center; border: 1px dashed var(--secondary-color); color: var(--secondary-color); margin-top: 1rem;">+ Adicionar Série</button>

                <div class="input-group" style="margin-top: 2rem;">
                    <label>Tags de Execução</label>
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
        }
        
        wmCarousel.innerHTML = slidesHtml;
        
        // Bind Add Set Buttons
        document.querySelectorAll('.btn-add-set').forEach((btn, slideIdx) => {
            btn.addEventListener('click', (e) => {
                const container = e.target.parentElement.querySelector('.sets-container');
                const setNumber = container.children.length + 1;
                const setHtml = `
                    <div class="input-row set-row" style="align-items: center;">
                        <span style="color: var(--text-secondary); font-size: 0.8rem; width: 40px;">S${setNumber}</span>
                        <div class="input-group" style="margin-top:0;">
                            <input type="number" class="inp-reps" placeholder="Reps" style="padding: 0.5rem;">
                        </div>
                        <div class="input-group" style="margin-top:0;">
                            <input type="text" class="inp-load" placeholder="Peso (ex: 20kg)" style="padding: 0.5rem;">
                        </div>
                    </div>
                `;
                container.insertAdjacentHTML('beforeend', setHtml);
            });
            // Click to add the first set by default
            btn.click();
        });

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

    wmNext?.addEventListener('click', () => { currentSlide++; updateWorkoutUI(); });
    wmPrev?.addEventListener('click', () => { currentSlide--; updateWorkoutUI(); });

    document.getElementById('wm-cancel')?.addEventListener('click', () => {
        wmContainer.style.display = 'none';
        document.getElementById('tab-treino').style.display = 'block';
    });

    wmFinish?.addEventListener('click', () => {
        const slides = document.querySelectorAll('.wm-slide');
        let finalData = [];
        
        slides.forEach(s => {
            const exName = s.querySelector('.inp-ex-name').value;
            if (!exName) return; // Skip empty slides

            const setRows = s.querySelectorAll('.set-row');
            let sets = [];
            setRows.forEach(row => {
                const reps = row.querySelector('.inp-reps').value;
                const load = row.querySelector('.inp-load').value;
                if (reps || load) sets.push({ reps: reps || '0', load: load || 'BW' });
            });

            const notes = s.querySelector('.inp-notes').value;
            const selectedTags = Array.from(s.querySelectorAll('.tag-chip.selected')).map(t => t.getAttribute('data-tag'));
            
            finalData.push({ name: exName, sets: sets, notes, tags: selectedTags });
        });

        if (finalData.length === 0) {
            alert('Nenhum exercício preenchido!');
            return;
        }

        // Usa a data atual real, formatada localmente
        const tzoffset = (new Date()).getTimezoneOffset() * 60000;
        const localISOTime = (new Date(Date.now() - tzoffset)).toISOString().split('T')[0];
        
        DB.saveWorkout(localISOTime, {
            type: todayWorkoutType,
            exercises: finalData
        });
        
        alert('Treino Salvo com Sucesso! Seu histórico foi atualizado.');
        window.location.reload();
    });
});
