const isValidPayee = (payee) => {
  if (payee === null) {
    return true;
  }

  return payee.internalName !== 'StartingBalancePayee';
};

const isValidDate = (transactionTime, currentTime, historyLookupMonths) => {
  if (historyLookupMonths !== 0) {
    return (currentTime - transactionTime) / 3600 / 24 / 1000 / (365 / 12) < historyLookupMonths;
  }
  return true;
};


export function outflowTransactionFilter(historyLookupMonths) {
  const dateNow = Date.now();

  return (transaction) => (
    !transaction.isTombstone &&
      transaction.transferAccountId === null &&
      transaction.amount < 0 &&
      isValidPayee(transaction.getPayee()) &&
      transaction.getAccount().onBudget &&
      !!transaction.getTransferAccountId() &&
      isValidDate(transaction.getDate().getUTCTime(), dateNow, historyLookupMonths)
  );
}

export function generateReport(transactions, totalBudget) {
  const transactionDates = transactions.map(t => t.getDate().getUTCTime());
  const firstTransactionDate = Math.min(...transactionDates);
  const lastTransactionDate = Math.max(...transactionDates);
  const totalDays = (lastTransactionDate - firstTransactionDate) / 3600 / 24 / 1000;
  const totalOutflow = transactions.map(t => -t.amount).reduce((outflow, amount) => outflow + amount, 0);
  const avgDailyOutflow = totalOutflow / totalDays;
  const avgDailyTransactions = transactions.length / totalDays;

  let daysOfBuffering = Math.floor(totalBudget / avgDailyOutflow);
  if (daysOfBuffering < 10) {
    daysOfBuffering = (totalBudget / avgDailyOutflow).toFixed(1);
  }

  if (totalDays < 15) {
    return { ableToGenerate: false };
  }

  return {
    daysOfBuffering,
    totalOutflow,
    totalDays,
    avgDailyOutflow,
    avgDailyTransactions,
    ableToGenerate: true
  };
}
