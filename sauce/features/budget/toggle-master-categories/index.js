import { Feature } from 'toolkit/core/feature';

export class ToggleMasterCategories extends Feature {
  injectCSS() {
    return require('./index.css');
  }

  shouldInvoke() {
    return true; // Always invoke at least once.
  }

  invoke() {
    $(document).on('click.toolkit-toggle-master-cats', '.undo-redo-container', function (e) {
      var container = $('.undo-redo-container');
      var min = container.offset().left + container.outerWidth() - 2;
      var max = min + 28;

      if (e.pageX >= min && e.pageX <= max) {
        // if some sections are already hidden, expand all
        if ($('.is-master-category .budget-table-cell-name-static-width button.right').length) {
          $('.is-master-category .budget-table-cell-name-static-width button.right').click();
        } else {
          $('.is-master-category .budget-table-cell-name-static-width button.down').click();
        }
      }
    });

    // Turn ourself off to prevent adding multiple click handlers!
    this.settings.enabled = false;
  }
}
