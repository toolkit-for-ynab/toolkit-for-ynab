(function poll() {
  if (typeof ynabToolKit !== 'undefined' && ynabToolKit.actOnChangeInit === true) {
    ynabToolKit.importNotification = function () {
      $('.import-notification').remove();
      $('.nav-account-row').each(function (index, row) {
        var account = ynabToolKit.shared.getEmberView($(row).attr('id')).get('data');

        // Check for both functions should be temporary until all users have been switched to new bank data
        // provider but of course we have no good way of knowing when that has occurred.
        if (typeof account.getDirectConnectEnabled === 'function' && account.getDirectConnectEnabled() ||
            typeof account.getIsDirectImportActive === 'function' && account.getIsDirectImportActive()) {
          var t = new ynab.managers.DirectImportManager(ynab.YNABSharedLib.defaultInstance.entityManager, account);
          var transactions = t.getImportTransactionsForAccount(account);
          if (transactions.length >= 1) {
            $(row).find('.nav-account-notification').append('<a class="notification import-notification">' + transactions.length + '</a>');
          }
        }
      });
    };

    // Hook transaction imports so that we can run our stuff when things change
    ynab.YNABSharedLib.defaultInstance.entityManager._transactionEntityPropertyChanged.addHandler(ynabToolKit.importNotification);

    ynabToolKit.importNotification(); // Run itself once
  } else {
    setTimeout(poll, 250);
  }
}());
