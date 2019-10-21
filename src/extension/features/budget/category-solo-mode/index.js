import { Feature } from 'toolkit/extension/features/feature';
import { isCurrentRouteBudgetPage } from 'toolkit/extension/utils/ynab';

export class CategorySoloMode extends Feature {
  // ===== LISTENERS ======
  shouldInvoke() {
    return isCurrentRouteBudgetPage();
  }

  injectCSS() {
    return require('./index.css');
  }

  onRouteChanged() {
    if (this.shouldInvoke()) this.invoke();
  }

  invoke() {
    $('.budget-toolbar').append(
      '<span class="ember-view"><button id="all-category-expand-button">&#8597;</button><input type="checkbox" id="cat-solo-mode" class="ember-view" ' +
        localStorage.catSoloMode +
        '><label class="ember-view button" for="cat-solo-mode">Solo Mode</label></span>'
    );
    $('.js-budget-table-cell-collapse').on('click', this.toggleCategory);
    $('.budget-toolbar #cat-solo-mode').on('click', this.initializeState);
    $('.budget-toolbar #all-category-expand-button').on('click', this.toggleAllCategories);
    setTimeout(this.initializeState, 500);
  }

  // ===== Custom functions ======
  initializeState = () => {
    var checked = $('.budget-toolbar #cat-solo-mode').prop('checked');
    $('#all-category-expand-button').attr('disabled', checked);
    if (checked) {
      localStorage.catSoloMode = 'checked';
      $('.js-budget-table-cell-collapse.down')
        .first()
        .click()
        .click();
    } else {
      localStorage.catSoloMode = '';
    }
  };

  toggleCategory = event => {
    if ($('.budget-toolbar #cat-solo-mode').prop('checked')) {
      if ($(event.target).hasClass('right')) {
        $('.js-budget-table-cell-collapse.down').each(function() {
          if ($(this).id !== event.target.id) $(this).click();
        });
      }
    }
  };

  toggleAllCategories = () => {
    if ($('.js-budget-table-cell-collapse.right').length === 0) {
      $('.js-budget-table-cell-collapse.down').each(function() {
        $(this).click();
      });
    } else {
      $('.js-budget-table-cell-collapse.right').each(function() {
        $(this).click();
      });
    }
  };
}
