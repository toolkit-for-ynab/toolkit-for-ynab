import Highcharts from 'highcharts';
import * as React from 'react';
import * as PropTypes from 'prop-types';
import { formatCurrency } from 'toolkit/extension/utils/currency';
import { FiltersPropType } from 'toolkit-reports/common/components/report-context/component';
import { isBetween } from 'toolkit/extension/utils/date';
import { getEntityManager } from 'toolkit/extension/utils/ynab';
import { showTransactionModal } from 'toolkit-reports/utils/show-transaction-modal';

export class AccountsReportComponent extends React.Component {
  // Define our proptypes for usage of this class
  static propTypes = {
    filters: PropTypes.shape(FiltersPropType).isRequired,
    allReportableTransactions: PropTypes.array.isRequired,
  };

  /**
   * Prepare our data before we render
   */
  componentWillMount() {
    if (this.props.filters && this.props.allReportableTransactions) {
      this._invalidateState();
    }
  }

  /**
   * Attempt to render the chart on update
   */
  compontDidMount() {
    this._renderChart();
  }

  /**
   * Update the state if the filters or transactions have changed
   * @param {*} prevProps The previous props used to compare against
   */
  componentDidUpdate(prevProps) {
    // Only update if the filters got updated
    if (
      this.props.filters !== prevProps.filters ||
      this.props.allReportableTransactions !== prevProps.allReportableTransactions
    ) {
      this._invalidateState();
    }
  }

  /**
   * Update the current state and render the chart
   */
  _invalidateState() {
    const { filters, allReportableTransactions } = this.props;
    let accountToTransactionsMap = this._mapAccountsToTransactions(
      filters,
      allReportableTransactions
    );
    let accountToDataPointsMap = new Map();
    let accountIds = Array.from(accountToTransactionsMap.keys());

    for (let i = 0; i < accountIds.length; i++) {
      let accountId = accountIds[i];
      let transactions = accountToTransactionsMap.get(accountId);
      accountToDataPointsMap.set(accountId, this._generateDataPointsMap(transactions));
    }
    this.setState(
      {
        accountToTransactionsMap: accountToTransactionsMap,
        accountToDataPointsMap: accountToDataPointsMap,
      },
      () => {
        this._renderChart();
      }
    );
  }

  /**
   * On render, if we are still loading, render the spinner, else render the chart
   */
  render() {
    return <div className="tk-highcharts-report-container" id="tk-accounts-report-graph" />;
  }

  /**
   * Generate a Map with keys containing accountIds and value transactions associated with the accountId
   *
   * @param {*} filters The filters to use (Passed in from props)
   * @param {*} transactions The list of transactions to apply the filter to (Passed in from props)
   */
  _mapAccountsToTransactions(filters, transactions) {
    if (!filters || !transactions) return;

    // Get the blacklisted accounted
    const accountFilterIds = filters.accountFilterIds;

    // Filter out all the transactions we don't want
    let desiredTransactions = transactions.filter(transaction => {
      return (
        isBetween(transaction.date, filters.dateFilter.fromDate, filters.dateFilter.toDate) &&
        !accountFilterIds.has(transaction.accountId)
      );
    });

    // Sort the transactions by date
    desiredTransactions.sort((t1, t2) => t1.date.getUTCTime() - t2.date.getUTCTime());

    // Map each transaction to their respective account id. AccountID => [t1, t2, ... , tn]
    let accountsToTransactionsMap = new Map();
    for (let i = 0; i < desiredTransactions.length; i++) {
      let transaction = desiredTransactions[i];
      let accountId = transaction.accountId;
      if (!accountsToTransactionsMap.has(accountId)) {
        accountsToTransactionsMap.set(accountId, []);
      }
      accountsToTransactionsMap.get(accountId).push(transaction);
    }
    return accountsToTransactionsMap;
  }

  /**
   * Given a transactions list, we generate a map of data points of
   * Key (Date in UTC Time) to Value (object containing, transactions and amount total for that date)
   *
   * @param {Array} transactionsList The list of transactions to convert to data points
   * @returns Map of date to transactions and amount
   */
  _generateDataPointsMap(transactionsList) {
    let datapoints = new Map();

    // Keep track of the running total for the graph, the transactions for each date, along with the amount spend that date
    let runningTotal = 0;
    for (let i = 0; i < transactionsList.length; i++) {
      let transaction = transactionsList[i];
      let date = transaction.date.getUTCTime();
      runningTotal = runningTotal - transaction.outflow + transaction.inflow;

      // Add the date with empty values if it's a new date
      if (!datapoints.has(date)) {
        datapoints.set(date, {
          runningTotal: 0,
          netChange: 0,
          transactions: [],
        });
      }

      // Update the values of the date with the new values
      let newValues = datapoints.get(date);
      newValues.netChange = newValues.netChange + transaction.inflow - transaction.outflow;
      newValues.transactions.push(transaction);
      newValues.runningTotal = runningTotal;
      datapoints.set(date, newValues);
    }
    return datapoints;
  }

  /**
   * Generate the series to be fed into HighCharts
   * @param {*} dataPointsMap Map containing keys UTC Time and values {amount, transactions, currentTotal}
   * @returns {*} object containing the HighChart Points
   */
  _dataPointsToHighChartSeries(dataPointsMap) {
    let resultData = [];
    dataPointsMap.forEach((values, date) => {
      resultData.push({
        x: date,
        y: values.runningTotal,
        netChange: values.netChange,
        transactions: values.transactions,
      });
    });
    return resultData;
  }

  /**
   * Get the corresponding account name given a accountId
   *
   * @param {} accountId The accountId used to search for name
   * @returns String, the corresponding account name, null if not found
   */
  _getAccountName(accountId) {
    return getEntityManager().getAccountById(accountId).accountName;
  }

  /**
   * Use the current state to render the chart
   */
  _renderChart() {
    if (
      !this.state.accountToDataPointsMap ||
      !this.state.accountToTransactionsMap ||
      !this.state.accountToTransactionsMap.size === 0 ||
      !this.state.accountToDataPointsMap.size === 0
    ) {
      return;
    }
    // Generate our series
    const { accountToDataPointsMap } = this.state;
    let series = [];
    accountToDataPointsMap.forEach((datapoints, accountId) => {
      series.push({
        name: this._getAccountName(accountId),
        data: this._dataPointsToHighChartSeries(datapoints),
      });
    });

    // Use the series to attach the data to the chart
    Highcharts.chart('tk-accounts-report-graph', {
      title: { text: 'Money over Time' },
      series: series,
      yAxis: {
        title: { text: 'Amount' },
        labels: {
          formatter: e => {
            return formatCurrency(e.value);
          },
        },
      },
      xAxis: {
        title: 'Time',
        type: 'datetime',
        dateTimeLabelFormats: { day: '%d %b %Y' },
      },
      legend: {
        layout: 'vertical',
        align: 'right',
        verticalAlign: 'middle',
      },
      tooltip: {
        useHTML: true,
        pointFormatter: function() {
          let coloredPoint = `<span style="color:${this.color}">\u25CF</span>`;
          let tooltip = `${coloredPoint} ${this.series.name}: <b>${formatCurrency(
            this.y
          )}</b><br/>`;
          // Format the color for the net change
          let color = this.netChange < 0 ? '#ea5439' : '#16a336';
          tooltip += `${coloredPoint} Net Change: <span style="color: ${color}"><b>${formatCurrency(
            this.netChange
          )}</b> <br/>`;
          return tooltip;
        },
      },
      plotOptions: {
        series: {
          cursor: 'pointer',
          events: {
            click: event => {
              showTransactionModal(event.point.x, event.point.transactions);
            },
            legendItemClick: event => {
              event.preventDefault(); // Prevent toggling via the le
            },
          },
        },
      },
      responsive: {
        rules: [
          {
            condition: { maxWidth: 500 },
            chartOptions: {
              legend: {
                layout: 'horizontal',
                align: 'center',
                verticalAlign: 'bottom',
              },
            },
          },
        ],
      },
    });
  }
}
