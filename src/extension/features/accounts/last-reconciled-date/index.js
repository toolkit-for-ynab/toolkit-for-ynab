import { Feature } from 'toolkit/extension/features/feature';
import { isCurrentRouteAccountsPage } from 'toolkit/extension/utils/ynab';
import { controllerLookup } from 'toolkit/extension/utils/ember';
import { getEntityManager } from 'toolkit/extension/utils/ynab';
const YNAB_ACCOUNTS_HEADER_RIGHT = '.accounts-header-balances-right';
const TK_LAST_RECONCILED_ID = 'tk-last-reconciled-date';

export class LastReconciledDate extends Feature {
  injectCSS() {
    return require('./styles.css');
  }

  shouldInvoke() {
    let { selectedAccountId } = controllerLookup('accounts');
    return selectedAccountId && isCurrentRouteAccountsPage();
  }

  invoke() {
    // Get the current account id and calculate the last reconciled date
    let { selectedAccountId } = controllerLookup('accounts');
    let latestDate = this._calculateLastReconciledDate(selectedAccountId);
    let textToShow = 'NA';
    if (latestDate) {
      textToShow = ynab.YNABSharedLib.dateFormatter.formatDateExpanded(latestDate.utc());
    }
    // Retrieve or create the reconcile date container
    let dateContainer = $(`#${TK_LAST_RECONCILED_ID}`);
    if (!dateContainer || dateContainer.length === 0) {
      $(YNAB_ACCOUNTS_HEADER_RIGHT).append(
        `<div class="tk-accounts-header-last-reconciled">
        <span id="${TK_LAST_RECONCILED_ID}">${textToShow}</span>
        <div class="tk-accounts-header-last-reconciled-label">Last Reconciled Date</div>
      </div>`
      );
    }

    // Update the reconcile date in the element
    dateContainer.text(textToShow);
    this._setFeatureVisibility(true);
  }

  onRouteChanged() {
    if (this.shouldInvoke()) {
      this.invoke();
    } else {
      this._setFeatureVisibility(false);
    }
  }

  observe(changedNodes) {
    if (!this.shouldInvoke()) return;

    // When the reconciled icon changes, reevaluate our date
    if (changedNodes.has('is-reconciled-icon svg-icon lock')) {
      this.invoke();
    }
  }

  /**
   * Calculate the last reconciled date
   * @param {String} accountId The account id to get the reconciled date for
   * @returns {Moment} the latest date, null otherwise
   */
  _calculateLastReconciledDate = accountId => {
    const account = getEntityManager().getAccountById(accountId);

    let reconciledDates = account
      .getTransactions()
      .filter(transaction => transaction.date && transaction.isReconciled())
      .map(transaction => moment(transaction.date.getUTCTime()));

    return reconciledDates.length ? moment.max(reconciledDates) : null;
  };

  /**
   * Helper method to show and hide the reconcile date container
   * @param {Boolean} visible True to show the container, false to hide
   */
  _setFeatureVisibility = visible => {
    let featureContainer = $('.tk-accounts-header-last-reconciled');
    if (featureContainer && featureContainer.length) {
      featureContainer.toggle(visible);
    }
  };
}
