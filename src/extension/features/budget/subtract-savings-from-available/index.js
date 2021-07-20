import { Feature } from 'toolkit/extension/features/feature';
import { isCurrentRouteBudgetPage } from 'toolkit/extension/utils/ynab';
import { getEmberView } from 'toolkit/extension/utils/ember';
import { formatCurrency } from 'toolkit/extension/utils/currency';
import { addToolkitEmberHook } from 'toolkit/extension/utils/toolkit';
import { getCurrencyClass } from 'toolkit/extension/features/budget/subtract-upcoming-from-available/index';

export class SubtractSavingsFromAvailable extends Feature {
  shouldInvoke() {
    return isCurrentRouteBudgetPage();
  }

  invoke() {
    addToolkitEmberHook(this, 'budget-breakdown', 'didRender', this.run);
  }

  run(element) {
    if (!this.shouldInvoke()) return;
    this.subtractSavingsFromAvailable(element);
  }

  subtractSavingsFromAvailable(element) {
    const elementObject = $(element);
    const budgetBreakdownObject = elementObject.hasClass('budget-breakdown')
      ? elementObject
      : undefined;
    if (!budgetBreakdownObject) return;

    const budgetBreakdown = getEmberView(element.id);
    if (!budgetBreakdown) return;

    const totalAvailable = budgetBreakdown.budgetTotals.available;
    const totalSavings = getTotalSavings(budgetBreakdown);
    const totalAvailableAfterSavings = totalAvailable - totalSavings;

    const totalAvailableObject = $('.budget-breakdown-monthly-totals', budgetBreakdownObject)
      .children()
      .first();
    const totalAvailableTextObject = $(`.user-data`, totalAvailableObject);
    totalAvailableTextObject.text(formatCurrency(totalAvailableAfterSavings));

    totalAvailableTextObject.removeClass('positive zero negative');
    const currencyClass = getCurrencyClass(totalAvailableAfterSavings);
    totalAvailableTextObject.addClass(currencyClass);
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

  return totalSavings;
}
