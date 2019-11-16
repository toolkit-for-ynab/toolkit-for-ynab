import Highcharts from 'highcharts';
import * as React from 'react';
import * as PropTypes from 'prop-types';
import { formatCurrency } from 'toolkit/extension/utils/currency';
import { FiltersPropType } from 'toolkit-reports/common/components/report-context/component';
import { isBetween } from 'toolkit/extension/utils/date';
import { getAccountName } from 'toolkit/extension/utils/ynab';
import { showTransactionModal } from 'toolkit-reports/utils/show-transaction-modal';
import { mapAccountsToTransactions, generateDataPointsMap } from 'toolkit/extension/utils/mappings';

export class AccountsReportComponent extends React.Component {
  // Define our proptypes for usage of this class
  static propTypes = {
    filters: PropTypes.shape(FiltersPropType).isRequired,
    allReportableTransactions: PropTypes.array.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {};
  }

  /**
   * Prepare our data by mapping generating all our datapoints
   *
   */
  componentWillMount() {
    if (this.props.filters && this.props.allReportableTransactions) {
      this._calculateData(this.props.allReportableTransactions);
      this._updateCurrentDataSet();
    }
  }

  componentDidMount() {
    this._updateCurrentDataSet();
  }

  /**
   * Update the state if the filters or transactions have changed
   * @param {*} prevProps The previous props used to compare against
   */
  componentDidUpdate(prevProps) {
    // Recalculate our data if new transactions were reported
    if (this.props.allReportableTransactions !== prevProps.allReportableTransactions) {
      this._calculateData(this.props.allReportableTransactions);
      this._updateCurrentDataSet();
    } else if (this.props.filters !== prevProps.filters) {
      this._updateCurrentDataSet();
    }
  }

  /**
   * Given a transactions list, update the state by recalculating the datapoints
   * Updates the state to the reflect the new data points
   * @param {*} transactions The transactions to use
   */
  _calculateData(transactions) {
    if (!transactions || transactions.length === 0) return;

    // Sort our transactions by date
    let sortedTransactions = transactions.sort(
      (t1, t2) => t1.date.getUTCTime() - t2.date.getUTCTime()
    );

    // Map each account to all their transactions
    let accountToTransactionsMap = mapAccountsToTransactions(sortedTransactions);

    // Generate our datapoints for each account
    let accountToDataPointsMap = new Map();
    accountToTransactionsMap.forEach((transactionsForAcc, accountId) => {
      let datapoints = generateDataPointsMap(transactionsForAcc);
      accountToDataPointsMap.set(accountId, datapoints);
    });

    // Update our state to reflect the datapoints
    this.setState({
      accountToTransactionsMap,
      accountToDataPointsMap,
    });
  }

  /**
   * Render the container for the Chart
   */
  render() {
    return <div className="tk-highcharts-report-container" id="tk-accounts-report-graph" />;
  }

  /**
   * Use the current filters and data points map to update the data points
   */
  _updateCurrentDataSet() {
    const { filters } = this.props;
    const { accountToDataPointsMap } = this.state;
    if (!filters || !accountToDataPointsMap) return;

    const accountFilters = filters.accountFilterIds;
    const dateFilter = filters.dateFilter;

    // Filter out the accounts and transactions we don't want to include
    let filteredData = new Map();
    accountToDataPointsMap.forEach((datapoints, accountId) => {
      if (!accountFilters.has(accountId)) {
        let filteredDatapoints = new Map();
        datapoints.forEach((data, date) => {
          if (isBetween(date, dateFilter.fromDate, dateFilter.toDate)) {
            filteredDatapoints.set(date, data);
          }
        });
        filteredData.set(accountId, filteredDatapoints);
      }
    });

    // Using our filtered data convert them to the highseries points
    let series = [];
    filteredData.forEach((datapoints, accountId) => {
      series.push({
        name: getAccountName(accountId),
        data: this._dataPointsToHighChartSeries(datapoints),
      });
    });

    this.setState(
      {
        filteredData: filteredData,
        series: series,
      },
      this._renderChart
    );
  }

  /**
   * Generate the series to be fed into HighCharts
   * @param {Map} dataPointsMap Map of dates in UTC to data
   * @returns {Array} Array containing the HighChart Points
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
   * Use the current state to render the chart
   */
  _renderChart() {
    const { series } = this.state;
    if (!series) return;
    // Use the series to attach the data to the chart
    Highcharts.chart('tk-accounts-report-graph', {
      title: { text: 'Money over Time' },
      series: series,
      yAxis: {
        title: { text: 'Amount' },
        labels: {
          formatter: e => {
            return formatCurrency(e.value, false);
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
          let totalAmount = formatCurrency(this.y, false);
          let netChange = formatCurrency(this.netChange, false);

          let tooltip = `${coloredPoint} ${this.series.name}: <b>${totalAmount}</b><br/>`;
          let color = this.netChange < 0 ? '#ea5439' : '#16a336'; // Red or Green
          tooltip += `${coloredPoint} Net Change: <span style="color: ${color}"><b>${netChange}</b> <br/>`;
          return tooltip;
        },
      },
      plotOptions: {
        series: {
          cursor: 'pointer',
          events: {
            click: event => {
              let date = new Date(event.point.x);
              let formattedDate = ynab.YNABSharedLib.dateFormatter.formatDate(date);
              showTransactionModal(formattedDate, event.point.transactions);
            },
            legendItemClick: event => {
              event.preventDefault(); // Prevent toggling via the legend
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
