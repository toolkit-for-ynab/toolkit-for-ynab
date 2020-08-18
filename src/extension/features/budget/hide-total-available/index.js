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
    const localizedHeading = l10n('inspector.totalAvailable', 'TOTAL AVAILABLE');
    const headingEl = $(element).find(`h3:contains(${localizedHeading})`)[0];

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
