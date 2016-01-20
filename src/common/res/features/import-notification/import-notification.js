(function poll() {
   if ( typeof ynabToolKit !== 'undefined' && ynabToolKit.actOnChangeInit === true && typeof ynab.utilities.TransactionImportUtilities !== 'undefined' ) {

      ynabToolKit.importNotification = function ()  {
        $('.import-notification').remove();
        $('.nav-account-row').each(function(index, row) {
          var account = Ember.View.views[$(row).attr('id')].get('data');
          var transactions = ynab.utilities.TransactionImportUtilities.getImportTransactionsForAccount(account);
          if(transactions.length >= 1) {
            $(row).find('.nav-account-notification').append('<a class="notification import-notification">'+transactions.length+'</a>');
          }
        });  
      };

      // Hook transaction imports so that we can run our stuff when things change
      ynab.YNABSharedLib.defaultInstance.entityManager._transactionEntityPropertyChanged.addHandler(ynabToolKit.importNotification);

      ynabToolKit.importNotification(); // Run itself once
   } else {
     setTimeout(poll, 250);
   }    
})();









