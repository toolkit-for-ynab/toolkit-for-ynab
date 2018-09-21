import * as React from 'react';
import * as PropTypes from 'prop-types';
import { formatCurrency } from 'toolkit/extension/utils/currency';

export const MonthlyTotalsColumns = (props) => {
  const allMonthsTotal = props.monthlyTotals.reduce((reduced, monthData) => reduced + monthData.get('total'), 0);

  return (
    <div className="tk-flex">
      {props.monthlyTotals.map((monthData) => (
        <div key={monthData.get('date').toISOString()} className="tk-totals-table__data-cell">
          {formatCurrency(monthData.get('total'))}
        </div>
      ))}
      <div key="average" className="tk-totals-table__data-cell">
        {formatCurrency(allMonthsTotal / props.monthlyTotals.length)}
      </div>
      <div key="total" className="tk-totals-table__data-cell">
        {formatCurrency(allMonthsTotal)}
      </div>
    </div>
  );
};

MonthlyTotalsColumns.propTypes = {
  monthlyTotals: PropTypes.array.isRequired
};
