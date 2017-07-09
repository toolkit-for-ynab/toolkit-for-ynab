import { Feature } from 'core/feature';

export class ImportNotification extends Feature {
  injectCSS() { return require('./index.css'); }

  constructor() {
    super();
    this.isActive = false;
    this.importClass = 'import-notification';
    this.invoke = this.invoke.bind(this);
  }

  willInvoke() {
    if (this.settings.enabled !== '0') {
      if (this.settings.enabled === '2') {
        this.importClass += '-red';
      }

      // Hook transaction imports so that we can run our stuff when things change
      ynab.YNABSharedLib.defaultInstance.entityManager._transactionEntityPropertyChanged.addHandler(this.invoke);
    }
  }

  shouldInvoke() {
    return this.settings.enabled !== '0';
  }

  invoke() {
    if (!this.isActive) {
      this.checkImportTransactions();
    }
  }

  observe(changedNodes) {
    if (!this.shouldInvoke()) return;

    // Don't call invoke() if the changed node is a result of us adding or removing
    // the notification class in checkImportTransactions().
    if (!changedNodes.has('nav-account-notification') && !this.isActive) {
      this.invoke();
    }
  }

  checkImportTransactions() {
    this.isActive = true;

    $('.' + this.importClass).remove();
    $('.nav-account-row').each((index, row) => {
      let account = ynabToolKit.shared.getEmberView($(row).attr('id')).get('data');

      // Check for both functions should be temporary until all users have been switched to new bank data
      // provider but of course we have no good way of knowing when that has occurred.
      if (typeof account.getDirectConnectEnabled === 'function' && account.getDirectConnectEnabled() ||
          typeof account.getIsDirectImportActive === 'function' && account.getIsDirectImportActive()) {
        let t = new ynab.managers.DirectImportManager(ynab.YNABSharedLib.defaultInstance.entityManager, account);
        let transactions = t.getImportTransactionsForAccount(account);
        if (transactions.length >= 1) {
          $(row)
            .find('.nav-account-notification')
            .append('<a class="notification ' + this.importClass + '">' + transactions.length + '</a>');
        }
      }
    });

    this.isActive = false;
  }
}
