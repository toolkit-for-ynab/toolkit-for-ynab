import { controllerLookup, getEmberView } from 'toolkit/extension/utils/ember';
import {
  getEntityManager,
  isCurrentMonthSelected,
  isCurrentRouteBudgetPage,
} from 'toolkit/extension/utils/ynab';
import { formatCurrency } from 'toolkit/extension/utils/currency';
import { Feature } from '../../feature';

export class CustomAverageBudgeting extends Feature {
  shouldInvoke() {
    return isCurrentRouteBudgetPage() && isCurrentMonthSelected();
  }

  _calculateAverage() {
    const today = new Date();
    const firstDate = new Date();
    firstDate.setMonth(firstDate.getMonth() - this.settings.enabled);
    let sum = 0;
    getEntityManager().transactionsCollection._internalDataArray.forEach((transaction) => {
      const transactionDate = transaction.date;

      if (
        transactionDate.isBefore(today) &&
        transactionDate.isAfter(firstDate) &&
        transaction.subCategoryId === this._getSelectedCategoryId()
      ) {
        sum += parseFloat(ynab.formatCurrency(transaction.amount));
      }
    });

    if (sum === 0) {
      return 0;
    }

    return Math.abs(parseFloat((sum / this.settings.enabled).toFixed(2)) * 1000);
  }

  _getSelectedCategoryId() {
    if (controllerLookup('budget').checkedRowsCount === 1) {
      return controllerLookup('budget').checkedRows[0].categoryId;
    }

    return null;
  }

  _quickBudgetHandler(event) {
    if (event.currentTarget.id !== 'tk-average-months') return;

    const budgetRow = document.querySelector(`[data-entity-id="${this._getSelectedCategoryId()}"]`);
    const emberView = getEmberView(budgetRow.id);
    emberView.category.budgeted += this._calculateAverage();
  }

  _renderButton() {
    if (this._getSelectedCategoryId() == null) return;

    const target = $('.option-groups div').eq(0);
    const button = $(`
    <button id="tk-average-months" class="budget-inspector-button" title="Assign your historical average spent over the past ${
      this.settings.enabled
    } months">
        <div class="">Average Spent in Past ${this.settings.enabled} Months</div>
        <div><strong class="user-data" title="${formatCurrency(
          this._calculateAverage()
        )}"><span class="user-data currency positive">${formatCurrency(
      this._calculateAverage()
    )}</span></strong></div>
      </button>
    `);

    $(button).on('click', (event) => this._quickBudgetHandler(event));

    $(target).append(button);
  }

  invoke() {
    this._renderButton();
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
