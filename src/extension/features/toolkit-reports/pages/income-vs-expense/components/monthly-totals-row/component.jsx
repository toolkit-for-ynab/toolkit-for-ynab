import * as React from 'react';
import * as PropTypes from 'prop-types';
import { formatCurrency } from 'toolkit/extension/utils/currency';
import { localizedMonthAndYear } from 'toolkit/extension/utils/date';
import { MonthStyle } from 'toolkit/extension/utils/toolkit';
import classnames from 'classnames';
import './styles.scss';

export const MonthlyTotalsRow = (props) => {
  const allMonthsTotal = props.monthlyTotals && props.monthlyTotals.reduce((reduced, monthData) => reduced + monthData.get('total'), 0);
  const allMonthsSuffix = allMonthsTotal < 0 ? '--negative' : '--positive';
  const allMonthsClassName = classnames('tk-monthly-totals-row__data-cell', {
    [`tk-monthly-totals-row__data-cell${allMonthsSuffix}`]: props.emphasizeTotals
  });

  return (
    <div className={`tk-flex tk-monthly-totals-row ${props.className}`} onClick={props.onClick}>
      {props.titleCell && <div className="tk-monthly-totals-row__title-cell">{props.titleCell}</div>}
      {props.monthlyTotals && (
        <React.Fragment>
          {props.monthlyTotals.map((monthData) => {
            const total = monthData.get('total');
            const suffix = total < 0 ? '--negative' : '--positive';
            const className = classnames('tk-monthly-totals-row__data-cell', {
              [`tk-monthly-totals-row__data-cell${suffix}`]: props.emphasizeTotals
            });

            return (
              <div key={monthData.get('date').toISOString()} className={className}>
                {props.titles ? localizedMonthAndYear(monthData.get('date'), MonthStyle.Short) : formatCurrency(monthData.get('total'))}
              </div>
            );
          })}
          <div key="average" className={allMonthsClassName}>
            {props.titles ? 'Average' : formatCurrency(allMonthsTotal / props.monthlyTotals.length)}
          </div>
          <div key="total" className={allMonthsClassName}>
            {props.titles ? 'Total' : formatCurrency(allMonthsTotal)}
          </div>
        </React.Fragment>
      )}
    </div>
  );
};

MonthlyTotalsRow.propTypes = {
  className: PropTypes.string,
  emphasizeTotals: PropTypes.bool,
  monthlyTotals: PropTypes.array,
  onClick: PropTypes.func,
  titleCell: PropTypes.any.isRequired,
  titles: PropTypes.bool
};

MonthlyTotalsRow.defaultProps = {
  className: '',
  emphasizeTotals: false,
  onClick: () => {},
  titles: false
};
