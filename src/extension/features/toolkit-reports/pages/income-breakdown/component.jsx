import Highcharts from 'highcharts';
require('highcharts/modules/sankey')(Highcharts);
import * as React from 'react';
import * as PropTypes from 'prop-types';
import { Collections } from 'toolkit/extension/utils/collections';
import { FiltersPropType } from 'toolkit-reports/common/components/report-context/component';
import { formatCurrency } from 'toolkit/extension/utils/currency';
import { LabeledCheckbox } from 'toolkit-reports/common/components/labeled-checkbox';
import './styles.scss';

export class IncomeBreakdownComponent extends React.Component {
  _payeesCollection = Collections.payeesCollection;
  _subCategoriesCollection = Collections.subCategoriesCollection;
  _masterCategoriesCollection = Collections.masterCategoriesCollection;

  static propTypes = {
    filters: PropTypes.shape(FiltersPropType),
    filteredTransactions: PropTypes.array.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      showIncome: true,
      showExpense: true,
      showLossGain: true,
    };
  }

  componentDidUpdate(prevProps) {
    if (this.props.filteredTransactions !== prevProps.filteredTransactions) {
      this._calculateData();
    }
  }

  componentDidMount() {
    this._calculateData();
  }

  render() {
    const { showIncome, showExpense, showLossGain } = this.state;
    return (
      <div className="tk-flex-grow tk-flex tk-flex-column">
        <div className="tk-flex tk-pd-05 tk-border-b">
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
              id="tk-income-breakdown-hide-epxense-selector"
              checked={showExpense}
              label="Show Expense"
              onChange={this.toggleExpense}
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
        </div>
        <div className="tk-flex tk-flex-grow">
          <div className="tk-highcharts-report-container" id="tk-income-breakdown" />
        </div>
      </div>
    );
  }

  toggleLossGainEntry = ({ currentTarget }) => {
    const { checked } = currentTarget;
    this.setState({ showLossGain: checked });
    this._calculateData();
  };

  toggleIncome = ({ currentTarget }) => {
    const { checked } = currentTarget;
    this.setState({ showIncome: checked });
    this._calculateData();
  };

  toggleExpense = ({ currentTarget }) => {
    const { checked } = currentTarget;
    this.setState({ showExpense: checked });
    this._calculateData();
  };

  _calculateData() {
    if (!this.props.filters) {
      return;
    }

    const incomes = new Map();
    const expenses = new Map();

    this.props.filteredTransactions.forEach(transaction => {
      const transactionSubCategoryId = transaction.get('subCategoryId');
      if (!transactionSubCategoryId) {
        return;
      }

      const transactionSubCategory = this._subCategoriesCollection.findItemByEntityId(
        transactionSubCategoryId
      );
      if (!transactionSubCategory) {
        return;
      }

      if (transactionSubCategory.isIncomeCategory()) {
        const transactionPayeeId =
          transaction.get('payeeId') || transaction.get('parentTransaction.payeeId');
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

  _assignExpenseTransaction(expenses, transaction, transactionSubCategory) {
    const transactionMasterCategory = this._masterCategoriesCollection.findItemByEntityId(
      transactionSubCategory.get('masterCategoryId')
    );

    let amount = transaction.get('amount');
    let subCategoryMap;
    if (expenses.has(transactionMasterCategory)) {
      subCategoryMap = expenses.get(transactionMasterCategory);
    } else {
      subCategoryMap = new Map();
      expenses.set(transactionMasterCategory, subCategoryMap);
    }
    subCategoryMap.set(
      transactionSubCategory,
      (subCategoryMap.get(transactionSubCategory) || 0) + amount
    );
  }

  _assignIncomeTransaction(incomes, transaction, transactionPayee) {
    let amount = transaction.get('amount');
    if (incomes.has(transactionPayee)) {
      amount += incomes.get(transactionPayee);
    }
    incomes.set(transactionPayee, amount);
  }

  _getSeriesData() {
    const { incomes, expenses, showLossGain, showExpense, showIncome } = this.state;
    let seriesData = [];
    let totalIncome = 0;
    let totalExpense = 0;
    incomes.forEach((amount, payee) => {
      if (amount <= 0) {
        return;
      }
      if (showIncome) {
        seriesData.push({
          from: payee.get('entityId'),
          to: 'Budget',
          weight: amount,
        });
      }
      totalIncome += amount;
    });

    let categorySeries = [];
    expenses.forEach((subCategoryMap, masterCategory) => {
      let subCategorySeries = [];
      let masterCategoryTotal = 0;
      subCategoryMap.forEach((amount, subCatogory) => {
        const absAmount = Math.abs(amount);
        if (absAmount <= 0) {
          return;
        }
        subCategorySeries.push({
          from: masterCategory.get('entityId'),
          to: subCatogory.get('entityId'),
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
          to: masterCategory.get('entityId'),
          weight: masterCategoryTotal,
        },
        subEntries: subCategorySeries.sort((a, b) => b.weight - a.weight),
      });
    });
    if (showExpense) {
      categorySeries = categorySeries.sort((a, b) => b.masterEntry.weight - a.masterEntry.weight);
      categorySeries.forEach(categorySerie => {
        seriesData.push(categorySerie.masterEntry);
        seriesData.push(...categorySerie.subEntries);
      });
    }

    if (showLossGain && (showExpense || showExpense) && totalExpense !== totalIncome) {
      seriesData.push({
        from: totalExpense > totalIncome ? 'OVERDRAFT' : 'Budget',
        to: totalExpense > totalIncome ? 'Budget' : 'NET GAIN',
        weight: Math.abs(totalIncome - totalExpense),
      });
    }

    return seriesData;
  }

  _getNodeData() {
    const { expenses, incomes } = this.state;

    let nodeData = [];

    expenses.forEach((subCategoryMap, masterCategory) => {
      subCategoryMap.forEach((_amount, subCatogory) => {
        nodeData.push({
          id: subCatogory.get('entityId'),
          name: subCatogory.get('name'),
        });
      });

      nodeData.push({
        id: masterCategory.get('entityId'),
        name: masterCategory.get('name'),
      });
    });

    incomes.forEach((_amount, payee) => {
      nodeData.push({
        id: payee.get('entityId'),
        name: payee.get('name'),
      });
    });

    return nodeData;
  }

  _renderReport = () => {
    const linksHover = (point, state) => {
      if (point.isNode) {
        point.linksTo.forEach(l => {
          l.setState(state);
        });
        point.linksFrom.forEach(l => {
          l.setState(state);
        });
      }
    };
    Highcharts.chart({
      credits: false,
      title: {
        text: '',
      },
      chart: {
        renderTo: 'tk-income-breakdown',
      },
      plotOptions: {
        sankey: {
          point: {
            events: {
              mouseOut: function() {
                linksHover(this, '');
              },
              mouseOver: function() {
                linksHover(this, 'hover');
              },
            },
          },
          tooltip: {
            headerFormat: '',
            pointFormatter: function() {
              let formattedNumber = formatCurrency(this.weight);
              return `${this.fromNode.name} → ${this.toNode.name}: <b>${formattedNumber}</b>`;
            },
            nodeFormatter: function() {
              let formattedNumber = formatCurrency(this.sum);
              return `${this.name}: <b>${formattedNumber}</b>`;
            },
          },
        },
      },
      series: [
        {
          keys: ['from', 'to', 'weight'],
          data: this._getSeriesData(),
          type: 'sankey',
          nodes: this._getNodeData(),
        },
      ],
    });
  };
}
