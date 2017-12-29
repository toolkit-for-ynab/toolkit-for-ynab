import { Feature } from 'toolkit/extension/features/feature';
import * as toolkitHelper from 'toolkit/extension/helpers/toolkit';

export class CurrentMonthIndicator extends Feature {
  injectCSS() { return require('./index.css'); }

  shouldInvoke() {
    return toolkitHelper.getCurrentRouteName().indexOf('budget') !== -1;
  }

  invoke() {
    if (this.inCurrentMonth()) {
      $('.budget-header .budget-header-calendar').addClass('toolkit-highlight-current-month');
    } else {
      $('.budget-header .budget-header-calendar').removeClass('toolkit-highlight-current-month');
    }
  }

  inCurrentMonth() {
    var today = new Date();
    var selectedMonth = ynabToolKit.shared.parseSelectedMonth();
    if (selectedMonth === null) return false;
    return selectedMonth.getMonth() === today.getMonth() && selectedMonth.getYear() === today.getYear();
  }

  observe(changedNodes) {
    if (!this.shouldInvoke()) return;

    if (changedNodes.has('budget-header-item budget-header-calendar') ||
        changedNodes.has('budget-header-totals-cell-value user-data')) {
      this.invoke();
    }
  }

  onRouteChanged() {
    if (!this.shouldInvoke()) return;
    this.invoke();
  }
}
