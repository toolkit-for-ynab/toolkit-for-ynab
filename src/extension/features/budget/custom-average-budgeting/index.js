import { controllerLookup, getEmberView } from 'toolkit/extension/utils/ember';
import {
  getEntityManager,
  isCurrentMonthSelected,
  isCurrentRouteBudgetPage,
} from 'toolkit/extension/utils/ynab';
import { formatCurrency } from 'toolkit/extension/utils/currency';
import { Feature } from '../../feature';

export class CustomAverageBudgeting extends Feature {
  constructor() {
    super();
    this.timeframe = this.settings.enabled;
    this.transactions = getEntityManager().transactionsCollection._internalDataArray;
    this.lookbackFrame = this._calculateLookback();
    this.selectedCategory = this._getSelectedCategoryId();
    this.average = 0;
  }

  shouldInvoke() {
    return isCurrentRouteBudgetPage() && isCurrentMonthSelected();
  }

  _calculateLookback() {
    var today = new Date();
    var d;
    var month;
    var year;
    var arr = [];

    for (var i = this.timeframe; i >= 1; i -= 1) {
      d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      month = d.getMonth();
      year = d.getFullYear();
      arr.push(`${month}|${year}`);
    }

    return arr.join('`');
  }

  _calculateAverage() {
    var timeframe = this.lookbackFrame.split('`');
    var filteredTransactions = this.transactions.filter((transaction) => {
      var month = transaction.date._internalUTCMoment._i[1];
      var year = transaction.date._internalUTCMoment._i[0];
      return (
        timeframe.includes(`${month}|${year}`) &&
        transaction.subCategoryId === this.selectedCategory
      );
    });

    if (filteredTransactions.length === 0) {
      return 0;
    }

    var totalSum = filteredTransactions
      .map((i) => parseFloat(ynab.formatCurrency(i.amount)) * -1)
      .reduce((a, b) => a + b);

    var average = parseFloat((totalSum / timeframe.length).toFixed(2)) * 1000;

    return average;
  }

  _getSelectedCategoryId() {
    var budgetController = controllerLookup('budget');
    if (budgetController.checkedRowsCount === 1) {
      return budgetController.checkedRows[0].categoryId;
    }

    return null;
  }

  _quickBudgetHandler(event) {
    if (event.currentTarget.id !== 'tk-average-months') return;

    var budgetRow = document.querySelector(`[data-entity-id="${this.selectedCategory}"]`);
    var emberView = getEmberView(budgetRow.id);
    emberView.category.budgeted = this.average;
  }

  _renderButton() {
    var target = $('.option-groups div').eq(0);
    var button = $(`
    <button id="tk-average-months" class="budget-inspector-button" title="Assign your historical average spent over the past ${
      this.settings.enabled
    } months">
        <div class="">Average Spent in Past ${this.settings.enabled} Months</div>
        <div><strong class="user-data" title="${formatCurrency(
          this.average
        )}"><span class="user-data currency positive">${formatCurrency(
      this.average
    )}</span></strong></div>
      </button>
    `);

    $(button).on('click', (event) => this._quickBudgetHandler(event));

    $(target).append(button);
  }

  invoke() {
    this.transactions = getEntityManager().transactionsCollection._internalDataArray;
    this.lookbackFrame = this._calculateLookback();
    this.selectedCategory = this._getSelectedCategoryId();
    this.average = this._calculateAverage();
    if (this.selectedCategory !== null) {
      this._renderButton();
    }
  }

  observe(changedNodes) {
    if (!this.shouldInvoke()) return;

    if (
      changedNodes.has('budget-table-row js-budget-table-row is-sub-category is-checked') ||
      changedNodes.has('budget-table-row js-budget-table-row is-sub-category')
    ) {
      this.invoke();
    }
  }
}
