import Highcharts from 'highcharts';
require('highcharts/modules/drilldown')(Highcharts);
import * as React from 'react';
import { formatCurrency } from 'toolkit/extension/utils/currency';
import { Collections } from 'toolkit/extension/utils/collections';
import { mapToArray } from 'toolkit/extension/utils/helpers';
import { SeriesLegend } from '../../common/components/series-legend';
import { PIE_CHART_COLORS } from 'toolkit/extension/features/toolkit-reports/common/constants/colors';
import { showTransactionModal } from 'toolkit/extension/features/toolkit-reports/utils/show-transaction-modal';
import { LabeledCheckbox } from 'toolkit/extension/features/toolkit-reports/common/components/labeled-checkbox';
import { AdditionalReportSettings } from 'toolkit/extension/features/toolkit-reports/common/components/additional-settings';
import './styles.scss';
import { YNABTransaction } from 'toolkit/types/ynab/data/transaction';
import { ReportContextType } from '../../common/components/report-context';
import { PointWithPayload } from '../../utils/types';
import { YNABMasterCategory } from 'toolkit/types/ynab/data/master-category';
import { YNABSubCategory } from 'toolkit/types/ynab/data/sub-category';

type Point = PointWithPayload<{ id: string; transactions: YNABTransaction[] }>;

type MasterCategoryMap = {
  masterCategory: YNABMasterCategory;
  subCategories: Map<string, SubCategoryMap>;
  total: number;
};
type SubCategoryMap = {
  subCategory: YNABSubCategory;
  total: number;
  transactions: YNABTransaction[];
};

type NormalizedSubCategoryData = {
  source: YNABSubCategory;
  total: number;
  transactions: YNABTransaction[];
};

type NormalizedMasterCategoryData = {
  source: YNABMasterCategory;
  sources: NormalizedSubCategoryData[];
  total: number;
};

const createMasterCategoryMap = (masterCategory: YNABMasterCategory): MasterCategoryMap => ({
  masterCategory: masterCategory,
  subCategories: new Map(),
  total: 0,
});

const createSubCategoryMap = (subCategory: YNABSubCategory): SubCategoryMap => ({
  subCategory: subCategory,
  total: 0,
  transactions: [],
});

type SpendingByCategoryState = {
  currentDrillDownId: null | string;
  drillDownData:
    | null
    | Highcharts.SeriesOptionsRegistry['SeriesPieOptions' | 'SeriesColumnOptions'][];
  seriesData: Highcharts.PointOptionsObject[];
  spendingByMasterCategory: NormalizedMasterCategoryData[];
  useBarChart: boolean;
  chart?: Highcharts.Chart;
};

export class SpendingByCategoryComponent extends React.Component<
  Pick<ReportContextType, 'filteredTransactions'>,
  SpendingByCategoryState
> {
  _masterCategoriesCollection = Collections.masterCategoriesCollection;

  _subCategoriesCollection = Collections.subCategoriesCollection;

  state: SpendingByCategoryState = {
    currentDrillDownId: null,
    drillDownData: null,
    seriesData: [],
    spendingByMasterCategory: [],
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
    const { currentDrillDownId, drillDownData, seriesData, spendingByMasterCategory } = this.state;

    let legendSeries = seriesData;
    if (currentDrillDownId && drillDownData) {
      const drillDownSeries = drillDownData.find(({ id }) => id === currentDrillDownId);
      // @ts-expect-error custom payload on point
      if (drillDownSeries && drillDownSeries.data) legendSeries = drillDownSeries.data;
    }

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
          <div className="tk-highcharts-report-container" id="tk-spending-by-category" />
          <div className="tk-spending-by-category__totals-legend tk-flex">
            {legendSeries && spendingByMasterCategory && (
              <SeriesLegend
                onDataHover={this._onLegendDataHover}
                series={legendSeries}
                sourceName="Categories"
                tableName="Spending"
              />
            )}
          </div>
        </div>
      </>
    );
  }

  _calculateData() {
    const spendingByMasterCategory = new Map<string, MasterCategoryMap>();

    this.props.filteredTransactions.forEach((transaction) => {
      if (transaction.isOnBudgetTransfer) {
        return;
      }

      const transactionSubCategoryId = transaction.subCategoryId!;
      const transactionSubCategory =
        this._subCategoriesCollection.findItemByEntityId(transactionSubCategoryId);
      if (!transactionSubCategory || transactionSubCategory.isImmediateIncomeCategory()) {
        return;
      }

      const transactionMasterCategoryId = transactionSubCategory.masterCategoryId;
      const transactionMasterCategory = this._masterCategoriesCollection.findItemByEntityId(
        transactionMasterCategoryId
      );
      const transactionAmount = transaction.amount;
      const masterCategoryData =
        spendingByMasterCategory.get(transactionMasterCategoryId) ||
        createMasterCategoryMap(transactionMasterCategory);
      masterCategoryData.total += transactionAmount;

      const subCategories = masterCategoryData.subCategories;
      const subCategoryData =
        subCategories.get(transactionSubCategoryId) || createSubCategoryMap(transactionSubCategory);
      subCategoryData.total += transactionAmount;
      subCategoryData.transactions = [...subCategoryData.transactions, transaction];

      subCategories.set(transactionSubCategoryId, subCategoryData);
      spendingByMasterCategory.set(transactionMasterCategoryId, masterCategoryData);
    });

    const sortedSpendingData = this._sortAndNormalizeData(spendingByMasterCategory);
    this.setState(
      {
        spendingByMasterCategory: sortedSpendingData,
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
    const _this = this;
    const { spendingByMasterCategory } = this.state;

    let totalSpending = 0;
    const seriesData: SpendingByCategoryState['seriesData'] = [];
    const drillDownData: SpendingByCategoryState['drillDownData'] = [];
    spendingByMasterCategory.forEach((spendingData, masterCategoryIndex) => {
      const masterCategory = spendingData.source;
      const masterCategoryTotal = spendingData.total;
      const masterCategoryId = masterCategory?.entityId;
      const masterCategoryName = masterCategory?.name;

      totalSpending += masterCategoryTotal;

      seriesData.push({
        color: PIE_CHART_COLORS[masterCategoryIndex % PIE_CHART_COLORS.length],
        drilldown: masterCategoryId,
        id: masterCategoryId,
        name: masterCategoryName,
        y: masterCategoryTotal,
      });

      drillDownData.push({
        data: spendingData.sources.map((subCategoryData, subCategoryIndex) => ({
          color: PIE_CHART_COLORS[subCategoryIndex % PIE_CHART_COLORS.length],
          id: subCategoryData.source?.entityId,
          name: subCategoryData.source?.name,
          y: subCategoryData.total,
          transactions: subCategoryData.transactions,
        })),
        events: {
          click: (event) => {
            const point = event.point as Point;
            showTransactionModal(point.name, point.transactions);
          },
        },
        id: masterCategoryId,
        innerSize: '50%',
        name: masterCategoryName,
        size: '80%',
        type: this.state.useBarChart ? 'column' : 'pie',
      });
    });

    const chart = new Highcharts.Chart({
      credits: { enabled: false },
      chart: {
        height: '70%',
        type: this.state.useBarChart ? 'column' : 'pie',
        renderTo: 'tk-spending-by-category',
        backgroundColor: 'transparent',
        events: {
          drilldown: (event) => {
            const point = event.point as Point;
            chart.setTitle({
              text: `${point.name}<br><span class="currency">${formatCurrency(point.y)}</span>`,
            });
            _this.setState({ currentDrillDownId: point.id });
          },
          drillup: () => {
            chart.setTitle({
              text: `Total Spending<br><span class="currency">${formatCurrency(
                totalSpending
              )}</span>`,
            });
            _this.setState({ currentDrillDownId: null });
          },
        },
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
          innerSize: '50%',
          type: this.state.useBarChart ? 'column' : 'pie',
        },
      ],
      drilldown: {
        series: drillDownData,
        activeDataLabelStyle: {
          color: 'var(--labelPrimary)',
        },
      },
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

    this.setState({ chart, seriesData, drillDownData });
  };

  _sortAndNormalizeData(spendingByMasterCategory: Map<string, MasterCategoryMap>) {
    const spendingByMasterCategoryArray = mapToArray(spendingByMasterCategory);

    return spendingByMasterCategoryArray
      .sort((a, b) => {
        return a.total - b.total;
      })
      .map((masterCategoryData): NormalizedMasterCategoryData => {
        const subCategoriesArray = mapToArray(masterCategoryData.subCategories);

        const normalizedSubCategories = subCategoriesArray
          .sort((a, b) => {
            return b.total - a.total;
          })
          .map(
            (subCategoryData): NormalizedSubCategoryData => ({
              source: subCategoryData.subCategory,
              total: subCategoryData.total * -1,
              transactions: subCategoryData.transactions,
            })
          );

        return {
          source: masterCategoryData.masterCategory,
          sources: normalizedSubCategories,
          total: masterCategoryData.total * -1,
        };
      });
  }
}
