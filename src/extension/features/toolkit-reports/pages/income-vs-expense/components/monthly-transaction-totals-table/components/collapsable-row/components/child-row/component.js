import * as React from 'react';
import * as PropTypes from 'prop-types';
import { MonthlyTotalsColumns } from 'toolkit-reports/pages/income-vs-expense/components/monthly-totals-columns';

export const ChildRow = (props) => (
  <div className="tk-totals-table__child-row tk-flex">
    <div className="tk-totals-table__data-cell--title tk-pd-l-1">{props.source.get('name')}</div>
    <MonthlyTotalsColumns monthlyTotals={props.monthlyTotals} />
  </div>
);

ChildRow.propTypes = {
  monthlyTotals: PropTypes.array.isRequired,
  source: PropTypes.any.isRequired
};
