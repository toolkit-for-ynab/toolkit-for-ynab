import * as React from 'react';
import { controllerLookup, getEmberView } from 'toolkit/extension/utils/ember';
import { getBudgetController, getEntityManager } from 'toolkit/extension/utils/ynab';
import { formatCurrency } from 'toolkit/extension/utils/currency';
import { Feature } from '../../feature';
import { componentAfter } from 'toolkit/extension/utils/react';

const QuickBudgetButton = ({
  setting,
  onClick,
  average,
}: {
  setting: FeatureSetting;
  onClick: React.MouseEventHandler;
  average: number;
}) => (
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
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - parseInt(this.settings.enabled as string));

    const startMonth = ynab.utilities.DateWithoutTime.createFromYearMonthDate(
      startDate.getFullYear(),
      startDate.getMonth(),
      1
    );

    const endDate = new Date();
    endDate.setMonth(startDate.getMonth() - 1);
    const endMonth = ynab.utilities.DateWithoutTime.createFromYearMonthDate(
      endDate.getFullYear(),
      endDate.getMonth(),
      1
    );

    let sum = 0;
    const monthsIncluded = new Set();
    const selectedCategoryId = this._getSelectedCategoryId();
    if (!selectedCategoryId) {
      return 0;
    }

    getEntityManager()
      .getTransactionsBySubCategoryId(selectedCategoryId)
      .forEach((transaction) => {
        if (
          !transaction.isTombstone &&
          transaction.subCategoryId === selectedCategoryId &&
          transaction.date?.isBetweenMonths(startMonth, endMonth)
        ) {
          monthsIncluded.add(transaction.date.format('YYYYMMM'));
          if (transaction.amount) {
            sum += transaction.amount;
          }
        }
      });

    getEntityManager()
      .getSubTransactionsBySubCategoryId(selectedCategoryId)
      .forEach((subTransaction) => {
        if (
          !subTransaction.isTombstone &&
          subTransaction.subCategoryId === selectedCategoryId &&
          subTransaction.date?.isBetweenMonths(startMonth, endMonth)
        ) {
          monthsIncluded.add(subTransaction.date.format('YYYYMMM'));
          if (subTransaction.amount) {
            sum += subTransaction.amount;
          }
        }
      });

    if (sum === 0) {
      return 0;
    }

    return Math.abs(sum / monthsIncluded.size);
  };

  _getSelectedCategoryId = () => {
    if (getBudgetController()?.checkedRowsCount === 1) {
      return getBudgetController()?.checkedRows[0].categoryId;
    }

    return null;
  };

  _quickBudgetHandler = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (event.currentTarget.id !== 'tk-average-months') return;

    const budgetRow = document.querySelector(`[data-entity-id="${this._getSelectedCategoryId()}"]`);
    const emberView = getEmberView<BudgetTableRowComponent>(budgetRow?.id);
    if (emberView) {
      emberView.category.budgeted = this._calculateAverage();
    }
  };

  _renderButton = (element: Element) => {
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
