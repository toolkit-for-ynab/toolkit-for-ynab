import * as React from 'react';
import * as PropTypes from 'prop-types';
import { ChildRow } from './components/child-row';
import { MonthlyTotalsColumns } from 'toolkit-reports/pages/income-vs-expense/components/monthly-totals-columns';

export class CollapsableRow extends React.Component {
  static propTypes = {
    isCollapsed: PropTypes.bool.isRequired,
    onToggleCollapse: PropTypes.func.isRequired,
    monthlyTotals: PropTypes.array.isRequired,
    source: PropTypes.any.isRequired,
    sources: PropTypes.array.isRequired
  }

  render() {
    const monthlyTotalColumns = <MonthlyTotalsColumns monthlyTotals={this.props.monthlyTotals} />;

    return (
      <div>
        <div className="tk-flex tk-totals-table__title-row">
          <div className="tk-totals-table__data-cell--title" onClick={this._toggleCollapse}>
            <div>{this.props.source.get('name')}</div>
          </div>
          {this.props.isCollapsed && monthlyTotalColumns}
        </div>
        {!this.props.isCollapsed && (
          <div>
            {this._renderChildRows()}
            <div className="tk-flex tk-totals-table__title-row">
              <div className="tk-totals-table__data-cell--title tk-pd-l-1">Total {this.props.source.get('name')}</div>
              {monthlyTotalColumns}
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

  _toggleCollapse = () => {
    this.props.onToggleCollapse(this.props.source.get('entityId'));
  }
}
