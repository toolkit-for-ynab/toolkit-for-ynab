import { Feature } from 'toolkit/extension/features/feature';

export class SplitTransactionTabExpand extends Feature {
  shouldInvoke() {
    return true;
  }

  invoke() {
    this.addToolkitEmberHook('register/grid-split', 'didRender', this.addEventListeners);
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
