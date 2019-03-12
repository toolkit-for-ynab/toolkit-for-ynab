import { Feature } from 'toolkit/extension/features/feature';
import { controllerLookup } from 'toolkit/extension/utils/ember';
import { l10n } from 'toolkit/extension/utils/toolkit';
import {
  getSelectedMonth,
  isCurrentRouteBudgetPage,
  transitionTo,
} from 'toolkit/extension/utils/ynab';

/**
 * Adds a click handler to the "TOTAL INFLOW" inspector area.
 */
export class LinkToInflows extends Feature {
  injectCSS() {
    return require('./index.css');
  }

  shouldInvoke() {
    return isCurrentRouteBudgetPage();
  }

  onRouteChanged() {
    if (this.shouldInvoke()) {
      this.invoke();
    }
  }

  /**
   * Add the wrapper element to the TOTAL INFLOWS inspector area.
   */
  invoke() {
    const budgetInspector = $('.budget-inspector');

    // Attempt to target the english string, `TOTAL INFLOWS`, but if that's not
    // found, try the localized version of the string.
    const englishHeading = 'TOTAL INFLOWS';
    const localizedHeading = l10n('inspector.totalIncome', englishHeading);
    const inflowsHeadingEl =
      budgetInspector.find(`h3:contains(${englishHeading})`)[0] ||
      budgetInspector.find(`h3:contains(${localizedHeading})`)[0];

    $(inflowsHeadingEl)
      .next()
      .andSelf()
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

    if (controller.filters) {
      controller.filters.resetFilters();
    }

    controller.set('searchText', `Income: ${month.format('MMMM YYYY')}`);
    transitionTo('accounts');
  }
}
