import { Feature } from 'toolkit/extension/features/feature';

import { getAccountsService } from 'toolkit/extension/utils/ynab';

const INDICATOR_CLASS = 'tk-uncleared-account-indicator';
const INDICATOR_ELEMENT = `<div class="${INDICATOR_CLASS} flaticon solid copyright"></div>`;

export class UnclearedAccountHighlight extends Feature {
  injectCSS() {
    return require('./index.css');
  }

  shouldInvoke() {
    return true;
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

  updateSidebarIndicator(element) {
    // the nav-account-icons-right container is hard-coded as 1rem, when we add the
    // cleared icon to it, that's not enough space if there's already an icon in the space
    // so we need to add a class which overrides it to 2rem.
    let hasAnyClearedIndicator = false;
    let hasOtherNavAccountRightIcons = false;
    const navAccounts = element.querySelectorAll('.nav-account-row');

    navAccounts.forEach((navAccount) => {
      const account = getAccountsService().activeAccounts.find(({ itemId }) => {
        return itemId === element.dataset.accountId;
      });
      if (!account) {
        return;
      }

      const accountCalculation = account.getAccountCalculation();
      const shouldShowIndicator = !!accountCalculation.unclearedBalance;
      const isIndicatorShowing = navAccount.querySelector(`.${INDICATOR_CLASS}`) !== null;
      const navAccountIconsRight = navAccount.querySelector('.nav-account-icons-right');

      if ($(navAccountIconsRight).children(`:not(.${INDICATOR_CLASS})`).length) {
        hasOtherNavAccountRightIcons = true;
      }

      if (shouldShowIndicator) {
        hasAnyClearedIndicator = true;

        if (!isIndicatorShowing) {
          $(navAccountIconsRight).append(INDICATOR_ELEMENT);
        }
      } else if (isIndicatorShowing) {
        navAccount.querySelector(`.${INDICATOR_CLASS}`).remove();
      }
    });

    if (hasAnyClearedIndicator && hasOtherNavAccountRightIcons) {
      element.classList.add('tk-nav-account-icons-right-space');
    } else {
      element.classList.remove('tk-nav-account-icons-right-space');
    }
  }

  invoke() {
    this.addToolkitEmberHook('accounts-list', 'didRender', this.updateSidebarIndicator);
  }

  destroy() {
    $(`.nav-account-row .${INDICATOR_CLASS}`).remove();
    $('.tk-nav-account-icons-right-space').removeClass('tk-nav-account-icons-right-space');
  }
}
