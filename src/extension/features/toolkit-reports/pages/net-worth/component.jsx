import Highcharts from 'highcharts';
import * as React from 'react';
import * as PropTypes from 'prop-types';
import { formatCurrency } from 'toolkit/extension/utils/currency';
import { localizedMonthAndYear, sortByGettableDate } from 'toolkit/extension/utils/date';
import { l10n } from 'toolkit/extension/utils/toolkit';
import { FiltersPropType } from 'toolkit-reports/common/components/report-context/component';
import { Legend } from './components/legend';
import { LabeledCheckbox } from 'toolkit-reports/common/components/labeled-checkbox';
import { getToolkitStorageKey, setToolkitStorageKey } from 'toolkit/extension/utils/toolkit';

const STORAGE_KEYS = {
  inverseDebt: 'net-worth-inverse-debt',
};

export class NetWorthComponent extends React.Component {
  static propTypes = {
    filters: PropTypes.shape(FiltersPropType),
    allReportableTransactions: PropTypes.array.isRequired,
  };

  state = {
    inverseDebt: getToolkitStorageKey(STORAGE_KEYS.inverseDebt, false),
  };

  componentDidMount() {
    this._calculateData();
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.filters !== prevProps.filters ||
      this.props.allReportableTransactions !== prevProps.allReportableTransactions
    ) {
      this._calculateData();
    }
  }

  render() {
    return (
      <div className="tk-flex-grow tk-flex tk-flex-column">
        <div className="tk-flex tk-pd-05 tk-border-b">
          <div>
            <LabeledCheckbox
              id="tk-net-worth-inverse-debt-selector"
              checked={this.state.inverseDebt}
              label="Flip Debt"
              onChange={this.toggleDebtDirection}
            />
          </div>
        </div>
        <div className="tk-flex tk-flex-column tk-flex-grow">
          <div className="tk-flex tk-justify-content-end">
            {this.state.hoveredData && (
              <Legend
                label={this.state.hoveredData.label}
                assets={this.state.hoveredData.assets}
                debts={this.state.hoveredData.debts}
                debtRatio={this.state.hoveredData.debtRatio}
                netWorth={this.state.hoveredData.netWorth}
              />
            )}
          </div>
          <div className="tk-highcharts-report-container" id="tk-net-worth-chart" />
        </div>
      </div>
    );
  }

  toggleDebtDirection = () => {
    this.setState((prevState) => {
      const inverseDebt = !prevState.inverseDebt;
      setToolkitStorageKey(STORAGE_KEYS.inverseDebt, inverseDebt);
      return { inverseDebt };
    });
    this._calculateData();
  };

  _renderReport = () => {
    const _this = this;
    const { labels, debts, assets, debtRatios, netWorths } = this.state.reportData;

    const pointHover = {
      events: {
        mouseOver: function () {
          _this.setState({
            hoveredData: {
              label: labels[this.index],
              assets: assets[this.index],
              debts: debts[this.index],
              debtRatio: debtRatios[this.index],
              netWorth: netWorths[this.index],
            },
          });
        },
      },
    };

    const chart = new Highcharts.Chart({
      credits: false,
      chart: {
        backgroundColor: 'transparent',
        renderTo: 'tk-net-worth-chart',
      },
      legend: { enabled: false },
      title: { text: '' },
      tooltip: { enabled: false },
      xAxis: {
        categories: labels,
        labels: {
          style: { color: 'var(--label_primary)' },
        },
      },
      yAxis: {
        title: { text: '' },
        labels: {
          formatter: function () {
            return formatCurrency(this.value);
          },
          style: { color: 'var(--label_primary)' },
        },
      },
      plotOptions: {
        series: {
          states: {
            inactive: {
              enabled: false,
            },
          },
        },
      },
      series: [
        {
          id: 'debts',
          type: 'column',
          name: l10n('toolkit.debts', 'Debts'),
          color: 'rgba(234,106,81,1)',
          data: this.state.inverseDebt ? debts.map((item) => -item) : debts,
          pointPadding: 0,
          point: pointHover,
        },
        {
          id: 'assets',
          type: 'column',
          name: l10n('toolkit.assets', 'Assets'),
          color: 'rgba(142,208,223,1)',
          data: assets,
          pointPadding: 0,
          point: pointHover,
        },
        {
          id: 'networth',
          type: 'area',
          name: l10n('toolkit.netWorth', 'Net Worth'),
          fillColor: 'rgba(244,248,226,0.5)',
          negativeFillColor: 'rgba(247, 220, 218, 0.5)',
          data: netWorths,
          point: pointHover,
        },
      ],
    });

    this.setState({ chart });
  };

  _calculateData() {
    if (!this.props.filters) {
      return;
    }

    const accounts = new Map();
    const allReportData = { assets: [], labels: [], debts: [], netWorths: [], debtRatios: [] };
    const transactions = this.props.allReportableTransactions.slice().sort(sortByGettableDate);

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

      allReportData.assets.push(assets);
      allReportData.debts.push(debts);
      allReportData.netWorths.push(assets - debts);
      // for debtRatio: if any assets are $0, it will safely display 'Infinity'
      allReportData.debtRatios.push((debts / assets) * 100);
      allReportData.labels.push(localizedMonthAndYear(lastMonth));
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
      if (this.props.filters.accountFilterIds.has(transactionAccountId)) {
        return;
      }

      const transactionAmount = transaction.get('amount');
      if (accounts.has(transactionAccountId)) {
        accounts.set(transactionAccountId, accounts.get(transactionAccountId) + transactionAmount);
      } else {
        accounts.set(transactionAccountId, transactionAmount);
      }
    });

    if (
      lastMonth &&
      allReportData.labels[allReportData.labels.length - 1] !== localizedMonthAndYear(lastMonth)
    ) {
      pushCurrentAccountData();
    }

    // make sure we have a label for any months which have empty data
    const { fromDate, toDate } = this.props.filters.dateFilter;
    if (transactions.length) {
      let currentIndex = 0;
      const transactionMonth = transactions[0].get('date').clone().startOfMonth();
      const lastFilterMonth = toDate.clone().addMonths(1).startOfMonth();
      while (transactionMonth.isBefore(lastFilterMonth)) {
        if (!allReportData.labels.includes(localizedMonthAndYear(transactionMonth))) {
          const { assets, debts, debtRatios, netWorths, labels } = allReportData;
          labels.splice(currentIndex, 0, localizedMonthAndYear(transactionMonth));
          assets.splice(currentIndex, 0, assets[currentIndex - 1] || 0);
          debts.splice(currentIndex, 0, debts[currentIndex - 1] || 0);
          debtRatios.splice(currentIndex, 0, debtRatios[currentIndex - 1] || 0);
          netWorths.splice(currentIndex, 0, netWorths[currentIndex - 1] || 0);
        }

        currentIndex++;
        transactionMonth.addMonths(1);
      }
    }

    // Net Worth is calculated from the start of time so we need to handle "filters" here
    // rather than using `filteredTransactions` from context.
    const { labels, assets, debts, netWorths, debtRatios } = allReportData;
    let startIndex = labels.findIndex((label) => label === localizedMonthAndYear(fromDate));
    startIndex = startIndex === -1 ? 0 : startIndex;
    let endIndex = labels.findIndex((label) => label === localizedMonthAndYear(toDate));
    endIndex = endIndex === -1 ? labels.length + 1 : endIndex + 1;

    const filteredLabels = labels.slice(startIndex, endIndex);
    const filteredDebts = debts.slice(startIndex, endIndex);
    const filteredAssets = assets.slice(startIndex, endIndex);
    const filteredDebtRatios = debtRatios.slice(startIndex, endIndex);
    const filteredNetWorths = netWorths.slice(startIndex, endIndex);

    this.setState(
      {
        hoveredData: {
          label: labels[labels.length - 1] || '',
          assets: assets[assets.length - 1] || 0,
          debts: debts[debts.length - 1] || 0,
          debtRatio: debtRatios[debtRatios.length - 1] || 0,
          netWorth: netWorths[netWorths.length - 1] || 0,
        },
        reportData: {
          labels: filteredLabels,
          debts: filteredDebts,
          assets: filteredAssets,
          netWorths: filteredNetWorths,
          debtRatios: filteredDebtRatios,
        },
      },
      this._renderReport
    );
  }
}
