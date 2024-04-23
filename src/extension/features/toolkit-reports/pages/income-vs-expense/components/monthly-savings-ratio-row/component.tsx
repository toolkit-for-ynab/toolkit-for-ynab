import classnames from 'classnames';
import * as React from 'react';
import { localizedMonthAndYear } from 'toolkit/extension/utils/date';
import { MonthStyle } from 'toolkit/extension/utils/toolkit';
import { Percentage } from '../../../../common/components/percentage';
import { NormalizedExpenses, NormalizedIncomes } from '../../types';

export const MonthlySavingsRatioRow = ({
  className = '',
  onClick,
  titleCell,
  incomes,
  expenses,
  threshold = 0.1,
  titles = false,
  emphasizeTotals = false,
}: MonthlySavingsRatioRowProps) => {
  const monthlyIncomes = incomes.monthlyTotals;
  const monthlyExpenses = expenses.monthlyTotals;
  const allMonthsIncomeTotal = monthlyIncomes.reduce(
    (reduced, monthData) => reduced + monthData.total,
    0
  );
  const allMonthsExpenseTotal = Math.abs(
    monthlyExpenses.reduce((reduced, monthData) => reduced + monthData.total, 0)
  );

  let allMonthsRatioTotal = 0;
  if (allMonthsIncomeTotal !== 0 && allMonthsIncomeTotal >= allMonthsExpenseTotal) {
    allMonthsRatioTotal = 1 - allMonthsExpenseTotal / allMonthsIncomeTotal;
  }

  const allMonthsSuffix = allMonthsRatioTotal < threshold ? '--negative' : '--positive';
  const allMonthsClassName = classnames('tk-monthly-totals-row__data-cell', {
    [`tk-monthly-totals-row__data-cell${allMonthsSuffix}`]: emphasizeTotals,
  });

  return (
    <div className={`tk-flex tk-monthly-totals-row ${className}`} onClick={onClick}>
      {titleCell && <div className="tk-monthly-totals-row__title-cell">{titleCell}</div>}

      <React.Fragment>
        {monthlyIncomes.map((incomeMonthData, index) => {
          const expenseMonthData = monthlyExpenses[index];
          const incomeTotal = incomeMonthData?.total ?? 0;
          const expenseTotal = Math.abs(expenseMonthData?.total ?? 0);
          let ratio = 0;
          if (incomeTotal !== 0 && incomeTotal >= expenseTotal) {
            ratio = 1 - expenseTotal / incomeTotal;
          }

          const suffix = ratio < threshold ? '--negative' : '--positive';
          const className = classnames('tk-monthly-totals-row__data-cell', {
            [`tk-monthly-totals-row__data-cell${suffix}`]: emphasizeTotals,
          });

          return (
            <div key={incomeMonthData.date.toISOString()} className={className}>
              {titles ? (
                localizedMonthAndYear(incomeMonthData.date, MonthStyle.Short)
              ) : (
                <Percentage pretty numbersAfterPoint={1} value={ratio} />
              )}
            </div>
          );
        })}
        <div key="average" className={allMonthsClassName}>
          {titles ? (
            'Average'
          ) : (
            <Percentage pretty numbersAfterPoint={1} value={allMonthsRatioTotal} />
          )}
        </div>
        <div key="total" className={allMonthsClassName}>
          {titles ? (
            'Total'
          ) : (
            <Percentage pretty numbersAfterPoint={1} value={allMonthsRatioTotal} />
          )}
        </div>
      </React.Fragment>
    </div>
  );
};

type MonthlySavingsRatioRowProps = {
  className?: string;
  emphasizeTotals?: boolean;
  expenses: NormalizedExpenses;
  incomes: NormalizedIncomes;
  onClick?: VoidFunction;
  titleCell: React.ReactNode;
  titles?: boolean;
  threshold?: number;
};
