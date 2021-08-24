import { Feature } from 'toolkit/extension/features/feature';
import { getSelectedMonth } from 'toolkit/extension/utils/ynab';
import { handleBudgetBreakdownAvailableBalance } from './budget-breakdown-available-balance';
import { handleBudgetBreakdownMonthlyTotals } from './budget-breakdown-monthly-totals';
import { handleBudgetTableRow } from './budget-table-row';
import { setCategoriesObject } from './categories';
import * as destroyHelpers from './destroy-helpers';

export class SubtractUpcomingFromAvailable extends Feature {
  shouldInvoke() {
    return true;
  }

  invoke() {
    setCategoriesObject();
    this.addToolkitEmberHook('budget-breakdown', 'didRender', this.handleBudgetBreakdown);
    this.addToolkitEmberHook('budget-table-row', 'didRender', handleBudgetTableRow);
  }

  onRouteChanged() {
    setCategoriesObject();
  }

  destroy() {
    destroyHelpers.resetInspectorMessage();
    destroyHelpers.removeBudgetBreakdownEntries();
    destroyHelpers.resetCategoryValues();
  }

  handleBudgetBreakdown(element) {
    handleBudgetBreakdownAvailableBalance(element);
    handleBudgetBreakdownMonthlyTotals(element);
  }
}

export function shouldRun() {
  // Upcoming transactions can only exist in current or future months.
  const selectedMonth = getSelectedMonth();
  const currentMonth = ynab.utilities.DateWithoutTime.createForCurrentMonth();
  return !selectedMonth.isBeforeMonth(currentMonth);
}
