export default function reportGenerator(transactions, totalBudget) {
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
