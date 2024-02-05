import * as React from 'react';
import * as PropTypes from 'prop-types';
import { MonthlyTotalsRow } from 'toolkit/extension/features/toolkit-reports/pages/income-vs-expense/components/monthly-totals-row';
import { MonthlyTotals, NormalizedIncomes, PayeeMap } from '../../../../types';

type CollapsibleRowProps = {
  isCollapsed: boolean;
  onToggleCollapse: (id: string) => void;
  monthlyTotals: MonthlyTotals[];
  source: {
    entityId?: string;
    name: string;
  };
  sources: {
    source: {
      entityId?: string;
      name: string;
    };
    monthlyTotals: MonthlyTotals[];
  }[];
};

export class CollapsibleRow extends React.Component<CollapsibleRowProps> {
  render() {
    const { isCollapsed, monthlyTotals, source } = this.props;

    return (
      <div>
        <MonthlyTotalsRow
          className={`tk-totals-table__title-row ${
            isCollapsed ? 'tk-totals-table__title-row--collapsed' : ''
          }`}
          titleCell={this._renderCollapsableTitle()}
          monthlyTotals={isCollapsed ? monthlyTotals : undefined}
          onClick={this._toggleCollapse}
        />
        {!isCollapsed && (
          <div>
            {this._renderChildRows()}
            <MonthlyTotalsRow
              className="tk-totals-table__child-summary-row"
              titleCell={`Total ${source?.name}`}
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
        <div>{source?.name}</div>
      </div>
    );
  }

  _renderChildRows() {
    return this.props.sources.map((sourceData) => {
      const source = sourceData.source;
      const monthlyTotals = sourceData.monthlyTotals;

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
    const entityId = this.props.source?.entityId;
    if (entityId) this.props.onToggleCollapse(entityId);
  };
}
