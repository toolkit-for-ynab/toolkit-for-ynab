import { Feature } from 'toolkit/extension/features/feature';
import { isCurrentRouteBudgetPage } from 'toolkit/extension/utils/ynab';

export class ToBeBudgetedWarning extends Feature {
  injectCSS() {
    return require('./index.css');
  }

  shouldInvoke() {
    return isCurrentRouteBudgetPage();
  }

  invoke() {
    // check if TBB > zero, if so, change background color
    if ($('.budget-header-totals-amount-value .currency').hasClass('positive')) {
      $('.budget-header-totals-amount').addClass('toolkit-cautious');
      $('.budget-header-totals-amount-arrow').addClass('toolkit-cautious');
    } else {
      $('.budget-header-totals-amount').removeClass('toolkit-cautious');
      $('.budget-header-totals-amount-arrow').removeClass('toolkit-cautious');
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
