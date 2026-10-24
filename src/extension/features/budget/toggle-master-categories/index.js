import { Feature } from 'toolkit/extension/features/feature';
import { getBudgetService, isCurrentRouteBudgetPage } from 'toolkit/extension/utils/ynab';
import { controllerLookup } from 'toolkit/extension/utils/ember';
import { getToolkitStorageKey, setToolkitStorageKey } from 'toolkit/extension/utils/toolkit';
import { getBudgetMonthDisplayMasterCategory } from '../utils';

const SOLO_ROW_TOGGLE_SELECTOR = '.budget-table-row.is-master-category .budget-table-cell-collapse';

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
      this.handleToggleSoloMode,
    );
    $(document).off('click', SOLO_ROW_TOGGLE_SELECTOR, this.handleRowExpandedToggle);
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
        !this.isAnyCategoryCollapsed,
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
      $(document).off('click', SOLO_ROW_TOGGLE_SELECTOR, this.handleRowExpandedToggle);
    } else {
      event.currentTarget.dataset.tkCategoryToggle = 'solo';
      setToolkitStorageKey('catSoloMode', true);
      this.enableSoloCategoryMode();
    }

    this.updateToggleIcon();
  };

  enableSoloCategoryMode() {
    // delegate so rows YNAB re-renders keep the handler
    $(document).off('click', SOLO_ROW_TOGGLE_SELECTOR, this.handleRowExpandedToggle);
    $(document).on('click', SOLO_ROW_TOGGLE_SELECTOR, this.handleRowExpandedToggle);

    controllerLookup('budget').send('toggleCollapseMasterCategories', true);
  }

  updateToggleIcon() {
    let $toggle = $('#tk-master-category-toggle');
    if (!$toggle.length) {
      $toggle =
        $(`<svg id="tk-master-category-toggle" className="ynab-new-icon" width="10" height="10">
          <use id="tk-master-category-toggle-direction" href="#icon_sprite_caret_down" />
        </svg>`);
    }

    const isSoloModeEnabled = getToolkitStorageKey('catSoloMode', false);
    if (isSoloModeEnabled) {
      $('#tk-master-category-toggle-direction', $toggle).attr('href', '#icon_sprite_subtract');
    } else {
      $('#tk-master-category-toggle-direction', $toggle).attr(
        'href',
        `#icon_sprite_caret_${this.isAnyCategoryCollapsed ? 'right' : 'down'}`,
      );
    }

    $('.budget-table-header .budget-table-cell-collapse').html($toggle);
  }

  handleRowExpandedToggle = (event) => {
    if (!getToolkitStorageKey('catSoloMode', false)) {
      return;
    }

    const masterCategory = getBudgetMonthDisplayMasterCategory(event.currentTarget.parentElement);
    if (!masterCategory) {
      return;
    }

    // YNAB's own collapse button already toggles the clicked group, so only
    // collapse the others. Toggling the clicked group here as well undid YNAB's
    // toggle, and setting the others to `false` expanded them instead.
    getBudgetService().budgetMonthDisplayItems.forEach((item) => {
      if (!item.isMasterCategory) {
        return;
      }

      if (item?.masterCategory?.entityId !== masterCategory.categoryId) {
        item.isCollapsed = true;
      }
    });
  };
}
