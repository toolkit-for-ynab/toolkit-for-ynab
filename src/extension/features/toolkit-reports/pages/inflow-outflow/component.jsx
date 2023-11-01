import Highcharts from 'highcharts';
import * as React from 'react';
import * as PropTypes from 'prop-types';
import { formatCurrency } from 'toolkit/extension/utils/currency';
import { localizedMonthAndYear, sortByDate } from 'toolkit/extension/utils/date';
import { l10n } from 'toolkit/extension/utils/toolkit';
import { FiltersPropType } from 'toolkit-reports/common/components/report-context/component';
import { Legend } from './components/legend';

export class InflowOutflowComponent extends React.Component {
  static propTypes = {
    filters: PropTypes.shape(FiltersPropType),
    filteredTransactions: PropTypes.array.isRequired,
  };

  state = {};

  componentDidMount() {
    this._calculateData();
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.filters !== prevProps.filters ||
      this.props.filteredTransactions !== prevProps.filteredTransactions
    ) {
      this._calculateData();
    }
  }

  render() {
    return (
      <div className="tk-flex tk-flex-column tk-flex-grow">
        <div className="tk-flex tk-justify-content-end">
          {this.state.hoveredData && (
            <Legend
              label={this.state.hoveredData.label}
              inflows={this.state.hoveredData.inflows}
              outflows={this.state.hoveredData.outflows}
              diffs={this.state.hoveredData.diffs}
              savings={this.state.hoveredData.savings}
            />
          )}
        </div>
        <div className="tk-highcharts-report-container" id="tk-net-worth-chart" />
      </div>
    );
  }

  _renderReport = () => {
    const _this = this;
    const { inflows, outflows, diffs, savings, labels } = this.state.reportData;

    const pointHover = {
      events: {
        mouseOver: function () {
          _this.setState({
            hoveredData: {
              label: labels[this.index],
              inflows: inflows[this.index],
              outflows: outflows[this.index],
              diffs: diffs[this.index],
              savings: savings[this.index],
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
        column: {
          grouping: false,
        },
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
          id: 'inflows',
          type: 'column',
          name: l10n('toolkit.inflows', 'Inflows'),
          color: 'rgba(142,208,223,1)',
          data: inflows,
          pointPadding: 0,
          point: pointHover,
        },
        {
          id: 'outflows',
          type: 'column',
          name: l10n('toolkit.outflows', 'Outflows'),
          color: 'rgba(234,106,81,1)',
          data: outflows,
          pointPadding: 0,
          point: pointHover,
        },
        {
          id: 'diffs',
          type: 'area',
          name: l10n('toolkit.diff', 'Difference'),
          fillColor: 'rgba(244,248,226,0.5)',
          negativeFillColor: 'rgba(247, 220, 218, 0.5)',
          data: diffs,
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

    let accountInflows = new Map();
    let accountOutflows = new Map();
    const allReportData = { inflows: [], outflows: [], labels: [] };
    const transactions = this.props.filteredTransactions.slice().sort(sortByDate);

    let lastMonth = null;
    function pushCurrentAccountData() {
      let inflows = 0;
      let outflows = 0;
      accountInflows.forEach((total) => {
        inflows += total;
      });
      accountOutflows.forEach((total) => {
        outflows += total;
      });

      allReportData.inflows.push(inflows);
      allReportData.outflows.push(outflows);
      allReportData.labels.push(localizedMonthAndYear(lastMonth));

      accountInflows = new Map();
      accountOutflows = new Map();
    }

    transactions.forEach((transaction) => {
      const transactionMonth = transaction.date.clone().startOfMonth();
      if (lastMonth === null) {
        lastMonth = transactionMonth;
      }

      // we're on a new month
      if (transactionMonth.toISOString() !== lastMonth.toISOString()) {
        pushCurrentAccountData();
        lastMonth = transactionMonth;
      }

      const transactionAccountId = transaction.accountId;

      if (transaction.isOnBudgetTransfer) {
        return;
      }

      const transactionAmount = transaction.amount;
      let prevInflow = accountInflows.has(transactionAccountId)
        ? accountInflows.get(transactionAccountId)
        : 0;
      let prevOutflow = accountOutflows.has(transactionAccountId)
        ? accountOutflows.get(transactionAccountId)
        : 0;
      if (transactionAmount > 0) {
        accountInflows.set(transactionAccountId, prevInflow + transactionAmount);
      } else {
        accountOutflows.set(transactionAccountId, prevOutflow + transactionAmount);
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
      const transactionMonth = transactions[0].date.clone().startOfMonth();
      const lastFilterMonth = toDate.clone().addMonths(1).startOfMonth();
      while (transactionMonth.isBefore(lastFilterMonth)) {
        if (!allReportData.labels.includes(localizedMonthAndYear(transactionMonth))) {
          const { inflows, outflows, labels } = allReportData;
          labels.splice(currentIndex, 0, localizedMonthAndYear(transactionMonth));
          inflows.splice(currentIndex, 0, inflows[currentIndex - 1] || 0);
          outflows.splice(currentIndex, 0, outflows[currentIndex - 1] || 0);
        }

        currentIndex++;
        transactionMonth.addMonths(1);
      }
    }

    // Net Worth is calculated from the start of time so we need to handle "filters" here
    // rather than using `filteredTransactions` from context.
    const { labels, inflows, outflows } = allReportData;
    let startIndex = labels.findIndex((label) => label === localizedMonthAndYear(fromDate));
    startIndex = startIndex === -1 ? 0 : startIndex;
    let endIndex = labels.findIndex((label) => label === localizedMonthAndYear(toDate));
    endIndex = endIndex === -1 ? labels.length + 1 : endIndex + 1;

    const filteredLabels = labels.slice(startIndex, endIndex);
    const filteredOutflows = outflows.slice(startIndex, endIndex);
    const filteredInflows = inflows.slice(startIndex, endIndex);
    const filteredDiffs = filteredOutflows.map((outflow, idx) => filteredInflows[idx] + outflow);
    const filteredSavings = filteredOutflows.map((outflow, idx) => {
      const inflow = filteredInflows[idx];
      if (inflow >= Math.abs(outflow)) {
        return 1 - Math.abs(outflow) / inflow;
      }

      return 0;
    });

    this.setState(
      {
        hoveredData: {
          label: labels[inflows.length - 1] || '',
          inflows: filteredInflows[inflows.length - 1] || 0,
          outflows: filteredOutflows[outflows.length - 1] || 0,
          diffs: filteredDiffs[outflows.length - 1] || 0,
          savings: filteredSavings[outflows.length - 1] || 0,
        },
        reportData: {
          labels: filteredLabels,
          outflows: filteredOutflows,
          inflows: filteredInflows,
          diffs: filteredDiffs,
          savings: filteredSavings,
        },
      },
      this._renderReport
    );
  }
}
