import { Feature } from 'toolkit/extension/features/feature';
import { isCurrentRouteBudgetPage } from 'toolkit/extension/utils/ynab';
import { controllerLookup } from 'toolkit/extension/utils/ember';
import { getToolkitStorageKey, setToolkitStorageKey } from 'toolkit/extension/utils/toolkit';

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
    var dom = $('<span class="ember-view"></span>');
    if (this.settings.enabled.indexOf('toggle-all') !== -1) {
      dom.append(
        '<button id="all-category-expand-button" title="Expands / collapses Master categories">&#8597;' +
          '</button>'
      );
      $(dom, '#all-category-expand-button').on('click', this.toggleAllCategories);
    }

    if (this.settings.enabled.indexOf('solo-mode') !== -1) {
      dom.append(
        '<input type="checkbox" id="cat-solo-mode" class="ember-view"' +
          getToolkitStorageKey('catSoloMode') +
          '><label class="ember-view button" for="cat-solo-mode" title="Only have one master category opened at a time">Solo Mode</label>'
      );
      $('.js-budget-table-cell-collapse').on('click', this.toggleCategory);
      $(dom, '#cat-solo-mode').on('click', this.initializeState);
    }
    $('.budget-toolbar').append(dom);

    setTimeout(this.initializeState, 500);
  }

  // ===== Custom functions ======
  initializeState = () => {
    var checked = $('.budget-toolbar #cat-solo-mode').prop('checked');
    $('#all-category-expand-button').attr('disabled', checked);
    if (checked) {
      setToolkitStorageKey('catSoloMode', 'checked');
      $('.js-budget-table-cell-collapse.down')
        .first()
        .click()
        .click();
    } else {
      setToolkitStorageKey('catSoloMode', '');
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
    controllerLookup('budget').send(
      'toggleCollapseMasterCategories',
      Boolean($('.js-budget-table-cell-collapse.down').length)
    );
  };
}
