import type { NormalizedExpenses, NormalizedIncomes, NormalizedNetIncome } from './types';

export function normalizeNetIncomes(
  expenses: NormalizedExpenses,
  incomes: NormalizedIncomes
): NormalizedNetIncome[] {
  const expensesMonthlyTotals = expenses.monthlyTotals;
  const incomesMonthlyTotals = incomes.monthlyTotals;

  return incomesMonthlyTotals.map((incomeMonthData, index) => {
    const expenseMonthData = expensesMonthlyTotals[index];

    return {
      date: incomeMonthData.date.clone(),
      total: incomeMonthData.total + expenseMonthData.total,
      transactions: [...incomeMonthData.transactions, ...expenseMonthData.transactions],
    };
  });
}
