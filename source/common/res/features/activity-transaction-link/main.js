(function poll() {
  if (typeof ynabToolKit !== 'undefined' && ynabToolKit.pageReady === true) {
    ynabToolKit.activityTransactionLink = (function () {
      var selectedTransaction;
      var waitForRowView = false;

      function initialize() {
        var budgetController = ynabToolKit.shared.containerLookup('controller:budget');
        var selectedActivityTransactions = budgetController.selectedActivityTransactions;

        $('.activity-rows').children().each(function (index, row) {
          $(row).on('click', function () {
            selectedTransaction = selectedActivityTransactions[index];
            $('.nav-account-name[title="' + selectedTransaction.accountName + '"]').trigger('click');
            waitForRowView = true;
          });
        });
      }

      function resetFiltersAndShowSelectedTransaction(accountsController) {
        function getTransactionIndex() {
          accountsController.removeObserver('contentResults', getTransactionIndex);
          var contentResults = accountsController.get('contentResults');
          var transactionIndex = contentResults.indexOf(selectedTransaction);
          showSelectedTransaction(accountsController, contentResults, transactionIndex);
        }

        accountsController.addObserver('contentResults', getTransactionIndex);
        accountsController.filters.resetFilters();
      }

      function findSelectedTransaction() {
        var accountsController = ynabToolKit.shared.containerLookup('controller:accounts');
        var contentResults = accountsController.get('contentResults');
        var transactionIndex = contentResults.indexOf(selectedTransaction);

        if (transactionIndex === -1) {
          resetFiltersAndShowSelectedTransaction(accountsController);
        } else {
          showSelectedTransaction(accountsController, contentResults, transactionIndex);
        }
      }

      function showSelectedTransaction(accountsController, contentResults, transactionIndex) {
        var rowView = ynabToolKit.shared.getEmberViewByContainerKey('view:ynab-grid/rows');
        var containerView = rowView.get('containerView');
        var recordHeight = rowView.get('recordHeight');
        var container = containerView.get('element');
        $(container).scrollTop(recordHeight * transactionIndex);
        rowView.gridView.uncheckAllBut(selectedTransaction);
      }

      return {
        invoke: function invoke() {
          Ember.Instrumentation.subscribe('render.view', {
            before: function before() {},
            after: function after(event, timestamp, view) {
              if (view.containerKey === 'view:modals/budget/activity') {
                return initialize();
              }

              if (view.containerKey === 'view:ynab-grid/rows' && waitForRowView) {
                waitForRowView = false;
                setTimeout(findSelectedTransaction, 250);
              }
            }
          });
        }
      };
    }());

    ynabToolKit.activityTransactionLink.invoke();
  } else {
    setTimeout(poll, 250);
  }
}());
