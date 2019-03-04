import { Feature } from 'toolkit/extension/features/feature';
import { isCurrentRouteAccountsPage } from 'toolkit/extension/utils/ynab';

export class AutomaticallyMarkAsCleared extends Feature {
  shouldInvoke() {
    return isCurrentRouteAccountsPage();
  }

  observe(changedNodes) {
    if (!changedNodes.has('flaticon copyright solid')) return;

    if (this.shouldInvoke()) {
      this.invoke();
    }
  }

  invoke() {
    // Calling click at DOM node and not jQuery because jQuery sometimes doesn't work properly
    let $markClearedButton = $('.is-adding .ynab-cleared:not(.is-cleared)');
    if ($markClearedButton.length !== 0) {
      $markClearedButton[0].click();
    }
  }
}
