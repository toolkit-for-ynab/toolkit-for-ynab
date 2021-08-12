import { getEmberView } from 'toolkit/extension/utils/ember';
import { Feature } from 'toolkit/extension/features/feature';
import { addToolkitEmberHook } from 'toolkit/extension/utils/toolkit';
import { isCurrentRouteBudgetPage } from 'toolkit/extension/utils/ynab';
import { isSavingsCategory } from 'toolkit/extension/features/budget/subtract-upcoming-from-available/categories';
import { createBudgetBreakdownEntry } from 'toolkit/extension/features/budget/subtract-upcoming-from-available/util';

export class ShowAvailableAfterSavings extends Feature {
  shouldInvoke() {
    return isCurrentRouteBudgetPage();
  }

  invoke() {
    addToolkitEmberHook(this, 'budget-breakdown', 'didRender', this.handleBudgetBreakdown);
  }

  handleBudgetBreakdown(element) {
    if (!this.shouldInvoke()) return;

    const $budgetBreakdownMonthlyTotals = $('.budget-breakdown-monthly-totals', element);
    if (!$budgetBreakdownMonthlyTotals.length) return;

    $(`#total-available-after-savings`, $budgetBreakdownMonthlyTotals).remove();

    const budgetBreakdown = getEmberView(element.id);
    if (!budgetBreakdown) return;

    this.showAvailableAfterSavings(budgetBreakdown, $budgetBreakdownMonthlyTotals);
  }

  showAvailableAfterSavings(budgetBreakdown, context) {
    const totalAvailable = budgetBreakdown.budgetTotals.available;
    const totalSavings = this.getTotalSavings(budgetBreakdown);
    const totalAvailableAfterSavings = totalAvailable - totalSavings;

    if (totalAvailableAfterSavings === totalAvailable) return;

    const $ynabBreakdown = $('.ynab-breakdown', context);

    createBudgetBreakdownEntry(
      'total-available-after-savings',
      'toolkit.availableAfterSavings',
      'Available After Savings',
      totalAvailableAfterSavings
    ).prependTo($ynabBreakdown);
  }

  getTotalSavings(budgetBreakdown) {
    let totalSavings = 0;

    for (const category in budgetBreakdown.inspectorCategories) {
      if (isSavingsCategory(category)) totalSavings += category.available;
    }

    return totalSavings;
  }

  onRouteChanged() {
    if (!this.shouldInvoke()) return;
    this.invoke();
  }
}
