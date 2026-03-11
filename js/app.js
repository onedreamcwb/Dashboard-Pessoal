const App = {
    // Estado da aplicação
    state: {
        currentMonth: new Date().toISOString().slice(0, 7) // Ex: "2026-03"
    },

    init: function() {
        console.log("App Iniciado");
        
        // 1. Inicializa o Formulário
        if (typeof FormsHandler !== 'undefined') {
            FormsHandler.init();
        }
        
        // 2. Configura o Filtro de Mês (Topo do Dashboard)
        const monthFilter = document.getElementById('month-filter');
        if (monthFilter) {
            monthFilter.value = this.state.currentMonth;
            
            monthFilter.addEventListener('change', (e) => {
                this.state.currentMonth = e.target.value;
                this.updateDashboard(); // Recarrega ao mudar a data
            });
        }

        // 3. Processa Despesas Recorrentes (Fixas)
        if (typeof RecurringManager !== 'undefined') {
            RecurringManager.processRecurringExpenses();
        }

        // 4. Configuração Inicial de Navegação
        // Garante que a aba "Resultados" comece ativa visualmente no menu
        this.switchTab('tab-resultados');
        
        // 5. Carrega os dados na tela
        this.loadData();
        // (Adicione isso no final do App.init)
        const formAporte = document.getElementById('form-aporte');
        if (formAporte) {
            // Coloca a data de hoje por padrão
            document.getElementById('aporte-data').value = new Date().toISOString().split('T')[0];
            formAporte.addEventListener('submit', (e) => this.handleAporteSubmit(e));
        }
        // Ouvinte do formulário de Património
        const formPatrimonio = document.getElementById('form-patrimonio');
        if (formPatrimonio) {
            formPatrimonio.addEventListener('submit', (e) => this.handlePatrimonioSubmit(e));
        }
    },

    loadData: function() {
        this.updateDashboard();
    },

    // --- NÚCLEO: ATUALIZAÇÃO DO DASHBOARD ---
    updateDashboard: function() {
        const allTransactions = Storage.getTransactions();
        
        // 1. Filtra transações pelo mês selecionado
        const filteredTransactions = allTransactions.filter(tr => 
            tr.date.startsWith(this.state.currentMonth)
        );

        // 2. Calcula os totais do mês
        const totals = Calculator.calculateTotals(filteredTransactions);
        
        // 3. Calcula Meta de Reserva (usa histórico completo)
        totals.reserveTarget = Calculator.calculateReserveTarget(allTransactions);
        
        // 4. Atualiza Interface (Cards e Barra de Progresso)
        Renderer.updateSummary(totals);
        // --- INTEGRAÇÃO DOS APORTES NO DASHBOARD PRINCIPAL ---
        const allAportes = JSON.parse(localStorage.getItem('finance_aportes') || '[]');
        const aportesMes = allAportes.filter(a => a.date.startsWith(this.state.currentMonth));
        const totalAportes = aportesMes.reduce((acc, a) => acc + Number(a.amount), 0);

        // Atualiza o Card de Aportes no Dashboard
        const cardAporteDash = document.querySelector('#card-aporte-dash .value');
        if (cardAporteDash) {
            cardAporteDash.textContent = Renderer.formatCurrency(totalAportes);
        }

        // Calcula o Saldo Livre (Entradas - Saídas - Aportes)
        const saldoLivre = totals.balance - totalAportes;
        const cardSaldoLivre = document.getElementById('valor-saldo-livre');
        
        if (cardSaldoLivre) {
            cardSaldoLivre.textContent = Renderer.formatCurrency(saldoLivre);
            // Fica vermelho se o saldo livre for negativo, e verde se sobrar dinheiro
            cardSaldoLivre.style.color = saldoLivre >= 0 ? 'var(--success-color)' : 'var(--danger-color)';
        }
        Renderer.updateSimulator(totals);

        // 5. Atualiza Gráficos (Envia dados do mês E histórico completo)
        if (typeof Charts !== 'undefined') {
            Charts.updateCharts(filteredTransactions, allTransactions);
        }
        
        // 6. Atualiza a Tabela
        const tbody = document.querySelector('#transactions-table tbody');
        if (tbody) {
            tbody.innerHTML = ''; // Limpa tabela
            
            // Ordena por data (mais recente primeiro)
            filteredTransactions
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .forEach(tr => Renderer.renderTransaction(tr));
        }
        // 7. Atualiza as Abas Específicas (Entradas e Saídas)
        this.updateSeparatedTabs(filteredTransactions);
    },

    // --- AÇÕES DE CRUD (Editar/Excluir) ---

    handleDelete: function(id) {
        if (confirm("Tem certeza que deseja excluir este lançamento?")) {
            Storage.deleteTransaction(id);
            this.updateDashboard();
            alert("Lançamento excluído.");
        }
    },

    handleEdit: function(id) {
        const transaction = Storage.getTransactionById(id);
        if (transaction) {
            // Se estivermos em outra aba, volta para Resultados para ver o formulário
            this.switchTab('tab-resultados');
            
            // Carrega os dados no formulário
            FormsHandler.loadForEdit(transaction);
        } else {
            alert("Erro: Transação não encontrada.");
        }
    },

    // --- CALCULADORA (Aba Simulador) ---
    
    runSimulation: function() {
        const initial = parseFloat(document.getElementById('calc-inicial').value) || 0;
        const monthly = parseFloat(document.getElementById('calc-aporte').value) || 0;
        const rate = parseFloat(document.getElementById('calc-taxa').value) || 0;
        const years = parseFloat(document.getElementById('calc-tempo').value) || 0;

        const result = Calculator.calculateCompoundInterest(initial, monthly, rate, years);

        document.getElementById('res-investido').textContent = Renderer.formatCurrency(result.invested);
        document.getElementById('res-juros').textContent = Renderer.formatCurrency(result.interest);
        document.getElementById('res-total').textContent = Renderer.formatCurrency(result.total);

        document.getElementById('calc-results').style.display = 'grid';
    },

    // --- NAVEGAÇÃO E LAYOUT (NOVO) ---

    // Alterna entre as abas (Resultados, Entradas, Simulador, etc.)
    switchTab: function(tabId) {
        // 1. Esconde todas as seções de conteúdo
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.style.display = 'none';
        });

        // 2. Mostra apenas a seção desejada
        const selectedTab = document.getElementById(tabId);
        if (selectedTab) {
            selectedTab.style.display = 'block';
        }

        // 3. Atualiza o Menu Lateral (Classe 'active')
        document.querySelectorAll('.nav-item').forEach(btn => {
            btn.classList.remove('active');
            // Verifica se o botão clicado corresponde à aba atual
            // O getAttribute('onclick') retorna a string da função, ex: "App.switchTab('tab-resultados')"
            if (btn.getAttribute('onclick') && btn.getAttribute('onclick').includes(tabId)) {
                btn.classList.add('active');
            }
        });

        // 4. Atualiza o Título da Página no Header
        const pageTitles = {
            'tab-resultados': 'Visão Geral',
            'tab-entradas': 'Gestão de Entradas',
            'tab-saidas': 'Gestão de Saídas',
            'tab-aporte': 'Meus Aportes',
            'tab-mensal': 'Despesas Fixas',
            'tab-previsao': 'Planejamento',
            'tab-patrimonio': 'Balanço Patrimonial',
            'tab-simulador': 'Simulador de Investimentos'
        };
        
        const titleElement = document.getElementById('page-title');
        if (titleElement) {
            titleElement.textContent = pageTitles[tabId] || 'Finanças';
        }

        // 5. Fecha a sidebar automaticamente no Mobile após clicar
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            sidebar.classList.remove('open');
        }
        // Se abriu a aba Mensal, carrega os dados dela
        if (tabId === 'tab-mensal') {
            this.updateRecurringTab();
        }
        // Se abriu a aba Mensal, carrega os dados dela
        if (tabId === 'tab-mensal') {
            this.updateRecurringTab();
        }
        // Se abriu a aba Aporte, carrega os dados dela
        if (tabId === 'tab-aporte') {
            this.updateAporteTab();
        }
        // Se abriu a aba Património, carrega os dados dela
        if (tabId === 'tab-patrimonio') {
            this.updatePatrimonioTab();
        }
    },

    // Abre/Fecha a sidebar no Mobile (Botão Hambúrguer)
    toggleSidebar: function() {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            sidebar.classList.toggle('open');
        }
    },
    // --- LÓGICA DA ABA MENSAL (CONTAS FIXAS) ---

    updateRecurringTab: function() {
        if (typeof Storage === 'undefined') return;
        
        // Pega as regras do banco de dados
        const rules = Storage.getRecurringRules() || [];
        
        let totalEntradas = 0;
        let totalSaidas = 0;
        
        const tbody = document.querySelector('#recurring-table tbody');
        if (!tbody) return;
        
        tbody.innerHTML = ''; // Limpa a tabela
        
        if (rules.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 20px; color: #64748b;">Nenhuma conta fixa cadastrada no momento.</td></tr>';
        }
        
        rules.forEach(rule => {
            // Soma para os cards
            if (rule.type === 'entrada') totalEntradas += Number(rule.amount);
            if (rule.type === 'saida') totalSaidas += Number(rule.amount);
            
            // Cria a linha da tabela
            const tr = document.createElement('tr');
            tr.style.borderBottom = "1px solid #f1f5f9";
            
            const corValor = rule.type === 'entrada' ? 'var(--success-color)' : 'var(--danger-color)';
            const valorFormatado = Number(rule.amount).toLocaleString('pt-BR', {minimumFractionDigits: 2});

            tr.innerHTML = `
                <td style="padding: 15px; font-weight: 600; color: #1e293b;">${rule.description}</td>
                <td style="padding: 15px;"><span style="background: #e2e8f0; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; color: #475569;">${rule.category}</span></td>
                <td style="padding: 15px; text-transform: capitalize; color: #64748b;">${rule.type}</td>
                <td style="padding: 15px; font-weight: bold; color: ${corValor};">R$ ${valorFormatado}</td>
                <td style="padding: 15px;">
                    <button onclick="App.deleteRecurringRule('${rule.id}')" style="background: none; border: none; cursor: pointer; font-size: 1.2rem; transition: transform 0.2s;" title="Cancelar Conta Fixa" onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='scale(1)'">🗑️</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
        
        // Atualiza os Cards de Resumo
        document.getElementById('mensal-entrada-total').textContent = `R$ ${totalEntradas.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
        document.getElementById('mensal-saida-total').textContent = `R$ ${totalSaidas.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
    },

    deleteRecurringRule: function(id) {
        if (confirm("Tem certeza que deseja CANCELAR esta conta fixa?\n\nEla não será mais gerada nos próximos meses. (As contas dos meses anteriores não serão apagadas).")) {
            
            // 1. Puxa as regras atuais
            let rules = Storage.getRecurringRules() || [];
            
            // 2. CORREÇÃO DE BUG: Converte ambos para Texto (String) para não dar erro de tipagem
            rules = rules.filter(r => String(r.id) !== String(id));
            
            // 3. Salva no banco de dados local com segurança
            // Verifica se o Storage tem uma função própria, senão salva direto no LocalStorage
            if (typeof Storage.saveRecurringRules === 'function') {
                Storage.saveRecurringRules(rules);
            } else {
                // Tenta as chaves que criamos nas etapas anteriores
                localStorage.setItem('finance_recurring_rules', JSON.stringify(rules));
                localStorage.setItem('finance_recurring', JSON.stringify(rules)); 
            }
            
            // 4. Atualiza a tela imediatamente
            this.updateRecurringTab();
            
            // Atualiza também os cards da aba Resultados para refletir qualquer mudança global
            this.updateDashboard(); 
            
            alert("Conta fixa cancelada com sucesso!");
        }
    },
    // --- LÓGICA DAS ABAS SEPARADAS (ENTRADAS E SAÍDAS) ---
    
    updateSeparatedTabs: function(filteredTransactions) {
        // 1. Separa os dados
        const entradas = filteredTransactions.filter(t => t.type === 'entrada');
        const saidas = filteredTransactions.filter(t => t.type === 'saida');

        // 2. Calcula Totais
        const totalEntradas = entradas.reduce((acc, t) => acc + Number(t.amount), 0);
        const totalSaidas = saidas.reduce((acc, t) => acc + Number(t.amount), 0);

        // 3. Atualiza os Cards das Abas
        const cardEntrada = document.getElementById('total-entradas-aba');
        if (cardEntrada) cardEntrada.textContent = Renderer.formatCurrency(totalEntradas);
        
        const cardSaida = document.getElementById('total-saidas-aba');
        if (cardSaida) cardSaida.textContent = Renderer.formatCurrency(totalSaidas);

        // 4. Renderiza as Tabelas (Reutilizando a inteligência de renderização)
        this.renderTableData('#entradas-table tbody', entradas, 'entrada');
        this.renderTableData('#saidas-table tbody', saidas, 'saida');
    },

    // Função Auxiliar para não repetir código
    renderTableData: function(selector, transactions, type) {
        const tbody = document.querySelector(selector);
        if (!tbody) return;
        
        tbody.innerHTML = ''; // Limpa a tabela
        
        if (transactions.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 20px; color: #64748b;">Nenhuma ${type} registrada neste mês.</td></tr>`;
            return;
        }

        // Ordena por data (mais recente primeiro)
        transactions.sort((a, b) => new Date(b.date) - new Date(a.date)).forEach(t => {
            const tr = document.createElement('tr');
            tr.style.borderBottom = "1px solid #f1f5f9";
            
            // Formata a data de YYYY-MM-DD para DD/MM/YYYY
            const [ano, mes, dia] = t.date.split('-');
            const dataFormatada = `${dia}/${mes}/${ano}`;
            
            const corValor = t.type === 'entrada' ? 'var(--success-color)' : 'var(--danger-color)';
            const sinal = t.type === 'saida' ? '- ' : '';
            
            tr.innerHTML = `
                <td style="padding: 15px; color: #64748b;">${dataFormatada}</td>
                <td style="padding: 15px; font-weight: 500; color: #1e293b;">${t.description}</td>
                <td style="padding: 15px;"><span style="background: #e2e8f0; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; color: #475569;">${t.category}</span></td>
                <td style="padding: 15px; font-weight: bold; color: ${corValor}; text-align: right;">${sinal}${Renderer.formatCurrency(t.amount)}</td>
                <td style="padding: 15px; text-align: center;">
                    <button onclick="App.handleEdit('${t.id}')" style="background: none; border: none; cursor: pointer; font-size: 1.1rem; margin-right: 10px;" title="Editar">✏️</button>
                    <button onclick="App.handleDelete('${t.id}')" style="background: none; border: none; cursor: pointer; font-size: 1.1rem;" title="Excluir">🗑️</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    },
    // --- LÓGICA DA ABA APORTE (INVESTIMENTOS) ---

    handleAporteSubmit: function(e) {
        e.preventDefault();
        
        // Pega os valores
        const aporte = {
            id: Date.now().toString(),
            description: document.getElementById('aporte-desc').value,
            category: document.getElementById('aporte-cat').value,
            amount: parseFloat(document.getElementById('aporte-valor').value),
            date: document.getElementById('aporte-data').value
        };

        // Salva no LocalStorage (Numa tabela separada só para investimentos)
        const aportes = JSON.parse(localStorage.getItem('finance_aportes') || '[]');
        aportes.push(aporte);
        localStorage.setItem('finance_aportes', JSON.stringify(aportes));

        // Limpa o form e atualiza a tela
        document.getElementById('aporte-desc').value = '';
        document.getElementById('aporte-valor').value = '';
        
        this.updateAporteTab();
        alert("Investimento registrado com sucesso! 🚀");
    },

    updateAporteTab: function() {
        const tbody = document.querySelector('#aportes-table tbody');
        if (!tbody) return;
        
        // Puxa do banco
        const allAportes = JSON.parse(localStorage.getItem('finance_aportes') || '[]');
        
        // Filtra pelo mês selecionado no topo da tela
        const currentMonth = document.getElementById('month-filter').value; // Ex: "2026-03"
        const filteredAportes = allAportes.filter(a => a.date.startsWith(currentMonth));
        
        let totalMes = 0;
        tbody.innerHTML = '';
        
        if (filteredAportes.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 20px; color: #64748b;">Nenhum aporte registrado neste mês. Que tal investir algo?</td></tr>`;
        } else {
            // Ordena e desenha a tabela
            filteredAportes.sort((a, b) => new Date(b.date) - new Date(a.date)).forEach(a => {
                totalMes += Number(a.amount);
                
                const tr = document.createElement('tr');
                tr.style.borderBottom = "1px solid #f1f5f9";
                
                const [ano, mes, dia] = a.date.split('-');
                
                tr.innerHTML = `
                    <td style="padding: 15px; color: #64748b;">${dia}/${mes}/${ano}</td>
                    <td style="padding: 15px; font-weight: 600; color: #1e3a8a;">${a.description}</td>
                    <td style="padding: 15px;"><span style="background: #dbeafe; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; color: #1e40af;">${a.category}</span></td>
                    <td style="padding: 15px; font-weight: bold; color: #3b82f6; text-align: right;">R$ ${a.amount.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                    <td style="padding: 15px; text-align: center;">
                        <button onclick="App.deleteAporte('${a.id}')" style="background: none; border: none; cursor: pointer; font-size: 1.1rem;" title="Excluir">🗑️</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }
        
        // Atualiza o Card
        document.getElementById('aporte-total-mes').textContent = `R$ ${totalMes.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
    },

    deleteAporte: function(id) {
        if (confirm("Tem certeza que deseja excluir este investimento?")) {
            let aportes = JSON.parse(localStorage.getItem('finance_aportes') || '[]');
            aportes = aportes.filter(a => String(a.id) !== String(id));
            localStorage.setItem('finance_aportes', JSON.stringify(aportes));
            
            this.updateAporteTab();
        }
    },
    // --- LÓGICA DA ABA PATRIMÓNIO ---

    handlePatrimonioSubmit: function(e) {
        e.preventDefault();
        
        const item = {
            id: Date.now().toString(),
            description: document.getElementById('patrimonio-desc').value,
            type: document.getElementById('patrimonio-tipo').value,
            amount: parseFloat(document.getElementById('patrimonio-valor').value)
        };

        // Guarda numa base de dados dedicada ao Património
        const patrimonio = JSON.parse(localStorage.getItem('finance_patrimonio') || '[]');
        patrimonio.push(item);
        localStorage.setItem('finance_patrimonio', JSON.stringify(patrimonio));

        document.getElementById('patrimonio-desc').value = '';
        document.getElementById('patrimonio-valor').value = '';
        
        this.updatePatrimonioTab();
        alert("Património atualizado com sucesso! 🏛️");
    },

    updatePatrimonioTab: function() {
        const tbody = document.querySelector('#patrimonio-table tbody');
        if (!tbody) return;
        
        const patrimonio = JSON.parse(localStorage.getItem('finance_patrimonio') || '[]');
        
        let totalAtivos = 0;
        let totalPassivos = 0;
        
        tbody.innerHTML = '';
        
        if (patrimonio.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 20px; color: #64748b;">Nenhum bem ou dívida registada.</td></tr>`;
        } else {
            patrimonio.forEach(item => {
                // Matemática
                if (item.type === 'ativo') totalAtivos += Number(item.amount);
                if (item.type === 'passivo') totalPassivos += Number(item.amount);
                
                const tr = document.createElement('tr');
                tr.style.borderBottom = "1px solid #f1f5f9";
                
                // Formatações Visuais
                const corTipo = item.type === 'ativo' ? 'var(--success-color)' : 'var(--danger-color)';
                const labelTipo = item.type === 'ativo' ? 'Ativo' : 'Passivo';
                const corBadge = item.type === 'ativo' ? '#dcfce7' : '#fee2e2';
                const corTextoBadge = item.type === 'ativo' ? '#166534' : '#991b1b';
                
                tr.innerHTML = `
                    <td style="padding: 15px; font-weight: 600; color: #1e293b;">${item.description}</td>
                    <td style="padding: 15px;"><span style="background: ${corBadge}; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; color: ${corTextoBadge}; font-weight: bold;">${labelTipo}</span></td>
                    <td style="padding: 15px; font-weight: bold; color: ${corTipo}; text-align: right;">R$ ${item.amount.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                    <td style="padding: 15px; text-align: center;">
                        <button onclick="App.deletePatrimonio('${item.id}')" style="background: none; border: none; cursor: pointer; font-size: 1.1rem;" title="Remover">🗑️</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }
        
        // Atualiza os Cards Superiores
        const patrimonioLiquido = totalAtivos - totalPassivos;
        
        document.getElementById('patrimonio-ativos').textContent = `R$ ${totalAtivos.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
        document.getElementById('patrimonio-passivos').textContent = `R$ ${totalPassivos.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
        
        const liquiElement = document.getElementById('patrimonio-liquido');
        liquiElement.textContent = `R$ ${patrimonioLiquido.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
        
        // Fica vermelho se as dívidas forem maiores que os bens
        liquiElement.style.color = patrimonioLiquido >= 0 ? '#8b5cf6' : 'var(--danger-color)';
    },

    deletePatrimonio: function(id) {
        if (confirm("Tem a certeza de que deseja remover este item do seu património?")) {
            let patrimonio = JSON.parse(localStorage.getItem('finance_patrimonio') || '[]');
            patrimonio = patrimonio.filter(p => String(p.id) !== String(id));
            localStorage.setItem('finance_patrimonio', JSON.stringify(patrimonio));
            
            this.updatePatrimonioTab();
        }
    }
};

// Inicializa quando o HTML estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});