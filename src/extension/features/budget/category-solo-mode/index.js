import { Feature } from 'toolkit/extension/features/feature';
import { isCurrentRouteBudgetPage } from 'toolkit/extension/utils/ynab';
import { controllerLookup } from 'toolkit/extension/utils/ember';
import { getToolkitStorageKey, setToolkitStorageKey } from 'toolkit/extension/utils/toolkit';

export class CategorySoloMode extends Feature {
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
    const dom = $('<span></span>');
    if (this.settings.enabled.includes('toggle-all')) {
      dom.append(
        $('<button>', {
          id: 'all-category-expand-button',
          title: 'Expands / Collapses Master Categories',
          text: '↕ ',
        }).on('click', this.toggleAllCategories)
      );
    }

    if (this.settings.enabled.includes('solo-mode')) {
      dom.append(
        $('<label>', {
          class: 'button',
          for: 'cat-solo-mode',
          title: 'Only expand one mastery category at a time',
          text: 'Solo Mode ',
        }).append(
          $('<input>', {
            id: 'cat-solo-mode',
            type: 'checkbox',
            class: getToolkitStorageKey('catSoloMode'),
          }).on('click', this.initializeState)
        )
      );

      $('.js-budget-table-cell-collapse').on('click', this.toggleCategory);
    }

    $('.budget-toolbar').append(dom);
  }

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
      !!$('.js-budget-table-cell-collapse.down').length
    );
  };
}
