import { Feature } from 'toolkit/extension/features/feature';
import { isCurrentRouteBudgetPage } from 'toolkit/extension/utils/ynab';

export class CategorySoloMode extends Feature {
  // ===== LISTENERS ======
  shouldInvoke() {
    return isCurrentRouteBudgetPage();
  }

  onRouteChanged() {
    if (this.shouldInvoke()) this.invoke();
  }

  invoke() {
    $('.budget-toolbar').append(
      '<span class="ember-view"><input type="checkbox" id="cat-solo-mode" class="ember-view" ' +
        localStorage.catSoloMode +
        '><label class="ember-view button" for="cat-solo-mode">Enable Category Solo Mode</label></span>'
    );
    $('.js-budget-table-cell-collapse').on('click', this.toggleCategorySoloMode);
    $('.budget-toolbar #cat-solo-mode').on('click', this.initializeState);
    setTimeout(this.initializeState, 500);
  }

  // ===== Custom functions ======
  initializeState = () => {
    if ($('.budget-toolbar #cat-solo-mode').prop('checked')) {
      localStorage.catSoloMode = 'checked';
      $('.js-budget-table-cell-collapse.down')
        .first()
        .click()
        .click();
    } else {
      localStorage.catSoloMode = '';
    }
  };

  toggleCategorySoloMode = event => {
    if ($('.budget-toolbar #cat-solo-mode').prop('checked')) {
      if ($(event.target).hasClass('right')) {
        $('.js-budget-table-cell-collapse.down').each(function() {
          if ($(this).id !== event.target.id) $(this).click();
        });
      }
    }
  };
}
