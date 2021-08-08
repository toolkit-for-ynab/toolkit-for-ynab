import { Feature } from 'toolkit/extension/features/feature';
import { isCurrentRouteBudgetPage } from 'toolkit/extension/utils/ynab';
import { getEmberView } from 'toolkit/extension/utils/ember';
import { addToolkitEmberHook, l10n } from 'toolkit/extension/utils/toolkit';
import { createBudgetBreakdownElement } from 'toolkit/extension/features/budget/subtract-upcoming-from-available/index';

export class SubtractSavingsFromTotalAvailable extends Feature {
  shouldInvoke() {
    return isCurrentRouteBudgetPage();
  }

  invoke() {
    addToolkitEmberHook(this, 'budget-breakdown', 'didRender', this.run);
  }

  run(element) {
    if (!this.shouldInvoke()) return;
    this.subtractSavingsFromTotalAvailable(element);
  }

  subtractSavingsFromTotalAvailable(element) {
    const $budgetBreakdownMonthlyTotals = $('.budget-breakdown-monthly-totals', element);
    if (!$budgetBreakdownMonthlyTotals.length) return;

    const elementId = 'total-available-after-savings';
    $(`#${elementId}`, $budgetBreakdownMonthlyTotals).remove();

    const budgetBreakdown = getEmberView(element.id);

    const totalAvailable = budgetBreakdown.budgetTotals.available;
    const totalSavings = getTotalSavings(budgetBreakdown);
    const totalAvailableAfterSavings = totalAvailable - totalSavings;

    const localizedTitle = l10n('toolkit.availableAfterSavings', 'Available After Savings');

    const $ynabBreakdown = $('.ynab-breakdown', $budgetBreakdownMonthlyTotals);

    createBudgetBreakdownElement(elementId, localizedTitle, totalAvailableAfterSavings).prependTo(
      $ynabBreakdown
    );
  }

  onRouteChanged() {
    if (!this.shouldInvoke()) return;
    this.invoke();
  }
}

export function getTotalSavings(budgetBreakdown) {
  let totalSavings = 0;

  for (const category of budgetBreakdown.inspectorCategories) {
    if (
      category.masterCategory.name.toLowerCase().includes('savings') ||
      category.displayName.toLowerCase().includes('savings')
    )
      totalSavings += category.available;
  }

  return totalSavings; // Returns positive amount. Each category.available is positive.
}
