import * as React from 'react';
import { controllerLookup, getEmberView } from 'toolkit/extension/utils/ember';
import { getEntityManager } from 'toolkit/extension/utils/ynab';
import { formatCurrency } from 'toolkit/extension/utils/currency';
import { Feature } from '../../feature';
import { componentAfter } from 'toolkit/extension/utils/react';

const QuickBudgetButton = ({ setting, onClick, average }) => (
  <button
    id="tk-average-months"
    className="budget-inspector-button"
    title={`Assign your historical average spent over the past ${setting} months`}
    onClick={onClick}
  >
    <div>Average Spent ({setting} Mo.)</div>
    <div>
      <strong className="user-data" title={formatCurrency(average)}>
        <span className="user-data currency positive">{formatCurrency(average)}</span>
      </strong>
    </div>
  </button>
);

export class CustomAverageBudgeting extends Feature {
  shouldInvoke() {
    return true;
  }

  invoke() {
    this.addToolkitEmberHook('budget-breakdown', 'didRender', this._renderButton);
  }

  _calculateAverage = () => {
    const today = new Date();
    const startMonth = ynab.utilities.DateWithoutTime.createFromYearMonthDate(
      today.getFullYear(),
      today.getMonth() - this.settings.enabled,
      1
    );

    const endMonth = ynab.utilities.DateWithoutTime.createFromYearMonthDate(
      today.getFullYear(),
      today.getMonth() - 1,
      1
    );

    let sum = 0;
    const monthsIncluded = new Set();
    getEntityManager().transactionsCollection.forEach((transaction) => {
      if (
        transaction.subCategoryId === this._getSelectedCategoryId() &&
        transaction.date.isBetweenMonths(startMonth, endMonth)
      ) {
        monthsIncluded.add(transaction.date.format('YYYYMMM'));
        sum += transaction.amount;
      }
    });

    if (sum === 0) {
      return 0;
    }

    return Math.abs(sum / monthsIncluded.size);
  };

  _getSelectedCategoryId = () => {
    if (controllerLookup('budget').checkedRowsCount === 1) {
      return controllerLookup('budget').checkedRows[0].categoryId;
    }

    return null;
  };

  _quickBudgetHandler = (event) => {
    if (event.currentTarget.id !== 'tk-average-months') return;

    const budgetRow = document.querySelector(`[data-entity-id="${this._getSelectedCategoryId()}"]`);
    const emberView = getEmberView(budgetRow.id);
    emberView.category.budgeted = this._calculateAverage();
  };

  _renderButton = (element) => {
    if (this._getSelectedCategoryId() == null) return;
    const target = $(
      '.inspector-quick-budget .option-groups button:contains("Average Spent")',
      element
    );
    if (target.length === 0 || document.querySelector('#tk-average-months') !== null) {
      return;
    }

    componentAfter(
      <QuickBudgetButton
        setting={this.settings.enabled}
        average={this._calculateAverage()}
        onClick={this._quickBudgetHandler}
      />,
      target[0]
    );
  };
}
