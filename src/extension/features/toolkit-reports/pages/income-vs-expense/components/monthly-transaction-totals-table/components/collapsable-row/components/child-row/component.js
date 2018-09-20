import * as React from 'react';
import * as PropTypes from 'prop-types';
import { formatCurrency } from 'toolkit/extension/utils/currency';

export class ChildRow extends React.Component {
  static propTypes = {
    monthlyTotals: PropTypes.array.isRequired,
    source: PropTypes.any.isRequired
  }

  render() {
    return (
      <div className="tk-totals-table__child-row tk-flex">
        <div className="tk-totals-table__data-cell--title">
          {this.props.source.get('name')}
        </div>
        <div className="tk-flex">
          {this._renderMonthlyTotals()}
        </div>
      </div>
    );
  }

  _renderMonthlyTotals() {
    return this.props.monthlyTotals.map((monthData) => {
      const key = `${monthData.get('date').toISOString()}`;

      return (
        <div key={key} className="tk-totals-table__data-cell">
          {formatCurrency(monthData.get('total'))}
        </div>
      );
    });
  }
}
