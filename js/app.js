const App = {
    init: function () {
        console.log("App Iniciado");

        // Inicializa os módulos
        FormsHandler.init();

        // Carrega dados iniciais (se houver)
        this.loadData();

    },
    runSimulation: function () {
        // 1. Pega os valores dos inputs
        const initial = parseFloat(document.getElementById('calc-inicial').value) || 0;
        const monthly = parseFloat(document.getElementById('calc-aporte').value) || 0;
        const rate = parseFloat(document.getElementById('calc-taxa').value) || 0;
        const years = parseFloat(document.getElementById('calc-tempo').value) || 0;

        // 2. Chama a calculadora
        const result = Calculator.calculateCompoundInterest(initial, monthly, rate, years);

        // 3. Mostra os resultados na tela
        document.getElementById('res-investido').textContent = Renderer.formatCurrency(result.invested);
        document.getElementById('res-juros').textContent = Renderer.formatCurrency(result.interest);
        document.getElementById('res-total').textContent = Renderer.formatCurrency(result.total);

        // 4. Mostra a área de resultados (que estava oculta)
        document.getElementById('calc-results').style.display = 'grid';
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
        // ADICIONE ESTA LINHA:
        Renderer.updateSimulator(totals);
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
