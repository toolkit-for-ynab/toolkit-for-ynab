import { Feature } from 'toolkit/extension/features/feature';
import { addToolkitEmberHook } from 'toolkit/extension/utils/toolkit';
import { isCurrentRouteBudgetPage } from 'toolkit/extension/utils/ynab';
import { handleBudgetBreakdown } from './budget-breakdown';
import { handleBudgetTableRow } from './budget-table-row';
import { setCategoriesObject } from './categories';

export class SubtractUpcomingFromAvailable extends Feature {
  shouldInvoke() {
    return isCurrentRouteBudgetPage();
  }

  invoke() {
    setCategoriesObject();
    addToolkitEmberHook(this, 'budget-breakdown', 'didRender', this.run);
    addToolkitEmberHook(this, 'budget-table-row', 'didRender', this.run);
  }

  run(element) {
    handleBudgetBreakdown(element);
    handleBudgetTableRow(element);
  }

  onRouteChanged() {
    if (!this.shouldInvoke()) return;
    this.invoke();
  }
}
