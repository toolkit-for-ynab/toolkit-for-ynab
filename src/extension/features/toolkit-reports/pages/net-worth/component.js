import * as React from 'react';
import * as PropTypes from 'prop-types';
import { formatCurrency } from 'toolkit/extension/utils/currency';
import { l10n } from 'toolkit/extension/utils/toolkit';
import { localizedMonthAndYear, sortByTransactionDate } from 'toolkit/extension/utils/date';
import { Legend } from './components/legend';
import { FiltersPropType } from 'toolkit-reports/common/components/report-context/component';

export class NetWorthComponent extends React.Component {
  static propTypes = {
    filters: PropTypes.shape(FiltersPropType),
    visibleTransactions: PropTypes.array.isRequired
  };

  state = {}

  componentDidMount() {
    this._renderReport();
  }

  componentDidUpdate(prevProps) {
    if (this.props.visibleTransactions !== prevProps.visibleTransactions) {
      this._renderReport();
    }
  }

  render() {
    return (
      <div className="tk-flex tk-flex-column tk-flex-grow-1">
        {this.state.hoveredData && (
          <Legend
            assets={this.state.hoveredData.assets}
            debts={this.state.hoveredData.debts}
            netWorth={this.state.hoveredData.netWorth}
          />
        )}
        <div className="tk-flex-grow-1" id="tk-net-worth-chart" />
      </div>
    );
  }

  _renderReport() {
    const _this = this;
    const { labels, debts, assets, netWorths } = this._calculateData();

    const pointHover = {
      events: {
        mouseOver: function () {
          _this.setState({
            hoveredData: {
              assets: assets[this.index],
              debts: debts[this.index],
              netWorth: netWorths[this.index]
            }
          });
        }
      }
    };

    const chart = new Highcharts.Chart({
      credits: false,
      chart: { renderTo: 'tk-net-worth-chart' },
      legend: { enabled: false },
      title: { text: '' },
      tooltip: { enabled: false },
      xAxis: { categories: labels },
      yAxis: {
        title: { text: '' },
        labels: {
          formatter: function () {
            return formatCurrency(this.value);
          }
        }
      },
      series: [
        {
          id: 'debts',
          type: 'column',
          name: l10n('toolkit.debts', 'Debts'),
          color: 'rgba(234,106,81,1)',
          data: debts,
          pointPadding: 0,
          point: pointHover
        },
        {
          id: 'assets',
          type: 'column',
          name: l10n('toolkit.assets', 'Assets'),
          color: 'rgba(142,208,223,1)',
          data: assets,
          pointPadding: 0,
          point: pointHover
        },
        {
          id: 'networth',
          type: 'area',
          name: l10n('toolkit.netWorth', 'Net Worth'),
          fillColor: 'rgba(244,248,226,0.5)',
          negativeFillColor: 'rgba(247, 220, 218, 0.5)',
          data: netWorths,
          point: pointHover
        }
      ]
    });

    this.setState({
      chart,
      hoveredData: {
        assets: assets[assets.length - 1] || 0,
        debts: debts[debts.length - 1] || 0,
        netWorth: netWorths[netWorths.length - 1] || 0
      }
    });
  }

  _renderLegend() {}

  _calculateData() {
    const accounts = new Map();
    const reportData = { assets: [], labels: [], debts: [], netWorths: [] };
    const transactions = this.props.visibleTransactions.slice().sort(sortByTransactionDate);

    let lastMonth = null;
    function pushCurrentAccountData() {
      let assets = 0;
      let debts = 0;
      accounts.forEach((total) => {
        if (total > 0) {
          assets += total;
        } else {
          debts -= total;
        }
      });

      reportData.assets.push(assets);
      reportData.debts.push(debts);
      reportData.netWorths.push(assets - debts);
      reportData.labels.push(localizedMonthAndYear(lastMonth));
    }

    transactions.forEach((transaction) => {
      const transactionMonth = transaction.get('date').clone().startOfMonth();
      if (lastMonth === null) {
        lastMonth = transactionMonth;
      }

      // we're on a new month
      if (transactionMonth.toISOString() !== lastMonth.toISOString()) {
        pushCurrentAccountData();
        lastMonth = transactionMonth;
      }

      const transactionAccountId = transaction.get('accountId');
      const transactionAmount = transaction.get('amount');
      if (accounts.has(transactionAccountId)) {
        accounts.set(transactionAccountId, accounts.get(transactionAccountId) + transactionAmount);
      } else {
        accounts.set(transactionAccountId, transactionAmount);
      }
    });

    if (lastMonth && reportData.labels[reportData.labels.length - 1] !== localizedMonthAndYear(lastMonth)) {
      pushCurrentAccountData();
    }

    // make sure we have a label for any months which have empty data
    if (transactions.length) {
      let currentIndex = 0;
      const transactionMonth = transactions[0].get('date').clone().startOfMonth();
      const lastTransactionMonth = transactions[transactions.length - 1].get('date').clone().startOfMonth();
      while (transactionMonth.isBefore(lastTransactionMonth)) {
        if (!reportData.labels.includes(localizedMonthAndYear(transactionMonth))) {
          const { assets, debts, netWorths, labels } = reportData;
          labels.splice(currentIndex, 0, localizedMonthAndYear(transactionMonth));
          assets.splice(currentIndex, 0, assets[currentIndex - 1] || 0);
          debts.splice(currentIndex, 0, debts[currentIndex - 1] || 0);
          netWorths.splice(currentIndex, 0, netWorths[currentIndex - 1] || 0);
        }

        currentIndex++;
        transactionMonth.addMonths(1);
      }
    }

    return reportData;
  }
}
