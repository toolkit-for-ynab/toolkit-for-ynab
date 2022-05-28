import { Feature } from 'toolkit/extension/features/feature';
import { getEmberView } from 'toolkit/extension/utils/ember';
import { isCurrentRouteAccountsPage } from 'toolkit/extension/utils/ynab';

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
    return isCurrentRouteAccountsPage();
  }

  invoke() {
    this.onElements('.ynab-grid-body-row', this.addClass);
  }

  observe() {
    this.onElements('.ynab-grid-body-row', this.addClass);
  }

  destroy() {
    $(`.${TOOLKIT_RECONCILED_CLASS}`).removeClass(TOOLKIT_RECONCILED_CLASS);
  }

  addClass(element) {
    const content = getEmberView(element.id, 'content');
    if (!content) {
      return;
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
