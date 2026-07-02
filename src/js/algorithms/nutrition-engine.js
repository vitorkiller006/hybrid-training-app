import { DB } from '../store/db.js';

export class NutritionEngine {
    constructor(profile) {
        this.profile = profile;
        this.weight = profile.weightKg;
        this.bf = profile.bodyFatPercentage;
        this.lbm = this.weight * (1 - (this.bf / 100));
        this.baseBMR = 370 + (21.6 * this.lbm); // Katch-McArdle is gender neutral
    }

    calculateDailyTDEE(workoutForDay) {
        let neatMultiplier = 1.2; 
        
        // Ajuste de Ciclo Menstrual
        let cycleAdjustment = 0;
        if (this.profile.trackMenstrualCycle) {
            const phase = DB.getCyclePhase();
            if (phase === 'lutea') {
                cycleAdjustment = 150; // Metabolismo basal aumenta ~100-200kcal na fase lútea
            }
        }
        
        let tdee = Math.round(this.baseBMR * neatMultiplier) + cycleAdjustment;
        
        // Objetivo
        if (this.profile.goal === 'recomp') {
            tdee -= 200; // Deficit leve para mulher (emagrecer e ganhar massa)
        }

        let workoutCalories = 0;
        let proteinMacro = Math.round(this.weight * 2.2); 
        let fatMacro = Math.round(this.weight * 0.9);     

        if (!workoutForDay || !workoutForDay.exercises || workoutForDay.exercises.length === 0) {
            let carbsRest = Math.round((tdee - (proteinMacro * 4) - (fatMacro * 9)) / 4);
            return {
                tdee,
                burned: 0,
                macros: { protein: proteinMacro, carbs: carbsRest, fat: fatMacro },
                type: 'REST (LOW CARB)'
            };
        }

        workoutForDay.exercises.forEach(ex => {
            if (!ex.sets) return;
            const setCount = Array.isArray(ex.sets) ? ex.sets.length : parseInt(ex.sets) || 1;
            const nameLower = ex.name.toLowerCase();
            
            const isCompound = ['agachamento', 'press', 'supino', 'remada', 'puxada', 'desenvolvimento'].some(kw => nameLower.includes(kw));
            const isCardio = ['tiro', 'corrida', 'bike', 'esteira', 'escada'].some(kw => nameLower.includes(kw));
            
            if (isCardio) {
                workoutCalories += (setCount * 30); 
            } else if (isCompound) {
                workoutCalories += (setCount * 25); 
            } else {
                workoutCalories += (setCount * 15); 
            }
        });

        const finalTDEE = tdee + workoutCalories;
        const carbMacro = Math.round((finalTDEE - (proteinMacro * 4) - (fatMacro * 9)) / 4);

        return {
            tdee: finalTDEE,
            burned: workoutCalories,
            macros: { protein: proteinMacro, carbs: carbMacro, fat: fatMacro },
            type: workoutForDay.type
        };
    }

    // Mantido por retrocompatibilidade se for chamado em outro lugar
    calculateMacros(workoutType) {
        return this.calculateDailyTDEE({ type: workoutType, exercises: [] });
    }
}
