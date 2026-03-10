# 💰 Finanças 2026 - ERP Pessoal

![Status](https://img.shields.io/badge/Status-Em%20Desenvolvimento-blue)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)

Um sistema completo de Gestão Financeira Pessoal (ERP) construído do zero. O objetivo deste projeto é ir além de uma simples planilha de gastos, criando uma aplicação web inteligente, rápida e focada em **Planejamento vs. Realizado**.

## 📸 Preview do Projeto

> **Nota para você, Gustavo:** Para adicionar as imagens aqui no GitHub, basta editar este arquivo pelo site do GitHub e arrastar as imagens do seu computador para dentro da caixa de texto. Ele vai gerar um link automático. Substitua os textos abaixo pelos links gerados!

<p align="center">
  <img src="assets/images/Dashboards/Dashboard.png" width="100%" title="Versão Mobile">
  <br>
  <em>Dashboard principal mostrando resumos e gráficos gerados nativamente.</em>
</p>
<br>

<p align="center">
  <img src="assets/images/Dashboards/dashboard mobile.png" width="100%" title="Versão Mobile">
  <br>
  <em>Dashboard Mobile inicial.</em>
</p>

## 🎯 Motivação
A maioria dos aplicativos financeiros exige cadastros demorados, dependem de internet ou guardam seus dados em servidores de terceiros. A proposta do **Finanças 2026** é ser uma ferramenta:
- **Privada:** Os dados ficam salvos exclusivamente no navegador do usuário (`localStorage`).
- **Segura:** Sistema de Backup/Restore via arquivos `.json` exportáveis.
- **Inteligente:** Lógica de "Lazy Loading" para despesas fixas (o sistema cria a despesa do mês atual automaticamente, sem poluir o banco de dados com meses futuros).

## ✨ Funcionalidades Atuais (Fase 1)
- **Dashboard Gerencial:** Visão geral de Entradas, Saídas e Saldo do mês.
- **Gráficos Nativos:** Gráfico de Rosca (Categorias) e Gráfico de Barras (Histórico 6 meses) construídos puramente com CSS e JS, **sem uso de bibliotecas externas** como Chart.js.
- **CRUD Completo:** Adição, edição e exclusão de movimentações financeiras.
- **Inteligência de Recorrência:** Cadastro de despesas fixas que se auto-geram na virada do mês (com proteção contra duplicação de dados).
- **Simulador de Investimentos:** Calculadora de juros compostos integrada.
- **Filtro Temporal:** Navegação dinâmica entre meses e anos.

## 🛠️ Tecnologias Utilizadas
O projeto foi desenvolvido focando nos fundamentos da web (Zero Dependências):
- **HTML5:** Estrutura semântica e acessível.
- **CSS3:** Flexbox, CSS Grid, Variáveis Nativas (Custom Properties) e Design Responsivo (Mobile-First).
- **JavaScript (ES6+):** Arquitetura modular (`App`, `Storage`, `Charts`, `FormsHandler`).
- **Banco de Dados:** `window.localStorage` (Persistência local no client-side).

## 🚀 Como Executar o Projeto

Como o projeto não possui backend ou dependências de Node.js, rodá-lo é extremamente simples:

1. Clone este repositório:
   ```bash
   git clone [https://github.com/SEU_USUARIO/Projeto-web.git](https://github.com/SEU_USUARIO/Projeto-web.git)
