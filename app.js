document.addEventListener('DOMContentLoaded', () => {
    console.log("App Initialized - Anti-Gravity Engine");
    
    const startWorkoutBtn = document.querySelector('.start-workout');
    if (startWorkoutBtn) {
        startWorkoutBtn.addEventListener('click', () => {
            startWorkoutBtn.textContent = 'Carregando Módulos...';
            setTimeout(() => {
                alert('Módulo de Treino Híbrido ativado! (Integração com IndexedDB pendente)');
                startWorkoutBtn.textContent = 'Iniciar Sessão';
            }, 800);
        });
    }
});
