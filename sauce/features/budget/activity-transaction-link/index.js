import { Feature } from 'toolkit/core/feature';

export class ActivityTransactionLink extends Feature {
  injectCSS() { return require('./index.css'); }

  selectedTransaction = null
  waitingForAccountsPage = false

  invoke = () => {
    $('.budget-activity').each((index, row) => {
      $(row).addClass('toolkit-activity-row');

      $(row).on('click', () => {
        var selectedTransEmberId = $(row).attr('id');
        var emberView = ynabToolKit.shared.getEmberView(selectedTransEmberId);
        this.selectedTransaction = emberView.get('transaction');
        $('.nav-account-name[title="' + this.selectedTransaction.get('accountName') + '"]').trigger('click');
        this.waitingForAccountsPage = true;
      });
    });
  }

  // find the parent entity if the selectedTransaction has one.
  findTransactionIndex = (contentResults) => {
    var entityId = this.selectedTransaction.get('parentEntityId') || this.selectedTransaction.get('entityId');
    var transactionIndex = 0;

    for (var i = 0; i < contentResults.length; i++, transactionIndex++) {
      var currentTransaction = contentResults[i];

      if (contentResults[i].get('entityId') === entityId) {
        this.selectedTransaction = currentTransaction;
        return transactionIndex;
      }
    }

    return -1;
  }

  resetFiltersAndShowSelectedTransaction = (accountsController) => {
    function getTransactionIndex() {
      accountsController.removeObserver('contentResults', getTransactionIndex);
      var contentResults = accountsController.get('contentResults');
      var transactionIndex = this.findTransactionIndex(contentResults);
      this.showSelectedTransaction(accountsController, contentResults, transactionIndex);
    }

    accountsController.addObserver('contentResults', getTransactionIndex);
    accountsController.filters.resetFilters();
  }

  findSelectedTransaction = () => {
    var accountsController = ynabToolKit.shared.containerLookup('controller:accounts');
    var contentResults = accountsController.get('contentResults');
    var transactionIndex = this.findTransactionIndex(contentResults);

    if (transactionIndex === -1) {
      this.resetFiltersAndShowSelectedTransaction(accountsController);
    } else {
      this.showSelectedTransaction(accountsController, contentResults, transactionIndex);
    }
  }

  showSelectedTransaction = (accountsController, contentResults, transactionIndex) => {
    var ynabGrid = ynabToolKit.shared.getEmberView($('.ynab-grid').attr('id'));
    var ynabGridContainer = ynabToolKit.shared.getEmberView($('.ynab-grid-container').attr('id'));
    var recordHeight = ynabGridContainer.get('recordHeight');

    Ember.run.later(() => {
      var skipSplits = ynabToolKit.options.ToggleSplits && !accountsController.get('toolkitShowSubTransactions');
      var transactionScrollTo = recordHeight * transactionIndex;

      $(ynabGridContainer.element).scrollTop(transactionScrollTo);

      // if the toggle splits feature is enabled and we're hiding splits, then we need to recalculate
      // the actual scroll position of the transaction we're linking to.
      if (skipSplits) {
        Ember.run.later(() => {
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
          ynabGrid.uncheckAllBut(this.selectedTransaction);
          $(ynabGridContainer.element).scrollTop(newTransactionScrollTo);
        }, 250);
      } else {
        ynabGrid.uncheckAllBut(this.selectedTransaction);
      }
    }, 250);
  }

  observe = (changedNodes) => {
    if (changedNodes.has('ynab-u modal-popup modal-budget-activity ember-view modal-overlay active')) {
      this.invoke();
    }

    if (this.waitingForAccountsPage && changedNodes.has('ynab-grid-body')) {
      this.waitingForAccountsPage = false;
      Ember.run.later(this.findSelectedTransaction, 250);
    }
  }
}
