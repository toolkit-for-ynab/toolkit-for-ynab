import { Feature } from 'toolkit/extension/features/feature';
import { l10n } from 'toolkit/extension/utils/toolkit';
import { getAccountsService } from 'toolkit/extension/utils/ynab';

export class ImportNotification extends Feature {
  isActive = false;

  importClass = 'ynabtk-import-notification-underline';

  injectCSS() {
    return require('./index.css');
  }

  willInvoke() {
    if (this.settings.enabled !== '0') {
      if (this.settings.enabled === '2') {
        this.importClass += '-red';
      }

      // Hook transaction imports so that we can run our stuff when things change. The idea is for our code to
      // run when new imports show up while the user isn't doing anything in the app. The down side is the
      // handler being called when the user does something like "approve a transaction". That's why this feature
      // has a blocking mechanism (the isActive flag).
      ynab.YNABSharedLib.defaultInstance.entityManager._transactionEntityPropertyChanged.addHandler(
        this.invoke
      );
    }
  }

  shouldInvoke() {
    return !this.isActive;
  }

  invoke = () => {
    this.checkImportTransactions();
  };

  destroy() {
    $(`.nav-account-row .nav-account-name.${this.importClass}`)
      .removeAttr('title')
      .removeClass(this.importClass);
  }

  observe(changedNodes) {
    if (!this.shouldInvoke()) return;
    // To minimize checking for imported transactions, only do it if the changed nodes includes ynab-grid-body
    // if we're not already actively check.
    if (changedNodes.has('ynab-grid-body') && !this.shouldInvoke()) {
      this.invoke();
    }
  }

  onRouteChanged() {
    if (this.shouldInvoke()) {
      this.invoke();
    }
  }

  checkImportTransactions() {
    this.isActive = true;

    $('.nav-account-row').each((_, element) => {
      const account = getAccountsService().activeAccounts.find(({ itemId }) => {
        return itemId === element.dataset.accountId;
      });
      if (!account) {
        return;
      }

      let accountName = $('.nav-account-name', element);
      if (accountName.length) {
        // Remove the title attribute and our underline class in case the account no longer has txns to be imported
        $(accountName).removeAttr('title').removeClass(this.importClass);

        let currentTitle = $(element).find('.nav-account-name').prop('title');

        // Check for both functions should be temporary until all users have been switched to new bank data
        // provider but of course we have no good way of knowing when that has occurred.
        if (account.isDirectImportActive) {
          let t = new ynab.managers.DirectImportManager(
            ynab.YNABSharedLib.defaultInstance.entityManager,
            account
          );
          let transactions = t.getImportTransactionsForAccount(account);

          const toBeImported =
            transactions.length === 1
              ? l10n('toolkit.importNotification', 'transaction to be imported.')
              : l10n('toolkit.importNotificationMany', 'transactions to be imported.');

          if (transactions.length >= 1) {
            $(accountName)
              .addClass(this.importClass)
              .attr('title', `${currentTitle} - ${transactions.length} ${toBeImported}`);
          }
        }
      }
    });

    this.isActive = false;
  }
}
