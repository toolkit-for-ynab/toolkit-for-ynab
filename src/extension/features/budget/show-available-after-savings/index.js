import { Feature } from 'toolkit/extension/features/feature';
import { isCurrentRouteBudgetPage } from 'toolkit/extension/utils/ynab';
import { getEmberView } from 'toolkit/extension/utils/ember';
import { addToolkitEmberHook } from 'toolkit/extension/utils/toolkit';
import { createBudgetBreakdownEntry } from 'toolkit/extension/features/budget/subtract-upcoming-from-available/index';

export class ShowAvailableAfterSavings extends Feature {
  shouldInvoke() {
    return isCurrentRouteBudgetPage();
  }

  invoke() {
    addToolkitEmberHook(this, 'budget-breakdown', 'didRender', this.run);
  }

  run(element) {
    if (!this.shouldInvoke()) return;
    this.showAvailableAfterSavings(element);
  }

  showAvailableAfterSavings(element) {
    const $budgetBreakdownMonthlyTotals = $('.budget-breakdown-monthly-totals', element);
    if (!$budgetBreakdownMonthlyTotals.length) return;

    const budgetBreakdown = getEmberView(element.id);
    if (!budgetBreakdown) return;

    $(`#total-available-after-savings`, $budgetBreakdownMonthlyTotals).remove();

    const totalAvailable = budgetBreakdown.budgetTotals.available;
    const totalSavings = getTotalSavings(budgetBreakdown);
    const totalAvailableAfterSavings = totalAvailable - totalSavings;

    if (totalAvailableAfterSavings === totalAvailable) return;

    const $ynabBreakdown = $('.ynab-breakdown', $budgetBreakdownMonthlyTotals);

    createBudgetBreakdownEntry(
      'total-available-after-savings',
      'toolkit.availableAfterSavings',
      'Available After Savings',
      totalAvailableAfterSavings
    ).prependTo($ynabBreakdown);
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
      totalSavings += category.available + category.upcomingTransactions;
  }

  if (totalSavings < 0) return 0;
  return totalSavings;
}
