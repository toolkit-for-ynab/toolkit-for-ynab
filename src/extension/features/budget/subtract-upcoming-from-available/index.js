import { Feature } from 'toolkit/extension/features/feature';
import { addToolkitEmberHook } from 'toolkit/extension/utils/toolkit';
import { shouldInvoke } from 'toolkit/extension/features/budget/subtract-upcoming-from-available/util';
import { handleBudgetBreakdown } from 'toolkit/extension/features/budget/subtract-upcoming-from-available/budget-breakdown';
import { handleBudgetTableRow } from 'toolkit/extension/features/budget/subtract-upcoming-from-available/budget-table-row';

export class SubtractUpcomingFromAvailable extends Feature {
  invoke() {
    addToolkitEmberHook(this, 'budget-breakdown', 'didRender', handleBudgetBreakdown);
    addToolkitEmberHook(this, 'budget-table-row', 'didRender', handleBudgetTableRow);
  }

  onRouteChanged() {
    if (!shouldInvoke()) return;
    this.invoke();
  }
}
