export class WorkoutEngine {
    constructor(profile) {
        this.profile = profile || { cycleSequence: ['PUSH', 'LEGS FULL', 'PULL', 'LISS_RUN', 'HIIT'], gender: 'male' };
        this.cycleSequence = this.profile.cycleSequence;
    }

    getNextWorkoutType(lastWorkoutType) {
        if (!lastWorkoutType) return this.cycleSequence[0];
        const lastIndex = this.cycleSequence.indexOf(lastWorkoutType);
        if (lastIndex === -1) return this.cycleSequence[0];
        const nextIndex = (lastIndex + 1) % this.cycleSequence.length;
        return this.cycleSequence[nextIndex];
    }

    getExerciseLibrary(type) {
        const libs = {
            'PUSH': ['Supino Reto', 'Supino Inclinado', 'Peck Deck', 'Desenvolvimento', 'Elevação Lateral', 'Tríceps Polia', 'Tríceps Testa', 'Tríceps Corda'],
            'PUSH FEMININO': ['Supino Inclinado', 'Elevação Lateral', 'Tríceps Polia', 'Desenvolvimento Máquina', 'Peck Deck (Leve)', 'Tríceps Banco'],
            'PULL': ['Barra Fixa', 'Puxada Frontal', 'Remada Curvada', 'Remada Baixa', 'Crucifixo Inverso', 'Rosca Direta', 'Rosca Martelo', 'Rosca Scott'],
            'LEGS FULL': ['Agachamento Livre', 'Leg Press 45º', 'Stiff', 'Cadeira Extensora', 'Cadeira Flexora', 'Elevação Pélvica', 'Panturrilha em Pé na Máquina'],
            'LEGS POSTERIOR': ['Elevação Pélvica', 'Stiff', 'Cadeira Flexora', 'Mesa Flexora', 'Cadeira Abdutora', 'Glúteo Polia'],
            'LEGS ANTERIOR': ['Agachamento Livre', 'Leg Press 45º', 'Cadeira Extensora', 'Passada/Avanço', 'Cadeira Adutora', 'Panturrilha em Pé na Máquina', 'Panturrilha Sentado'],
            'LISS_RUN': ['Corrida LISS (Z2)', 'Bike Ergométrica', 'Caminhada Inclinada'],
            'HIIT': ['Tiro na Esteira', 'Bike Tiro', 'Burpees']
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

        const specificExercises = libs[type] || ['Exercício Livre'];
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
