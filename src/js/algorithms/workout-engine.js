export class WorkoutEngine {
    constructor() {
        this.baseLegVolume = 10;
        this.cycleSequence = ['HIIT', 'PUSH', 'LEGS FULL', 'PULL', 'LISS_RUN'];
    }

    getNextWorkoutType(lastWorkoutType) {
        if (!lastWorkoutType) return this.cycleSequence[0];
        const lastIndex = this.cycleSequence.indexOf(lastWorkoutType);
        if (lastIndex === -1) return this.cycleSequence[0];
        const nextIndex = (lastIndex + 1) % this.cycleSequence.length;
        return this.cycleSequence[nextIndex];
    }

    getExerciseLibrary(type) {
        const library = {
            'HIIT': ['Tiro na Esteira', 'Bike Erg', 'Remo', 'Burpees', 'Corda Naval'],
            'PUSH': ['Supino Reto', 'Supino Inclinado (Halteres)', 'Peck Deck', 'Crucifixo', 'Desenvolvimento (Halteres)', 'Elevação Lateral', 'Tríceps Polia', 'Tríceps Testa'],
            'LEGS FULL': ['Agachamento Livre', 'Leg Press 45º', 'Cadeira Extensora', 'Stiff', 'Cadeira Flexora', 'Mesa Flexora', 'Elevação Pélvica', 'Panturrilha Máquina', 'Panturrilha Sentado'],
            'PULL': ['Barra Fixa', 'Puxada Alta (Frente)', 'Remada Curvada', 'Remada Baixa (Triângulo)', 'Crucifixo Inverso', 'Rosca Direta', 'Rosca Martelo', 'Rosca Scott', 'Encolhimento (Halteres)'],
            'LISS_RUN': ['Corrida Contínua', 'Trote', 'Caminhada Inclinada']
        };
        
        const coreAndCardio = [
            '--- ACESSÓRIOS ---',
            'Abdominal Solo', 
            'Abdominal Máquina', 
            'Prancha Isométrica', 
            'Esteira (Cardio Pós)', 
            'Bike (Cardio Pós)', 
            'Escada (Cardio Pós)'
        ];

        const specificExercises = library[type] || ['Exercício Livre'];
        return specificExercises.concat(coreAndCardio);
    }

    getTagsForType(type) {
        const baseTags = [
            { id: 'facil', label: 'Estava Fácil', type: 'normal' },
            { id: 'falha', label: 'Atingi Falha', type: 'normal' },
            { id: 'cadencia', label: 'Boa Cadência', type: 'normal' },
            { id: 'articulacao', label: 'Dor Articular', type: 'danger' }
        ];

        const specificTags = {
            'HIIT': [
                { id: 'facil', label: 'Fôlego Sobrando', type: 'normal' },
                { id: 'falha', label: 'Exaustão Cardíaca', type: 'normal' },
                { id: 'canelite', label: 'Dor Canela (Shin Splint)', type: 'danger' },
                { id: 'articulacao', label: 'Dor Joelho', type: 'danger' }
            ],
            'LEGS FULL': [
                ...baseTags,
                { id: 'lombar', label: 'Fisgada Lombar', type: 'danger' }
            ],
            'PULL': [
                ...baseTags,
                { id: 'lombar', label: 'Tensão Lombar', type: 'danger' },
                { id: 'antibraco', label: 'Falha Antebraço Primeiro', type: 'normal' }
            ]
        };

        return specificTags[type] || baseTags;
    }

    evaluateTags(tags) {
        let recommendation = 'Manter carga/séries e consolidar execução.';
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
}
