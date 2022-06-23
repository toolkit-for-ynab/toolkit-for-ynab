import { Feature } from 'toolkit/extension/features/feature';
import { isCurrentRouteAccountsPage } from 'toolkit/extension/utils/ynab';

export class AutomaticallyMarkAsCleared extends Feature {
  shouldInvoke() {
    return isCurrentRouteAccountsPage();
  }

  invoke() {
    let eventKeys = ['register/grid-edit', 'register/grid-split'];

    eventKeys.forEach((key) => {
      this.addToolkitEmberHook(key, 'didInsertElement', (element) => this.triggerCleared(element));
    });

    // Calling click at DOM node and not jQuery because jQuery sometimes doesn't work properly
  }

  triggerCleared(element) {
    const $buttons = $(element).children('.ynab-grid-cell-cleared').children('button');
    if ($buttons.length !== 0) {
      if ($($buttons[0]).hasClass('is-cleared')) {
        return;
      }
      $buttons[0].click();
    }
  }
}
