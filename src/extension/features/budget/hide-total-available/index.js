import { Feature } from 'toolkit/extension/features/feature';
import { l10n } from 'toolkit/extension/utils/toolkit';
import { addToolkitEmberHook } from 'toolkit/extension/utils/toolkit';

/**
 * Hides the "Total Available" section of the budget inspector.
 */
export class HideTotalAvailable extends Feature {
  shouldInvoke() {
    return true;
  }

  invoke() {
    addToolkitEmberHook(
      this,
      'budget/inspector/default-inspector',
      'didRender',
      this.hideTotalAvailable
    );
  }

  hideTotalAvailable(element) {
    // Attempt to target the english string, `TOTAL AVAILABLE`, but if that's not
    // found, try the localized version of the string.
    const englishHeading = 'TOTAL AVAILABLE';
    const localizedHeading = l10n('inspector.totalAvailable', englishHeading);
    const headingEl =
      $(element).find(`h3:contains(${englishHeading})`)[0] ||
      $(element).find(`h3:contains(${localizedHeading})`)[0];

    if ($(headingEl).hasClass('hidden')) {
      return;
    }

    $(headingEl)
      .nextUntil('hr')
      .addBack()
      .next()
      .addBack()
      .addClass('hidden');
  }
}
