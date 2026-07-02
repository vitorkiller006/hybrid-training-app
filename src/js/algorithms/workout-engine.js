export class WorkoutEngine {
    constructor() {
        this.baseLegVolume = 10;
        this.cycleSequence = ['HIIT', 'PUSH', 'LEGS FULL', 'PULL', 'LISS_RUN'];
    }

    getNextWorkoutType(completedCount) {
        const index = completedCount % this.cycleSequence.length;
        return this.cycleSequence[index];
    }

    getTemplateForType(type) {
        const templates = {
            'HIIT': [{ name: 'Tiro na Esteira', sets: '6 ciclos', reps: '40s/20s' }],
            'PUSH': [
                { name: 'Supino Reto', sets: '3', reps: '10-12' },
                { name: 'Peck Deck', sets: '3', reps: '12-15' },
                { name: 'Desenvolvimento', sets: '3', reps: '10' },
                { name: 'Tríceps Polia', sets: '3', reps: '12-15' },
                { name: 'Abdominal Solo', sets: '3', reps: 'FALHA' }
            ],
            'LEGS FULL': [
                { name: 'Agachamento / Leg Press', sets: '4', reps: '10-12' },
                { name: 'Cadeira Flexora', sets: '3', reps: '12-15' },
                { name: 'Stiff', sets: '3', reps: '10' },
                { name: 'Panturrilha', sets: '4', reps: '15' }
            ],
            'PULL': [
                { name: 'Puxada Alta', sets: '3', reps: '10-12' },
                { name: 'Remada Baixa', sets: '3', reps: '10-12' },
                { name: 'Rosca Direta', sets: '3', reps: '12-15' },
                { name: 'Encolhimento', sets: '3', reps: '15' }
            ],
            'LISS_RUN': [{ name: 'Corrida Longa', sets: '1', reps: '40 min' }]
        };
        return templates[type] || [];
    }

    evaluateTags(tags) {
        let recommendation = 'Manter carga e consolidar execução.';
        let danger = false;
        if (tags.includes('facil')) recommendation = 'Aumentar carga (Sobrecarga Progressiva).';
        if (tags.includes('falha') && !tags.includes('facil')) recommendation = 'Manter carga (atingiu falha técnica).';
        if (tags.includes('lombar') || tags.includes('articulacao')) {
            recommendation = 'ALERTA: Reduzir carga, focar em mobilidade ou substituir exercício.';
            danger = true;
        }
        return { recommendation, danger };
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
        return isHybridDay ? Math.ceil(baseVolume * 0.6) : baseVolume;
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
