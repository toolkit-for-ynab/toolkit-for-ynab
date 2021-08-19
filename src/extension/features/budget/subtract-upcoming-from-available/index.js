import { Feature } from 'toolkit/extension/features/feature';
import { isCurrentRouteBudgetPage } from 'toolkit/extension/utils/ynab';
import { handleBudgetBreakdownAvailableBalance } from './budget-breakdown-available-balance';
import { resetInspectorMessage } from './budget-breakdown-available-balance';
import { handleBudgetBreakdownMonthlyTotals } from './budget-breakdown-monthly-totals';
import { removeBudgetBreakdownEntries } from './budget-breakdown-monthly-totals';
import { handleBudgetTableRow } from './budget-table-row';
import { setCategoriesObject } from './categories';

export class SubtractUpcomingFromAvailable extends Feature {
  shouldInvoke() {
    return isCurrentRouteBudgetPage();
  }

  invoke() {
    setCategoriesObject();
    this.addToolkitEmberHook('budget-breakdown', 'didRender', this.run);
    this.addToolkitEmberHook('budget-table-row', 'didRender', this.run);
  }

  destroy() {
    resetInspectorMessage();
    removeBudgetBreakdownEntries();
  }

  run(element) {
    handleBudgetBreakdownAvailableBalance(element);
    handleBudgetBreakdownMonthlyTotals(element);
    handleBudgetTableRow(element);
  }

  onRouteChanged() {
    if (!this.shouldInvoke()) return;
    this.invoke();
  }
}
