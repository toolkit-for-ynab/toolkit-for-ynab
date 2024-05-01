import type { NormalizedExpenses, NormalizedIncomes, NormalizedNetIncome } from './types';

export function normalizeNetIncomes(
  expenses: NormalizedExpenses,
  incomes: NormalizedIncomes
): NormalizedNetIncome[] {
  const expensesMonthlyTotals = expenses.monthlyTotals;
  const incomesMonthlyTotals = incomes.monthlyTotals;

  let netIncomes: NormalizedNetIncome[] = [];

  let expensesIdx = 0;
  let incomeIdx = 0;

  while (expensesIdx < expensesMonthlyTotals.length || incomeIdx < incomesMonthlyTotals.length) {
    const expenses = expensesMonthlyTotals[expensesIdx];
    const income = incomesMonthlyTotals[incomeIdx];

    let netIncome: NormalizedNetIncome;

    // There is no case for if expense and income are both null, because that should never happen.
    // If it did, then we would not have anything to determine date from and thus we'd generate an
    // invalid NormalizedNetIncome object
    if (expenses == null) {
      netIncome = {
        date: income.date.clone(),
        total: income.total,
        transactions: [...income.transactions],
      };
      incomeIdx++;
    } else if (income == null) {
      netIncome = {
        date: expenses.date.clone(),
        total: expenses.total,
        transactions: [...expenses.transactions],
      };
      expensesIdx++;
    } else if (expenses.date.equalsByMonth(income.date)) {
      netIncome = {
        date: income.date.clone(),
        total: income.total + expenses.total,
        transactions: [...income.transactions, ...expenses.transactions],
      };
      expensesIdx++;
      incomeIdx++;
    } else if (expenses.date.isBefore(income.date)) {
      netIncome = {
        date: expenses.date.clone(),
        total: expenses.total,
        transactions: [...expenses.transactions],
      };
      expensesIdx++;
    } else {
      netIncome = {
        date: income.date.clone(),
        total: income.total,
        transactions: [...income.transactions],
      };
      incomeIdx++;
    }

    netIncomes.push(netIncome);
  }

  return netIncomes;
}
