const Storage = {
    getTransactions: function () {
        return JSON.parse(localStorage.getItem('finance_transactions')) || [];
    },

    saveTransaction: function (transaction) {
        const transactions = this.getTransactions();
        transactions.push(transaction);
        localStorage.setItem('finance_transactions', JSON.stringify(transactions));
    }
};
