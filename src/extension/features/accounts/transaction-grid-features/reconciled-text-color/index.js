import { TransactionGridFeature } from '../feature';
import { isCurrentRouteAccountsPage } from 'toolkit/extension/utils/ynab';

const TOOLKIT_RECONCILED_CLASS = 'toolkit-is-reconciled';
const YNAB_IS_CHECKED_CLASS = 'is-checked';
const YNAB_GRID_BODY_ROW_CLASS = 'ynab-grid-body-row';
const YNAB_GRID_BODY_SUB_CLASS = 'ynab-grid-body-sub';

export class ReconciledTextColor extends TransactionGridFeature {
  injectCSS() {
    if (ynabToolKit.options.ReconciledTextColor === '1') {
      return require('./green.css');
    } else if (ynabToolKit.options.ReconciledTextColor === '2') {
      return require('./lightgray.css');
    } else if (ynabToolKit.options.ReconciledTextColor === '3') {
      return require('./darkgray.css');
    } else if (ynabToolKit.options.ReconciledTextColor === '4') {
      return require('./darkgraybg.css');
    }
  }

  shouldInvoke() {
    return isCurrentRouteAccountsPage();
  }

  didUpdate() {
    const isSubGridRow = this.get('_debugContainerKey') === 'component:register/grid-sub';
    const isGridRow = this.get('_debugContainerKey') === 'component:register/grid-row';

    // We only care about transaction and sub transaction rows
    if (isGridRow || isSubGridRow) {
      const content = this.get('content');
      const $element = $(this.element);
      const isChecked = $element.hasClass(YNAB_IS_CHECKED_CLASS);
      const isReconciled = content.get('cleared') === ynab.constants.TransactionState.Reconciled;

      if (isChecked) {
        $element.removeClass(TOOLKIT_RECONCILED_CLASS);
      } else if (!isChecked && isReconciled) {
        $element.addClass(TOOLKIT_RECONCILED_CLASS);
      }

      // I'm not sure how intensive it would be to go find the IDs of sub transactions in a
      // split so rather than do that, just continue down the line of sub transactions after
      // a split and update the classes accordingly
      if (content.get('isSplit')) {
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

  // Welcome to the City of Edge Case. Population: this feature.
  willInsertColumn() {
    const isSubGridRow = this.get('_debugContainerKey') === 'component:register/grid-sub';
    const isGridRow = this.get('_debugContainerKey') === 'component:register/grid-row';

    // We only care about transaction and sub transaction rows
    if (isGridRow || isSubGridRow) {
      const $element = $(this.element);
      let content = this.get('content');
      let isChecked = $element.hasClass(YNAB_IS_CHECKED_CLASS);

      // if we're looking at a sub transaction, we need to find the data for it's parent to
      // determine if it's been reconciled. we also need to use it's parent's element to
      // determine if it's been checked since sub transactions don't have check boxes. The
      // only reason we actually care about "checked" in `willInsertColumn` is because it's
      // possible the user toggles splits while having multiple things selected and we want
      // to make sure to handle the newly inserted rows properly. `willUpdate` won't catch this
      if (content.get('isSubTransaction')) {
        const parentEntityId = content.get('parentEntityId');

        content = content.getEntityManager().transactionsCollection.findItemByEntityId(parentEntityId);
        isChecked = $(`.${YNAB_GRID_BODY_ROW_CLASS}[data-row-id="${parentEntityId}"]`).hasClass(YNAB_IS_CHECKED_CLASS);
      }

      const isReconciled = content.get('cleared') === ynab.constants.TransactionState.Reconciled;
      if (isChecked) {
        $element.removeClass(TOOLKIT_RECONCILED_CLASS);
      } else if (!isChecked && isReconciled) {
        $element.addClass(TOOLKIT_RECONCILED_CLASS);
      }
    }
  }
}
