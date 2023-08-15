import Highcharts from 'highcharts';
require('highcharts/modules/drilldown')(Highcharts);
import * as React from 'react';
import * as PropTypes from 'prop-types';
import { formatCurrency } from 'toolkit/extension/utils/currency';
import { Collections } from 'toolkit/extension/utils/collections';
import { mapToArray } from 'toolkit/extension/utils/helpers';
import { SeriesLegend } from '../../common/components/series-legend';
import { PIE_CHART_COLORS } from 'toolkit-reports/common/constants/colors';
import { showTransactionModal } from 'toolkit-reports/utils/show-transaction-modal';
import './styles.scss';

const createMasterCategoryMap = (masterCategory) =>
  new Map([
    ['masterCategory', masterCategory],
    ['subCategories', new Map()],
    ['total', 0],
  ]);

const createSubCategoryMap = (subCategory) =>
  new Map([
    ['subCategory', subCategory],
    ['total', 0],
    ['transactions', []],
  ]);

export class SpendingByCategoryComponent extends React.Component {
  _masterCategoriesCollection = Collections.masterCategoriesCollection;

  _subCategoriesCollection = Collections.subCategoriesCollection;

  static propTypes = {
    filteredTransactions: PropTypes.array.isRequired,
  };

  state = {
    currentDrillDownId: null,
    drillDownData: null,
    seriesData: null,
    spendingByMasterCategory: null,
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
    const { currentDrillDownId, drillDownData, seriesData, spendingByMasterCategory } = this.state;

    let legendSeries = seriesData;
    if (currentDrillDownId) {
      const drillDownSeries = drillDownData.find(({ id }) => id === currentDrillDownId);
      if (drillDownSeries && drillDownSeries.data) {
        legendSeries = drillDownSeries.data;
      }
    }

    return (
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
    );
  }

  _calculateData() {
    const spendingByMasterCategory = new Map();

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

      const transactionMasterCategoryId = transactionSubCategory.masterCategoryId;
      const transactionMasterCategory = this._masterCategoriesCollection.findItemByEntityId(
        transactionMasterCategoryId
      );
      const transactionAmount = transaction.amount;
      const masterCategoryData =
        spendingByMasterCategory.get(transactionMasterCategoryId) ||
        createMasterCategoryMap(transactionMasterCategory);
      masterCategoryData.set('total', masterCategoryData.get('total') + transactionAmount);

      const subCategories = masterCategoryData.get('subCategories');
      const subCategoryData =
        subCategories.get(transactionSubCategoryId) || createSubCategoryMap(transactionSubCategory);
      subCategoryData.set('total', subCategoryData.get('total') + transactionAmount);
      subCategoryData.set('transactions', subCategoryData.get('transactions').concat(transaction));

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
    const _this = this;
    const { spendingByMasterCategory } = this.state;

    let totalSpending = 0;
    const seriesData = [];
    const drillDownData = [];
    spendingByMasterCategory.forEach((spendingData, masterCategoryIndex) => {
      const masterCategory = spendingData.get('source');
      const masterCategoryTotal = spendingData.get('total');
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
        data: spendingData.get('sources').map((subCategoryData, subCategoryIndex) => ({
          color: PIE_CHART_COLORS[subCategoryIndex % PIE_CHART_COLORS.length],
          id: subCategoryData.get('source')?.entityId,
          name: subCategoryData.get('source')?.name,
          y: subCategoryData.get('total'),
          transactions: subCategoryData.get('transactions'),
        })),
        events: {
          click: (event) => {
            showTransactionModal(event.point.name, event.point.transactions);
          },
        },
        id: masterCategoryId,
        innerSize: '50%',
        name: masterCategoryName,
        size: '80%',
      });
    });

    const chart = new Highcharts.Chart({
      credits: false,
      chart: {
        height: '70%',
        type: 'pie',
        renderTo: 'tk-spending-by-category',
        backgroundColor: 'transparent',
        events: {
          drilldown: (event) => {
            chart.setTitle({
              text: `${event.point.name}<br><span class="currency">${formatCurrency(
                event.point.y
              )}</span>`,
            });
            _this.setState({ currentDrillDownId: event.point.id });
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
      drilldown: {
        series: drillDownData,
        activeDataLabelStyle: {
          color: 'var(--label_primary)',
        },
      },
    });

    this.setState({ chart, seriesData, drillDownData });
  };

  _sortAndNormalizeData(spendingByMasterCategory) {
    const spendingByMasterCategoryArray = mapToArray(spendingByMasterCategory);

    return spendingByMasterCategoryArray
      .sort((a, b) => {
        return a.get('total') - b.get('total');
      })
      .map((masterCategoryData) => {
        const subCategoriesArray = mapToArray(masterCategoryData.get('subCategories'));

        const normalizedSubCategories = subCategoriesArray
          .sort((a, b) => {
            return b.get('total') - a.get('total');
          })
          .map(
            (subCategoryData) =>
              new Map([
                ['source', subCategoryData.get('subCategory')],
                ['total', subCategoryData.get('total') * -1],
                ['transactions', subCategoryData.get('transactions')],
              ])
          );

        return new Map([
          ['source', masterCategoryData.get('masterCategory')],
          ['sources', normalizedSubCategories],
          ['total', masterCategoryData.get('total') * -1],
        ]);
      });
  }
}
