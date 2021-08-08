import { Feature } from 'toolkit/extension/features/feature';
import { isCurrentRouteBudgetPage } from 'toolkit/extension/utils/ynab';
import { getEmberView } from 'toolkit/extension/utils/ember';
import { formatCurrency } from 'toolkit/extension/utils/currency';
import { addToolkitEmberHook } from 'toolkit/extension/utils/toolkit';
import { getCurrencyClass } from 'toolkit/extension/features/budget/subtract-upcoming-from-available/index';

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

    const budgetBreakdownMonthlyTotals = getEmberView(element.id);
    if (!budgetBreakdownMonthlyTotals) return;

    const totalAvailable = budgetBreakdownMonthlyTotals.budgetTotals.available;
    const totalSavings = getTotalSavings(budgetBreakdownMonthlyTotals);
    const totalAvailableAfterSavings = totalAvailable - totalSavings;

    // fix
    const $totalAvailable = $('.budget-breakdown-monthly-totals', $budgetBreakdownMonthlyTotals)
      .children()
      .first();
    const $totalAvailableText = $(`.user-data`, $totalAvailable);
    $totalAvailableText.text(formatCurrency(totalAvailableAfterSavings));

    $totalAvailableText.removeClass('positive zero negative');
    const currencyClass = getCurrencyClass(totalAvailableAfterSavings);
    $totalAvailableText.addClass(currencyClass);
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

  return totalSavings; // Returns positive value. Each category.available is positive.
}
