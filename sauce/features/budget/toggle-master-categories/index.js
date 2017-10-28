import { Feature } from 'toolkit/core/feature';
import { getCurrentRouteName } from 'toolkit/helpers/toolkit';

export class ToggleMasterCategories extends Feature {
  injectCSS() {
    return require('./index.css');
  }

  shouldInvoke() {
    return getCurrentRouteName().indexOf('budget') !== -1;
  }

  invoke() {
    $(document).on(
      'click.toolkit-toggle-master-cats',
      '.undo-redo-container',
      this.toggleMasterCategories
    );
  }

  toggleMasterCategories = (event) => {
    const container = $('.undo-redo-container');
    const min = container.offset().left + container.outerWidth() - 2;
    const max = min + 28;

    if (event.pageX >= min && event.pageX <= max) {
      // if some sections are already hidden, expand all
      if ($('.is-master-category .budget-table-cell-name-static-width button.right').length) {
        $('.is-master-category .budget-table-cell-name-static-width button.right').click();
      } else {
        $('.is-master-category .budget-table-cell-name-static-width button.down').click();
      }
    }
  }
}
