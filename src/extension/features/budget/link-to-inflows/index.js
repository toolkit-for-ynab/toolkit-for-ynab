import { Feature } from 'toolkit/extension/features/feature';
import { controllerLookup } from 'toolkit/extension/utils/ember';
import { addToolkitEmberHook, l10n } from 'toolkit/extension/utils/toolkit';
import { getSelectedMonth, transitionTo } from 'toolkit/extension/utils/ynab';

/**
 * Adds a click handler to the "TOTAL INFLOW" inspector area.
 */
export class LinkToInflows extends Feature {
  injectCSS() {
    return require('./index.css');
  }

  shouldInvoke() {
    return true;
  }

  /**
   * Add the wrapper element to the TOTAL INFLOWS inspector area.
   */
  invoke() {
    addToolkitEmberHook(
      this,
      'budget/inspector/default-inspector',
      'didRender',
      this._addTotalInflowsLink
    );
  }

  _addTotalInflowsLink(element) {
    const budgetInspector = $(element);

    // Attempt to target the english string, `TOTAL INFLOWS`, but if that's not
    // found, try the localized version of the string.
    const localizedHeading = l10n('inspector.totalIncome', 'TOTAL INFLOWS');
    const inflowsHeadingEl = budgetInspector.find(`h3:contains(${localizedHeading})`)[0];

    $(inflowsHeadingEl)
      .next()
      .addBack()
      .wrapAll('<span class="toolkit-total-inflows" />');

    $('.toolkit-total-inflows').click(this.onClick);
  }

  /**
   * Handle the click on TOTAL INFLOWS. Set the search field and navigate
   * to the accounts route.
   */
  onClick() {
    const month = getSelectedMonth();
    const controller = controllerLookup('accounts');
    const filters = controller.get('filters');

    if (filters) {
      filters.resetFilters();
    }

    controller.set('searchText', `Income: ${month.format('MMMM YYYY')}`);
    transitionTo('accounts');
  }
}
