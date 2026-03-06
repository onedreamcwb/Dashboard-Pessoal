// Import or ensure Calculator is available
// Add this line if Calculator is defined in a separate file:
// <script src="path-to-calculator.js"></script>

const App = {
    // Estado interno para saber qual mês estamos olhando
    state: {
        currentMonth: new Date().toISOString().slice(0, 7) // Ex: "2026-03"
    },

    init: function () {
        console.log("App Iniciado");

        FormsHandler.init();

        // Configura o Filtro de Mês
        const monthFilter = document.getElementById('month-filter');
        if (monthFilter) {
            monthFilter.value = this.state.currentMonth; // Define o mês atual no input

            // Quando mudar a data, recarrega a tela
            monthFilter.addEventListener('change', (e) => {
                this.state.currentMonth = e.target.value;
                this.updateDashboard(); // Recarrega com o novo filtro
            });
        }

        // Processa recorrências (Despesas Fixas)
        RecurringManager.processRecurringExpenses();

        this.loadData();
    },

    loadData: function () {
        // Carrega tudo e atualiza
        this.updateDashboard();
    },

    updateDashboard: function() {
        const allTransactions = Storage.getTransactions();
        
        // 1. Filtra transações pelo mês selecionado (State)
        const filteredTransactions = allTransactions.filter(tr => 
            tr.date.startsWith(this.state.currentMonth)
        );

        // 2. Calcula os totais baseados SOMENTE no mês filtrado
        const totals = Calculator.calculateTotals(filteredTransactions);
        
        // 3. Calcula Meta de Reserva (usa histórico completo 'allTransactions' para média real)
        totals.reserveTarget = Calculator.calculateReserveTarget(allTransactions);
        
        // 4. Atualiza a Interface (Cards e Barra de Progresso)
        Renderer.updateSummary(totals);
        Renderer.updateSimulator(totals);

        // --- NOVO: Atualiza o Gráfico ---
        // Passamos 'filteredTransactions' para o gráfico mostrar só o mês atual
        if (typeof Charts !== 'undefined') {
            Charts.updateCharts(filteredTransactions);
        }
        
        // 5. Atualiza a Tabela (Limpa e desenha as filtradas)
        const tbody = document.querySelector('#transactions-table tbody');
        if (tbody) {
            tbody.innerHTML = ''; // Limpa a tabela
            
            // Ordena e renderiza
            filteredTransactions
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .forEach(tr => Renderer.renderTransaction(tr));
        }
    },

    switchTab: function (tabName) {
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.style.display = 'none';
        });
        const selected = document.getElementById(tabName);
        if (selected) selected.style.display = 'block';
    },

    // (Mantenha a runSimulation aqui...)
    runSimulation: function () { /* ... código anterior ... */ }
};

document.addEventListener('DOMContentLoaded', () => {
    App.init();
});