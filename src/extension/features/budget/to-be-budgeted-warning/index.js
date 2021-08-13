import { Feature } from 'toolkit/extension/features/feature';
import { isCurrentRouteBudgetPage } from 'toolkit/extension/utils/ynab';

export class ToBeBudgetedWarning extends Feature {
  injectCSS() {
    return require('./index.css');
  }

  shouldInvoke() {
    return true;
  }

  invoke() {
    this.addToolkitEmberHook('to-be-budgeted', 'didRender', this.addClasses);
    $('.budget-header .to-be-budgeted').each((id, el) => this.addClasses(el));
  }

  addClasses(element) {
    const tbb = $(element);
    if (tbb.hasClass('is-positive')) {
      tbb.addClass('toolkit-tbb-warning');
    } else {
      tbb.removeClass('toolkit-tbb-warning');
    }
  }

  destroy() {
    $('.toolkit-tbb-warning').removeClass('toolkit-tbb-warning');
  }
}
