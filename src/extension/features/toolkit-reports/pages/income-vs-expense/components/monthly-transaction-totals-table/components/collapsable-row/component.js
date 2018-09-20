import * as React from 'react';
import * as PropTypes from 'prop-types';
import { ChildRow } from './components/child-row';
import { formatCurrency } from 'toolkit/extension/utils/currency';

export class CollapsableRow extends React.Component {
  static propTypes = {
    isCollapsed: PropTypes.bool.isRequired,
    onToggleCollapse: PropTypes.func.isRequired,
    monthlyTotals: PropTypes.array.isRequired,
    source: PropTypes.any.isRequired,
    sources: PropTypes.array.isRequired
  }

  render() {
    const monthlyTotalColumns = this._renderMonthlyTotals();

    return (
      <div className="tk-mg-b-05">
        <div className="tk-flex tk-totals-table__title-row">
          <div className="tk-totals-table__data-cell--title" onClick={this._toggleCollapse}>
            <div>{this.props.source.get('name')}</div>
          </div>
          {this.props.isCollapsed && (
            <div className="tk-flex">{monthlyTotalColumns}</div>
          )}
        </div>
        {!this.props.isCollapsed && (
          <div>
            {this._renderChildRows()}
            <div className="tk-flex tk-totals-table__title-row">
              <div className="tk-totals-table__data-cell--title">
                Total {this.props.source.get('name')}
              </div>

              <div className="tk-flex">{monthlyTotalColumns}</div>
            </div>
          </div>
        )}
      </div>
    );
  }

  _renderChildRows() {
    return this.props.sources.map((sourceData) => {
      const source = sourceData.get('source');
      const monthlyTotals = sourceData.get('monthlyTotals');

      return (
        <ChildRow key={source.get('entityId')} source={source} monthlyTotals={monthlyTotals} />
      );
    });
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

  _toggleCollapse = () => {
    this.props.onToggleCollapse(this.props.source.get('entityId'));
  }
}
