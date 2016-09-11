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
        var transactionIndex = 0;

        for (var i = 0; i < contentResults.length; i++, transactionIndex++) {
          var currentTransaction = contentResults[i];

          if (contentResults[i].get('entityId') === entityId) {
            selectedTransaction = currentTransaction;
            return transactionIndex;
          }
        }

        return -1;
      }

      function resetFiltersAndShowSelectedTransaction(accountsController) {
        function getTransactionIndex() {
          accountsController.removeObserver('contentResults', getTransactionIndex);
          var contentResults = accountsController.get('contentResults');
          var transactionIndex = findTransactionIndex(contentResults);
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
        var ynabGrid = ynabToolKit.shared.getEmberView($('.ynab-grid').attr('id'));
        var ynabGridContainer = ynabToolKit.shared.getEmberView($('.ynab-grid-container').attr('id'));
        var recordHeight = ynabGridContainer.get('recordHeight');

        Ember.run.later(function () {
          var skipSplits = ynabToolKit.options.toggleSplits && ynabToolKit.toggleSplits.setting === 'hide';
          var transactionScrollTo = recordHeight * transactionIndex;

          $(ynabGridContainer.element).scrollTop(transactionScrollTo);

          // if the toggle splits feature is enabled and we're hiding splits, then we need to recalculate
          // the actual scroll position of the transaction we're linking to.
          if (skipSplits) {
            Ember.run.later(function () {
              var newIndex = transactionIndex;
              for (var i = ynabGridContainer.get('displayStart'); i < transactionIndex; i++) {
                if (contentResults[i].get('parentEntityId')) {
                  newIndex--;
                }
              }

              // there is a weird interaction with this feature and the toggle splits (i think) that causes
              // the transaction to still be hidden (just out of view at viewable transaction - 1). Unfortunately
              // getting that transaction isn't as simple as scrolling one more transaction so we're going
              // to scroll 5 more transactions. this isn't perfect, it's as magic number as it gets but it works until
              // i can pinpoint the actual issue here.
              var newTransactionScrollTo = recordHeight * (newIndex - 5);
              ynabGrid.uncheckAllBut(selectedTransaction);
              $(ynabGridContainer.element).scrollTop(newTransactionScrollTo);
            }, 250);
          } else {
            ynabGrid.uncheckAllBut(selectedTransaction);
          }
        }, 250);
      }

      return {
        observe: function observe(changedNodes) {
          if (changedNodes.has('ynab-u modal-popup modal-budget-activity ember-view modal-overlay active')) {
            initialize();
          }

          if (waitingForAccountsPage && changedNodes.has('ynab-grid-body')) {
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
