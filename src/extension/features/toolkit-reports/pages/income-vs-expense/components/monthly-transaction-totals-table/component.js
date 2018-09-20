import * as React from 'react';
import * as PropTypes from 'prop-types';
import { CollapsableRow } from './components/collapsable-row';
import { localizedMonthAndYear } from 'toolkit/extension/utils/date';
import { formatCurrency } from 'toolkit/extension/utils/currency';
import { MonthStyle } from 'toolkit/extension/utils/toolkit';
import './styles.scss';

export class MonthlyTransactionTotalsTable extends React.Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    data: PropTypes.any.isRequired
  }

  state = {
    collapsedSources: new Set()
  }

  render() {
    return (
      <div>
        {this._renderTableHeader()}
        {this._renderTableBody()}
        {this._renderTableFooter()}
      </div>
    );
  }

  _renderTableHeader() {
    const headerColumns = this.props.data.get('monthlyTotals').map((monthData) => {
      const date = monthData.get('date');
      return (
        <div key={date.toISOString()} className="tk-totals-table__data-cell">
          {localizedMonthAndYear(date, MonthStyle.Short)}
        </div>
      );
    });

    return (
      <div className="tk-flex tk-totals-table__title-row">
        <div className="tk-totals-table__data-cell--title">{this.props.name}</div>
        {headerColumns.length && <div className="tk-flex">{headerColumns}</div>}
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
    const footerColumns = this.props.data.get('monthlyTotals').map((monthData) => {
      const date = monthData.get('date');
      const total = monthData.get('total');
      return (
        <div key={date.toISOString()} className="tk-totals-table__data-cell">
          {formatCurrency(total)}
        </div>
      );
    });

    return (
      <div className="tk-totals-table__title-row tk-flex">
        <div className="tk-totals-table__data-cell--title">Total {this.props.name}</div>
        {footerColumns.length && <div className="tk-flex">{footerColumns}</div>}
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
