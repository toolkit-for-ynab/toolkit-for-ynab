(function poll() {
  if (typeof ynabToolKit !== 'undefined' && ynabToolKit.actOnChangeInit === true && typeof ynab.managers.TransactionImporter !== 'undefined') {
    ynabToolKit.importNotification = function () {
      $('.import-notification').remove();
      $('.nav-account-row').each(function (index, row) {
        var account = ynabToolKit.shared.getEmberView($(row).attr('id')).get('data');
        if (account.getDirectConnectEnabled()) {
          var importStartDate = ynab.managers.TransactionImporter.getImportStartDateForAccount(account);
          var transactions = ynab.YNABSharedLib.defaultInstance.entityManager.getPendingDirectImportTransactionsByAccountId(account.entityId, importStartDate);
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

