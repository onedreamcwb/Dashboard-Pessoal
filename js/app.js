const App = {
    init: function () {
        console.log("App Iniciado");

        // Inicializa os módulos
        FormsHandler.init();

        // Carrega dados iniciais (se houver)
        this.loadData();
    },

    loadData: function () {
        const transactions = Storage.getTransactions();

        // Renderiza cada transação salva na tabela
        transactions.forEach(tr => Renderer.renderTransaction(tr));

        // Atualiza os totais dos cards
        this.updateDashboard();
    },

    updateDashboard: function () {
        const transactions = Storage.getTransactions();

        // Calcula Totais
        const totals = Calculator.calculateTotals(transactions);

        // Calcula Meta de Reserva (Regra dos 6 meses)
        totals.reserveTarget = Calculator.calculateReserveTarget(transactions);

        // Atualiza o DOM
        Renderer.updateSummary(totals);
    },

    // Função para alternar abas (Dashboard <-> Simulador)
    switchTab: function (tabName) {
        // Esconde todas as abas
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.style.display = 'none';
        });

        // Mostra a aba selecionada
        const selected = document.getElementById(tabName);
        if (selected) selected.style.display = 'block';
    }
};

// Inicializa a aplicação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
