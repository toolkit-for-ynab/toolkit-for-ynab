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

  onBudgetChanged() {
    this.hasInitialized = false;
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
    runningBalanceHeader.click(event => {
      event.preventDefault();
      event.stopPropagation();
      $('.ynab-grid-cell-date', $headerRow).click();
    });

    if ($('.ynab-grid-body .ynab-grid-body-row-top .ynab-grid-cell-toolkit-running-balance').length)
      return;
    var $topRow = $('.ynab-grid-body-row-top');
    var topRowRunningBalance = $('.ynab-grid-cell-inflow', $topRow).clone();
    topRowRunningBalance.removeClass('ynab-grid-cell-inflow');
    topRowRunningBalance.addClass('ynab-grid-cell-toolkit-running-balance');
    topRowRunningBalance.insertAfter($('.ynab-grid-cell-inflow', $topRow));
  }

  handleSingleRenderColumn($appendToRows) {
    $appendToRows.each((index, row) => {
      if ($('.ynab-grid-cell-toolkit-running-balance', row).length === 0) {
        $('<div class="ynab-grid-cell ynab-grid-cell-toolkit-running-balance">').insertAfter(
          $('.ynab-grid-cell-inflow', row)
        );
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
      if (!selectedAccountId) {
        return;
      }

      const $currentRow = $(this.element);
      const currentRowRunningBalance = $('.ynab-grid-cell-inflow', $currentRow).clone();
      currentRowRunningBalance.removeClass('ynab-grid-cell-inflow');
      currentRowRunningBalance.addClass('ynab-grid-cell-toolkit-running-balance');

      const transaction = this.get('content');
      const runningBalance = transaction.__ynabToolKitRunningBalance;
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
      } else if (typeof runningBalance === 'undefined') {
        currencySpan.text('Refresh Required');
      } else {
        currencySpan.text(formatCurrency(runningBalance));
      }

      currentRowRunningBalance.insertAfter($('.ynab-grid-cell-inflow', $currentRow));
    } else if (!isActions && !$('.ynab-grid-cell-toolkit-running-balance', this.element).length) {
      $('<div class="ynab-grid-cell ynab-grid-cell-toolkit-running-balance">').insertAfter(
        $('.ynab-grid-cell-inflow', this.element)
      );
    }
  }

  initializeRunningBalances() {
    const { accountsCollection } = getEntityManager();
    if (accountsCollection.length === 0 || this.hasInitialized) {
      return;
    }

    this.hasInitialized = true;

    const promises = [];
    accountsCollection.forEach(account => {
      promises.push(calculateRunningBalance(account.entityId));
    });

    return Promise.all(promises);
  }
}

function attachAnyItemChangedListener(transactionViewModel) {
  transactionViewModel.__ynabToolKitAnyItemChangedListener = true;
  transactionViewModel
    .get('visibleTransactionDisplayItems')
    .addObserver('anyItemChangedCounter', function(displayItems) {
      const updatedAccountId = displayItems.get('firstObject.accountId');
      if (updatedAccountId) {
        calculateRunningBalance(updatedAccountId);
      }
    });
}

function calculateRunningBalance(accountId) {
  const accountController = controllerLookup('accounts');
  const registerSort = accountController.get('registerSort');
  const sortFields = registerSort.fetchSortFields(accountId).copy();

  const dateSortFieldIndex = sortFields.findIndex(sortField => sortField.property === 'date');
  if (dateSortFieldIndex !== 0) {
    const temp = sortFields[0];
    sortFields[0] = sortFields[dateSortFieldIndex];
    sortFields[dateSortFieldIndex] = temp;
  }

  const sortFunction = registerSort.createSortFunction(sortFields);

  if (!accountController.__tkSortFieldsListener) {
    accountController.addObserver('sortFields', function(controller) {
      accountController.__tkSortFieldsListener = true;

      const observedAccountId = controller.get('filters.entityId');
      if (observedAccountId) {
        calculateRunningBalance(observedAccountId);
      }
    });
  }

  let accountViewModel;
  try {
    accountViewModel = ynab.YNABSharedLib.defaultInstance.getBudgetViewModel_AccountTransactionsViewModel(
      accountId
    );
  } catch (e) {
    /* do nothing */
  }

  if (!accountViewModel) {
    return;
  }

  return accountViewModel.then(transactionViewModel => {
    if (!transactionViewModel.__ynabToolKitAnyItemChangedListener) {
      attachAnyItemChangedListener(transactionViewModel);
    }

    // Sort all transactions is ascending order first. If the dates match, sort transactions
    // in ascending order (outflows are negative when using `.getAmount`). If the dates are
    // equal, the amounts are always sorted in descending order.
    const sorted = transactionViewModel
      .get('visibleTransactionDisplayItems')
      .slice()
      .sort(sortFunction);
    const dateSortField = sortFields.find(sortField => sortField.property === 'date');
    const sortedAscending = dateSortField ? dateSortField.sortAscending : false;

    let runningBalance = 0;
    if (sortedAscending) {
      sorted.forEach(transaction => {
        if (transaction.get('parentEntityId') === null && transaction.get('inflow')) {
          runningBalance += transaction.get('inflow');
        } else if (transaction.get('parentEntityId') === null && transaction.get('outflow')) {
          runningBalance -= transaction.get('outflow');
        }

        transaction.__ynabToolKitRunningBalance = runningBalance;
      });
    } else {
      for (let x = sorted.length - 1; x >= 0; x--) {
        const transaction = sorted[x];
        if (transaction.get('parentEntityId') === null && transaction.get('inflow')) {
          runningBalance += transaction.get('inflow');
        } else if (transaction.get('parentEntityId') === null && transaction.get('outflow')) {
          runningBalance -= transaction.get('outflow');
        }

        transaction.__ynabToolKitRunningBalance = runningBalance;
      }
    }
  });
}
