export class WorkoutEngine {
    constructor() {
        this.baseLegVolume = 10;
    }

    evaluateLumbarRisk(exerciseName, rpe, painLombar) {
        const riskyExercises = ['Stiff', 'Levantamento Terra', 'Agachamento Livre'];
        if (riskyExercises.includes(exerciseName) && painLombar && rpe < 8) {
            return {
                triggerActivated: true,
                action: 'ABORTAR SÉRIE IMEDIATAMENTE',
                substitute: 'Cadeira Flexora ou Mesa Flexora (Isolamento Mecânico)',
                reason: 'Perda de sustentação do core e transferência de carga para lombar detectada prematuramente.'
            };
        }
        return { triggerActivated: false };
    }

    calculateCompensationVolume(completedSets, targetVolume) {
        const remaining = targetVolume - completedSets;
        return remaining > 0 ? remaining : 0;
    }

    canProgressLoad(amplitudeMaxima, controleCadencia, rpe) {
        return (amplitudeMaxima && controleCadencia && rpe >= 8 && rpe <= 9);
    }

    adjustVolumeForHybridDay(baseVolume, isHybridDay) {
        if (isHybridDay) {
            return Math.ceil(baseVolume * 0.6); 
        }
        return baseVolume;
    }

    evaluateCalfQuality(repDropPercentage) {
        if (repDropPercentage > 20) {
            return {
                lockLoad: true,
                loadReductionNextSet: 0.15,
                focus: 'Priorizar Squeeze (contração isométrica no pico) e amplitude.'
            };
        }
        return { lockLoad: false, loadReductionNextSet: 0 };
    }
}
