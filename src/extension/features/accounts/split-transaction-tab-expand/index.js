import { Feature } from 'toolkit/extension/features/feature';
import { isCurrentRouteAccountsPage } from 'toolkit/extension/utils/ynab';

export class SplitTransactionTabExpand extends Feature {
  shouldInvoke() {
    return isCurrentRouteAccountsPage();
  }

  invoke() {}

  applyNewTabBehavior(event) {
    // If tab was pressed, simulate a mouse click on the "Add another split" button
    if (event.keyCode === 9) {
      let addSplitButton = $('.ynab-grid-split-add-sub-transaction');
      if (addSplitButton.length !== 0) {
        // The YNAB app checks the detail property isn't 0, so .click() won't work
        const clickEvent = new jQuery.Event('click', { detail: 1 });
        addSplitButton.trigger(clickEvent);
      }
    }
  }

  observe() {
    if (!this.shouldInvoke()) return;
    if ($('.ynab-grid-split-add-sub-transaction').length === 0) return;

    const addTransactionGrid = $('.ynab-grid-add-rows');
    const lastInput = $('input', addTransactionGrid).last();

    if (!lastInput.attr('data-toolkit-tab-expand')) {
      lastInput.attr('data-toolkit-tab-expand', true);
      lastInput.on('keydown', this.applyNewTabBehavior);
    }
  }
}
