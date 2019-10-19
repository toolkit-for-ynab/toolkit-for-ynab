import { Feature } from 'toolkit/extension/features/feature';

export class CategorySoloMode extends Feature {
  shouldInvoke() {
    // since we are adding the listener to the entire document,
    // we should invoke on page load.
    return true;
  }

  invoke() {
    $('.js-budget-table-cell-collapse').on('click', this.toggleCategorySoloMode);
  }

  toggleCategorySoloMode = event => {
    if ($(event.target).hasClass('right')) {
      $('.js-budget-table-cell-collapse.down').each(function() {
        if ($(this).id !== event.target.id && $(this).hasClass('down')) $(this).click();
      });
    }
  };
}
