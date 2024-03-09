import * as React from 'react';
import * as PropTypes from 'prop-types';
import { CollapsibleRow } from './components/collapsable-row';
import { MonthlyTotalsRow } from 'toolkit/extension/features/toolkit-reports/pages/income-vs-expense/components/monthly-totals-row';
import './styles.scss';
import { NormalizedExpenses, NormalizedIncomes } from '../../types';

export enum TableType {
  Expense = 'expense',
  Income = 'income',
}

type MonthlyTransactionTotalsTableProps = {
  onCollapseSource: (id: string) => void;
  collapsedSources: Set<string>;
  type: typeof TableType[keyof typeof TableType];
  data: NormalizedExpenses | NormalizedIncomes;
};

export class MonthlyTransactionTotalsTable extends React.Component<MonthlyTransactionTotalsTableProps> {
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
    const monthlyTotals = this.props.data.monthlyTotals;

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

    return this.props.data.sources.map((sourceData) => {
      const source = sourceData.source;
      const sourceId = source?.entityId;

      return (
        <CollapsibleRow
          key={sourceId}
          source={source}
          sources={sourceData.sources}
          monthlyTotals={sourceData.monthlyTotals}
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
        monthlyTotals={this.props.data.monthlyTotals}
        titleCell={`Total ${tableName}`}
      />
    );
  }
}
