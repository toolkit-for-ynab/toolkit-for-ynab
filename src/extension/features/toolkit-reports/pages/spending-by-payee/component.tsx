import Highcharts from 'highcharts';
import * as React from 'react';
import * as PropTypes from 'prop-types';
import { formatCurrency } from 'toolkit/extension/utils/currency';
import { Collections } from 'toolkit/extension/utils/collections';
import { mapToArray } from 'toolkit/extension/utils/helpers';
import { SeriesLegend } from '../../common/components/series-legend';
import {
  ALL_OTHER_DATA_COLOR,
  PIE_CHART_COLORS,
} from 'toolkit/extension/features/toolkit-reports/common/constants/colors';
import { showTransactionModal } from 'toolkit/extension/features/toolkit-reports/utils/show-transaction-modal';
import { LabeledCheckbox } from 'toolkit/extension/features/toolkit-reports/common/components/labeled-checkbox';
import { AdditionalReportSettings } from 'toolkit/extension/features/toolkit-reports/common/components/additional-settings';
import './styles.scss';
import { ReportContextType } from '../../common/components/report-context';
import { YNABTransaction } from 'toolkit/types/ynab/data/transaction';
import { PointWithPayload } from '../../utils/types';
import { YNABPayee } from 'toolkit/types/ynab/data/payee';

type PayeeMap = {
  payee: YNABPayee;
  total: number;
  transactions: YNABTransaction[];
};

type NormalizedPayeeData = {
  payee: YNABPayee;
  total: number;
  transactions: YNABTransaction[];
};

type Point = PointWithPayload<{ transactions: YNABTransaction[]; id: string }>;

const createPayeeMap = (payee: YNABPayee): PayeeMap => ({
  payee: payee,
  total: 0,
  transactions: [] as YNABTransaction[],
});

type SpendingByPayeeState = {
  seriesData: Highcharts.SeriesVariablepieOptions['data'];
  spendingByPayeeData: NormalizedPayeeData[];
  payeeCount: number;
  useBarChart: boolean;
  chart?: Highcharts.Chart;
};

export class SpendingByPayeeComponent extends React.Component<
  Pick<ReportContextType, 'filteredTransactions'>,
  SpendingByPayeeState
> {
  _subCategoriesCollection = Collections.subCategoriesCollection;

  _payeesCollection = Collections.payeesCollection;

  state: SpendingByPayeeState = {
    seriesData: [],
    spendingByPayeeData: [],
    payeeCount: 20,
    useBarChart: false,
  };

  componentDidMount() {
    this._calculateData();
  }

  componentDidUpdate(prevProps: Pick<ReportContextType, 'filteredTransactions'>) {
    if (this.props.filteredTransactions !== prevProps.filteredTransactions) {
      this._calculateData();
    }
  }

  render() {
    const { seriesData, spendingByPayeeData } = this.state;

    return (
      <>
        <AdditionalReportSettings>
          <LabeledCheckbox
            id="tk-income-breakdown-hide-income-selector"
            checked={this.state.useBarChart}
            label="Bar chart"
            onChange={(e) =>
              this.setState({ useBarChart: e.currentTarget.checked }, this._renderReport)
            }
          />
        </AdditionalReportSettings>
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
      </>
    );
  }

  _calculateData() {
    const spendingByPayeeData = new Map<string, PayeeMap>();

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

      const transactionPayeeId = (transaction.payeeId ??
        transaction?.parentTransaction?.payeeId) as string;
      const transactionPayee = this._payeesCollection.findItemByEntityId(transactionPayeeId);
      if (!transactionPayee) {
        return;
      }

      const transactionAmount = transaction.amount;
      const payeeReportData =
        spendingByPayeeData.get(transactionPayeeId) || createPayeeMap(transactionPayee);
      payeeReportData.total += transactionAmount;
      payeeReportData.transactions = [...payeeReportData.transactions, transaction];

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

  _onLegendDataHover = (hoveredId: string) => {
    const { chart } = this.state;
    if (!chart) {
      return;
    }

    if (!chart.series[0]) {
      return;
    }

    (chart.series[0].points as Point[]).forEach((point) => {
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
    const seriesData: Highcharts.SeriesVariablepieOptions['data'] = [];
    const allOtherPayees = {
      color: ALL_OTHER_DATA_COLOR,
      id: '__all-other-payees',
      name: 'All Other Payees',
      y: 0,
    };

    spendingByPayeeData.forEach((spendingData, payeeIndex) => {
      const payee = spendingData.payee;
      const payeeTotal = spendingData.total;
      const payeeId = payee?.entityId;
      const payeeName = payee?.name;

      totalSpending += payeeTotal;

      if (seriesData.length < payeeCount) {
        seriesData.push({
          color: PIE_CHART_COLORS[payeeIndex % PIE_CHART_COLORS.length],
          events: {
            click: (event) => {
              const point = event.point as Point;
              showTransactionModal(point.name, point.transactions);
            },
          },
          id: payeeId,
          name: payeeName,
          // @ts-expect-error We can attach arbitrary data, but Highchart types doesn't support this
          transactions: spendingData.transactions,
          y: payeeTotal,
        });
      } else {
        allOtherPayees.y += payeeTotal;
      }
    });

    seriesData.push(allOtherPayees);

    const chart = new Highcharts.Chart({
      credits: { enabled: false },
      chart: {
        height: '70%',
        type: this.state.useBarChart ? 'column' : 'pie',
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
              color: 'var(--labelPrimary)',
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
        enabled: this.state.useBarChart,
        formatter: function () {
          let formattedNumber = formatCurrency(this.y);
          return `${this.point.name}<br><span class="currency">${formattedNumber}</span>`;
        },
      },
      title: {
        align: 'center',
        verticalAlign: this.state.useBarChart ? 'top' : 'middle',
        text: `Total Spending<br><span class="currency">${formatCurrency(totalSpending)}</span>`,
        style: { color: 'var(--labelPrimary)' },
      },
      series: [
        {
          name: 'Total Spending',
          data: seriesData,
          size: '80%',
          type: this.state.useBarChart ? 'column' : 'pie',
          innerSize: '50%',
        } as Highcharts.SeriesOptionsRegistry['SeriesPieOptions' | 'SeriesColumnOptions'],
      ],
      xAxis: {
        type: 'category',
        labels: {
          style: {
            color: 'var(--labelPrimary)',
            textOutline: 'none',
          },
        },
      },
      yAxis: {
        labels: {
          formatter: function () {
            return formatCurrency(this.value);
          },
        },
        title: {
          text: '',
        },
      },
    });

    this.setState({ chart, seriesData });
  };

  _sortAndNormalizeData(spendingByPayeeData: Map<string, PayeeMap>) {
    const spendingByPayeeArray = mapToArray(spendingByPayeeData);

    return spendingByPayeeArray
      .sort((a, b) => {
        return a.total - b.total;
      })
      .map((payeeData) => {
        return {
          payee: payeeData.payee,
          total: payeeData.total * -1,
          transactions: payeeData.transactions,
        };
      });
  }
}
