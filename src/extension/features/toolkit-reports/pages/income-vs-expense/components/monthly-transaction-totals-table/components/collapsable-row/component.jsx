import * as React from 'react';
import * as PropTypes from 'prop-types';
import { MonthlyTotalsRow } from 'toolkit-reports/pages/income-vs-expense/components/monthly-totals-row';

export class CollapsibleRow extends React.Component {
  static propTypes = {
    isCollapsed: PropTypes.bool.isRequired,
    onToggleCollapse: PropTypes.func.isRequired,
    monthlyTotals: PropTypes.array.isRequired,
    source: PropTypes.any.isRequired,
    sources: PropTypes.array.isRequired,
  };

  render() {
    const { isCollapsed, monthlyTotals, source } = this.props;

    return (
      <div>
        <MonthlyTotalsRow
          className={`tk-totals-table__title-row ${
            isCollapsed ? 'tk-totals-table__title-row--collapsed' : ''
          }`}
          titleCell={this._renderCollapsableTitle()}
          monthlyTotals={isCollapsed ? monthlyTotals : null}
          onClick={this._toggleCollapse}
        />
        {!isCollapsed && (
          <div>
            {this._renderChildRows()}
            <MonthlyTotalsRow
              className="tk-totals-table__child-summary-row"
              titleCell={`Total ${source?.name ?? source.get('name')}`}
              monthlyTotals={monthlyTotals}
            />
          </div>
        )}
      </div>
    );
  }

  _renderCollapsableTitle() {
    const { isCollapsed, source } = this.props;

    return (
      <div className="tk-flex tk-align-items-center tk-gap-025">
        <svg className="ynab-new-icon" width="10" height="10">
          <use href={`#icon_sprite_caret_${isCollapsed ? 'up' : 'down'}`} />
        </svg>
        <div>{source?.name ?? source.get('name')}</div>
      </div>
    );
  }

  _renderChildRows() {
    return this.props.sources.map((sourceData) => {
      const source = sourceData.get('source');
      const monthlyTotals = sourceData.get('monthlyTotals');

      return (
        <MonthlyTotalsRow
          key={source?.entityId}
          className="tk-totals-table__child-row"
          titleCell={source?.name}
          monthlyTotals={monthlyTotals}
        />
      );
    });
  }

  _toggleCollapse = () => {
    this.props.onToggleCollapse(this.props.source?.entityId ?? this.props.source?.get('entityId'));
  };
}
