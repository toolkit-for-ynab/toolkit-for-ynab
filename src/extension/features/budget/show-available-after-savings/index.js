import { Feature } from 'toolkit/extension/features/feature';
import { l10n } from 'toolkit/extension/utils/toolkit';
import { getBudgetService } from 'toolkit/extension/utils/ynab';
import { getBudgetBreakdownEntries } from '../subtract-upcoming-from-available/budget-breakdown-monthly-totals';
import { isSavingsCategory } from '../subtract-upcoming-from-available/categories';
import { isClassInChangedNodes } from 'toolkit/extension/utils/helpers';

export class ShowAvailableAfterSavings extends Feature {
  observe(changedNodes) {
    if (isClassInChangedNodes('budget-inspector-button', changedNodes)) {
      this.handleBudgetBreakdown();
    }
  }

  destroy() {
    this.removeAvailableAfterSavings();
  }

  removeAvailableAfterSavings() {
    $('#tk-total-available-after-savings').remove();
  }

  handleBudgetBreakdown() {
    this.removeAvailableAfterSavings();

    const $budgetBreakdownMonthlyTotals = $('.budget-breakdown-monthly-totals');
    if (!$budgetBreakdownMonthlyTotals.length) return;

    this.showAvailableAfterSavings($budgetBreakdownMonthlyTotals);
  }

  showAvailableAfterSavings(context) {
    const inspectorCategories = getBudgetService().inspectorCategories;

    const totalAvailable = inspectorCategories.reduce((p, c) => p + c.available, 0);
    const totalSavings = getTotalSavings(inspectorCategories);
    const totalAvailableAfterSavings = totalAvailable - totalSavings;

    if (totalAvailableAfterSavings === totalAvailable) return;

    const $ynabBreakdown = $('.ynab-breakdown', context);

    getBudgetBreakdownEntries({
      availableAfterSavings: {
        elementId: 'tk-total-available-after-savings',
        title: l10n('toolkit.availableAfterSavings', 'Available After Savings'),
        amount: totalAvailableAfterSavings,
      },
    }).prependTo($ynabBreakdown);
  }
}

export function getTotalSavings(inspectorCategories) {
  let totalSavings = 0;

  for (const category of inspectorCategories) {
    if (isSavingsCategory(category))
      totalSavings += category.available < 0 ? 0 : category.available; // If available is less than 0, it will already have been subtracted from YNAB's total available.
  }

  return totalSavings;
}
