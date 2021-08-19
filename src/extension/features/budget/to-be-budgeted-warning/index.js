import { Feature } from 'tk/extension/features/feature';

export class ToBeBudgetedWarning extends Feature {
  injectCSS() {
    return require('./index.css');
  }

  shouldInvoke() {
    return true;
  }

  invoke() {
    this.addToolkitEmberHook('to-be-budgeted', 'didRender', this.addClasses);
    $('.budget-header-item:not(.tk-stealing-from-future) .to-be-budgeted').each((id, el) =>
      this.addClasses(el)
    );
  }

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
