import { WorkoutEngine } from './src/js/algorithms/workout-engine.js';
import { NutritionEngine } from './src/js/algorithms/nutrition-engine.js';
import { DB } from './src/js/store/db.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log("Anti-Gravity Engine Initialized");
    
    // Tab Navigation Logic
    const navButtons = document.querySelectorAll('.nav-btn');
    const tabSections = document.querySelectorAll('.tab-section');

    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons and hide all sections
            navButtons.forEach(b => b.classList.remove('active'));
            tabSections.forEach(s => s.style.display = 'none');

            // Add active class to clicked button and show target section
            btn.classList.add('active');
            const targetId = 'tab-' + btn.getAttribute('data-tab');
            document.getElementById(targetId).style.display = 'block';
        });
    });

    // User data (Base)
    const userWeightKg = 80;
    const userBF = 20;
    
    const workoutEngine = new WorkoutEngine();
    const nutritionEngine = new NutritionEngine(userWeightKg, userBF);

    // Simulation for Today's logic (LISS Run)
    const todayWorkoutType = 'LISS_RUN';
    const isHybridDay = (todayWorkoutType === 'LISS_RUN');
    
    // Calculate Nutrition
    const todayNutrition = nutritionEngine.calculateMacros(todayWorkoutType);
    
    // Update UI DOM
    const badgeCarb = document.querySelector('.badge-carb-low');
    const badgeHybrid = document.querySelector('.badge-hybrid');
    const macroValues = document.querySelectorAll('.macro-item .value');
    
    if (badgeCarb && macroValues.length === 3) {
        badgeCarb.textContent = todayNutrition.type;
        // Update styling based on type
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
            // Simulação de gatilho de lombar
            const lumbarCheck = workoutEngine.evaluateLumbarRisk('Stiff', 7, true);
            
            if (lumbarCheck.triggerActivated) {
                alert(`ALERTA DE SEGURANÇA:\nAção: ${lumbarCheck.action}\nSubstituir por: ${lumbarCheck.substitute}\nMotivo: ${lumbarCheck.reason}`);
            } else {
                alert('Sessão iniciada com sucesso. Bom treino!');
            }
        });
    }
});
