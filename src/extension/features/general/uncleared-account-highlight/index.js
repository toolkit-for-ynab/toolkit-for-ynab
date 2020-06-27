import { Feature } from 'toolkit/extension/features/feature';

const INDICATOR_CLASS = 'tk-uncleared-account-indicator';
const INDICATOR_SELECTOR = `div.${INDICATOR_CLASS}`;
const INDICATOR_ELEMENT = `<div class="${INDICATOR_CLASS} flaticon solid copyright"></div>`;

export class UnclearedAccountHighlight extends Feature {
  injectCSS() {
    return require('./index.css');
  }

  shouldInvoke() {
    return true;
  }

  invoke() {
    this.updateUnclearedIndicatorOnSidebarAccounts();
  }

  async updateUnclearedIndicatorOnSidebarAccounts() {
    const accountMap = await this.buildAccountMap();

    Object.values(accountMap).forEach(account => {
      const accountNameElement = $(`div.nav-account-name.user-data[title="${account.name}"]`);
      const accountContainer = accountNameElement.parent();
      const accountBalanceElement = accountContainer.children('.nav-account-value.user-data');
      const isPositiveAccountBalance =
        accountContainer
          .children('.nav-account-value.user-data')
          .children('.user-data.currency.positive').length > 0;
      const isIndicatorShowing = accountContainer.children(INDICATOR_SELECTOR).length !== 0;
      const shouldShowIndicator = account.unclearedTransactions.length > 0;

      if (shouldShowIndicator) {
        if (!isIndicatorShowing) {
          accountBalanceElement.after(INDICATOR_ELEMENT);
        }

        if (isPositiveAccountBalance) {
          // If the indicator is next to a positive balance, we need to do some layout tweaks
          accountBalanceElement.next().addClass('tk-uncleared-account-indicator-positive');
        }
      } else {
        accountContainer.children(INDICATOR_SELECTOR).remove();
        accountBalanceElement.next().removeClass('tk-uncleared-account-indicator-positive');
      }
    });
  }

  async getAllVisibleAccounts() {
    const sidebarViewModel = await ynab.YNABSharedLib.getBudgetViewModel_SidebarViewModel();
    const allAccounts = sidebarViewModel.allAccounts;

    if (!allAccounts) return [];

    return allAccounts.filter(account => !account.hidden);
  }

  async getAllVisibleTransactions() {
    const allAccountTransactionsViewModel = await ynab.YNABSharedLib.getBudgetViewModel_AllAccountTransactionsViewModel();
    const allVisibleTransactions = allAccountTransactionsViewModel.visibleTransactionDisplayItems;

    if (!allVisibleTransactions) return [];

    return allVisibleTransactions;
  }

  /**
   * Returns a map keyed by account IDs, with each element containing an account name,
   * and a list of uncleared transactions.
   *
   * Example:
   *
   * {
   *   '43dcbff6-ccf4-4367-9d13-d6d7e9beec39': {
   *     name: "Bank Account Name",
   *     unclearedTransactions: []
   *   }
   * }
   */
  async buildAccountMap() {
    let accountMap = {};

    const accounts = await this.getAllVisibleAccounts();
    accounts.forEach(account => {
      accountMap[account.entityId] = {
        name: account.accountName,
        unclearedTransactions: [],
      };
    });

    const transactions = await this.getAllVisibleTransactions();
    transactions.forEach(transaction => {
      if (!transaction.account.hidden && this.isUnclearedTransaction(transaction)) {
        accountMap[transaction.account.entityId].unclearedTransactions.push(transaction);
      }
    });

    return accountMap;
  }

  isUnclearedTransaction(transaction) {
    return (
      transaction &&
      transaction.cleared !== ynab.constants.TransactionState.Cleared &&
      transaction.cleared !== ynab.constants.TransactionState.Reconciled &&
      transaction.displayItemType !== ynab.constants.TransactionDisplayItemType.SubTransaction &&
      transaction.displayItemType !==
        ynab.constants.TransactionDisplayItemType.ScheduledTransaction &&
      transaction.displayItemType !==
        ynab.constants.TransactionDisplayItemType.ScheduledSubTransaction
    );
  }

  observe(changedNodes) {
    if (!this.shouldInvoke()) return;

    // We want to invoke when the user expands the budget account list
    if (changedNodes.has('svg-icon chevronDown')) {
      this.invoke();
    }
  }

  onRouteChanged() {
    if (this.shouldInvoke()) {
      this.invoke();
    }
  }
}
