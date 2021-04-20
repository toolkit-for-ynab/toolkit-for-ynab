import { Feature } from 'toolkit/extension/features/feature';
import { isCurrentRouteAccountsPage } from 'toolkit/extension/utils/ynab';
import { controllerLookup } from 'toolkit/extension/utils/ember';

export class DeselectTransactionsOnSave extends Feature {
  shouldInvoke() {
    return isCurrentRouteAccountsPage() && $('.ynab-grid-body-row .is-editing').length > 0;
  }

  invoke() {
    // locate save button
    const $saveButton = $('.ynab-grid-actions-buttons .button.button-primary:not(.button-another');

    // attach an event handler when the save button is clicked
    $saveButton.on('click', () => {
      setTimeout(() => {
        controllerLookup('accounts').areChecked.setEach('isChecked', false);
      }, 0);
    });
  }

  observe(changedNodes) {
    if (!this.shouldInvoke()) return;

    if (changedNodes.has('ynab-grid-body')) {
      this.invoke();
    }
  }
}
