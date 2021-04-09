import { Feature } from 'toolkit/extension/features/feature';
import { isCurrentRouteAccountsPage } from 'toolkit/extension/utils/ynab';
import { controllerLookup } from 'toolkit/extension/utils/ember';
import { getEntityManager } from 'toolkit/extension/utils/ynab';
const YNAB_ACCOUNTS_HEADER_RIGHT = '.accounts-header-balances-right';
const TK_LAST_RECONCILED_ID = 'tk-last-reconciled-date';
const TK_DAYS_SINCE_RECONCILED_ID = 'tk-days-since-reconciled';

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

    // Handle days since reconciled
    if (this.settings.enabled.includes('days-since')) {
      let daysSinceTextToShow = 'NA days';

      if (latestDate) {
        let todaysDate = moment();
        let differenceInDays = todaysDate.diff(latestDate, 'days');
        if (differenceInDays === 1) {
          daysSinceTextToShow = differenceInDays + ' day';
        } else {
          daysSinceTextToShow = differenceInDays + ' days';
        }
      }

      let daysSinceContainer = this._createReconciledContainer(
        TK_DAYS_SINCE_RECONCILED_ID,
        daysSinceTextToShow,
        'Since Last Reconciled'
      );
      daysSinceContainer.children('span').text(daysSinceTextToShow);

      this._setFeatureVisibility(`#${TK_DAYS_SINCE_RECONCILED_ID}`, true);
    }

    // Handle date last reconciled
    if (this.settings.enabled.includes('last-date')) {
      let latestDateTextToShow = 'NA';
      if (latestDate) {
        latestDateTextToShow = ynab.YNABSharedLib.dateFormatter.formatDateExpanded(
          latestDate.utc()
        );
      }

      let latestDateContainer = this._createReconciledContainer(
        TK_LAST_RECONCILED_ID,
        latestDateTextToShow,
        'Last Reconciled Date'
      );

      latestDateContainer.children('span').text(latestDateTextToShow);
      this._setFeatureVisibility(`#${TK_LAST_RECONCILED_ID}`, true);
    }
  }

  onRouteChanged() {
    if (this.shouldInvoke()) {
      this.invoke();
    } else {
      this._setFeatureVisibility(`#${TK_LAST_RECONCILED_ID}`, false);
      this._setFeatureVisibility(`#${TK_DAYS_SINCE_RECONCILED_ID}`, false);
    }
  }

  observe(changedNodes) {
    if (!this.shouldInvoke()) return;

    if (
      changedNodes.has('modal-account-reconcile-reconciled') ||
      changedNodes.has('nav-account-value user-data') ||
      changedNodes.has('is-reconciled-icon svg-icon lock')
    ) {
      this.invoke();
    }
  }

  /**
   * Create the Reconciled Info Container
   * @param {String} id The id of the element
   * @param {String} text The Text to Show
   * @param {String} label The Label to Show
   * @returns JQuery Element
   */
  _createReconciledContainer(id, text, label) {
    let reconciledInfoContainer = $(`#${id}`);
    if (!reconciledInfoContainer || reconciledInfoContainer.length === 0) {
      $(YNAB_ACCOUNTS_HEADER_RIGHT).append(
        `<div id="${id}" class="tk-accounts-header-reconciled-info">
          <span>${text}</span>
          <div class="tk-accounts-header-reconciled-info-label">${label}</div>
        </div>`
      );
    }
    return reconciledInfoContainer;
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
   * Helper methods to show and hide the reconcile containers
   * @param {Container} featureContainer container to hide or show
   * @param {Boolean} visible True to show the container, false to hide
   */
  _setFeatureVisibility = (featureSelector, visible) => {
    let featureContainer = $(featureSelector);
    if (featureContainer && featureContainer.length) {
      featureContainer.toggle(visible);
    }
  };
}
