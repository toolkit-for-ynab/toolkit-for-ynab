export const ReportKeys = {
  NetWorth: 'net-worth',
  InflowOutflow: 'inflow-outflow',
  SpendingByCategory: 'spending-by-category',
  SpendingByCategoryOverTime: 'spending-by-category-over-time',
  SpendingByPayee: 'spending-by-payee',
  IncomeVsExpense: 'income-vs-expense',
  IncomeBreakdown: 'income-breakdown',
  BalanceOverTime: 'balance-over-time',
  OutflowOverTime: 'outflow-over-time',
  Forecast: 'forecast',
} as const;

export const ReportNames = {
  NetWorth: 'Net Worth',
  InflowOutflow: 'Inflow/Outflow',
  SpendingByCategory: 'Spending By Category',
  SpendingByCategoryOverTime: 'Spending by Category Over Time',
  SpendingByPayee: 'Spending By Payee',
  IncomeVsExpense: 'Income vs. Expense',
  IncomeBreakdown: 'Income Breakdown',
  BalanceOverTime: 'Balance Over Time',
  OutflowOverTime: 'Outflow Over Time',
  Forecast: 'Forecast',
} as const;

export const REPORT_TYPES = [
  {
    key: ReportKeys.NetWorth,
    name: ReportNames.NetWorth,
  },
  {
    key: ReportKeys.InflowOutflow,
    name: ReportNames.InflowOutflow,
  },
  {
    key: ReportKeys.SpendingByCategory,
    name: ReportNames.SpendingByCategory,
  },
  {
    key: ReportKeys.SpendingByCategoryOverTime,
    name: ReportNames.SpendingByCategoryOverTime,
  },
  {
    key: ReportKeys.SpendingByPayee,
    name: ReportNames.SpendingByPayee,
  },
  {
    key: ReportKeys.IncomeVsExpense,
    name: ReportNames.IncomeVsExpense,
  },
  {
    key: ReportKeys.IncomeBreakdown,
    name: ReportNames.IncomeBreakdown,
  },
  {
    key: ReportKeys.BalanceOverTime,
    name: ReportNames.BalanceOverTime,
  },
  {
    key: ReportKeys.OutflowOverTime,
    name: ReportNames.OutflowOverTime,
  },
  {
    key: ReportKeys.Forecast,
    name: ReportNames.Forecast,
  },
];
