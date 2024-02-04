import classnames from 'classnames';
import * as React from 'react';
import { localizedMonthAndYear } from 'toolkit/extension/utils/date';
import { MonthStyle } from 'toolkit/extension/utils/toolkit';
import { Currency } from 'toolkit/extension/features/toolkit-reports/common/components/currency';
import './styles.scss';
import { MonthlyTotals } from '../../types';

function getViewZeroAsEmptySetting() {
  const { ViewZeroAsEmpty } = (window.ynabToolKit && window.ynabToolKit.options) || {};
  return ViewZeroAsEmpty;
}

export const MonthlyTotalsRow = ({
  emphasizeTotals = false,
  titleCell,
  titles,
  monthlyTotals,
  onClick,
  className = '',
}: MonthlyTotalsRowProps) => {
  const allMonthsTotal =
    monthlyTotals === undefined
      ? 0
      : monthlyTotals.reduce((reduced, monthData) => reduced + monthData.total, 0);
  const allMonthsSuffix = allMonthsTotal < 0 ? '--negative' : '--positive';
  const allMonthsClassName = classnames('tk-monthly-totals-row__data-cell', {
    [`tk-monthly-totals-row__data-cell${allMonthsSuffix}`]: emphasizeTotals,
  });
  const shouldHideZeroCells = getViewZeroAsEmptySetting();

  return (
    <div className={`tk-flex tk-monthly-totals-row ${className}`} onClick={onClick}>
      {titleCell && <div className="tk-monthly-totals-row__title-cell">{titleCell}</div>}
      {monthlyTotals && (
        <React.Fragment>
          {monthlyTotals.map((monthData) => {
            const total = monthData.total;
            const suffix = total < 0 ? '--negative' : '--positive';
            const className = classnames('tk-monthly-totals-row__data-cell', {
              [`tk-monthly-totals-row__data-cell${suffix}`]: emphasizeTotals,
            });
            const monthTotal = monthData.total;
            const isTotalZero = monthTotal === 0;
            const shouldHideCurrency = shouldHideZeroCells && isTotalZero;

            return (
              <div key={monthData.date.toISOString()} className={className}>
                {titles
                  ? localizedMonthAndYear(monthData.date, MonthStyle.Short)
                  : !shouldHideCurrency && <Currency value={monthTotal} />}
              </div>
            );
          })}
          <div key="average" className={allMonthsClassName}>
            {titles ? 'Average' : <Currency value={allMonthsTotal / monthlyTotals.length} />}
          </div>
          <div key="total" className={allMonthsClassName}>
            {titles ? 'Total' : <Currency value={allMonthsTotal} />}
          </div>
        </React.Fragment>
      )}
    </div>
  );
};

type MonthlyTotalsRowProps = {
  className?: string;
  emphasizeTotals?: boolean;
  monthlyTotals?: MonthlyTotals[];
  onClick?: VoidFunction;
  titleCell: React.ReactNode;
  titles?: boolean;
};
