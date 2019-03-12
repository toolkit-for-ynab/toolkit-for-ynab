import { Feature } from 'toolkit/extension/features/feature';
import { isCurrentRouteBudgetPage } from 'toolkit/extension/utils/ynab';
import { l10n } from 'toolkit/extension/utils/toolkit';

/**
 * Hides the "Total Available" section of the budget inspector.
 */
export class HideTotalAvailable extends Feature {
  shouldInvoke() {
    return isCurrentRouteBudgetPage();
  }

  onRouteChanged() {
    if (this.shouldInvoke()) {
      this.invoke();
    }
  }

  invoke() {
    const budgetInspector = $('.budget-inspector');

    // Attempt to target the english string, `TOTAL AVAILABLE`, but if that's not
    // found, try the localized version of the string.
    const englishHeading = 'TOTAL AVAILABLE';
    const localizedHeading = l10n('inspector.totalAvailable', englishHeading);
    const headingEl =
      budgetInspector.find(`h3:contains(${englishHeading})`)[0] ||
      budgetInspector.find(`h3:contains(${localizedHeading})`)[0];

    $(headingEl)
      .nextUntil('h3')
      .andSelf()
      .addClass('hidden');
  }
}
