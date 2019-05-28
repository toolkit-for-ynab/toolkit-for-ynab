import Highcharts from 'highcharts';
require('highcharts/modules/sankey')(Highcharts);
import * as React from 'react';
import * as PropTypes from 'prop-types';
import { Collections } from 'toolkit/extension/utils/collections';
import { FiltersPropType } from 'toolkit-reports/common/components/report-context/component';
import { formatCurrency } from 'toolkit/extension/utils/currency';

export class IncomeBreakdownComponent extends React.Component {
  _payeesCollection = Collections.payeesCollection;
  _subCategoriesCollection = Collections.subCategoriesCollection;
  _masterCategoriesCollection = Collections.masterCategoriesCollection;

  static propTypes = {
    filters: PropTypes.shape(FiltersPropType),
    filteredTransactions: PropTypes.array.isRequired,
  };

  componentDidUpdate(prevProps) {
    if (this.props.filteredTransactions !== prevProps.filteredTransactions) {
      this._calculateData();
    }
  }

  componentDidMount() {
    this._calculateData();
  }

  render() {
    return (
      <div className="tk-flex tk-flex-grow">
        <div className="tk-highcharts-report-container" id="tk-income-breakdown" />
      </div>
    );
  }

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
        let amount = transaction.get('amount');
        if (incomes.has(transactionPayee)) {
          amount += incomes.get(transactionPayee);
        }
        incomes.set(transactionPayee, amount);
      } else {
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
    });
    this.setState(
      {
        incomes: incomes,
        expenses: expenses,
      },
      this._renderReport
    );
  }

  _renderReport = () => {
    let seriesData = [];
    const { incomes, expenses } = this.state;
    let totalIncome = 0;
    incomes.forEach((amount, payee) => {
      if (amount <= 0) {
        return;
      }
      seriesData.push({
        from: payee.get('name'),
        to: 'Income',
        weight: amount,
      });
      totalIncome += amount;
    });
    seriesData.push({
      from: 'Income',
      to: 'Expense',
      weight: totalIncome,
    });
    expenses.forEach((subCategoryMap, masterCategory) => {
      const masterCategorySeries = [];
      let masterCategoryTotal = 0;
      subCategoryMap.forEach((amount, subCatogory) => {
        const absAmount = Math.abs(amount);
        if (absAmount <= 0) {
          return;
        }
        masterCategorySeries.push({
          from: masterCategory.get('name'),
          to: subCatogory.get('name'),
          weight: absAmount,
          outgoing: true,
        });
        masterCategoryTotal += absAmount;
      });
      if (masterCategoryTotal <= 0) {
        return;
      }
      masterCategorySeries.push({
        from: 'Expense',
        to: masterCategory.get('name'),
        weight: masterCategoryTotal,
      });
      seriesData = seriesData.concat(masterCategorySeries);
    });

    seriesData.sort((a, b) => b.weight - a.weight);

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
    const chart = new Highcharts.Chart({
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
          data: seriesData,
          type: 'sankey',
        },
      ],
    });
    this.setState({ chart });
  };
}
