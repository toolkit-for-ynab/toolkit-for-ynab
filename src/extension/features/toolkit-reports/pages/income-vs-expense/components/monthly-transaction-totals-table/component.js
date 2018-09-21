import * as React from 'react';
import * as PropTypes from 'prop-types';
import { CollapsableRow } from './components/collapsable-row';
import { localizedMonthAndYear } from 'toolkit/extension/utils/date';
import { MonthStyle } from 'toolkit/extension/utils/toolkit';
import { MonthlyTotalsColumns } from 'toolkit-reports/pages/income-vs-expense/components/monthly-totals-columns';
import './styles.scss';

const TableType = {
  Expense: 'expense',
  Income: 'income'
};

export class MonthlyTransactionTotalsTable extends React.Component {
  static propTypes = {
    type: PropTypes.string.isRequired,
    data: PropTypes.any.isRequired
  }

  state = {
    collapsedSources: new Set()
  }

  get tableProperties() {
    return {
      classSuffix: this.props.type === TableType.Income ? '--income' : '--expense',
      tableName: this.props.type === TableType.Income ? 'Income' : 'Expenses'
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
    const className = `tk-flex tk-totals-table__header-row tk-totals-table__header-row${classSuffix} tk-totals-table__title-row`;
    const monthlyTotals = this.props.data.get('monthlyTotals');

    return (
      <div className={className}>
        <div className="tk-totals-table__data-cell--title">{tableName}</div>
        <div className="tk-flex">
          {monthlyTotals.map((monthData) => (
            <div key={monthData.get('date').toISOString()} className="tk-totals-table__data-cell">
              {localizedMonthAndYear(monthData.get('date'), MonthStyle.Short)}
            </div>
          ))}
          <div key="average" className="tk-totals-table__data-cell">Average</div>
          <div key="total" className="tk-totals-table__data-cell">Total</div>
        </div>
      </div>
    );
  }

  _renderTableBody() {
    const { collapsedSources } = this.state;

    return this.props.data.get('sources').map((sourceData) => {
      const source = sourceData.get('source');
      const sourceId = source.get('entityId');

      return (
        <CollapsableRow
          key={sourceId}
          source={source}
          sources={sourceData.get('sources')}
          monthlyTotals={sourceData.get('monthlyTotals')}
          isCollapsed={collapsedSources.has(sourceId)}
          onToggleCollapse={this._collapseSourceRow}
        />
      );
    });
  }

  _renderTableFooter() {
    const { classSuffix, tableName } = this.tableProperties;
    const className = `tk-flex tk-totals-table__footer-row tk-totals-table__footer-row${classSuffix} tk-totals-table__title-row`;

    return (
      <div className={className}>
        <div className="tk-totals-table__data-cell--title">Total {tableName}</div>
        <MonthlyTotalsColumns monthlyTotals={this.props.data.get('monthlyTotals')} />
      </div>
    );
  }

  _collapseSourceRow = (sourceId) => {
    this.setState((prevState) => {
      const { collapsedSources } = prevState;
      if (collapsedSources.has(sourceId)) {
        collapsedSources.delete(sourceId);
      } else {
        collapsedSources.add(sourceId);
      }

      return { collapsedSources };
    });
  }
}
