import { Feature } from 'toolkit/extension/features/feature';
import { isCurrentRouteAccountsPage } from 'toolkit/extension/utils/ynab';

export class SplitTransactionTabExpand extends Feature {
  shouldInvoke() {
    return isCurrentRouteAccountsPage();
  }

  invoke() {}

  // This used to run from an Ember render hook that no longer exists, which left
  // the feature doing nothing; re-attach whenever a split is being edited instead.
  observe() {
    if (!this.shouldInvoke()) return;
    if (!document.querySelector('.ynab-grid-split-add-sub-transaction')) return;

    const lastInput = $('.ynab-grid-body-row.is-editing input').last();
    if (!lastInput.length || lastInput.attr('data-toolkit-tab-expand')) return;

    this.addEventListeners();
  }

  destroy() {
    const inputs = $('input[data-toolkit-tab-expand]');
    inputs.off('keydown', this.applyNewTabBehavior);
    inputs.removeAttr('data-toolkit-tab-expand');
  }

  addEventListeners() {
    const previousInputs = $('input[data-toolkit-tab-expand]');
    previousInputs.removeAttr('data-toolkit-tab-expand');
    previousInputs.off('keydown', this.applyNewTabBehavior);

    const lastInput = $('.ynab-grid-body-row.is-editing input').last();
    lastInput.attr('data-toolkit-tab-expand', true);
    lastInput.on('keydown', this.applyNewTabBehavior);
  }

  applyNewTabBehavior(event) {
    // If tab was pressed, simulate a mouse click on the "Add another split" button
    if (event.keyCode === 9 && !event.shiftKey) {
      $(event.target).trigger('blur');

      let addSplitButton = $('.ynab-grid-split-add-sub-transaction');
      if (addSplitButton.length !== 0) {
        // The YNAB app checks the detail property isn't 0, so .click() won't work
        const clickEvent = new jQuery.Event('click', { detail: 1 });
        addSplitButton.trigger(clickEvent);
      }
    }
  }
}
