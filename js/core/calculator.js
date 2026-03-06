const Calculator = {
    // Calcula os totais gerais (Entrada, Saída, Saldo)
    calculateTotals: function (transactions) {
        let income = 0;
        let expense = 0;

        transactions.forEach(tr => {
            // Garante que é número para evitar erro de soma de texto
            const amount = Number(tr.amount);

            if (tr.type === 'entrada') {
                income += amount;
            } else if (tr.type === 'saida') {
                expense += amount;
            }
        });

        return {
            income: income,
            expense: expense,
            balance: income - expense
        };
    },

    // Sua Regra de Negócio: Média de Gastos x 6 [cite: 1]
    calculateReserveTarget: function (transactions) {
        // Filtra apenas saídas
        const expenses = transactions.filter(t => t.type === 'saida');

        if (expenses.length === 0) return 0;

        // Descobre quantos meses únicos existem nos dados
        const uniqueMonths = new Set(expenses.map(t => t.date.substring(0, 7))); // Ex: "2026-03"
        const monthsCount = uniqueMonths.size || 1;

        // Soma total das saídas
        const totalExpense = expenses.reduce((acc, curr) => acc + Number(curr.amount), 0);

        // Média Mensal = Total Gasto / Número de Meses
        const averageMonthlyExpense = totalExpense / monthsCount;

        // Meta = Média x 6
        return averageMonthlyExpense * 6;
    },
    // Fórmula de Juros Compostos com Aporte Mensal
    calculateCompoundInterest: function (initial, monthly, rateYearly, years) {
        const r = rateYearly / 100 / 12; // Taxa mensal
        const n = years * 12;            // Número de meses

        // Valor Futuro do Montante Inicial: P * (1 + r)^n
        const futureValueInitial = initial * Math.pow(1 + r, n);

        // Valor Futuro dos Aportes: PMT * [ ((1 + r)^n - 1) / r ]
        let futureValueContributions = 0;
        if (r > 0) {
            futureValueContributions = monthly * ((Math.pow(1 + r, n) - 1) / r);
        } else {
            futureValueContributions = monthly * n;
        }

        const total = futureValueInitial + futureValueContributions;
        const totalInvested = initial + (monthly * n);

        return {
            total: total,
            invested: totalInvested,
            interest: total - totalInvested
        };
    }
};