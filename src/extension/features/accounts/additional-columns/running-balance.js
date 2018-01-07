import * as toolkitHelper from 'toolkit/extension/helpers/toolkit';

export class RunningBalance {
  willInvoke() {
    return this.initializeRunningBalances();
  }

  shouldInvoke() {
    const applicationController = toolkitHelper.controllerLookup('application');
    return applicationController.get('selectedAccountId') !== null;
  }

  cleanup() {
    $('.ynab-grid-cell-toolkit-running-balance').remove();
  }

  insertHeader() {
    if ($('.ynab-grid-header .ynab-grid-cell-toolkit-running-balance').length) return;

    var $headerRow = $('.ynab-grid-header');
    var runningBalanceHeader = $('.ynab-grid-cell-inflow', $headerRow).clone();
    runningBalanceHeader.removeClass('ynab-grid-cell-inflow');
    runningBalanceHeader.addClass('ynab-grid-cell-toolkit-running-balance');
    runningBalanceHeader.text('RUNNING BALANCE').css('font-weight', 'normal');
    runningBalanceHeader.insertAfter($('.ynab-grid-cell-inflow', $headerRow));
    runningBalanceHeader.click((event) => {
      event.preventDefault();
      event.stopPropagation();
      $('.ynab-grid-cell-date', $headerRow).click();
    });

    if ($('.ynab-grid-body .ynab-grid-body-row-top .ynab-grid-cell-toolkit-running-balance').length) return;
    var $topRow = $('.ynab-grid-body-row-top');
    var topRowRunningBalance = $('.ynab-grid-cell-inflow', $topRow).clone();
    topRowRunningBalance.removeClass('ynab-grid-cell-inflow');
    topRowRunningBalance.addClass('ynab-grid-cell-toolkit-running-balance');
    topRowRunningBalance.insertAfter($('.ynab-grid-cell-inflow', $topRow));
  }

  handleSingleRenderColumn($appendToRows) {
    $appendToRows.each((index, row) => {
      if ($('.ynab-grid-cell-toolkit-running-balance', row).length === 0) {
        $('<div class="ynab-grid-cell ynab-grid-cell-toolkit-running-balance">')
          .insertAfter($('.ynab-grid-cell-inflow', row));
      }
    });
  }

  willInsertColumn() {
    const isSub = this.get('_debugContainerKey') === 'component:register/grid-sub';
    const isRow = this.get('_debugContainerKey') === 'component:register/grid-row';
    const isScheduled = this.get('_debugContainerKey') === 'component:register/grid-scheduled';
    const isRunningBalance = isSub || isRow || isScheduled;

    if (isRunningBalance) {
      const applicationController = toolkitHelper.controllerLookup('application');
      const selectedAccountId = applicationController.get('selectedAccountId');
      if (!selectedAccountId) { return; }

      const $currentRow = $(this.element);
      const currentRowRunningBalance = $('.ynab-grid-cell-inflow', $currentRow).clone();
      currentRowRunningBalance.removeClass('ynab-grid-cell-inflow');
      currentRowRunningBalance.addClass('ynab-grid-cell-toolkit-running-balance');

      const transaction = this.get('content');

      let runningBalance = transaction.__ynabToolKitRunningBalance;
      if (typeof runningBalance === 'undefined') {
        calculateRunningBalance(selectedAccountId);
        runningBalance = transaction.__ynabToolKitRunningBalance;
      }

      const currencySpan = $('.user-data', currentRowRunningBalance);
      if (runningBalance < 0) {
        currencySpan.addClass('user-data currency negative');
      } else if (runningBalance > 0) {
        currencySpan.addClass('user-data currency positive');
      } else {
        currencySpan.addClass('user-data currency zero');
      }

      if (transaction.get('parentEntityId') !== null) {
        currencySpan.text('');
      } else {
        currencySpan.text(ynabToolKit.shared.formatCurrency(runningBalance));
      }

      currentRowRunningBalance.insertAfter($('.ynab-grid-cell-inflow', $currentRow));
    } else {
      if ($('.ynab-grid-cell-toolkit-running-balance', this.element).length === 0) {
        $('<div class="ynab-grid-cell ynab-grid-cell-toolkit-running-balance">')
          .insertAfter($('.ynab-grid-cell-inflow', this.element));
      }
    }
  }

  initializeRunningBalances() {
    return ynab.YNABSharedLib.defaultInstance.entityManager.accountsCollection.forEach((account) => {
      // we call this now so it's guaranteed to be resolved later
      return ynab.YNABSharedLib.defaultInstance.getBudgetViewModel_AccountTransactionsViewModel(account.entityId).
        then(() => {
          calculateRunningBalance(account.entityId);
        });
    });
  }
}

function attachAnyItemChangedListener(accountId, accountViewModel) {
  accountViewModel.__ynabToolKitAnyItemChangedListener = true;
  accountViewModel.get('visibleTransactionDisplayItems')
    .addObserver('anyItemChangedCounter', function () {
      calculateRunningBalance(accountId);
    });
}

// Using ._result here bcause we can guarantee that we've already invoked the
// getBudgetViewModel_AccountTransactionsViewModel() function when we initialized
function calculateRunningBalance(accountId) {
  const accountsController = toolkitHelper.controllerLookup('accounts');
  const accountViewModel = ynab.YNABSharedLib.defaultInstance.
    getBudgetViewModel_AccountTransactionsViewModel(accountId)._result;

  if (!accountViewModel.__ynabToolKitAnyItemChangedListener) {
    attachAnyItemChangedListener(accountId, accountViewModel);
  }

  const transactions = accountViewModel.get('visibleTransactionDisplayItems');
  const sorted = transactions.slice().sort((a, b) => {
    var propA = a.get('date');
    var propB = b.get('date');

    if (propA instanceof ynab.utilities.DateWithoutTime) propA = propA.getUTCTime();
    if (propB instanceof ynab.utilities.DateWithoutTime) propB = propB.getUTCTime();

    var res = Ember.compare(propA, propB);

    if (res === 0) {
      res = Ember.compare(a.getAmount(), b.getAmount());
      if (accountsController.get('sortAscending')) {
        return res;
      }

      return -res;
    }

    return res;
  });

  let runningBalance = 0;
  sorted.forEach((transaction) => {
    if (transaction.get('parentEntityId') !== null) {
      transaction.__ynabToolKitRunningBalance = runningBalance;
      return;
    }

    if (transaction.get('inflow')) {
      runningBalance += transaction.get('inflow');
    } else if (transaction.get('outflow')) {
      runningBalance -= transaction.get('outflow');
    }

    transaction.__ynabToolKitRunningBalance = runningBalance;
  });
}
