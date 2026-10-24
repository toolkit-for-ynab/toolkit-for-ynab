import { Feature } from 'toolkit/extension/features/feature';
import { l10n } from 'toolkit/extension/utils/toolkit';
import { getBudgetService } from 'toolkit/extension/utils/ynab';
import { getBudgetBreakdownEntries } from '../subtract-upcoming-from-available/budget-breakdown-monthly-totals';
import { isSavingsCategory } from '../subtract-upcoming-from-available/categories';

export class ShowAvailableAfterSavings extends Feature {
  observe(changedNodes) {
    if (changedNodes.has('budget-inspector-button')) {
      this.handleBudgetBreakdown();
    }
  }

  destroy() {
    this.removeAvailableAfterSavings();
  }

  removeAvailableAfterSavings() {
    // attribute selector removes every copy, `#id` would only match the first
    $('[id="tk-total-available-after-savings"]').remove();
  }

  handleBudgetBreakdown() {
    this.removeAvailableAfterSavings();

    const $budgetBreakdown = $('.budget-breakdown');
    if (!$budgetBreakdown.length) return;

    this.showAvailableAfterSavings($budgetBreakdown);
  }

  showAvailableAfterSavings(context) {
    const inspectorCategories = getBudgetService().inspectorCategories;

    const totalAvailable = inspectorCategories.reduce((p, c) => p + c.available, 0);
    const totalSavings = getTotalSavings(inspectorCategories);
    const totalAvailableAfterSavings = totalAvailable - totalSavings;

    if (totalAvailableAfterSavings === totalAvailable) return;

    // other inspector cards (e.g. Live on Last Month's Income) also contain a .ynab-breakdown
    const $ynabBreakdown = $('.ynab-breakdown', context).first();

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
