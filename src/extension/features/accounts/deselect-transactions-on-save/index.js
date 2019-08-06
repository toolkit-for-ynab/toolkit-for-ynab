import { Feature } from 'toolkit/extension/features/feature';
import { isCurrentRouteAccountsPage } from 'toolkit/extension/utils/ynab';

export class DeselectTransactionsOnSave extends Feature {
  shouldInvoke() {
    return isCurrentRouteAccountsPage() && $('.ynab-grid-body-row .is-editing').length > 0;
  }

  invoke() {
    // locate save button
    const $saveButton = $('.ynab-grid-actions-buttons .button.button-primary:not(.button-another');

    // attach an event handler when the save button is clicked
    $saveButton.on('click', function() {
      // use a very small timeout since deselect doesn't work until after the save
      setTimeout(function() {
        $('.ynab-grid-header-row .ynab-checkbox-button.is-checked').click();
      }, 5);
    });
  }

  observe(changedNodes) {
    if (!this.shouldInvoke()) return;

    if (changedNodes.has('ynab-grid-body')) {
      this.invoke();
    }
  }
}
