import { Feature } from 'toolkit/extension/features/feature';
import { addToolkitEmberHook } from 'toolkit/extension/utils/toolkit';
import { getEmberView } from 'toolkit/extension/utils/ember';

const TOOLKIT_RECONCILED_CLASS = 'tk-is-reconciled';
const YNAB_IS_CHECKED_CLASS = 'is-checked';
const YNAB_GRID_BODY_SUB_CLASS = 'ynab-grid-body-sub';

export class ReconciledTextColor extends Feature {
  injectCSS() {
    if (ynabToolKit.options.ReconciledTextColor === '1') {
      return require('./green.css');
    }
    if (ynabToolKit.options.ReconciledTextColor === '2') {
      return require('./lightgray.css');
    }
    if (ynabToolKit.options.ReconciledTextColor === '3') {
      return require('./darkgray.css');
    }
    if (ynabToolKit.options.ReconciledTextColor === '4') {
      return require('./darkgraybg.css');
    }
  }

  shouldInvoke() {
    return true;
  }

  invoke() {
    addToolkitEmberHook(this, 'register/grid-sub', 'didInsertElement', this.addClass);
    addToolkitEmberHook(this, 'register/grid-row', 'didInsertElement', this.addClass);

    addToolkitEmberHook(this, 'register/grid-sub', 'didUpdate', this.addClass);
    addToolkitEmberHook(this, 'register/grid-row', 'didUpdate', this.addClass);
  }

  addClass(element) {
    let content;
    const emberView = getEmberView(element.id);
    if (emberView) {
      content = emberView.content;
    }

    const $element = $(element);
    const isChecked = $element.hasClass(YNAB_IS_CHECKED_CLASS);
    const isReconciled = content.cleared === ynab.constants.TransactionState.Reconciled;

    if (isChecked) {
      $element.removeClass(TOOLKIT_RECONCILED_CLASS);
    } else if (!isChecked && isReconciled) {
      $element.addClass(TOOLKIT_RECONCILED_CLASS);
    }

    // I'm not sure how intensive it would be to go find the IDs of sub transactions in a
    // split so rather than do that, just continue down the line of sub transactions after
    // a split and update the classes accordingly
    if (content.isSplit) {
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
