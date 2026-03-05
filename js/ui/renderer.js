const Renderer = {
    renderTransaction: function (transaction) {
        const tbody = document.querySelector('#transactions-table tbody');
        const tr = document.createElement('tr');

        const amountFormatted = new Intl.NumberFormat('pt-BR', {
            style: 'currency', currency: 'BRL'
        }).format(transaction.amount);

        // Define a cor do valor baseada no tipo (CSS Class)
        const amountClass = transaction.type === 'entrada' ? 'text-green' : 'text-red';

        tr.innerHTML = `
            <td>${new Date(transaction.date + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
            <td>${transaction.description}</td>
            <td><span class="category-tag">${transaction.category}</span></td>
            <td class="${amountClass}" style="color: var(--${transaction.type === 'entrada' ? 'success' : 'danger'}-color); font-weight:bold;">
                ${transaction.type === 'saida' ? '-' : ''} ${amountFormatted}
            </td>
            <td>
                <button onclick="console.log('Deletar ${transaction.id}')" style="color:red; border:none; background:none; cursor:pointer;">X</button>
            </td>
        `;

        // Adiciona no topo da lista (mais recente primeiro)
        tbody.prepend(tr);
    },

    // --- ATUALIZE ESTA FUNÇÃO ABAIXO ---
    updateSummary: function (totals) {
        const cardEntrada = document.querySelector('#card-entrada .value');
        const cardSaida = document.querySelector('#card-saida .value');
        const cardResultado = document.querySelector('#card-resultado .value');

        // Atualiza Cards Principais
        if (cardEntrada) cardEntrada.textContent = this.formatCurrency(totals.income);
        if (cardSaida) cardSaida.textContent = this.formatCurrency(totals.expense);

        if (cardResultado) {
            cardResultado.textContent = this.formatCurrency(totals.balance);
            // Muda a cor do texto do resultado se estiver negativo
            cardResultado.style.color = totals.balance >= 0 ? 'var(--success-color)' : 'var(--danger-color)';
        }

        // Atualiza a Meta de Reserva na aba Simulador (Se existir)
        const reserveElement = document.getElementById('reserva-valor');
        if (reserveElement && totals.reserveTarget) {
            reserveElement.textContent = this.formatCurrency(totals.reserveTarget);
        }
    },

    // Função utilitária para não repetir código
    formatCurrency: function (value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    }
};

