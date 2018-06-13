import { TransactionGridFeature } from '../feature';
import { controllerLookup } from 'toolkit/extension/utils/ember';
import { isCurrentRouteAccountsPage, getEntityManager } from 'toolkit/extension/utils/ynab';
import { formatCurrency } from 'toolkit/extension/utils/currency';

export class RunningBalance extends TransactionGridFeature {
  hasInitialized = false;

  injectCSS() {
    let css = require('./index.css');

    if (ynabToolKit.options.RunningBalance === '1') {
      css += require('./highlight-negatives.css');
    }

    return css;
  }

  willInvoke() {
    return this.initializeRunningBalances();
  }

  shouldInvoke() {
    return (
      isCurrentRouteAccountsPage() &&
      controllerLookup('application').get('selectedAccountId') !== null
    );
  }

  invoke() {
    this.initializeRunningBalances();
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
    const isActions = this.get('_debugContainerKey') === 'component:register/grid-actions';
    const isScheduled = this.get('_debugContainerKey') === 'component:register/grid-scheduled';
    const isRunningBalance = isSub || isRow || isScheduled;

    if (isRunningBalance) {
      const applicationController = controllerLookup('application');
      const selectedAccountId = applicationController.get('selectedAccountId');
      if (!selectedAccountId) { return; }

      const $currentRow = $(this.element);
      const currentRowRunningBalance = $('.ynab-grid-cell-inflow', $currentRow).clone();
      currentRowRunningBalance.removeClass('ynab-grid-cell-inflow');
      currentRowRunningBalance.addClass('ynab-grid-cell-toolkit-running-balance');

      const transaction = this.get('content');
      const runningBalance = transaction.__ynabToolKitRunningBalance;
      if (typeof runningBalance !== 'undefined') {
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
          currencySpan.text(formatCurrency(runningBalance));
        }

        currentRowRunningBalance.insertAfter($('.ynab-grid-cell-inflow', $currentRow));
      }
    } else if (!isActions && !$('.ynab-grid-cell-toolkit-running-balance', this.element).length) {
      $('<div class="ynab-grid-cell ynab-grid-cell-toolkit-running-balance">')
        .insertAfter($('.ynab-grid-cell-inflow', this.element));
    }
  }

  initializeRunningBalances() {
    const { accountsCollection } = getEntityManager();
    if (accountsCollection.length === 0 || this.hasInitialized) {
      return;
    }

    this.hasInitialized = true;

    const promises = [];
    accountsCollection.forEach((account) => {
      const viewModel = ynab.YNABSharedLib.defaultInstance.getBudgetViewModel_AccountTransactionsViewModel(account.entityId);
      promises.push(viewModel.then(() => calculateRunningBalance(account.entityId)));
    });

    return Promise.all(promises);
  }
}

function attachAnyItemChangedListener(accountId, transactionViewModel) {
  transactionViewModel.__ynabToolKitAnyItemChangedListener = true;
  transactionViewModel.get('visibleTransactionDisplayItems')
    .addObserver('anyItemChangedCounter', function (displayItems) {
      const updatedAccountId = displayItems.get('firstObject.accountId');
      if (updatedAccountId) {
        calculateRunningBalance(updatedAccountId);
      }
    });
}

function calculateRunningBalance(accountId) {
  return ynab.YNABSharedLib.defaultInstance.getBudgetViewModel_AccountTransactionsViewModel(accountId).then((transactionViewModel) => {
    if (!transactionViewModel.__ynabToolKitAnyItemChangedListener) {
      attachAnyItemChangedListener(accountId, transactionViewModel);
    }

    // Sort all transactions is ascending order first. If the dates match, sort transactions
    // in ascending order (outflows are negative when using `.getAmount`). If the dates are
    // equal, the amounts are always sorted in descending order.
    const transactions = transactionViewModel.get('visibleTransactionDisplayItems');
    const sorted = transactions.slice().sort((a, b) => {
      let propA = a.get('date');
      let propB = b.get('date');

      if (propA instanceof ynab.utilities.DateWithoutTime) propA = propA.getUTCTime();
      if (propB instanceof ynab.utilities.DateWithoutTime) propB = propB.getUTCTime();

      const dateCompare = Ember.compare(propA, propB);
      if (dateCompare === 0) {
        const amountCompare = Ember.compare(a.getAmount(), b.getAmount());
        if (amountCompare === 0) {
          return Ember.compare(a.getEntityId(), b.getEntityId());
        }

        return -amountCompare;
      }

      return dateCompare;
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
  });
}
