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
    this.onElement('.budget-header .to-be-budgeted', this.addClasses);
  }

  observe() {
    this.onElement('.budget-header .to-be-budgeted', this.addClasses);
  }

  addClasses(element) {
    if (element.classList.contains('is-positive')) {
      $(element).addClass('tk-tbb-warning');
    } else {
      $(element).removeClass('tk-tbb-warning');
    }
  }

  destroy() {
    $('.tk-tbb-warning').removeClass('tk-tbb-warning');
  }
}
