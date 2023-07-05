import { Feature } from 'toolkit/extension/features/feature';
import { getEntityManager } from 'toolkit/extension/utils/ynab';

const TOOLKIT_RECONCILED_CLASS = 'tk-is-reconciled';
const YNAB_IS_CHECKED_CLASS = 'is-checked';
const YNAB_GRID_BODY_SUB_CLASS = 'ynab-grid-body-sub';

export class ReconciledTextColor extends Feature {
  injectCSS() {
    if (this.settings.enabled === '1') {
      return require('./green.css');
    }
    if (this.settings.enabled === '2') {
      return require('./lightgray.css');
    }
    if (this.settings.enabled === '3') {
      return require('./darkgray.css');
    }
    if (this.settings.enabled === '4') {
      return require('./darkgraybg.css');
    }
  }

  shouldInvoke() {
    return true;
  }

  invoke() {
    const gridRows = document.querySelectorAll('.ynab-grid-body-row');
    gridRows.forEach((row) => {
      if (row.dataset && row.dataset.rowId) {
        this.addClass(row);
      }
    });
  }

  observe() {
    if (document.querySelector('.ynab-grid-body') !== null) {
      this.invoke();
    }
  }

  destroy() {
    $(`.${TOOLKIT_RECONCILED_CLASS}`).removeClass(TOOLKIT_RECONCILED_CLASS);
  }

  addClass(element) {
    const $element = $(element);

    let transaction;
    if (element.dataset && element.dataset.rowId) {
      transaction = getEntityManager().getTransactionById(element.dataset.rowId);
    }

    if (!transaction) {
      return;
    }

    const isChecked = $element.hasClass(YNAB_IS_CHECKED_CLASS);
    const isReconciled = transaction.cleared === ynab.constants.TransactionState.Reconciled;

    if (isChecked) {
      $element.removeClass(TOOLKIT_RECONCILED_CLASS);
    } else if (!isChecked && isReconciled) {
      $element.addClass(TOOLKIT_RECONCILED_CLASS);
    }

    // I'm not sure how intensive it would be to go find the IDs of sub transactions in a
    // split so rather than do that, just continue down the line of sub transactions after
    // a split and update the classes accordingly
    if (transaction.isSplit) {
      let $nextTransaction = $element.next();
      while ($nextTransaction.hasClass(YNAB_GRID_BODY_SUB_CLASS)) {
        if (isChecked) {
          $nextTransaction.removeClass(TOOLKIT_RECONCILED_CLASS);
        } else if (!isChecked && isReconciled) {
          $nextTransaction.addClass(TOOLKIT_RECONCILED_CLASS);
        }

        $nextTransaction = $nextTransaction.next();
      }
    }
  }
}
