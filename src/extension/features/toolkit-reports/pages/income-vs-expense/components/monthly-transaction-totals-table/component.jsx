import * as React from 'react';
import * as PropTypes from 'prop-types';
import { CollapsibleRow } from './components/collapsable-row';
import { MonthlyTotalsRow } from 'toolkit-reports/pages/income-vs-expense/components/monthly-totals-row';
import './styles.scss';

export const TableType = {
  Expense: 'expense',
  Income: 'income',
};

export class MonthlyTransactionTotalsTable extends React.Component {
  static propTypes = {
    onCollapseSource: PropTypes.func.isRequired,
    collapsedSources: PropTypes.any.isRequired, // Set
    type: PropTypes.string.isRequired,
    data: PropTypes.any.isRequired,
  };

  get tableProperties() {
    return {
      classSuffix: this.props.type === TableType.Income ? '--income' : '--expense',
      tableName: this.props.type === TableType.Income ? 'Income' : 'Expenses',
    };
  }

  render() {
    return (
      <div className="tk-totals-table">
        {this._renderTableHeader()}
        {this._renderTableBody()}
        {this._renderTableFooter()}
      </div>
    );
  }

  _renderTableHeader() {
    const { classSuffix, tableName } = this.tableProperties;
    const className = `tk-totals-table__header-row tk-totals-table__header-row${classSuffix} tk-totals-table__title-row`;
    const monthlyTotals = this.props.data.get('monthlyTotals');

    return (
      <MonthlyTotalsRow
        className={className}
        titleCell={tableName}
        monthlyTotals={monthlyTotals}
        titles
      />
    );
  }

  _renderTableBody() {
    const { collapsedSources } = this.props;

    return this.props.data.get('sources').map((sourceData) => {
      const source = sourceData.get('source');
      const sourceId = source?.entityId ?? source.get('entityId');

      return (
        <CollapsibleRow
          key={sourceId}
          source={source}
          sources={sourceData.get('sources')}
          monthlyTotals={sourceData.get('monthlyTotals')}
          isCollapsed={collapsedSources.has(sourceId)}
          onToggleCollapse={this.props.onCollapseSource}
        />
      );
    });
  }

  _renderTableFooter() {
    const { classSuffix, tableName } = this.tableProperties;
    const className = `tk-totals-table__footer-row tk-totals-table__footer-row${classSuffix} tk-totals-table__title-row`;

    return (
      <MonthlyTotalsRow
        className={className}
        monthlyTotals={this.props.data.get('monthlyTotals')}
        titleCell={`Total ${tableName}`}
      />
    );
  }
}
