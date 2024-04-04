import * as React from 'react';

import { getBudgetService, getEntityManager } from 'toolkit/extension/utils/ynab';
import { formatCurrency } from 'toolkit/extension/utils/currency';
import { Feature } from '../../feature';
import { componentAfter } from 'toolkit/extension/utils/react';
import type { FeatureSetting } from 'toolkit/types/toolkit/features';
import type { BudgetTableRowComponent } from 'toolkit/types/ynab/components/BudgetTableRow';
import { getBudgetMonthDisplaySubCategory } from '../utils';

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
  observe(changedNodes: Set<string>) {
    if (changedNodes.has('budget-inspector-button')) {
      this._renderButton();
    }
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
    endDate.setMonth(endDate.getMonth() - 1);
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
    if (getBudgetService()?.checkedRowsCount === 1) {
      return getBudgetService()?.checkedRows[0].categoryId;
    }

    return null;
  };

  _quickBudgetHandler = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (event.currentTarget.id !== 'tk-average-months') return;

    const selectedCategoryId = this._getSelectedCategoryId();
    const budgetRow = document.querySelector(`[data-entity-id="${selectedCategoryId}"]`);
    const category = getBudgetMonthDisplaySubCategory(selectedCategoryId);
    if (category) {
      category.budgeted = this._calculateAverage();
    }
  };

  _renderButton = () => {
    if (this._getSelectedCategoryId() == null) return;
    const target = $('.inspector-quick-budget .option-groups button:contains("Average Spent")');
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
