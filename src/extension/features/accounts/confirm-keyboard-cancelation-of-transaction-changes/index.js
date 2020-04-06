import { Feature } from 'toolkit/extension/features/feature';
import { isCurrentRouteAccountsPage } from 'toolkit/extension/utils/ynab';
import { l10n } from 'toolkit/extension/utils/toolkit';

export class ConfirmKeyboardCancelationOfTransactionChanges extends Feature {
  shouldInvoke() {
    return isCurrentRouteAccountsPage() && $('.ynab-grid-body-row .is-editing').length > 0;
  }

  invoke() {
    const $cancelButton = $('.ynab-grid-actions-buttons .button.button-cancel');
    const confirmationText = l10n(
      'toolkit.confirmCancelationOfTransactionChanges',
      'Discard changes to this transaction?'
    );
    const guardedKeydownEventCode = 'Enter';

    $cancelButton.on('keydown', e => {
      if (e.code !== guardedKeydownEventCode) return;
      if (window.confirm(confirmationText)) return;

      e.preventDefault();
      e.stopPropagation();
    });
  }

  observe(changedNodes) {
    if (!this.shouldInvoke()) return;

    if (changedNodes.has('button button-cancel')) {
      this.invoke();
    }
  }
}
