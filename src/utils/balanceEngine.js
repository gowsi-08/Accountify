export const balanceEngine = {
  // Apply a transaction to accounts
  applyTransaction(accounts, transaction) {
    const updatedAccounts = [...accounts];

    if (transaction.type === 'income') {
      // Income: add to to_account
      const toAccount = updatedAccounts.find(acc => acc.id === transaction.to_account);
      if (toAccount) {
        toAccount.balance += transaction.amount;
      }
    } else if (transaction.type === 'expense') {
      // Expense: deduct from from_account
      const fromAccount = updatedAccounts.find(acc => acc.id === transaction.from_account);
      if (fromAccount) {
        fromAccount.balance -= transaction.amount;
      }
    } else if (transaction.type === 'transfer') {
      // Transfer: deduct from from_account, add to to_account
      const fromAccount = updatedAccounts.find(acc => acc.id === transaction.from_account);
      const toAccount = updatedAccounts.find(acc => acc.id === transaction.to_account);
      if (fromAccount) {
        fromAccount.balance -= transaction.amount;
      }
      if (toAccount) {
        toAccount.balance += transaction.amount;
      }
    }

    return updatedAccounts;
  },

  // Reverse a transaction from accounts
  reverseTransaction(accounts, transaction) {
    const updatedAccounts = [...accounts];

    if (transaction.type === 'income') {
      const toAccount = updatedAccounts.find(acc => acc.id === transaction.to_account);
      if (toAccount) {
        toAccount.balance -= transaction.amount;
      }
    } else if (transaction.type === 'expense') {
      const fromAccount = updatedAccounts.find(acc => acc.id === transaction.from_account);
      if (fromAccount) {
        fromAccount.balance += transaction.amount;
      }
    } else if (transaction.type === 'transfer') {
      const fromAccount = updatedAccounts.find(acc => acc.id === transaction.from_account);
      const toAccount = updatedAccounts.find(acc => acc.id === transaction.to_account);
      if (fromAccount) {
        fromAccount.balance += transaction.amount;
      }
      if (toAccount) {
        toAccount.balance -= transaction.amount;
      }
    }

    return updatedAccounts;
  },

  // Generate unique ID
  generateId(prefix = 'txn') {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
};
