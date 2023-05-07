import { Feature } from 'toolkit/extension/features/feature';
import { isCurrentRouteBudgetPage } from 'toolkit/extension/utils/ynab';

export class ToBeBudgetedWarning extends Feature {
  injectCSS() {
    return require('./index.css');
  }

  shouldInvoke() {
    return isCurrentRouteBudgetPage();
  }

  observe(changedNodes) {
    if (!this.shouldInvoke()) return;

    if (
      changedNodes.has('budget-header-item budget-header-totals') ||
      changedNodes.has('budget-header-item budget-header-calendar tk-highlight-current-month')
    ) {
      this.addClasses(document.querySelector('.to-be-budgeted'));
    }
  }

  invoke() {}

  addClasses(element) {
    if (element.classList.contains('is-positive')) {
      element.classList.add('tk-tbb-warning');
    } else {
      element.classList.remove('tk-tbb-warning');
    }
  }

  destroy() {
    $('.tk-tbb-warning').removeClass('tk-tbb-warning');
  }
}
