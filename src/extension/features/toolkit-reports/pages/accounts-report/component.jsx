import Highcharts from 'highcharts';
import * as React from 'react';
import * as PropTypes from 'prop-types';
import { formatCurrency } from 'toolkit/extension/utils/currency';
import { FiltersPropType } from 'toolkit-reports/common/components/report-context/component';
import { isBetween } from 'toolkit/extension/utils/date';
import { getEntityManager } from 'toolkit/extension/utils/ynab';
export class AccountsReportComponent extends React.Component {
  // Define our proptypes for usage of this class
  static propTypes = {
    filters: PropTypes.shape(FiltersPropType).isRequired,
    allReportableTransactions: PropTypes.array.isRequired,
  };

  /**
   * Construct a AccountsReport Component
   * @param {*} props The passed in props from the parent who initialized this component
   */
  constructor(props) {
    super(props);
    this.state = {}; // Set a default state
  }

  /**
   * Attach the chart to the container rendered
   */
  _renderChart() {
    // Format the series to be inserted into the Highlight Graph
    let series = [];
    let accountIds = Array.from(this.state.accountsToTransactionsMap.keys());
    for (let i = 0; i < accountIds.length; i++) {
      let accountId = accountIds[i];
      let dataPoints = this._generateDataPoints(accountId);
      let accountName = getEntityManager().getAccountById(accountId).accountName;
      let data = [];
      for (let j = 0; j < dataPoints.length; j++) {
        let dataPoint = dataPoints[j];
        console.log(dataPoint);
        data.push([dataPoint.date, dataPoint.amount]);
        console.log(`pushing ${dataPoint.date}, ${dataPoint.amount}`);
      }
      series.push({
        name: accountName,
        data: data,
      });
    }
    console.log(series);
    const chart = Highcharts.chart('tk-accounts-report-graph', {
      title: {
        text: 'Account Amount Over Time',
      },
      yAxis: {
        title: {
          text: 'Amount',
        },
        formatter: function() {
          return formatCurrency(this.value);
        },
        labels: {
          format: '${value:,.0f}',
        },
      },
      xAxis: {
        title: 'Time',
        type: 'datetime',
        dateTimeLabelFormats: {
          day: '%d %b %Y', //ex- 01 Jan 2016
        },
      },
      legend: {
        layout: 'vertical',
        align: 'right',
        verticalAlign: 'middle',
      },

      plotOptions: {
        series: {
          label: {
            connectorAllowed: false,
          },
        },
      },

      series: series,

      responsive: {
        rules: [
          {
            condition: {
              maxWidth: 500,
            },
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
    return chart;
  }

  componentDidUpdate(prevProps) {
    // Only update if the filters got updated
    if (
      this.props.filters !== prevProps.filters ||
      this.props.allReportableTransactions !== prevProps.allReportableTransactions
    ) {
      this.setState(
        {
          accountsToTransactionsMap: this._mapData(),
        },
        () => {
          this._renderChart();
        }
      );
    }
  }

  render() {
    return <div className="tk-highcharts-report-container" id="tk-accounts-report-graph" />;
  }

  /**
   * Map white-listed account ids to transactions sorted by date
   *
   * @returns Map of accountId to Sorted Transactions by date, or
   *          null if no filters or no transactions data.
   */
  _mapData() {
    const { filters, allReportableTransactions } = this.props;
    if (!filters || !allReportableTransactions) return;

    // Get the blacklisted accounted
    const accountFilterIds = filters.accountFilterIds;

    // Filter out all the transactions we don't want
    let desiredTransactions = allReportableTransactions.filter(transaction => {
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
   * Generate all the data points used for the graph
   *
   * @param {String} accountId The account ID to generate the datapoints for
   */
  _generateDataPoints(accountId) {
    let transactions = this.state.accountsToTransactionsMap.get(accountId);
    let datapoints = []; // All the datapoints associated with this account id

    let currentDate = null;
    let currentCost = 0;
    let transactionsForDay = [];
    for (let i = 0; i < transactions.length; i++) {
      let transaction = transactions[i];
      if (currentDate === null) {
        currentDate = transaction.date;
      }
      // If we're still on the same date then we update the current cost
      if (currentDate.getUTCTime() === transaction.date.getUTCTime()) {
        if (transaction.outflow) currentCost -= transaction.outflow;
        if (transaction.inflow) currentCost += transaction.inflow;
        transactionsForDay.push(transaction.entityId);
      } else {
        if (i === transactions.length - 1) {
          currentDate = transaction.date;
          if (transaction.outflow) currentCost -= transaction.outflow;
          if (transaction.inflow) currentCost += transaction.inflow;
          transactionsForDay = [transaction];
        }
        // We're on a new date so go ahead and commit
        datapoints.push({
          date: currentDate.getUTCTime(),
          amount: currentCost,
          transactions: transactionsForDay,
        });
        currentDate = transaction.date;
        if (transaction.outflow) currentCost -= transaction.outflow;
        if (transaction.inflow) currentCost += transaction.inflow;
        transactionsForDay = [];
      }
    }
    return datapoints;
  }
}
