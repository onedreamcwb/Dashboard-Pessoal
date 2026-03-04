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

    updateSummary: function (totals) {
        // Atualiza os Cards (Vamos implementar a lógica real na próxima etapa)
        // Por enquanto, placeholder:
        console.log("Totais atualizados:", totals);
    }
};
