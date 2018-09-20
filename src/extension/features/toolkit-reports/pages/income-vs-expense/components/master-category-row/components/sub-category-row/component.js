import * as React from 'react';
import * as PropTypes from 'prop-types';
import { formatCurrency } from 'toolkit/extension/utils/currency';

export class SubCategoryRow extends React.Component {
  static propTypes = {
    subCategory: PropTypes.object.isRequired,
    monthlyTotals: PropTypes.array.isRequired
  }

  render() {
    const months = this.props.monthlyTotals.map((monthData) => {
      const key = `${monthData.get('date').toISOString()}`;

      return (
        <div key={key} className="tk-income-vs-expense__cell--data">
          {formatCurrency(monthData.get('total'))}
        </div>
      );
    });

    return (
      <div className="tk-flex tk-income-vs-expense__row">
        <div className="tk-pd-l-1 tk-income-vs-expense__cell--title tk-income-vs-expense__cell--title--nested">
          {this.props.subCategory.get('name')}
        </div>
        <div className="tk-flex">
          {months}
        </div>
      </div>
    );
  }
}
