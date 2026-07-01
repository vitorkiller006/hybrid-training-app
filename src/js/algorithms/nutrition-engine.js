export class NutritionEngine {
    constructor(weightKg, bodyFatPercentage) {
        this.weight = weightKg;
        this.bf = bodyFatPercentage;
        this.lbm = weightKg * (1 - (bodyFatPercentage / 100));
        this.baseBMR = 370 + (21.6 * this.lbm);
    }

    calculateDynamicTDEE(workoutType) {
        let multiplier = 1.2;
        switch (workoutType) {
            case 'REST': multiplier = 1.2; break;
            case 'PUSH': 
            case 'PULL': multiplier = 1.375; break;
            case 'HIIT': multiplier = 1.45; break;
            case 'LEGS_FULL': multiplier = 1.55; break;
            case 'LISS_RUN': multiplier = 1.6; break;
        }
        return Math.round(this.baseBMR * multiplier);
    }

    calculateMacros(workoutType) {
        const tdee = this.calculateDynamicTDEE(workoutType);
        const proteinGrams = Math.round(this.weight * 2.2);
        const proteinCals = proteinGrams * 4;

        let carbMultiplier = 1.0;
        let fatMultiplier = 1.0;

        if (['LEGS_FULL', 'LISS_RUN'].includes(workoutType)) {
            carbMultiplier = 3.5;
            fatMultiplier = 0.8;
        } else if (['PUSH', 'PULL'].includes(workoutType)) {
            carbMultiplier = 2.0;
            fatMultiplier = 1.0;
        } else {
            carbMultiplier = 1.2;
            fatMultiplier = 1.2;
        }

        const carbGrams = Math.round(this.weight * carbMultiplier);
        const carbCals = carbGrams * 4;

        let fatGrams = Math.round(this.weight * fatMultiplier);
        let fatCals = fatGrams * 9;

        const currentCals = proteinCals + carbCals + fatCals;
        const diff = tdee - currentCals;
        
        if (diff > 0 && ['LEGS_FULL', 'LISS_RUN'].includes(workoutType)) {
             fatGrams += Math.round(diff / 9);
        }

        return {
            tdee,
            macros: {
                protein: proteinGrams,
                carbs: carbGrams,
                fat: fatGrams
            },
            type: ['LEGS_FULL', 'LISS_RUN'].includes(workoutType) ? 'HIGH CARB' : 
                  (['PUSH', 'PULL'].includes(workoutType) ? 'MODERATE CARB' : 'LOW CARB')
        };
    }
}
