import Highcharts from 'highcharts';
require('highcharts/modules/sankey')(Highcharts);
import * as React from 'react';
import * as PropTypes from 'prop-types';
import { Collections } from 'toolkit/extension/utils/collections';
import { formatCurrency } from 'toolkit/extension/utils/currency';
import { LabeledCheckbox } from 'toolkit/extension/features/toolkit-reports/common/components/labeled-checkbox';
import { AdditionalReportSettings } from 'toolkit/extension/features/toolkit-reports/common/components/additional-settings';
import './styles.scss';
import { ReportContextType } from '../../common/components/report-context';
import { ChangeEventHandler } from 'react';
import { YNABTransaction } from 'toolkit/types/ynab/data/transaction';
import { PointWithPayload } from '../../utils/types';
import { YNABPayee } from 'toolkit/types/ynab/data/payee';
import { YNABMasterCategory } from 'toolkit/types/ynab/data/master-category';
import { YNABSubCategory } from 'toolkit/types/ynab/data/sub-category';

type IncomeBreakdownProps = Pick<ReportContextType, 'filteredTransactions' | 'filters'>;

type IncomeBreakdownState = {
  incomes: Map<YNABPayee, number>;
  expenses: Map<YNABMasterCategory, Map<YNABSubCategory, number>>;
  showIncome: boolean;
  showExpense: boolean;
  showSubCategories: boolean;
  showLossGain: boolean;
  groupPositiveCategories: boolean;
};

type Point = PointWithPayload<{
  id: string;
  isNode: boolean;
  linksTo: Point[];
  linksFrom: Point[];
  weight: number;
  toNode: Point;
  fromNode: Point;
  name: string;
  sum: number;
}>;

export class IncomeBreakdownComponent extends React.Component<
  IncomeBreakdownProps,
  IncomeBreakdownState
> {
  _payeesCollection = Collections.payeesCollection;

  _subCategoriesCollection = Collections.subCategoriesCollection;

  _masterCategoriesCollection = Collections.masterCategoriesCollection;

  constructor(props: IncomeBreakdownProps) {
    super(props);

    this.state = {
      incomes: new Map(),
      expenses: new Map(),
      showIncome: true,
      showExpense: true,
      showSubCategories: true,
      showLossGain: true,
      groupPositiveCategories: false,
    };
  }

  componentDidUpdate(prevProps: IncomeBreakdownProps) {
    if (this.props.filteredTransactions !== prevProps.filteredTransactions) {
      this._calculateData();
    }
  }

  componentDidMount() {
    this._calculateData();
  }

  render() {
    const { showIncome, showExpense, showSubCategories, showLossGain, groupPositiveCategories } =
      this.state;
    return (
      <div className="tk-flex-grow tk-flex tk-flex-column">
        <AdditionalReportSettings>
          <div className="tk-income-breakdown__filter">
            <LabeledCheckbox
              id="tk-income-breakdown-hide-income-selector"
              checked={showIncome}
              label="Show Income"
              onChange={this.toggleIncome}
            />
          </div>
          <div className="tk-income-breakdown__filter">
            <LabeledCheckbox
              id="tk-income-breakdown-hide-expense-selector"
              checked={showExpense}
              label="Show Expense"
              onChange={this.toggleExpense}
            />
          </div>
          <div className="tk-income-breakdown__filter">
            <LabeledCheckbox
              id="tk-income-breakdown-hide-sub-category-selector"
              checked={showSubCategories}
              disabled={!showExpense}
              label="Show Subcategories"
              onChange={this.toggleSubCategories}
            />
          </div>
          <div className="tk-income-breakdown__filter">
            <LabeledCheckbox
              id="tk-income-breakdown-loss-gain-selector"
              checked={showLossGain}
              label="Show Net Loss/Gain"
              onChange={this.toggleLossGainEntry}
            />
          </div>
          <div className="tk-income-breakdown__filter">
            <LabeledCheckbox
              id="tk-income-breakdown-positive-categories-selector"
              checked={groupPositiveCategories}
              label="Group positive categories"
              onChange={this.togglePositiveCategories}
            />
          </div>
        </AdditionalReportSettings>
        <div className="tk-flex tk-flex-grow">
          <div className="tk-highcharts-report-container" id="tk-income-breakdown" />
        </div>
      </div>
    );
  }

  toggleLossGainEntry: ChangeEventHandler<HTMLInputElement> = ({ currentTarget }) => {
    const { checked } = currentTarget;
    this.setState({ showLossGain: checked });
    this._calculateData();
  };

  togglePositiveCategories: ChangeEventHandler<HTMLInputElement> = ({ currentTarget }) => {
    const { checked } = currentTarget;
    this.setState({ groupPositiveCategories: checked });
    this._calculateData();
  };

  toggleIncome: ChangeEventHandler<HTMLInputElement> = ({ currentTarget }) => {
    const { checked } = currentTarget;
    this.setState({ showIncome: checked });
    this._calculateData();
  };

  toggleExpense: ChangeEventHandler<HTMLInputElement> = ({ currentTarget }) => {
    const { checked } = currentTarget;
    this.setState({ showExpense: checked });
    this._calculateData();
  };

  toggleSubCategories: ChangeEventHandler<HTMLInputElement> = ({ currentTarget }) => {
    const { checked } = currentTarget;
    this.setState({ showSubCategories: checked });
    this._calculateData();
  };

  _calculateData() {
    if (!this.props.filters) {
      return;
    }

    const incomes: IncomeBreakdownState['incomes'] = new Map();
    const expenses: IncomeBreakdownState['expenses'] = new Map();

    this.props.filteredTransactions.forEach((transaction) => {
      const transactionSubCategoryId = transaction.subCategoryId;
      if (!transactionSubCategoryId) {
        return;
      }

      const transactionSubCategory =
        this._subCategoriesCollection.findItemByEntityId(transactionSubCategoryId);
      if (!transactionSubCategory) {
        return;
      }

      if (transactionSubCategory.isImmediateIncomeCategory()) {
        const transactionPayeeId = transaction.payeeId || transaction.parentTransaction?.payeeId;
        if (!transactionPayeeId) {
          return;
        }

        const transactionPayee = this._payeesCollection.findItemByEntityId(transactionPayeeId);
        if (!transactionPayee) {
          return;
        }
        this._assignIncomeTransaction(incomes, transaction, transactionPayee);
      } else {
        this._assignExpenseTransaction(expenses, transaction, transactionSubCategory);
      }
    });
    this.setState(
      {
        incomes: incomes,
        expenses: expenses,
      },
      this._renderReport
    );
  }

  _assignExpenseTransaction(
    expenses: IncomeBreakdownState['expenses'],
    transaction: YNABTransaction,
    transactionSubCategory: YNABSubCategory
  ) {
    const transactionMasterCategory = this._masterCategoriesCollection.findItemByEntityId(
      transactionSubCategory.masterCategoryId
    );

    let amount = transaction.amount;
    let subCategoryMap;
    if (expenses.has(transactionMasterCategory)) {
      subCategoryMap = expenses.get(transactionMasterCategory);
    } else {
      subCategoryMap = new Map();
      expenses.set(transactionMasterCategory, subCategoryMap);
    }
    subCategoryMap?.set(
      transactionSubCategory,
      (subCategoryMap.get(transactionSubCategory) || 0) + amount
    );
  }

  _assignIncomeTransaction(
    incomes: IncomeBreakdownState['incomes'],
    transaction: YNABTransaction,
    transactionPayee: YNABPayee
  ) {
    let amount = transaction.amount;
    if (incomes.has(transactionPayee)) {
      amount += incomes.get(transactionPayee)!;
    }
    incomes.set(transactionPayee, amount);
  }

  _getSeriesData() {
    type Entry = { from?: string; to?: string; weight: number; outgoing?: boolean };

    const {
      incomes,
      expenses,
      showLossGain,
      showExpense,
      showSubCategories,
      showIncome,
      groupPositiveCategories,
    } = this.state;
    let seriesData: Entry[] = [];
    let totalIncome = 0;
    let totalExpense = 0;
    incomes.forEach((amount, payee) => {
      if (amount <= 0) {
        return;
      }
      if (showIncome) {
        seriesData.push({
          from: payee?.entityId,
          to: 'Budget',
          weight: amount,
        });
      }
      totalIncome += amount;
    });

    let positiveCategoriesAmount = 0;
    let positiveCategoriesSeries: Entry[] = [];
    let categorySeries: { masterEntry: Entry; subEntries: Entry[] }[] = [];
    expenses.forEach((subCategoryMap, masterCategory) => {
      let subCategorySeries: Entry[] = [];
      let masterCategoryTotal = 0;
      subCategoryMap.forEach((amount, subCatogory) => {
        if (amount > 0) {
          positiveCategoriesSeries.push({
            from: subCatogory?.entityId,
            to: 'Budget',
            weight: amount,
          });
          positiveCategoriesAmount += amount;
          totalIncome += amount;
          return;
        }
        const absAmount = Math.abs(amount);
        if (absAmount <= 0) {
          return;
        }
        subCategorySeries.push({
          from: masterCategory?.entityId,
          to: subCatogory?.entityId,
          weight: absAmount,
          outgoing: true,
        });
        masterCategoryTotal += absAmount;
        totalExpense += absAmount;
      });
      if (masterCategoryTotal <= 0) {
        return;
      }
      categorySeries.push({
        masterEntry: {
          from: 'Budget',
          to: masterCategory?.entityId,
          weight: masterCategoryTotal,
        },
        subEntries: subCategorySeries.sort((a, b) => b.weight - a.weight),
      });
    });
    if (positiveCategoriesAmount > 0 && showIncome) {
      if (groupPositiveCategories) {
        seriesData.push({
          from: 'POSITIVE CATEGORIES',
          to: 'Budget',
          weight: positiveCategoriesAmount,
        });
      } else {
        seriesData.push(...positiveCategoriesSeries);
      }
    }
    if (showExpense) {
      categorySeries = categorySeries.sort((a, b) => b.masterEntry.weight - a.masterEntry.weight);
      categorySeries.forEach((categorySerie) => {
        seriesData.push(categorySerie.masterEntry);
        if (showSubCategories) {
          seriesData.push(...categorySerie.subEntries);
        }
      });
    }

    if (showLossGain && (showExpense || showIncome) && totalExpense !== totalIncome) {
      const lossGainData = {
        from: totalExpense > totalIncome ? 'NET LOSS' : 'Budget',
        to: totalExpense > totalIncome ? 'Budget' : 'NET GAIN',
        weight: Math.abs(totalIncome - totalExpense),
      };

      if (totalExpense > totalIncome && totalIncome === 0) {
        seriesData.unshift(lossGainData);
      } else {
        seriesData.push(lossGainData);
      }
    }

    return { totalIncome, seriesData };
  }

  _getNodeData() {
    const { expenses, incomes } = this.state;

    let nodeData: { id?: string; name?: string }[] = [];

    expenses.forEach((subCategoryMap, masterCategory) => {
      subCategoryMap.forEach((_amount, subCatogory) => {
        nodeData.push({
          id: subCatogory?.entityId,
          name: subCatogory?.name,
        });
      });

      nodeData.push({
        id: masterCategory?.entityId,
        name: masterCategory?.name,
      });
    });

    incomes.forEach((_amount, payee) => {
      nodeData.push({
        id: payee?.entityId,
        name: payee?.name,
      });
    });

    return nodeData;
  }

  _renderReport = () => {
    const { totalIncome, seriesData } = this._getSeriesData();
    const linksHover = (point: Point, state: 'hover' | '') => {
      if (point.isNode) {
        point.linksTo.forEach((l) => {
          l.setState(state);
        });
        point.linksFrom.forEach((l) => {
          l.setState(state);
        });
      }
    };
    Highcharts.chart({
      credits: { enabled: false },
      title: {
        text: '',
      },
      chart: {
        backgroundColor: 'transparent',
        renderTo: 'tk-income-breakdown',
      },
      plotOptions: {
        sankey: {
          point: {
            events: {
              // @ts-ignore Incorrect types from Highchart library
              mouseOut: function (this: Point) {
                linksHover(this, '');
              },
              // @ts-ignore Incorrect types from Highchart library
              mouseOver: function (this: Point) {
                linksHover(this, 'hover');
              },
            },
          },
          dataLabels: {
            backgroundColor: '#00000080',
            borderRadius: 5,
            padding: 3,
            style: {
              color: '#FFF',
              textOutline: 'none',
            },
          },
          tooltip: {
            headerFormat: '',
            // @ts-ignore incorrect types in Highcharts library
            pointFormatter: function (this: Point) {
              const formattedNumber = formatCurrency(this.weight);
              const percentage = (this.weight / totalIncome) * 100;
              return `${this.fromNode.name} → ${
                this.toNode.name
              }: <b>${formattedNumber} (${percentage.toFixed(2)}%)</b>`;
            },
            // @ts-ignore incorrect types in Highcharts library
            nodeFormatter: function (this: Point) {
              let formattedNumber = formatCurrency(this.sum);
              return `${this.name}: <b>${formattedNumber}</b>`;
            },
          },
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
          keys: ['from', 'to', 'weight'],
          data: seriesData,
          type: 'sankey',
          nodes: this._getNodeData(),
        },
      ],
    });
  };
}
