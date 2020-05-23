import { Feature } from 'toolkit/extension/features/feature';
import { isCurrentRouteBudgetPage } from 'toolkit/extension/utils/ynab';
import { controllerLookup } from 'toolkit/extension/utils/ember';
import { isFeatureEnabled } from 'toolkit/extension/utils/feature';
import { getToolkitStorageKey, setToolkitStorageKey } from 'toolkit/extension/utils/toolkit';

export class CategorySoloMode extends Feature {
  shouldInvoke() {
    return isCurrentRouteBudgetPage();
  }

  injectCSS() {
    return require('./index.css');
  }

  onRouteChanged() {
    if (this.shouldInvoke()) {
      this.invoke();
    }
  }

  invoke() {
    if ($('.budget-toolbar .tk-toggle-master-categories').length) {
      $('.budget-toolbar .tk-toggle-master-categories').remove();
    }

    const isFilterCategoriesEnabled = isFeatureEnabled(window.ynabToolKit.options.FilterCategories);
    const toggleContainer = $('<div>', {
      class: `tk-toggle-master-categories${
        isFilterCategoriesEnabled ? '' : ' tk-toggle-master-categories--first'
      }`,
    });

    if (this.settings.enabled.includes('toggle-all')) {
      toggleContainer.append(
        $('<button>', {
          id: 'all-category-expand-button',
          title: 'Expands / Collapses Master Categories',
          text: '↕ ',
        }).on('click', this.toggleAllCategories)
      );
    }

    if (this.settings.enabled.includes('solo-mode')) {
      toggleContainer.append(
        $('<input>', {
          id: 'cat-solo-mode',
          type: 'checkbox',
          checked: getToolkitStorageKey('catSoloMode') === 'checked',
        }).on('click', this.initializeState)
      );
      toggleContainer.append(
        $('<label>', {
          class: 'button',
          for: 'cat-solo-mode',
          title: 'Only expand one master category at a time',
          text: 'Solo Mode ',
        })
      );

      $('.js-budget-table-cell-collapse').on('click', this.toggleCategory);
    }

    const filterCategoriesWrapper = $('.tk-categories-filter-wrapper');
    if (filterCategoriesWrapper.length) {
      $(filterCategoriesWrapper).after(toggleContainer);
    } else {
      $('.budget-toolbar').prepend(toggleContainer);
    }

    this.initializeState();
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
