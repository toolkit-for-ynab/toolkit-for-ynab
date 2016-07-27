(function poll() {
  if (typeof ynabToolKit !== 'undefined' && ynabToolKit.pageReady === true) {
    ynabToolKit.activityTransactionLink = (function () {
      var selectedTransaction;
      var waitingForAccountsPage = false;

      function initialize() {
        $('.budget-activity').each(function (index, row) {
          $(this).addClass('toolkit-activity-row');

          $(row).on('click', function () {
            var selectedTransEmberId = $(this).attr('id');
            var emberView = ynabToolKit.shared.getEmberView(selectedTransEmberId);
            selectedTransaction = emberView.get('transaction');
            $('.nav-account-name[title="' + selectedTransaction.get('accountName') + '"]').trigger('click');
            waitingForAccountsPage = true;
          });
        });
      }

      // find the parent entity if the selectedTransaction has one.
      function findTransactionIndex(contentResults) {
        var entityId = selectedTransaction.get('parentEntityId') || selectedTransaction.get('entityId');
        for (var i = 0; i < contentResults.length; i++) {
          if (contentResults[i].get('entityId') === entityId) {
            selectedTransaction = contentResults[i];
            return i;
          }
        }
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
        var transactionIndex = findTransactionIndex(contentResults);

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

        Ember.run.later(function () {
          $(container).scrollTop(recordHeight * transactionIndex);
          rowView.gridView.uncheckAllBut(selectedTransaction);
        }, 250);
      }

      return {
        observe: function observe(changedNodes) {
          if (changedNodes.has('ynab-u modal-popup modal-budget-activity ember-view modal-overlay active')) {
            initialize();
          }

          if (waitingForAccountsPage && changedNodes.has('ynab-grid-body') > -1) {
            waitingForAccountsPage = false;
            Ember.run.later(findSelectedTransaction, 250);
          }
        }
      };
    }());
  } else {
    setTimeout(poll, 250);
  }
}());
