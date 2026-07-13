export const Auth = {
    users: {
        'admin': {
            password: 'admin',
            profile: {
                name: 'Admin',
                gender: 'none',
                role: 'admin'
            }
        },
        'vitor': {
            password: '@19216801Gg',
            profile: {
                name: 'Vitor',
                gender: 'male',
                age: 25, // Aproximado baseado em histórico
                weightKg: 80,
                bodyFatPercentage: 20,
                goal: 'hypertrophy',
                cycleSequence: ['HIIT', 'PUSH', 'LEGS FULL', 'PULL', 'LISS_RUN']
            }
        },
        'gabi': {
            password: 'jlsp2000',
            profile: {
                name: 'Gabi',
                gender: 'female',
                age: 26,
                weightKg: 78,
                heightCm: 158,
                bodyFatPercentage: 28, // Entre 25 e 30
                goal: 'recomp', // Emagrecer e ganhar massa
                cycleSequence: ['PUSH FEMININO', 'LEGS POSTERIOR', 'PULL', 'LEGS ANTERIOR'],
                trackMenstrualCycle: true,
                lastCycleStart: null // Pode ser configurado futuramente na UI
            }
        }
    },
    
    login: function(username, password) {
        const u = username.toLowerCase().trim();
        const p = password.trim();
        if (this.users[u] && this.users[u].password === p) {
            localStorage.setItem('active_user', u);
            return this.users[u].profile;
        }
        return null;
    },

    logout: function() {
        localStorage.removeItem('active_user');
    },

    getActiveUser: function() {
        const username = localStorage.getItem('active_user');
        if (username && this.users[username]) {
            return this.users[username].profile;
        }
        return null;
    }
};
