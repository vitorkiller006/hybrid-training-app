import { WorkoutEngine } from './src/js/algorithms/workout-engine.js?v=4';
import { NutritionEngine } from './src/js/algorithms/nutrition-engine.js?v=4';
import { FoodDB } from './src/js/store/food-db.js?v=4';
import { DB } from './src/js/store/db.js?v=4';
import { Auth } from './src/js/store/auth.js?v=4';
import { CloudSync } from './src/js/store/firebase-client.js?v=4';

document.addEventListener('DOMContentLoaded', () => {
    let workoutEngine = null;
    let nutritionEngine = null;
    let activeProfile = null;
    let todayWorkoutType = null;
    
    const tzoffset = (new Date()).getTimezoneOffset() * 60000;
    let localToday = (new Date(Date.now() - tzoffset)).toISOString().split('T')[0];

    const runMigrations = (u) => {
        const nHist = JSON.parse(localStorage.getItem(DB._getKey('nutrition_history')) || '{}');
        let updated = false;

        if (u === 'vitor') {
            if (nHist['2026-07-02']) {
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
                const ceiaIdx = nHist['2026-07-02'].findIndex(m => m.type === 'Ceia / Pós-Treino');
                if (ceiaIdx !== -1 && nHist['2026-07-02'][ceiaIdx].macros?.kcal === 125) {
                    nHist['2026-07-02'][ceiaIdx].macros = { kcal: 549, p: 8, c: 79, f: 18, fib: 12 };
                    if (nHist['2026-07-02'][ceiaIdx].items[1]) nHist['2026-07-02'][ceiaIdx].items[1].macros = { kcal: 292, p: 7, c: 59, f: 3, fib: 10 };
                    if (nHist['2026-07-02'][ceiaIdx].items[2]) nHist['2026-07-02'][ceiaIdx].items[2].macros = { kcal: 132, p: 0, c: 0, f: 15, fib: 0 };
                    updated = true;
                }
            }
        } else if (u === 'gabi') {
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
                const ceiaIdx = nHist['2026-07-02'].findIndex(m => m.type === 'Ceia / Pós-Treino' && m.macros?.kcal === 125);
                if (ceiaIdx !== -1) {
                    nHist['2026-07-02'][ceiaIdx].macros = { kcal: 395, p: 6, c: 68, f: 12, fib: 8 };
                    if (nHist['2026-07-02'][ceiaIdx].items[1]) nHist['2026-07-02'][ceiaIdx].items[1].macros = { kcal: 182, p: 5, c: 37, f: 2, fib: 6 };
                    if (nHist['2026-07-02'][ceiaIdx].items[2]) nHist['2026-07-02'][ceiaIdx].items[2].macros = { kcal: 88, p: 0, c: 0, f: 10, fib: 0 };
                    updated = true;
                }
            }
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
        }

        if (!nHist['2026-07-03']) nHist['2026-07-03'] = [];
        
        // GENERIC FIXER FOR OVO AND BANANA
        nHist['2026-07-03'].forEach(meal => {
            let mealUpdated = false;
            meal.items.forEach(item => {
                if (item.name.includes('Ovo') && item.macros?.kcal < 20) {
                    item.macros = { kcal: 225, p: 19.5, c: 1.5, f: 16.5, fib: 0 };
                    mealUpdated = true;
                }
                if (item.name.includes('Banana Naninca') && item.macros?.kcal === 0) {
                    item.macros = { kcal: 135, p: 1.5, c: 35, f: 0.5, fib: 3 };
                    mealUpdated = true;
                }
            });
            if (mealUpdated) {
                let k=0, p=0, c=0, f=0, fib=0;
                meal.items.forEach(i => {
                    k += i.macros?.kcal || 0;
                    p += i.macros?.p || 0;
                    c += i.macros?.c || 0;
                    f += i.macros?.f || 0;
                    fib += i.macros?.fib || 0;
                });
                meal.macros = { kcal: Math.round(k), p: Math.round(p), c: Math.round(c), f: Math.round(f), fib: Math.round(fib) };
                updated = true;
            }
        });

        // JANTAR PIZZA 2026-07-03
        const jantarPizzaIdx = nHist['2026-07-03'].findIndex(m => m.type === 'Jantar' && m.items.length === 6);
        if (jantarPizzaIdx === -1) {
            nHist['2026-07-03'].push({
                type: 'Jantar',
                timestamp: new Date().toISOString(),
                macros: { kcal: 736, p: 40, c: 84, f: 26, fib: 4 },
                items: [
                    { name: 'Mini Pizza Pratty (Massa)', qty: '6 un', macros: { kcal: 204, p: 6, c: 42, f: 0, fib: 1.2 } },
                    { name: 'Frango Cozido', qty: '30g', macros: { kcal: 50, p: 9, c: 0, f: 1, fib: 0 } },
                    { name: 'Queijo Mussarela', qty: '30g', macros: { kcal: 90, p: 7.5, c: 1, f: 6.6, fib: 0 } },
                    { name: 'Tomate', qty: '30g', macros: { kcal: 6, p: 0.3, c: 1.2, f: 0.1, fib: 0.4 } },
                    { name: 'Ganache de Chocolate', qty: '3 colheres', macros: { kcal: 300, p: 3, c: 30, f: 18, fib: 3 } },
                    { name: 'Suco Tang (Preparado)', qty: '300ml', macros: { kcal: 27, p: 0, c: 6, f: 0, fib: 0 } }
                ]
            });
            updated = true;
        }

        if (updated) {
            localStorage.setItem(DB._getKey('nutrition_history'), JSON.stringify(nHist));
            CloudSync.pushUp(u);
        }

        // NUTRITION INJECTION AND RECALCULATION
        let nUpdated = false;
        
        // Inject 2026-07-07 meals if not present or if forced
        if (u === 'vitor' && localToday === '2026-07-07') {
            if (!localStorage.getItem('force_inject_0707_v2')) {
                localStorage.setItem('force_inject_0707_v2', 'true');
                nHist['2026-07-07'] = [
                    {
                        type: 'Caf\u00E9 da Manh\u00E3',
                        items: [
                            { name: 'P\u00E3o de Forma Pullman', qty: '2 un', macros: {kcal:0,p:0,c:0,f:0,fib:0} },
                            { name: 'Frango Desfiado', qty: '20g', macros: {kcal:0,p:0,c:0,f:0,fib:0} },
                            { name: 'Caf\u00E9 Preto com ado\u00E7ante', qty: '50ml', macros: {kcal:0,p:0,c:0,f:0,fib:0} }
                        ],
                        macros: {kcal:0,p:0,c:0,f:0,fib:0},
                        timestamp: new Date().toISOString()
                    },
                    {
                        type: 'Almo\u00E7o',
                        items: [
                            { name: 'Arroz Branco (Cozido)', qty: '100g', macros: {kcal:0,p:0,c:0,f:0,fib:0} },
                            { name: 'Feij\u00E3o Carioca (Cozido)', qty: '40g', macros: {kcal:0,p:0,c:0,f:0,fib:0} },
                            { name: 'abobrinha', qty: '20g', macros: {kcal:0,p:0,c:0,f:0,fib:0} },
                            { name: 'Carne Mo\u00EDda', qty: '50g', macros: {kcal:0,p:0,c:0,f:0,fib:0} }
                        ],
                        macros: {kcal:0,p:0,c:0,f:0,fib:0},
                        timestamp: new Date().toISOString()
                    },
                    {
                        type: 'Lanche da Tarde',
                        items: [
                            { name: 'P\u00E3o de Forma Pullman', qty: '2 un', macros: {kcal:0,p:0,c:0,f:0,fib:0} },
                            { name: 'Frango Desfiado', qty: '20g', macros: {kcal:0,p:0,c:0,f:0,fib:0} },
                            { name: 'Caf\u00E9 Preto com ado\u00E7ante', qty: '50ml', macros: {kcal:0,p:0,c:0,f:0,fib:0} }
                        ],
                        macros: {kcal:0,p:0,c:0,f:0,fib:0},
                        timestamp: new Date().toISOString()
                    },
                    {
                        type: 'Jantar',
                        items: [
                            { name: 'Ovo Cozido', qty: '4 un', macros: {kcal:0,p:0,c:0,f:0,fib:0} },
                            { name: 'Arroz Branco (Cozido)', qty: '100g', macros: {kcal:0,p:0,c:0,f:0,fib:0} },
                            { name: 'Feij\u00E3o Carioca (Cozido)', qty: '40g', macros: {kcal:0,p:0,c:0,f:0,fib:0} },
                            { name: 'abobrinha', qty: '20g', macros: {kcal:0,p:0,c:0,f:0,fib:0} }
                        ],
                        macros: {kcal:0,p:0,c:0,f:0,fib:0},
                        timestamp: new Date().toISOString()
                    }
                ];
                nUpdated = true;
            }
        }

        if (u === 'vitor') {
            Object.keys(nHist).forEach(date => {
                nHist[date].forEach(meal => {
                let mealKcal = 0, mealP = 0, mealC = 0, mealF = 0, mealFib = 0;
                meal.items.forEach(item => {
                    // Try exact match or lowercase match
                    let foodDbItem = FoodDB[item.name];
                    if (!foodDbItem) {
                        const key = Object.keys(FoodDB).find(k => k.toLowerCase() === item.name.toLowerCase());
                        if (key) foodDbItem = FoodDB[key];
                    }

                    if (foodDbItem) {
                        const qtyMatch = item.qty.match(/(\d+[\.,]?\d*)/);
                        if (qtyMatch) {
                            let qtyNum = parseFloat(qtyMatch[1].replace(',', '.'));
                            const ratio = qtyNum / foodDbItem.baseQty;
                            
                            const newKcal = Math.round(foodDbItem.kcal * ratio);
                            if (!item.macros) item.macros = {};
                            if (item.macros.kcal !== newKcal) {
                                item.macros.kcal = newKcal;
                                item.macros.p = parseFloat((foodDbItem.p * ratio).toFixed(1));
                                item.macros.c = parseFloat((foodDbItem.c * ratio).toFixed(1));
                                item.macros.f = parseFloat((foodDbItem.f * ratio).toFixed(1));
                                item.macros.fib = parseFloat((foodDbItem.fib * ratio).toFixed(1));
                                nUpdated = true;
                            }
                        }
                    }
                    mealKcal += item.macros?.kcal || 0;
                    mealP += item.macros?.p || 0;
                    mealC += item.macros?.c || 0;
                    mealF += item.macros?.f || 0;
                    mealFib += item.macros?.fib || 0;
                });
                const mKcal = Math.round(mealKcal);
                if (!meal.macros) meal.macros = {};
                if (meal.macros.kcal !== mKcal) {
                    meal.macros = { 
                        kcal: mKcal, 
                        p: parseFloat(mealP.toFixed(1)), 
                        c: parseFloat(mealC.toFixed(1)), 
                        f: parseFloat(mealF.toFixed(1)), 
                        fib: parseFloat(mealFib.toFixed(1)) 
                    };
                    nUpdated = true;
                }
            });
        });
    }

        if (nUpdated) {
            localStorage.setItem(DB._getKey('nutrition_history'), JSON.stringify(nHist));
            CloudSync.pushUp(u);
        }

        // WORKOUT MIGRATIONS
        const wHist = JSON.parse(localStorage.getItem(DB._getKey('workout_history')) || '{}');
        let wUpdated = false;

        // INJECT LOST WORKOUT
        if (u === 'vitor' && localToday === '2026-07-07') {
            if (!wHist['2026-07-07'] || wHist['2026-07-07'].exercises.length === 0) {
                wHist['2026-07-07'] = {
                    type: 'PUSH',
                    exercises: [
                        { name: 'Supino reto sentado', sets: [{reps: '15', load: '10'}, {reps: '12', load: '20'}, {reps: '12', load: '23'}, {reps: '12', load: '25'}, {reps: '12', load: '27'}], notes: '', tags: [] },
                        { name: 'Elevação lateral', sets: [{reps: '12', load: '7'}, {reps: '12', load: '7'}, {reps: '12', load: '8'}, {reps: '10', load: '8'}], notes: '', tags: [] },
                        { name: 'Tríceps polia', sets: [{reps: '15', load: '40'}, {reps: '12', load: '45'}, {reps: '10', load: '50'}, {reps: '8', load: '55'}], notes: '', tags: [] },
                        { name: 'Tiro na Esteira (HIIT)', sets: [{reps: '12', load: '9.1km/h'}], notes: '40s duração / 20s descanso', tags: [] }
                    ]
                };
                wUpdated = true;
            }
        }
        if (u === 'vitor') {
            if (wHist['2026-07-06'] && wHist['2026-07-06'].type === 'LISS_RUN' && (!wHist['2026-07-06'].exercises || wHist['2026-07-06'].exercises.length === 0)) {
                wHist['2026-07-06_skip_1'] = wHist['2026-07-06'];
                delete wHist['2026-07-06'];
                wUpdated = true;
            }

            if (!wHist['2026-07-06'] || wHist['2026-07-06'].type !== 'HIIT') {
                wHist['2026-07-06'] = {
                    type: 'HIIT',
                    exercises: [
                        { name: 'Tiro na Esteira (HIIT)', sets: [{reps: '12 tiros', load: '9.2km/h'}], tags: [], notes: '40s sprint / 20s descanso' },
                        { name: 'Abdominal Paralelas', sets: [{reps: '15', load: 'BW'}, {reps: '12', load: 'BW'}, {reps: '12', load: 'BW'}], tags: [], notes: '' },
                        { name: 'Abdominal Máquina', sets: [{reps: '15', load: '5kg'}, {reps: '15', load: '5kg'}, {reps: '15', load: '5kg'}], tags: ['falha'], notes: 'Falhei muito nessa' },
                        { name: 'Extensão Lombar', sets: [{reps: '12', load: 'BW'}, {reps: '10', load: 'BW'}, {reps: '12', load: 'BW'}], tags: [], notes: '' },
                        { name: 'Tiro na Esteira (HIIT) 2º Round', sets: [{reps: '12 tiros', load: '9.2km/h'}], tags: [], notes: '40s sprint / 20s descanso' }
                    ]
                };
                wUpdated = true;
            }
        }
        if (wUpdated) {
            localStorage.setItem(DB._getKey('workout_history'), JSON.stringify(wHist));
            CloudSync.pushUp(u);
        }
    };

    // --- AUTHENTICATION LOGIC ---
    const checkAuth = async () => {
        activeProfile = Auth.getActiveUser();
        if (activeProfile) {
            const btn = document.getElementById('btn-login');
            if (btn) btn.textContent = 'Sincronizando nuvem... ☁️';
            
            try {
                if (activeProfile.role !== 'admin') {
                    await CloudSync.pullDown(activeProfile.name.toLowerCase());
                    try { runMigrations(activeProfile.name.toLowerCase()); } catch(e) { console.error('Migration failed:', e); }
                }
                
                document.getElementById('login-screen').style.display = 'none';
                
                if (activeProfile.role === 'admin') {
                    document.getElementById('admin-container').style.display = 'block';
                    document.getElementById('app-container').style.display = 'none';
                    initAdminDashboard();
                } else {
                    document.getElementById('admin-container').style.display = 'none';
                    document.getElementById('app-container').style.display = 'block';
                    initApp();
                    renderWater(); 
                }
            } catch (err) {
                console.error("Auth init error:", err);
                alert("Erro ao iniciar sessão.");
                Auth.logout();
                window.location.reload();
            }
        } else {
            document.getElementById('login-screen').style.display = 'flex';
            document.getElementById('app-container').style.display = 'none';
            document.getElementById('admin-container').style.display = 'none';
        }
    };

    let adminCurrentProgram = { name: '', exercises: [] };
    let adminEditingIndex = null;
    
    const initAdminDashboard = () => {
        const selUser = document.getElementById('admin-user-select');
        
        const renderAdminPrograms = async () => {
            const u = selUser.value;
            await CloudSync.pullDown(u);
            const progs = JSON.parse(localStorage.getItem(u + '_workout_programs') || '[]');
            const list = document.getElementById('admin-existing-programs');
            
            // Se o elemento não existir, a gente cria ele no painel principal! 
            // Ops, vi que não existe no index.html original. Precisamos injetar!
            let container = document.getElementById('admin-existing-programs-container');
            if (!container) {
                const adminMain = document.querySelector('#admin-container main');
                container = document.createElement('div');
                container.id = 'admin-existing-programs-container';
                container.style.marginTop = '2rem';
                container.innerHTML = '<div id="admin-existing-programs"></div>';
                adminMain.appendChild(container);
            }
            
            const targetList = document.getElementById('admin-existing-programs');
            targetList.innerHTML = '<h3>Programas de ' + u + '</h3>';
            progs.forEach((p, idx) => {
                targetList.innerHTML += `<div style="background: var(--surface-color); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                    <div style="display:flex; justify-content:space-between;">
                        <h4 style="color:var(--secondary-color); margin:0;">${p.name}</h4>
                        <div>
                            <button class="btn-edit-prog" data-u="${u}" data-idx="${idx}" style="background:transparent; border:none; color:#00e676; cursor:pointer; margin-right:1rem;">✏️ Editar</button>
                            <button class="btn-del-prog" data-u="${u}" data-idx="${idx}" style="background:transparent; border:none; color:#ff3366; cursor:pointer;">🗑️ Excluir</button>
                        </div>
                    </div>
                    <p style="font-size:0.8rem; color:var(--text-secondary); margin-top:0.5rem;">${p.exercises.length} Exercícios</p>
                </div>`;
            });
            
            document.querySelectorAll('.btn-del-prog').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    if(!confirm('Tem certeza que deseja excluir esse treino?')) return;
                    const idx = e.target.getAttribute('data-idx');
                    progs.splice(idx, 1);
                    localStorage.setItem(u + '_workout_programs', JSON.stringify(progs));
                    await CloudSync.pushUp(u);
                    renderAdminPrograms();
                });
            });

            document.querySelectorAll('.btn-edit-prog').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const idx = e.target.getAttribute('data-idx');
                    adminCurrentProgram = JSON.parse(JSON.stringify(progs[idx])); // clone
                    adminEditingIndex = idx;
                    document.getElementById('admin-program-name').value = adminCurrentProgram.name;
                    document.getElementById('btn-admin-save-program').textContent = 'Atualizar Programa';
                    renderDraftList();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                });
            });
        };
        
        selUser.addEventListener('change', () => {
            adminCurrentProgram = { name: '', exercises: [] };
            adminEditingIndex = null;
            document.getElementById('admin-program-name').value = '';
            document.getElementById('btn-admin-save-program').textContent = 'Salvar Programa no Aluno';
            renderDraftList();
            renderAdminPrograms();
        });
        renderAdminPrograms();

        const renderDraftList = () => {
            const list = document.getElementById('admin-exercise-list');
            list.innerHTML = '';
            adminCurrentProgram.exercises.forEach((ex, idx) => {
                list.innerHTML += `<div style="background: #f0f2f5; padding: 0.8rem; border-radius: 8px; margin-bottom: 0.5rem; border-left: 3px solid var(--secondary-color); display:flex; justify-content:space-between; align-items:center;">
                    <span><strong>${ex.name}</strong> - ${ex.sets}x ${ex.reps}</span>
                    <button class="btn-del-draft-ex" data-idx="${idx}" style="background:transparent; border:none; color:#ff3366; cursor:pointer; padding:0 0.5rem;">✖</button>
                </div>`;
            });

            document.querySelectorAll('.btn-del-draft-ex').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const idx = e.target.getAttribute('data-idx');
                    adminCurrentProgram.exercises.splice(idx, 1);
                    renderDraftList();
                });
            });
        };

        document.getElementById('btn-admin-add-ex').addEventListener('click', () => {
            const name = document.getElementById('admin-ex-name').value;
            const sets = document.getElementById('admin-ex-sets').value;
            const reps = document.getElementById('admin-ex-reps').value;
            if(!name || !sets || !reps) return alert('Preencha os dados do exercício');
            adminCurrentProgram.exercises.push({ name, sets: parseInt(sets), reps });
            document.getElementById('admin-ex-name').value = '';
            document.getElementById('admin-ex-sets').value = '';
            document.getElementById('admin-ex-reps').value = '';
            renderDraftList();
        });

        document.getElementById('btn-admin-save-program').addEventListener('click', async () => {
            const pName = document.getElementById('admin-program-name').value;
            if(!pName || adminCurrentProgram.exercises.length === 0) return alert('Dê um nome e adicione exercícios');
            
            const u = selUser.value;
            adminCurrentProgram.name = pName;
            const progs = JSON.parse(localStorage.getItem(u + '_workout_programs') || '[]');
            
            if (adminEditingIndex !== null) {
                progs[adminEditingIndex] = adminCurrentProgram;
            } else {
                progs.push(adminCurrentProgram);
            }
            
            localStorage.setItem(u + '_workout_programs', JSON.stringify(progs));
            
            const btnSave = document.getElementById('btn-admin-save-program');
            const originalText = btnSave.textContent;
            btnSave.textContent = 'Salvando na Nuvem...';
            await CloudSync.pushUp(u);
            btnSave.textContent = 'Salvar Programa no Aluno';
            
            adminCurrentProgram = { name: '', exercises: [] };
            adminEditingIndex = null;
            document.getElementById('admin-program-name').value = '';
            renderDraftList();
            renderAdminPrograms();
            alert('Programa salvo com sucesso!');
        });

        document.getElementById('btn-admin-logout').addEventListener('click', () => {
            Auth.logout();
            location.reload();
        });
    };

    const renderWater = () => {
        let wHist = JSON.parse(localStorage.getItem(DB._getKey('water_history')) || '{}');
        const waterToday = wHist[localToday] || 0;
        
        const user = Auth.getActiveUser();
        const goal = user ? (user.weightKg * 35) : 3000;

        const disp = document.getElementById('water-consumed');
        if (disp) disp.textContent = waterToday;
        
        const dispGoal = document.getElementById('water-goal');
        if (dispGoal) dispGoal.textContent = goal;

        const pw = document.getElementById('progress-water');
        if (pw) pw.value = Math.min((waterToday / goal) * 100, 100);
    };
    document.getElementById('btn-water-plus')?.addEventListener('click', () => {
        let wHist = JSON.parse(localStorage.getItem(DB._getKey('water_history')) || '{}');
        let waterToday = wHist[localToday] || 0;
        waterToday += 250;
        wHist[localToday] = waterToday;
        localStorage.setItem(DB._getKey('water_history'), JSON.stringify(wHist));
        const username = Auth.getActiveUser()?.name;
        if (username) CloudSync.pushUp(username.toLowerCase());
        renderWater();
    });
    document.getElementById('btn-water-minus')?.addEventListener('click', () => {
        let wHist = JSON.parse(localStorage.getItem(DB._getKey('water_history')) || '{}');
        let waterToday = wHist[localToday] || 0;
        waterToday = Math.max(0, waterToday - 250);
        wHist[localToday] = waterToday;
        localStorage.setItem(DB._getKey('water_history'), JSON.stringify(wHist));
        const username = Auth.getActiveUser()?.name;
        if (username) CloudSync.pushUp(username.toLowerCase());
        renderWater();
    });

    document.getElementById('btn-login')?.addEventListener('click', () => {
        const u = document.getElementById('login-user').value;
        const p = document.getElementById('login-pass').value;
        const profile = Auth.login(u, p);
        if (profile) {
            document.getElementById('login-error').style.display = 'none';
            checkAuth();
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
                    renderWeeklyPrograms();
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
        const sortedDates = Object.keys(history).sort((a, b) => {
            const da = a.split('_')[0];
            const db = b.split('_')[0];
            if (da === db) return a.localeCompare(b);
            return new Date(db) - new Date(da);
        });
        const lastWorkoutType = sortedDates.length > 0 ? history[sortedDates[0]].type : null;
        
        todayWorkoutType = workoutEngine.getNextWorkoutType(lastWorkoutType);
        
        // UI Updates
        renderWeeklyPrograms();
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

        const allDates = [...new Set([...Object.keys(wHist), ...Object.keys(nHist)])].sort((a, b) => {
            const da = a.split('_')[0];
            const db = b.split('_')[0];
            if (da === db) return a.localeCompare(b);
            return new Date(db) - new Date(da);
        });

        if (allDates.length === 0) {
            historyContainer.innerHTML = '<p class="rpe-status">Nenhum dado registrado ainda.</p>';
            return;
        }

        allDates.forEach(date => {
            const w = wHist[date];
            const n = nHist[date];
            const baseDate = date.split('_')[0];
            const dateStr = baseDate.split('-').reverse().join('/');

            let html = `<div style="background: var(--surface-color); padding: 1rem; border-radius: 12px; margin-bottom: 1rem; border: 1px solid var(--border-color);">
                <h3 style="color: var(--text-primary); margin-bottom: 0.8rem; font-family: var(--font-heading); font-size: 1.1rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem;">🗓️ ${dateStr}</h3>`;
            
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
                    <p style="font-size: 0.85rem; color: var(--text-primary); margin:0;">
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
                
                if (w.notes) {
                    html += `<div style="font-size: 0.85rem; color: var(--secondary-color); font-style: italic; margin-bottom: 0.5rem;">${w.notes}</div>`;
                }
                
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
        const sortedDates = Object.keys(h).sort((a, b) => {
            const da = a.split('_')[0];
            const db = b.split('_')[0];
            if (da === db) return a.localeCompare(b);
            return new Date(db) - new Date(da);
        });
        
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

    
    const renderWeeklyPrograms = () => {
        const u = activeProfile.name.toLowerCase();
        const progs = JSON.parse(localStorage.getItem(u + '_workout_programs') || '[]');
        const list = document.getElementById('weekly-programs-list');
        if (!list) return;
        list.innerHTML = '';
        if (progs.length === 0) {
            list.innerHTML = '<p class="rpe-status">Nenhum programa atribuído a você ainda pelo Professor.</p>';
            return;
        }
        progs.forEach((p, idx) => {
            list.innerHTML += `<button class="program-btn" data-prog-idx="${idx}">
                <span>${p.name}</span>
                <span style="font-size: 0.8rem; color: var(--secondary-color);">▶ Iniciar</span>
            </button>`;
        });

        document.querySelectorAll('.program-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = e.currentTarget.getAttribute('data-prog-idx');
                startPreProgrammedWorkout(progs[idx]);
            });
        });
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
    
    const parseQtyAndCalculateMacros = async (foodName, qtyString) => {
        const cleanName = foodName.trim().toLowerCase();
        let exactKey = Object.keys(FoodDB).find(k => k.trim().toLowerCase() === cleanName);
        let dbEntry = exactKey ? FoodDB[exactKey] : null;

        // Tenta busca parcial local
        if (!dbEntry) {
            exactKey = Object.keys(FoodDB).find(k => k.trim().toLowerCase().includes(cleanName) || cleanName.includes(k.trim().toLowerCase()));
            if (exactKey) dbEntry = FoodDB[exactKey];
        }

        // Se não achou local, tenta OpenFoodFacts
        if (!dbEntry) {
            try {
                const res = await fetch(`https://br.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(cleanName)}&search_simple=1&action=process&json=1&page_size=1`);
                const data = await res.json();
                if (data.products && data.products.length > 0) {
                    const nut = data.products[0].nutriments || {};
                    dbEntry = {
                        kcal: nut['energy-kcal_100g'] || 0,
                        p: nut.proteins_100g || 0,
                        c: nut.carbohydrates_100g || 0,
                        f: nut.fat_100g || 0,
                        fib: nut.fiber_100g || 0,
                        baseQty: 100,
                        unit: 'g'
                    };
                }
            } catch (e) {
                console.log("OpenFoodFacts search failed", e);
            }
        }

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

    document.getElementById('btn-add-food')?.addEventListener('click', async () => {
        const name = document.getElementById('food-input').value;
        const qty = document.getElementById('food-qty-input').value;
        if (!name || !qty) return alert('Preencha alimento e quantidade.');
        
        const btn = document.getElementById('btn-add-food');
        btn.textContent = 'Buscando... ⏳';
        
        const macros = await parseQtyAndCalculateMacros(name, qty);
        currentMealItems.push({ name, qty, macros });
        renderCurrentPlate();
        document.getElementById('food-input').value = '';
        document.getElementById('food-qty-input').value = '';
        btn.textContent = '+ Adicionar ao Prato';
    });

    document.getElementById('btn-copy-meal')?.addEventListener('click', () => {
        const type = document.getElementById('meal-type-select').value;
        const nutHistory = JSON.parse(localStorage.getItem(DB._getKey('nutrition_history')) || '{}');
        const dates = Object.keys(nutHistory).sort().reverse();
        let found = null;
        for (const date of dates) {
            const meals = nutHistory[date];
            const m = meals.find(x => x.type === type);
            if (m) {
                found = m;
                break;
            }
        }
        if (found) {
            // Deep copy items
            currentMealItems = JSON.parse(JSON.stringify(found.items));
            renderCurrentPlate();
        } else {
            alert('Nenhuma refeição deste tipo encontrada no histórico.');
        }
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
            html += `<div style="background: var(--surface-color); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                    <h4 style="color: var(--secondary-color); margin: 0;">${meal.type}</h4>
                    <button class="btn-edit-meal" data-meal-idx="${idx}" style="background:transparent; border:1px solid var(--border-color); color:var(--text-secondary); padding:0.2rem 0.5rem; border-radius:4px; font-size:0.8rem; cursor:pointer;">Editar</button>
                </div>
                <div style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 0.8rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem; display: flex; gap: 0.5rem; flex-wrap: wrap;">
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

        // Progress bars update
        const goalP = parseInt(document.getElementById('macro-p-goal').textContent) || 1;
        const goalC = parseInt(document.getElementById('macro-c-goal').textContent) || 1;
        const goalF = parseInt(document.getElementById('macro-f-goal').textContent) || 1;
        const pp = document.getElementById('progress-p'); if(pp) pp.value = Math.min((totalP/goalP)*100, 100);
        const pc = document.getElementById('progress-c'); if(pc) pc.value = Math.min((totalC/goalC)*100, 100);
        const pf = document.getElementById('progress-f'); if(pf) pf.value = Math.min((totalF/goalF)*100, 100);

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

    let restInterval = null;
    
    document.querySelector('.skip-workout')?.addEventListener('click', async () => {
        if(confirm("Tem certeza que deseja pular o treino de hoje? (O ciclo avançará automaticamente)")) {
            const btn = document.querySelector('.skip-workout');
            const originalText = btn.textContent;
            btn.textContent = "Sincronizando...";
            await DB.saveWorkout(localToday + '_skip_' + Date.now(), {
                type: todayWorkoutType,
                exercises: [],
                notes: "Treino pulado (Descanso forçado)"
            });
            alert('Treino pulado com sucesso! O próximo treino já está engatilhado.');
            renderWeeklyPrograms();
            renderHistory();
        }
    });

    
    let activeProgram = null;

    const startPreProgrammedWorkout = (program) => {
        activeProgram = program;
        document.getElementById('tab-treino').style.display = 'none';
        document.getElementById('workout-mode').style.display = 'block';
        document.getElementById('wm-title').textContent = program.name;

        const list = document.getElementById('wm-exercise-list');
        list.innerHTML = '';

        program.exercises.forEach((ex, exIdx) => {
            let setsHtml = '';
            for(let i=0; i<ex.sets; i++) {
                setsHtml += `
                <div class="set-row">
                    <span class="set-info">Série ${i+1} <span style="margin-left: 0.5rem; opacity: 0.7; font-weight: normal;">(Meta: ${ex.reps})</span></span>
                    <input type="number" class="set-load-input" placeholder="Kg">
                    <input type="checkbox" class="set-checkbox">
                </div>`;
            }
            
            list.innerHTML += `
            <div class="exercise-block" data-ex-name="${ex.name}">
                <h3 style="margin-bottom: 1rem; color: var(--text-primary);">${ex.name}</h3>
                <div class="sets-container">
                    ${setsHtml}
                </div>
            </div>`;
        });
        
        // Setup rest timer buttons
        document.getElementById('rest-timer-widget').style.display = 'block';
        document.querySelectorAll('.set-checkbox').forEach(chk => {
            chk.addEventListener('change', (e) => {
                if(e.target.checked) {
                    // Start 1 min timer automatically
                    startRestTimer(60);
                }
            });
        });
    };


    const startRestTimer = (secs) => {
        clearInterval(restInterval);
        const disp = document.getElementById('rest-timer-display');
        disp.style.color = '#fff';
        restInterval = setInterval(() => {
            secs--;
            const m = Math.floor(secs / 60);
            const s = secs % 60;
            disp.textContent = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
            if (secs <= 0) {
                clearInterval(restInterval);
                disp.style.color = '#ff3366';
                disp.textContent = "TEMPO!";
            }
        }, 1000);
    };

    document.querySelectorAll('.btn-rest').forEach(btn => {
        btn.addEventListener('click', (e) => {
            startRestTimer(parseInt(e.target.getAttribute('data-sec')));
        });
    });

    document.getElementById('wm-cancel')?.addEventListener('click', () => {
        document.getElementById('workout-mode').style.display = 'none';
        document.getElementById('tab-treino').style.display = 'block';
        clearInterval(restInterval);
    });


    wmFinish?.addEventListener('click', async () => {
        const finalData = [];
        
        const blocks = document.querySelectorAll('.exercise-block');
        blocks.forEach(b => {
            const exName = b.getAttribute('data-ex-name');
            const rows = b.querySelectorAll('.set-row');
            let sets = [];
            rows.forEach(row => {
                const chk = row.querySelector('.set-checkbox');
                if (chk.checked) {
                    const load = row.querySelector('.set-load-input').value || 'BW';
                    // We don't have the exact reps done natively yet, just load, we assume target reps hit if checked
                    // Or we just save the load for the history.
                    sets.push({ load: load, reps: 'Concluído' });
                }
            });
            if(sets.length > 0) {
                finalData.push({ name: exName, sets: sets, notes: '', tags: [] });
            }
        });

        if (finalData.length === 0) {
            alert('Nenhuma série marcada como concluída!');
            return;
        }

        if (typeof restInterval !== 'undefined' && restInterval !== null) clearInterval(restInterval);

        wmFinish.textContent = "Salvando...";
        await DB.saveWorkout(localToday + '_' + activeProgram.name.replace(/s+/g, ''), {
            type: activeProgram.name,
            exercises: finalData
        });
        
        alert('Treino Salvo com Sucesso!'); 
        document.getElementById('workout-mode').style.display = 'none'; 
        document.getElementById('tab-treino').style.display = 'block'; 
        renderHistory();
        renderWeeklyPrograms();
        wmFinish.textContent = "✅ FINALIZAR TREINO";
    });

});
