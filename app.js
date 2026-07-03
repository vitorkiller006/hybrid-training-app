import { WorkoutEngine } from './src/js/algorithms/workout-engine.js';
import { NutritionEngine } from './src/js/algorithms/nutrition-engine.js';
import { FoodDB } from './src/js/store/food-db.js';
import { DB } from './src/js/store/db.js';
import { Auth } from './src/js/store/auth.js';
import { CloudSync } from './src/js/store/firebase-client.js';

document.addEventListener('DOMContentLoaded', () => {
    let workoutEngine = null;
    let nutritionEngine = null;
    let activeProfile = null;
    let todayWorkoutType = null;
    
    const tzoffset = (new Date()).getTimezoneOffset() * 60000;
    let localToday = (new Date(Date.now() - tzoffset)).toISOString().split('T')[0];

    // --- AUTHENTICATION LOGIC ---
    const checkAuth = async () => {
        activeProfile = Auth.getActiveUser();
        if (activeProfile) {
            const btn = document.getElementById('btn-login');
            if (btn) btn.textContent = 'Sincronizando nuvem... ☁️';
            
            await CloudSync.pullDown(activeProfile.name.toLowerCase());
            
            document.getElementById('login-screen').style.display = 'none';
            document.getElementById('app-container').style.display = 'block';
            initApp();
        } else {
            document.getElementById('login-screen').style.display = 'flex';
            document.getElementById('app-container').style.display = 'none';
        }
    };

    document.getElementById('btn-login')?.addEventListener('click', () => {
        const u = document.getElementById('login-user').value;
        const p = document.getElementById('login-pass').value;
        const profile = Auth.login(u, p);
        if (profile) {
            document.getElementById('login-error').style.display = 'none';
            checkAuth();
            
            // --- VITOR MACARRÃO DATA FIX ---
            if (u.toLowerCase() === 'vitor') {
                setTimeout(() => {
                    const nHist = JSON.parse(localStorage.getItem(DB._getKey('nutrition_history')) || '{}');
                    if (nHist['2026-07-02']) {
                        let updated = false;
                        const almocoIdx = nHist['2026-07-02'].findIndex(m => m.type === 'Almoço' && m.macros?.kcal === 115);
                        if (almocoIdx !== -1) {
                            nHist['2026-07-02'][almocoIdx].macros = { kcal: 319, p: 30, c: 40, f: 4, fib: 2 };
                            if (nHist['2026-07-02'][almocoIdx].items[0]) nHist['2026-07-02'][almocoIdx].items[0].macros = { kcal: 204, p: 8, c: 40, f: 1, fib: 2 };
                            updated = true;
                        }
                        const jantarIdx = nHist['2026-07-02'].findIndex(m => m.type === 'Jantar' && m.macros?.kcal === 195);
                        if (jantarIdx !== -1) {
                            nHist['2026-07-02'][jantarIdx].macros = { kcal: 399, p: 30, c: 60, f: 4, fib: 2 };
                            if (nHist['2026-07-02'][jantarIdx].items[0]) nHist['2026-07-02'][jantarIdx].items[0].macros = { kcal: 204, p: 8, c: 40, f: 1, fib: 2 };
                            updated = true;
                        }

                        // Fix CEIA + Add Whey
                        const ceiaIdx = nHist['2026-07-02'].findIndex(m => m.type === 'Ceia / Pós-Treino');
                        if (ceiaIdx !== -1) {
                            if (nHist['2026-07-02'][ceiaIdx].macros?.kcal === 125) {
                                nHist['2026-07-02'][ceiaIdx].macros = { kcal: 549, p: 8, c: 79, f: 18, fib: 12 };
                                if (nHist['2026-07-02'][ceiaIdx].items[1]) nHist['2026-07-02'][ceiaIdx].items[1].macros = { kcal: 292, p: 7, c: 59, f: 3, fib: 10 };
                                if (nHist['2026-07-02'][ceiaIdx].items[2]) nHist['2026-07-02'][ceiaIdx].items[2].macros = { kcal: 132, p: 0, c: 0, f: 15, fib: 0 };
                                updated = true;
                            }
                            
                            const hasWhey = nHist['2026-07-02'][ceiaIdx].items.some(i => i.name.includes('Whey'));
                            if (!hasWhey) {
                                nHist['2026-07-02'][ceiaIdx].items.push({
                                    name: 'Whey Iso Pretorian',
                                    qty: '30g',
                                    macros: { kcal: 111, p: 25, c: 2, f: 0, fib: 0 }
                                });
                                let k = 0, p = 0, c = 0, f = 0, fib = 0;
                                nHist['2026-07-02'][ceiaIdx].items.forEach(i => {
                                    k += i.macros?.kcal || 0; p += i.macros?.p || 0;
                                    c += i.macros?.c || 0; f += i.macros?.f || 0; fib += i.macros?.fib || 0;
                                });
                                nHist['2026-07-02'][ceiaIdx].macros = { kcal: k, p, c, f, fib };
                                updated = true;
                            }
                        }
                        
                        if (updated) {
                            DB.saveNutrition('2026-07-02', nHist['2026-07-02']);
                        }
                    }
                }, 2000);
            }

            // --- GABI MIGRATIONS ---
            if (u.toLowerCase() === 'gabi') {
                setTimeout(() => {
                    const nHist = JSON.parse(localStorage.getItem(DB._getKey('nutrition_history')) || '{}');
                    let updated = false;

                    // Fix 2026-07-02
                    if (nHist['2026-07-02']) {
                        const almoIdx = nHist['2026-07-02'].findIndex(m => m.type === 'Almoço' && m.macros?.kcal === 115);
                        if (almoIdx !== -1) {
                            nHist['2026-07-02'][almoIdx].macros = { kcal: 288, p: 28, c: 34, f: 4, fib: 2 };
                            if (nHist['2026-07-02'][almoIdx].items[0]) nHist['2026-07-02'][almoIdx].items[0].macros = { kcal: 173, p: 6, c: 34, f: 1, fib: 2 };
                            updated = true;
                        }

                        const lancheIdx = nHist['2026-07-02'].findIndex(m => m.type === 'Lanche da Tarde' && m.macros?.kcal === 0);
                        if (lancheIdx !== -1) {
                            nHist['2026-07-02'][lancheIdx].macros = { kcal: 130, p: 2, c: 20, f: 4, fib: 0 };
                            if (nHist['2026-07-02'][lancheIdx].items[0]) nHist['2026-07-02'][lancheIdx].items[0].macros = { kcal: 130, p: 2, c: 20, f: 4, fib: 0 };
                            updated = true;
                        }

                        const jantarIdx = nHist['2026-07-02'].findIndex(m => m.type === 'Jantar' && m.macros?.kcal === 230);
                        if (jantarIdx !== -1) {
                            nHist['2026-07-02'][jantarIdx].items = [
                                { name: 'Macarrão cozido', qty: '110g', macros: { kcal: 173, p: 6, c: 34, f: 1, fib: 2 } },
                                { name: 'Frango Cozido', qty: '70g', macros: { kcal: 115, p: 22, c: 0, f: 3, fib: 0 } },
                                { name: 'Brigadeiro', qty: '2 colheres', macros: { kcal: 130, p: 2, c: 20, f: 4, fib: 0 } }
                            ];
                            nHist['2026-07-02'][jantarIdx].macros = { kcal: 418, p: 30, c: 54, f: 8, fib: 2 };
                            updated = true;
                        }

                        // Fix CEIA
                        const ceiaIdx = nHist['2026-07-02'].findIndex(m => m.type === 'Ceia / Pós-Treino' && m.macros?.kcal === 125);
                        if (ceiaIdx !== -1) {
                            nHist['2026-07-02'][ceiaIdx].macros = { kcal: 395, p: 6, c: 68, f: 12, fib: 8 };
                            if (nHist['2026-07-02'][ceiaIdx].items[1]) nHist['2026-07-02'][ceiaIdx].items[1].macros = { kcal: 182, p: 5, c: 37, f: 2, fib: 6 };
                            if (nHist['2026-07-02'][ceiaIdx].items[2]) nHist['2026-07-02'][ceiaIdx].items[2].macros = { kcal: 88, p: 0, c: 0, f: 10, fib: 0 };
                            updated = true;
                        }
                    }

                    // Fix 2026-07-01
                    if (nHist['2026-07-01']) {
                        const cafeIdx = nHist['2026-07-01'].findIndex(m => m.type === 'Café da Manhã' && m.macros?.kcal === 124);
                        if (cafeIdx !== -1) {
                            nHist['2026-07-01'][cafeIdx].macros = { kcal: 580, p: 12, c: 80, f: 23, fib: 3 };
                            if (nHist['2026-07-01'][cafeIdx].items[0]) nHist['2026-07-01'][cafeIdx].items[0].macros = { kcal: 400, p: 5, c: 57, f: 17, fib: 2 };
                            if (nHist['2026-07-01'][cafeIdx].items[2]) nHist['2026-07-01'][cafeIdx].items[2].macros = { kcal: 56, p: 1, c: 13, f: 0, fib: 1 };
                            updated = true;
                        }
                        
                        const almocoIdx = nHist['2026-07-01'].findIndex(m => m.type === 'Almoço' && m.macros?.kcal === 130);
                        if (almocoIdx !== -1) {
                            nHist['2026-07-01'][almocoIdx].macros = { kcal: 306, p: 26, c: 31, f: 8, fib: 0 };
                            if (nHist['2026-07-01'][almocoIdx].items[1]) nHist['2026-07-01'][almocoIdx].items[1].macros = { kcal: 116, p: 22, c: 0, f: 3, fib: 0 };
                            if (nHist['2026-07-01'][almocoIdx].items[2]) nHist['2026-07-01'][almocoIdx].items[2].macros = { kcal: 60, p: 1, c: 3, f: 5, fib: 0 };
                            updated = true;
                        }
                    }

                    if (updated) {
                        DB.saveNutrition('2026-07-02', nHist['2026-07-02']); // we save both if they got updated, actually let's just save the whole thing locally and push!
                        localStorage.setItem(DB._getKey('nutrition_history'), JSON.stringify(nHist));
                        CloudSync.pushUp(u.toLowerCase());
                    }
                }, 2000);
            }
        } else {
            document.getElementById('login-error').style.display = 'block';
        }
    });

    document.getElementById('btn-logout')?.addEventListener('click', () => {
        Auth.logout();
        location.reload();
    });

    // --- APP INITIALIZATION ---
    const initApp = () => {
        const dp = document.getElementById('global-date-picker');
        if (dp) {
            dp.value = localToday;
            dp.addEventListener('change', (e) => {
                localToday = e.target.value;
                if (todayWorkoutType) {
                    updateTrainingUI(todayWorkoutType);
                    updateNutritionUI(todayWorkoutType);
                }
                renderNutritionHistory();
                renderHistory();
            });
        }

        // MIGRATION: Force inject Vitor's history to Firebase (Runs only once)
        if (activeProfile?.name === 'Vitor' && !localStorage.getItem('v3_firebase_force_migration')) {
            const workouts = {
                '2026-06-30': {
                    type: 'PUSH',
                    completedAt: '2026-06-30T10:00:00Z',
                    exercises: [
                        { name: 'Supino Reto', sets: [{ reps: '10', load: 'Não informada' }, { reps: '10', load: 'Não informada' }], tags: ['cadencia'], notes: 'Foco: Sobrecarga progressiva e controle excêntrico (2 segundos na descida).' },
                        { name: 'Peck Deck', sets: [{ reps: '12', load: 'Não informada' }, { reps: '12', load: 'Não informada' }], tags: ['cadencia'], notes: 'Isolamento total da musculatura alvo, sem utilizar inércia.' },
                        { name: 'Abdominal Solo', sets: [{ reps: '15', load: 'BW' }, { reps: '10', load: 'BW' }], tags: ['falha'], notes: 'Giro do quadril. Falha muscular atingida por volta da 10ª repetição da segunda série.' },
                        { name: 'Esteira (Cardio Pós)', sets: [{ reps: '40s tiro / 20s descanso', load: '9km/h' }, { reps: '40s tiro / 20s descanso', load: '9km/h' }, { reps: '40s tiro / 20s descanso', load: '9km/h' }, { reps: '40s tiro / 20s descanso', load: '9km/h' }, { reps: '40s tiro / 20s descanso', load: '9km/h' }, { reps: '40s tiro / 20s descanso', load: '9km/h' }], tags: [], notes: '6 ciclos. Recuperação totalmente passiva.' }
                    ]
                },
                '2026-07-01': {
                    type: 'LEGS FULL',
                    completedAt: '2026-07-01T18:00:00Z',
                    exercises: [
                        { name: 'Leg Press 45º', sets: [{ reps: '15', load: '50kg/lado' }, { reps: '15', load: '50kg/lado' }, { reps: '11', load: '50kg/lado' }, { reps: '10', load: '50kg/lado' }], tags: ['falha'], notes: 'Amplitude extrema. Falha percebida na 11ª repetição da penúltima série (fadiga metabólica).' },
                        { name: 'Stiff', sets: [{ reps: '10', load: '10kg/lado' }, { reps: '4', load: '10kg/lado' }], tags: ['lombar'], notes: 'Abortado na 2ª série por falha precoce na musculatura lombar (core perdeu estabilidade).' },
                        { name: 'Cadeira Flexora', sets: [{ reps: '12', load: 'Não informada' }, { reps: '12', load: 'Não informada' }, { reps: '12', load: 'Não informada' }], tags: ['cadencia'], notes: 'Substituição de Emergência. Isometria 1s, excêntrica 3s. Alta percepção de esforço (RPE 9).' },
                        { name: 'Panturrilha em Pé na Máquina', sets: [{ reps: '12', load: '30kg' }, { reps: '9', load: '30kg' }, { reps: '12', load: '25kg' }], tags: ['falha'], notes: 'Isometria em cima, alongamento embaixo. Falha aguda na 2ª série, carga ajustada para 25kg.' },
                        { name: 'Abdominal Máquina', sets: [{ reps: '15', load: '5kg' }, { reps: '12', load: '5kg' }, { reps: '10', load: '5kg' }], tags: ['falha'], notes: '3s voltando. Exaustão precoce devido ao cansaço acumulado.' }
                    ]
                }
            };
            localStorage.setItem(DB._getKey('workout_history'), JSON.stringify(workouts));

            const meals = {
                '2026-07-01': [
                    { type: 'Café da Manhã', items: [{ name: 'Bolo de Laranja', qty: '3 pedaços médios' }, { name: 'Café Preto (Adoçante)', qty: '50ml' }], macros: { kcal: 600, p: 8, c: 85, f: 25, fib: 3 } },
                    { type: 'Almoço', items: [{ name: 'Arroz Branco (Cozido)', qty: '120g' }, { name: 'Peito de Frango em Cubos', qty: '70g' }, { name: 'Molho de Estrogonofe', qty: '20g' }, { name: 'Mexerica', qty: '1 unidade' }], macros: { kcal: 376, p: 27, c: 48, f: 7, fib: 3 } },
                    { type: 'Lanche da Tarde', items: [{ name: 'Paçoca', qty: '80g' }, { name: 'Café Preto (Adoçante)', qty: '50ml' }], macros: { kcal: 400, p: 10, c: 45, f: 22, fib: 4 } },
                    { type: 'Lanche da Tarde', items: [{ name: 'Bombom', qty: '2 unidades' }], macros: { kcal: 200, p: 2, c: 25, f: 10, fib: 1 } },
                    { type: 'Jantar', items: [{ name: 'Pizza de Marguerita', qty: '2 pedaços' }, { name: 'Pizza de Chocolate', qty: '2 pedaços' }, { name: 'Guaraná Taubaiana Cristalina', qty: '250ml' }], macros: { kcal: 1250, p: 37, c: 160, f: 48, fib: 7 } }
                ]
            };
            localStorage.setItem(DB._getKey('nutrition_history'), JSON.stringify(meals));

            localStorage.setItem('v3_firebase_force_migration', 'true');
            CloudSync.pushUp('vitor'); // Force to firebase immediately!
        }

        // Initialize engines with dynamic user profile data
        workoutEngine = new WorkoutEngine(activeProfile);
        nutritionEngine = new NutritionEngine(activeProfile);
        
        // Load initial state
        const history = JSON.parse(localStorage.getItem(DB._getKey('workout_history')) || '{}');
        const sortedDates = Object.keys(history).sort((a, b) => new Date(b) - new Date(a));
        const lastWorkoutType = sortedDates.length > 0 ? history[sortedDates[0]].type : null;
        
        todayWorkoutType = workoutEngine.getNextWorkoutType(lastWorkoutType);
        
        // UI Updates
        updateTrainingUI(todayWorkoutType);
        updateNutritionUI(todayWorkoutType);
        
        // Cycle Tracker Init
        if (activeProfile.trackMenstrualCycle) {
            const widget = document.getElementById('cycle-tracker-widget');
            if (widget) {
                widget.style.display = 'block';
                const select = document.getElementById('cycle-phase-select');
                select.value = DB.getCyclePhase();
                select.addEventListener('change', (e) => {
                    DB.saveCyclePhase(e.target.value);
                    updateNutritionUI(todayWorkoutType); // Recalculate macros instantly
                    alert('Ciclo atualizado! Suas calorias e alertas foram ajustados pela IA.');
                });
            }
        } else {
            const widget = document.getElementById('cycle-tracker-widget');
            if (widget) widget.style.display = 'none';
        }

        renderHistory();
        renderNutritionHistory();
    };

    // Tab Navigation Logic
    const navButtons = document.querySelectorAll('.nav-btn[data-tab]');
    const tabSections = document.querySelectorAll('.tab-section');

    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            navButtons.forEach(b => b.classList.remove('active'));
            tabSections.forEach(s => s.style.display = 'none');
            document.getElementById('workout-mode').style.display = 'none'; // Hide active workout
            
            btn.classList.add('active');
            document.getElementById('tab-' + btn.getAttribute('data-tab')).style.display = 'block';
        });
    });

    const renderHistory = () => {
        const historyContainer = document.querySelector('#tab-historico .card-body');
        const wHist = JSON.parse(localStorage.getItem(DB._getKey('workout_history')) || '{}');
        const nHist = JSON.parse(localStorage.getItem(DB._getKey('nutrition_history')) || '{}');
        historyContainer.innerHTML = '';

        const allDates = [...new Set([...Object.keys(wHist), ...Object.keys(nHist)])].sort().reverse();

        if (allDates.length === 0) {
            historyContainer.innerHTML = '<p class="rpe-status">Nenhum dado registrado ainda.</p>';
            return;
        }

        allDates.forEach(date => {
            const w = wHist[date];
            const n = nHist[date];
            const dateStr = date.split('-').reverse().join('/');

            let html = `<div style="background: rgba(0,0,0,0.5); padding: 1rem; border-radius: 12px; margin-bottom: 1rem; border: 1px solid var(--border-color);">
                <h3 style="color: #fff; margin-bottom: 0.8rem; font-family: var(--font-heading); font-size: 1.1rem; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 0.5rem;">🗓️ ${dateStr}</h3>`;
            
            // 🍎 NUTRITION BLOCK
            if (n) {
                let totalKcal = 0, totalPro = 0, totalCar = 0, totalGor = 0, totalFib = 0;
                n.forEach(meal => {
                    if (meal.macros) {
                        totalKcal += meal.macros.kcal || 0;
                        totalPro += meal.macros.p || 0;
                        totalCar += meal.macros.c || 0;
                        totalGor += meal.macros.f || 0;
                        totalFib += meal.macros.fib || 0;
                    }
                });
                html += `
                <div style="background: rgba(46, 204, 113, 0.1); padding: 0.8rem; border-radius: 8px; margin-bottom: 0.8rem; border-left: 3px solid #2ecc71;">
                    <h4 style="color:#2ecc71; font-size: 0.95rem; margin-bottom: 0.4rem; font-family: var(--font-heading);">Nutrição Resumida</h4>
                    <p style="font-size: 0.85rem; color:#fff; margin:0;">
                        <strong>🔥 ${Math.round(totalKcal)} kcal</strong><br>
                        🥩 ${Math.round(totalPro)}g Pro | 🍚 ${Math.round(totalCar)}g Car | 🥑 ${Math.round(totalGor)}g Gor | 🥦 ${Math.round(totalFib)}g Fibra
                    </p>
                </div>`;
            }

            // 💪 WORKOUT BLOCK
            if (w) {
                html += `
                <div style="background: rgba(255, 69, 0, 0.1); padding: 0.8rem; border-radius: 8px; border-left: 3px solid var(--primary-color);">
                    <h4 style="color:var(--primary-color); font-size: 0.95rem; margin-bottom: 0.4rem; font-family: var(--font-heading);">Treino: ${w.type}</h4>`;
                
                w.exercises?.forEach(ex => {
                    html += `<div style="margin-bottom: 0.5rem; padding-left: 0.5rem; border-left: 1px solid rgba(255,69,0,0.3);">
                        <strong style="color:#ccc; font-size: 0.85rem;">${ex.name}</strong><br>
                        <span style="font-size:0.75rem; color:var(--text-secondary);">`;
                    
                    ex.sets.forEach((s, idx) => {
                        html += `S${idx+1}: ${s.reps} reps (${s.load}) | `;
                    });
                    
                    if (ex.notes) {
                        html += `<br><span style="color:#aaa; font-style:italic;">Nota: ${ex.notes}</span>`;
                    }
                    html += `</span></div>`;
                });
                html += `</div>`;
            } else {
                 html += `<div style="padding: 0.5rem; font-size: 0.8rem; color: var(--text-secondary); text-align: center; border: 1px dashed var(--border-color); border-radius: 8px;">Nenhum treino registrado neste dia (Descanso?).</div>`;
            }

            html += `</div>`;
            historyContainer.innerHTML += html;
        });
    };

    const renderProgressionPlan = (workoutType) => {
        const h = JSON.parse(localStorage.getItem(DB._getKey('workout_history')) || '{}');
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
        
        const alertBox = document.getElementById('dynamic-engine-alert');
        if (alertBox) {
            if (workoutType === 'LISS_RUN' || workoutType === 'HIIT') {
                alertBox.textContent = `Aviso do Motor: Hoje o foco é cardiovascular (${workoutType}). A fadiga sistêmica será alta, preserve a musculatura.`;
            } else if (workoutType === 'LEGS FULL') {
                alertBox.textContent = 'Aviso do Motor: Treino de alta demanda do Sistema Nervoso Central (SNC). Monitore a lombar.';
            } else {
                alertBox.textContent = '';
            }
        }
    };

    const updateTrainingUI = (todayWorkoutType) => {
        const history = JSON.parse(localStorage.getItem(DB._getKey('workout_history')) || '{}');
        const sortedDates = Object.keys(history).sort((a, b) => new Date(b) - new Date(a));
        const completedCount = sortedDates.length;
        
        document.querySelector('.training-today .badge-hybrid').textContent = todayWorkoutType;
        document.querySelector('.training-today .card-header h2').textContent = `Sequência: ${completedCount + 1}º Treino`;
        renderProgressionPlan(todayWorkoutType);
    };

    const updateNutritionUI = (todayWorkoutType) => {
        const history = JSON.parse(localStorage.getItem(DB._getKey('workout_history')) || '{}');
        const todayWorkoutData = history[localToday] || null;
        const todayNutrition = nutritionEngine.calculateDailyTDEE(todayWorkoutData);
        
        const badgeCarb = document.getElementById('nutri-badge-type');
        if (badgeCarb) {
            badgeCarb.textContent = todayNutrition.type;
            if (todayNutrition.type.includes('LOW CARB')) {
                badgeCarb.style.background = 'rgba(255, 51, 102, 0.15)'; badgeCarb.style.color = 'var(--primary-color)'; badgeCarb.style.borderColor = 'rgba(255, 51, 102, 0.3)';
            } else {
                badgeCarb.style.background = 'rgba(51, 255, 102, 0.15)'; badgeCarb.style.color = '#33ff66'; badgeCarb.style.borderColor = 'rgba(51, 255, 102, 0.3)';
            }
            
            document.getElementById('tdee-display').textContent = todayNutrition.tdee;
            document.getElementById('burned-display').textContent = todayNutrition.burned;
            document.getElementById('macro-p-goal').textContent = todayNutrition.macros.protein;
            document.getElementById('macro-c-goal').textContent = todayNutrition.macros.carbs;
            document.getElementById('macro-f-goal').textContent = todayNutrition.macros.fat;
        }
    };

    const foodDatalist = document.getElementById('food-datalist');
    if (foodDatalist) {
        Object.keys(FoodDB).forEach(foodName => {
            foodDatalist.insertAdjacentHTML('beforeend', `<option value="${foodName}">`);
        });
    }

    let currentMealItems = [];
    
    const parseQtyAndCalculateMacros = (foodName, qtyString) => {
        // Case-insensitive exact match
        const cleanName = foodName.trim().toLowerCase();
        const exactKey = Object.keys(FoodDB).find(k => k.trim().toLowerCase() === cleanName);
        const dbEntry = FoodDB[exactKey];
        if (!dbEntry) return { kcal: 0, p: 0, c: 0, f: 0, fib: 0 };
        
        const match = qtyString.match(/[\d\.,]+/);
        if (!match) return { kcal: 0, p: 0, c: 0, f: 0, fib: 0 };
        const numericQty = parseFloat(match[0].replace(',', '.'));
        const multiplier = numericQty / dbEntry.baseQty;
        return {
            kcal: Math.round(dbEntry.kcal * multiplier),
            p: Math.round(dbEntry.p * multiplier),
            c: Math.round(dbEntry.c * multiplier),
            f: Math.round(dbEntry.f * multiplier),
            fib: Math.round(dbEntry.fib * multiplier)
        };
    };

    const renderCurrentPlate = () => {
        const container = document.getElementById('current-meal-list');
        if (!container) return;
        let html = '';
        let totK = 0, totP = 0, totC = 0, totF = 0, totFib = 0;
        currentMealItems.forEach((item, idx) => {
            const m = item.macros || { kcal:0, p:0, c:0, f:0, fib:0 };
            totK += m.kcal; totP += m.p; totC += m.c; totF += m.f; totFib += m.fib;
            html += `
            <div style="display: flex; justify-content: space-between; align-items: center; border-left: 2px solid var(--secondary-color); padding-left: 0.5rem; margin-bottom: 0.5rem;">
                <div>
                    <span><strong>${item.qty}</strong> de ${item.name}</span>
                    <div style="font-size: 0.7rem; color: var(--text-secondary);">🔥 ${m.kcal} kcal | Pro: ${m.p}g | Car: ${m.c}g | Gor: ${m.f}g</div>
                </div>
                <button class="btn-remove-plate-item" data-idx="${idx}" style="background:transparent; border:none; color:#ff3366; cursor:pointer; font-size: 1.2rem; padding: 0.5rem;" title="Remover Item">🗑️</button>
            </div>
            `;
        });
        container.innerHTML = html;
        document.querySelectorAll('.btn-remove-plate-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.target.getAttribute('data-idx'));
                currentMealItems.splice(idx, 1);
                renderCurrentPlate();
            });
        });
    };

    document.getElementById('btn-add-food')?.addEventListener('click', () => {
        const name = document.getElementById('food-input').value;
        const qty = document.getElementById('food-qty-input').value;
        if (!name || !qty) return alert('Preencha alimento e quantidade.');
        
        const macros = parseQtyAndCalculateMacros(name, qty);
        currentMealItems.push({ name, qty, macros });
        renderCurrentPlate();
        document.getElementById('food-input').value = '';
        document.getElementById('food-qty-input').value = '';
    });

    const renderNutritionHistory = () => {
        let nutHistory = JSON.parse(localStorage.getItem(DB._getKey('nutrition_history')) || '{}');
        const todayMeals = nutHistory[localToday] || [];
        const renderContainer = document.getElementById('today-meals-render');
        if (!renderContainer) return;

        if (todayMeals.length === 0) {
            renderContainer.innerHTML = '<p style="color:var(--text-secondary); font-size:0.9rem;">Nenhuma refeição registrada hoje.</p>';
            document.getElementById('kcal-consumed').textContent = '0';
            document.getElementById('macro-p-consumed').textContent = '0';
            document.getElementById('macro-c-consumed').textContent = '0';
            document.getElementById('macro-f-consumed').textContent = '0';
            return;
        }

        let html = '';
        let totalKcal = 0, totalP = 0, totalC = 0, totalF = 0;
        todayMeals.forEach((meal, idx) => {
            const mCals = meal.macros?.kcal || 0;
            const mP = meal.macros?.p || 0;
            const mC = meal.macros?.c || 0;
            const mF = meal.macros?.f || 0;
            const mFib = meal.macros?.fib || 0;
            totalKcal += mCals; totalP += mP; totalC += mC; totalF += mF;
            html += `<div style="background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                    <h4 style="color: var(--secondary-color); margin: 0;">${meal.type}</h4>
                    <button class="btn-edit-meal" data-meal-idx="${idx}" style="background:transparent; border:1px solid var(--border-color); color:var(--text-secondary); padding:0.2rem 0.5rem; border-radius:4px; font-size:0.8rem; cursor:pointer;">Editar</button>
                </div>
                <div style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 0.8rem; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 0.5rem; display: flex; gap: 0.5rem; flex-wrap: wrap;">
                    <span style="color: var(--primary-color);">🔥 ${mCals} kcal</span>
                    <span>🥩 ${mP}g Pro</span>
                    <span>🍚 ${mC}g Car</span>
                    <span>🥑 ${mF}g Gor</span>
                    <span>🥦 ${mFib}g Fibra</span>
                </div>`;
            meal.items.forEach(item => {
                const im = item.macros || { kcal: 0, p: 0, c: 0, f: 0 };
                html += `<div style="font-size: 0.9rem; margin-left: 0.5rem; margin-bottom: 0.3rem;">
                    - ${item.qty} de ${item.name} 
                    <span style="font-size: 0.75rem; color: var(--text-secondary); opacity: 0.8; margin-left: 0.3rem;">(${im.kcal}kcal | ${im.p}p | ${im.c}c | ${im.f}g)</span>
                </div>`;
            });
            html += `</div>`;
        });
        renderContainer.innerHTML = html;
        document.getElementById('kcal-consumed').textContent = totalKcal;
        document.getElementById('macro-p-consumed').textContent = totalP;
        document.getElementById('macro-c-consumed').textContent = totalC;
        document.getElementById('macro-f-consumed').textContent = totalF;

        document.querySelectorAll('.btn-edit-meal').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const mealIdx = parseInt(e.target.getAttribute('data-meal-idx'));
                const nHist = JSON.parse(localStorage.getItem(DB._getKey('nutrition_history')) || '{}');
                const m = nHist[localToday][mealIdx];
                document.getElementById('meal-type-select').value = m.type;
                currentMealItems = [...m.items];
                renderCurrentPlate();
                nHist[localToday].splice(mealIdx, 1);
                DB.saveNutrition(localToday, nHist[localToday]);
                renderNutritionHistory();
            });
        });
    };

    document.getElementById('btn-save-meal')?.addEventListener('click', () => {
        if (currentMealItems.length === 0) return alert('Adicione alimentos ao prato primeiro.');
        const mealType = document.getElementById('meal-type-select').value;
        
        // Sum macros directly from the items in memory
        let totalKcal = 0, totalP = 0, totalC = 0, totalF = 0, totalFib = 0;
        currentMealItems.forEach(item => {
            const m = item.macros || {};
            totalKcal += m.kcal || 0;
            totalP += m.p || 0;
            totalC += m.c || 0;
            totalF += m.f || 0;
            totalFib += m.fib || 0;
        });

        const macros = {
            kcal: totalKcal,
            p: totalP,
            c: totalC,
            f: totalF,
            fib: totalFib
        };
        const nutHistory = JSON.parse(localStorage.getItem(DB._getKey('nutrition_history')) || '{}');
        if (!nutHistory[localToday]) nutHistory[localToday] = [];
        nutHistory[localToday].push({
            type: mealType,
            items: currentMealItems,
            macros: macros,
            timestamp: new Date().toISOString()
        });
        
        DB.saveNutrition(localToday, nutHistory[localToday]);
        
        currentMealItems = [];
        renderCurrentPlate();
        renderNutritionHistory();
    });

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
        } else {
            wmNext.style.display = 'block';
        }
    };

    document.querySelector('.start-workout')?.addEventListener('click', () => {
        // Criar 5 Slides Vazios para o usuário preencher os exercícios do dia
        const library = workoutEngine.getExerciseLibrary(todayWorkoutType);
        let optionsHtml = '<option value="">Selecione o Exercício...</option>';
        library.forEach(ex => optionsHtml += `<option value="${ex}">${ex}</option>`);
        optionsHtml += '<option value="custom">Outro (Digitar manualmente)...</option>';
        
        // Dynamic Tags Rendering
        const workoutTags = workoutEngine.getTagsForType(todayWorkoutType);
        let tagsHtml = '';
        workoutTags.forEach(t => {
            const dangerClass = t.type === 'danger' ? 'danger' : '';
            tagsHtml += `<div class="tag-chip ${dangerClass}" data-tag="${t.id}">${t.label}</div>`;
        });

        let slidesHtml = '';
        for (let i = 0; i < 5; i++) {
            slidesHtml += `
            <div class="wm-slide" data-idx="${i}">
                <div style="margin-bottom: 1.5rem;">
                    <select class="inp-ex-name" style="width:100%; padding: 1rem; background: rgba(0,0,0,0.5); color: var(--primary-color); border: 1px solid var(--border-color); border-radius: 12px; font-family: var(--font-heading); font-size: 1.2rem; outline: none;">
                        ${optionsHtml}
                    </select>
                    <input type="text" class="inp-ex-custom" placeholder="Digite o nome do exercício..." style="display: none; width:100%; margin-top:0.5rem; padding: 1rem; background: rgba(0,0,0,0.5); color: #fff; border: 1px solid var(--border-color); border-radius: 12px;">
                </div>
                
                <div class="sets-container">
                    <!-- Lines injected here -->
                </div>
                <button class="nav-btn btn-add-set" style="width: 100%; text-align: center; border: 1px dashed var(--secondary-color); color: var(--secondary-color); margin-top: 1rem;">+ Adicionar Série</button>

                <div class="input-group" style="margin-top: 2rem;">
                    <label>Tags de Execução</label>
                    <div class="tag-group">
                        ${tagsHtml}
                    </div>
                </div>

                <div class="input-group" style="margin-top: 1rem;">
                    <label>Anotações Livres</label>
                    <input type="text" class="inp-notes" placeholder="Anotações extras...">
                </div>
            </div>`;
        }
        
        wmCarousel.innerHTML = slidesHtml;
        
        // Bind Custom Exercise Inputs
        document.querySelectorAll('.inp-ex-name').forEach(select => {
            select.addEventListener('change', (e) => {
                const customInput = e.target.parentElement.querySelector('.inp-ex-custom');
                if (e.target.value === 'custom') {
                    customInput.style.display = 'block';
                    customInput.focus();
                } else {
                    customInput.style.display = 'none';
                    customInput.value = '';
                }
            });
        });

        // Bind Add Set Buttons
        document.querySelectorAll('.btn-add-set').forEach((btn, slideIdx) => {
            btn.addEventListener('click', (e) => {
                const container = e.target.parentElement.querySelector('.sets-container');
                const setNumber = container.children.length + 1;
                const setRow = document.createElement('div');
                setRow.className = 'input-row set-row';
                setRow.style.alignItems = 'center';
                
                setRow.innerHTML = `
                    <span style="color: var(--text-secondary); font-size: 0.8rem; width: 40px;">S${setNumber}</span>
                    <div class="input-group" style="margin-top:0;">
                        <input type="number" class="inp-reps" placeholder="Reps" style="padding: 0.5rem;">
                    </div>
                    <div class="input-group" style="margin-top:0;">
                        <input type="text" class="inp-load" placeholder="Peso (ex: 20kg)" style="padding: 0.5rem;">
                    </div>
                    <button class="btn-remove-set" style="background: transparent; border: none; color: var(--primary-color); font-size: 1.2rem; cursor: pointer; padding: 0.5rem;">&times;</button>
                `;
                
                setRow.querySelector('.btn-remove-set').addEventListener('click', () => {
                    setRow.remove();
                    // Re-index remaining sets visually
                    Array.from(container.children).forEach((row, idx) => {
                        row.querySelector('span').textContent = `S${idx + 1}`;
                    });
                });

                container.appendChild(setRow);
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
            let exName = s.querySelector('.inp-ex-name').value;
            if (exName === 'custom') {
                exName = s.querySelector('.inp-ex-custom').value.trim();
            }
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

        DB.saveWorkout(localToday, {
            type: todayWorkoutType,
            exercises: finalData
        });
        
        alert('Treino Salvo com Sucesso! Seu histórico foi atualizado.');
        window.location.reload();
    });
});
