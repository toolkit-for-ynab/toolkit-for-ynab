import Highcharts from 'highcharts';
import * as React from 'react';
import * as PropTypes from 'prop-types';
import { formatCurrency } from 'toolkit/extension/utils/currency';
import { Collections } from 'toolkit/extension/utils/collections';
import { mapToArray } from 'toolkit/extension/utils/helpers';
import { SeriesLegend } from '../../common/components/series-legend';
import { ALL_OTHER_DATA_COLOR, PIE_CHART_COLORS } from 'toolkit-reports/common/constants/colors';
import { showTransactionModal } from 'toolkit-reports/utils/show-transaction-modal';
import './styles.scss';

const createPayeeMap = (payee) =>
  new Map([
    ['payee', payee],
    ['total', 0],
    ['transactions', []],
  ]);

export class SpendingByPayeeComponent extends React.Component {
  _subCategoriesCollection = Collections.subCategoriesCollection;

  _payeesCollection = Collections.payeesCollection;

  static propTypes = {
    filteredTransactions: PropTypes.array.isRequired,
  };

  state = {
    seriesData: null,
    spendingByPayeeData: null,
    payeeCount: 20,
  };

  componentDidMount() {
    this._calculateData();
  }

  componentDidUpdate(prevProps) {
    if (this.props.filteredTransactions !== prevProps.filteredTransactions) {
      this._calculateData();
    }
  }

  render() {
    const { seriesData, spendingByPayeeData } = this.state;

    return (
      <div className="tk-flex tk-flex-grow">
        <div className="tk-highcharts-report-container" id="tk-spending-by-payee" />
        <div className="tk-spending-by-payee__totals-legend tk-flex">
          {seriesData && spendingByPayeeData && (
            <SeriesLegend
              onDataHover={this._onLegendDataHover}
              series={seriesData}
              sourceName="Payees"
              tableName="Spending"
            />
          )}
        </div>
      </div>
    );
  }

  _calculateData() {
    const spendingByPayeeData = new Map();

    this.props.filteredTransactions.forEach((transaction) => {
      if (transaction.isOnBudgetTransfer) {
        return;
      }

      const transactionSubCategoryId = transaction.subCategoryId;
      const transactionSubCategory =
        this._subCategoriesCollection.findItemByEntityId(transactionSubCategoryId);
      if (!transactionSubCategory || transactionSubCategory.isImmediateIncomeCategory()) {
        return;
      }

      const transactionPayeeId = transaction.payeeId ?? transaction?.parentTransaction?.payeeId;
      const transactionPayee = this._payeesCollection.findItemByEntityId(transactionPayeeId);
      if (!transactionPayee) {
        return;
      }

      const transactionAmount = transaction.amount;
      const payeeReportData =
        spendingByPayeeData.get(transactionPayeeId) || createPayeeMap(transactionPayee);
      payeeReportData.set('total', payeeReportData.get('total') + transactionAmount);
      payeeReportData.set('transactions', payeeReportData.get('transactions').concat(transaction));

      spendingByPayeeData.set(transactionPayeeId, payeeReportData);
    });

    const sortedSpendingData = this._sortAndNormalizeData(spendingByPayeeData);
    this.setState(
      {
        spendingByPayeeData: sortedSpendingData,
      },
      this._renderReport
    );
  }

  _onLegendDataHover = (hoveredId) => {
    const { chart } = this.state;
    if (!chart) {
      return;
    }

    if (!chart.series[0]) {
      return;
    }

    chart.series[0].points.forEach((point) => {
      if (point.id === hoveredId) {
        point.setState('hover');
      } else {
        point.setState('');
      }
    });
  };

  _renderReport = () => {
    const { spendingByPayeeData, payeeCount } = this.state;

    let totalSpending = 0;
    const seriesData = [];
    const allOtherPayees = {
      color: ALL_OTHER_DATA_COLOR,
      id: '__all-other-payees',
      name: 'All Other Payees',
      y: 0,
    };

    spendingByPayeeData.forEach((spendingData, payeeIndex) => {
      const payee = spendingData.get('source');
      const payeeTotal = spendingData.get('total');
      const payeeId = payee?.entityId;
      const payeeName = payee?.name;

      totalSpending += payeeTotal;

      if (seriesData.length < payeeCount) {
        seriesData.push({
          color: PIE_CHART_COLORS[payeeIndex % PIE_CHART_COLORS.length],
          events: {
            click: (event) => {
              showTransactionModal(event.point.name, event.point.transactions);
            },
          },
          id: payeeId,
          name: payeeName,
          transactions: spendingData.get('transactions'),
          y: payeeTotal,
        });
      } else {
        allOtherPayees.y += payeeTotal;
      }
    });

    seriesData.push(allOtherPayees);

    const chart = new Highcharts.Chart({
      credits: false,
      chart: {
        height: '70%',
        type: 'pie',
        renderTo: 'tk-spending-by-payee',
        backgroundColor: 'transparent',
      },
      plotOptions: {
        series: {
          dataLabels: {
            formatter: function () {
              let formattedNumber = formatCurrency(this.y);
              return `${
                this.point.name
              }<br><span class="currency">${formattedNumber}</span> (${Math.round(
                this.percentage
              )}%)`;
            },
            style: {
              color: 'var(--label_primary)',
              textOutline: 'none',
            },
          },
          states: {
            inactive: {
              enabled: false,
            },
          },
        },
      },
      tooltip: {
        enabled: false,
      },
      title: {
        align: 'center',
        verticalAlign: 'middle',
        text: `Total Spending<br><span class="currency">${formatCurrency(totalSpending)}</span>`,
        style: { color: 'var(--label_primary)' },
      },
      series: [
        {
          name: 'Total Spending',
          data: seriesData,
          size: '80%',
          innerSize: '50%',
        },
      ],
    });

    this.setState({ chart, seriesData });
  };

  _sortAndNormalizeData(spendingByPayeeData) {
    const spendingByPayeeArray = mapToArray(spendingByPayeeData);

    return spendingByPayeeArray
      .sort((a, b) => {
        return a.get('total') - b.get('total');
      })
      .map((payeeData) => {
        return new Map([
          ['source', payeeData.get('payee')],
          ['total', payeeData.get('total') * -1],
          ['transactions', payeeData.get('transactions')],
        ]);
      });
  }
}
