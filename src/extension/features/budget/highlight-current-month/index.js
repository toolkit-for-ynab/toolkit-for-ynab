import { Feature } from 'toolkit/extension/features/feature';
import { isCurrentRouteBudgetPage, isCurrentMonthSelected } from 'toolkit/extension/utils/ynab';

export class CurrentMonthIndicator extends Feature {
  injectCSS() {
    return require('./index.css');
  }

  shouldInvoke() {
    return isCurrentRouteBudgetPage();
  }

  invoke() {
    if (isCurrentMonthSelected()) {
      $('.budget-header .budget-header-calendar').addClass('toolkit-highlight-current-month');
    } else {
      $('.budget-header .budget-header-calendar').removeClass('toolkit-highlight-current-month');
    }
  }

  observe(changedNodes) {
    if (!this.shouldInvoke()) return;

    if (
      changedNodes.has('budget-header-item budget-header-calendar') ||
      changedNodes.has('budget-header-totals-cell-value user-data')
    ) {
      this.invoke();
    }
  }

  onRouteChanged() {
    if (!this.shouldInvoke()) return;
    this.invoke();
  }
}
