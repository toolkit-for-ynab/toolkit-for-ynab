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
  const allMonthsExpenseTotal = monthlyExpenses.reduce(
    (reduced, monthData) => reduced + monthData.total,
    0
  );

  let allMonthsRatioTotal: undefined | number = undefined;
  if (allMonthsIncomeTotal !== 0) {
    allMonthsRatioTotal = Math.min(
      Math.max(allMonthsExpenseTotal / allMonthsIncomeTotal + 1, 0),
      1
    );
  }

  const allMonthsSuffix =
    allMonthsRatioTotal === undefined
      ? ''
      : allMonthsRatioTotal < threshold
      ? '--negative'
      : '--positive';
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
          const expenseTotal = expenseMonthData?.total ?? 0;
          let ratio: undefined | number = undefined;
          if (incomeTotal !== 0) {
            // Clamp ratio to range [0, 1]
            ratio = Math.min(Math.max(expenseTotal / incomeTotal + 1, 0), 1);
          }

          const suffix = ratio === undefined ? '' : ratio < threshold ? '--negative' : '--positive';
          const className = classnames('tk-monthly-totals-row__data-cell', {
            [`tk-monthly-totals-row__data-cell${suffix}`]: emphasizeTotals,
          });

          return (
            <div key={incomeMonthData.date.toISOString()} className={className}>
              {titles ? (
                localizedMonthAndYear(incomeMonthData.date, MonthStyle.Short)
              ) : ratio === undefined ? (
                'N/A'
              ) : (
                <Percentage pretty numbersAfterPoint={1} value={ratio} />
              )}
            </div>
          );
        })}
        <div key="average" className={allMonthsClassName}>
          {titles ? (
            'Average'
          ) : allMonthsRatioTotal === undefined ? (
            'N/A'
          ) : (
            <Percentage pretty numbersAfterPoint={1} value={allMonthsRatioTotal} />
          )}
        </div>
        <div key="total" className={allMonthsClassName}>
          {titles ? (
            'Total'
          ) : allMonthsRatioTotal === undefined ? (
            'N/A'
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
