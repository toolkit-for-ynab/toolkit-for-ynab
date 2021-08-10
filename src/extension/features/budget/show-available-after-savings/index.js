import { getEmberView } from 'toolkit/extension/utils/ember';
import { Feature } from 'toolkit/extension/features/feature';
import { addToolkitEmberHook } from 'toolkit/extension/utils/toolkit';
import { isCurrentRouteBudgetPage } from 'toolkit/extension/utils/ynab';
import { getTotalSavings } from 'toolkit/extension/features/budget/subtract-upcoming-from-available/totals';
import { createBudgetBreakdownEntry } from 'toolkit/extension/features/budget/subtract-upcoming-from-available/util';

export class ShowAvailableAfterSavings extends Feature {
  shouldInvoke() {
    return isCurrentRouteBudgetPage();
  }

  invoke() {
    addToolkitEmberHook(this, 'budget-breakdown', 'didRender', this.run);
  }

  run(element) {
    if (!this.shouldInvoke()) return;

    const $budgetBreakdownMonthlyTotals = $('.budget-breakdown-monthly-totals', element);
    const budgetBreakdown = getEmberView(element.id);
    if ($budgetBreakdownMonthlyTotals.length && budgetBreakdown)
      this.showAvailableAfterSavings(budgetBreakdown, $budgetBreakdownMonthlyTotals);
  }

  showAvailableAfterSavings(budgetBreakdown, context) {
    $(`#total-available-after-savings`, context).remove();

    const totalAvailable = budgetBreakdown.budgetTotals.available;
    const totalSavings = getTotalSavings(budgetBreakdown);
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

  onRouteChanged() {
    if (!this.shouldInvoke()) return;
    this.invoke();
  }
}
