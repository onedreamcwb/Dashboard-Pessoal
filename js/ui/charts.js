const Charts = {
    // Paleta de cores para as categorias
    colors: [
        '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981',
        '#06b6d4', '#3b82f6', '#6366f1', '#a855f7', '#ec4899'
    ],

    // Função principal chamada pelo App
    updateCharts: function (transactions) {
        // Filtra apenas saídas e soma total
        const expenses = transactions.filter(t => t.type === 'saida');
        const totalExpense = expenses.reduce((acc, t) => acc + Number(t.amount), 0);

        // Se não houver gastos, mostra estado vazio
        if (totalExpense === 0) {
            this.renderEmptyState();
            return;
        }

        // Agrupa gastos por categoria
        const categories = {};
        expenses.forEach(t => {
            if (!categories[t.category]) categories[t.category] = 0;
            categories[t.category] += Number(t.amount);
        });

        // Prepara os dados para o gráfico (Array de objetos)
        const data = Object.entries(categories)
            .map(([name, value], index) => ({
                name,
                value,
                percent: (value / totalExpense) * 100,
                color: this.colors[index % this.colors.length]
            }))
            .sort((a, b) => b.value - a.value); // Ordena do maior para o menor

        // Renderiza
        this.renderDonut(data);
        this.renderLegend(data);
        this.updateTotal(totalExpense);
    },

    // Desenha o gráfico usando CSS Conic Gradient
    renderDonut: function (data) {
        const chart = document.getElementById('expense-chart');
        let gradientParts = [];
        let currentPercent = 0;

        data.forEach(item => {
            const start = currentPercent;
            const end = currentPercent + item.percent;
            // Cria a string: "COR INICIO% FIM%"
            gradientParts.push(`${item.color} ${start}% ${end}%`);
            currentPercent = end;
        });

        // Aplica o gradiente dinâmico
        chart.style.background = `conic-gradient(${gradientParts.join(', ')})`;
    },

    // Cria a legenda HTML
    renderLegend: function (data) {
        const legend = document.getElementById('expense-legend');
        legend.innerHTML = ''; // Limpa anterior

        data.forEach(item => {
            const div = document.createElement('div');
            div.className = 'legend-item';
            div.innerHTML = `
                <span class="color-dot" style="background-color: ${item.color}"></span>
                <span>${item.name}: ${Math.round(item.percent)}%</span>
            `;
            legend.appendChild(div);
        });
    },

    updateTotal: function (value) {
        // Usa o formatador global do Renderer (se disponível) ou formata aqui mesmo
        const formatted = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
        document.getElementById('chart-total').textContent = formatted;
    },

    renderEmptyState: function () {
        const chart = document.getElementById('expense-chart');
        const legend = document.getElementById('expense-legend');

        // Reseta para a cor padrão do CSS (cinza)
        chart.style.background = '';
        legend.innerHTML = '<div class="legend-item">Sem dados no período</div>';
        document.getElementById('chart-total').textContent = 'R$ 0,00';
    }
};