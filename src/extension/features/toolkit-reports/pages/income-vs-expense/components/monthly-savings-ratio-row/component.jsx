import classnames from 'classnames';
import * as PropTypes from 'prop-types';
import * as React from 'react';
import { localizedMonthAndYear } from 'toolkit/extension/utils/date';
import { MonthStyle } from 'toolkit/extension/utils/toolkit';
import { Percentage } from '../../../../common/components/percentage';

export const MonthlySavingsRatioRow = (props) => {
  const monthlyIncomes = props.incomes.get('monthlyTotals');
  const monthlyExpenses = props.expenses.get('monthlyTotals');
  const allMonthsIncomeTotal = monthlyIncomes.reduce(
    (reduced, monthData) => reduced + monthData.get('total'),
    0
  );
  const allMonthsExpenseTotal = Math.abs(
    monthlyExpenses.reduce((reduced, monthData) => reduced + monthData.get('total'), 0)
  );

  let allMonthsRatioTotal = 0;
  if (allMonthsIncomeTotal !== 0 && allMonthsIncomeTotal >= allMonthsExpenseTotal) {
    allMonthsRatioTotal = 1 - allMonthsExpenseTotal / allMonthsIncomeTotal;
  }

  const allMonthsSuffix = allMonthsRatioTotal < props.threshold ? '--negative' : '--positive';
  const allMonthsClassName = classnames('tk-monthly-totals-row__data-cell', {
    [`tk-monthly-totals-row__data-cell${allMonthsSuffix}`]: props.emphasizeTotals,
  });

  return (
    <div className={`tk-flex tk-monthly-totals-row ${props.className}`} onClick={props.onClick}>
      {props.titleCell && (
        <div className="tk-monthly-totals-row__title-cell">{props.titleCell}</div>
      )}

      <React.Fragment>
        {monthlyIncomes.map((incomeMonthData, index) => {
          const expenseMonthData = monthlyExpenses[index];
          const incomeTotal = incomeMonthData.get('total');
          const expenseTotal = Math.abs(expenseMonthData.get('total'));
          let ratio = 0;
          if (incomeTotal !== 0 && incomeTotal >= expenseTotal) {
            ratio = 1 - expenseTotal / incomeTotal;
          }

          const suffix = ratio < props.threshold ? '--negative' : '--positive';
          const className = classnames('tk-monthly-totals-row__data-cell', {
            [`tk-monthly-totals-row__data-cell${suffix}`]: props.emphasizeTotals,
          });

          return (
            <div key={incomeMonthData.get('date').toISOString()} className={className}>
              {props.titles ? (
                localizedMonthAndYear(incomeMonthData.get('date'), MonthStyle.Short)
              ) : (
                <Percentage pretty numbersAfterPoint={1} value={ratio} />
              )}
            </div>
          );
        })}
        <div key="average" className={allMonthsClassName}>
          {props.titles ? (
            'Average'
          ) : (
            <Percentage pretty numbersAfterPoint={1} value={allMonthsRatioTotal} />
          )}
        </div>
        <div key="total" className={allMonthsClassName}>
          {props.titles ? (
            'Total'
          ) : (
            <Percentage pretty numbersAfterPoint={1} value={allMonthsRatioTotal} />
          )}
        </div>
      </React.Fragment>
    </div>
  );
};

MonthlySavingsRatioRow.propTypes = {
  className: PropTypes.string,
  emphasizeTotals: PropTypes.bool,
  expenses: PropTypes.object.isRequired,
  incomes: PropTypes.object.isRequired,
  onClick: PropTypes.func,
  titleCell: PropTypes.any.isRequired,
  titles: PropTypes.bool,
  threshold: PropTypes.number,
};

MonthlySavingsRatioRow.defaultProps = {
  className: '',
  emphasizeTotals: false,
  onClick: () => {},
  titles: false,
  threshold: 0.1,
};
