import { Feature } from 'toolkit/extension/features/feature';
import { getBudgetService, isCurrentRouteBudgetPage } from 'toolkit/extension/utils/ynab';
import { controllerLookup, getEmberView } from 'toolkit/extension/utils/ember';
import { getToolkitStorageKey, setToolkitStorageKey } from 'toolkit/extension/utils/toolkit';

export class ToggleMasterCategories extends Feature {
  get isAnyCategoryCollapsed() {
    const { budgetMonthDisplayItems } = getBudgetService();
    return budgetMonthDisplayItems.some(({ isCollapsed }) => isCollapsed);
  }

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

  destroy() {
    $('#tk-master-category-toggle').remove();
    $('.budget-table-header .budget-table-cell-collapse').off('click', this.handleToggleCategories);
    $('.budget-table-header .budget-table-cell-collapse').off(
      'contextmenu',
      this.handleToggleSoloMode
    );
    $('.budget-table-row.is-master-category .budget-table-cell-collapse').off(
      'click',
      this.handleRowExpandedToggle
    );
  }

  invoke() {
    const headerToggle = document.querySelector('.budget-table-header .budget-table-cell-collapse');
    headerToggle.dataset.tkCategoryToggle = this.settings.enabled;

    $(headerToggle).off('click', this.handleToggleCategories);
    $(headerToggle).off('contextmenu', this.handleToggleSoloMode);
    $(headerToggle).on('click', this.handleToggleCategories);
    $(headerToggle).on('contextmenu', this.handleToggleSoloMode);

    this.updateToggleIcon();

    if (getToolkitStorageKey('catSoloMode', false)) {
      this.enableSoloCategoryMode();
    }
  }

  handleToggleCategories = (event) => {
    if (getToolkitStorageKey('catSoloMode', false)) {
      this.handleToggleSoloMode(event);
    } else {
      controllerLookup('budget').send(
        'toggleCollapseMasterCategories',
        !this.isAnyCategoryCollapsed
      );
    }

    this.updateToggleIcon();
  };

  handleToggleSoloMode = (event) => {
    event.preventDefault();

    const isSoloModeEnabled = getToolkitStorageKey('catSoloMode', false);
    if (isSoloModeEnabled) {
      event.currentTarget.dataset.tkCategoryToggle = 'toggle';
      setToolkitStorageKey('catSoloMode', false);
      $('.budget-table-row.is-master-category .budget-table-cell-collapse').off(
        'click',
        this.handleRowExpandedToggle
      );
    } else {
      event.currentTarget.dataset.tkCategoryToggle = 'solo';
      setToolkitStorageKey('catSoloMode', true);
      this.enableSoloCategoryMode();
    }

    this.updateToggleIcon();
  };

  enableSoloCategoryMode() {
    $('.budget-table-row.is-master-category .budget-table-cell-collapse').on(
      'click',
      this.handleRowExpandedToggle
    );

    controllerLookup('budget').send('toggleCollapseMasterCategories', true);
    getBudgetService()
      .budgetMonthDisplayItems.find(({ isMasterCategory }) => isMasterCategory)
      ?.set('isCollapsed', false);
  }

  updateToggleIcon() {
    let $toggle = $('#tk-master-category-toggle');
    if (!$toggle.length) {
      $toggle = $('<div>', {
        id: 'tk-master-category-toggle',
        class: 'flaticon stroke',
      });
    }

    const isSoloModeEnabled = getToolkitStorageKey('catSoloMode', false);
    if (isSoloModeEnabled) {
      $toggle.removeClass(['down', 'right']).addClass('minus');
    } else {
      $toggle
        .removeClass(['minus', this.isAnyCategoryCollapsed ? 'down' : 'right'])
        .addClass(this.isAnyCategoryCollapsed ? 'right' : 'down');
    }

    $('.budget-table-header .budget-table-cell-collapse').html($toggle);
  }

  handleRowExpandedToggle = (event) => {
    if (!getToolkitStorageKey('catSoloMode', false)) {
      return;
    }

    const clickedMasterCategoryId = getEmberView(event.currentTarget.parentElement.id)
      ?.masterCategory?.entityId;

    getBudgetService().budgetMonthDisplayItems.forEach((item) => {
      if (!item.isMasterCategory) {
        return;
      }

      if (item?.masterCategory?.entityId === clickedMasterCategoryId) {
        item.set('isCollapsed', false);
      } else {
        item.set('isCollapsed', true);
      }
    });
  };
}
