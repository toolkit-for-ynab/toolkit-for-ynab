import Feature from 'core/feature';
import * as toolkitHelper from 'helpers/toolkit';

export default class RunningBalanceNew extends Feature {
  constructor() {
    super();
    this.sortedContent = [];
  }

  injectCSS() {
    return require('./index.css');
  }

  shouldInvoke() {
    return toolkitHelper.getCurrentRouteName().indexOf('account') !== -1;
  }

  invoke() {
    initializeRunningBalances();
    insertHeader();

    const GridSubComponent = toolkitHelper.componentLookup('register/grid-sub');
    GridSubComponent.constructor.reopen({
      willInsertElement: function () {
        willInsertRunningBalanceRow.call(this);
        return this;
      }
    });

    const GridRowComponent = toolkitHelper.componentLookup('register/grid-row');
    GridRowComponent.constructor.reopen({
      willInsertElement: function () {
        willInsertRunningBalanceRow.call(this);
        return this;
      }
    });

    const GridScheduledComponent = toolkitHelper.componentLookup('register/grid-scheduled');
    GridScheduledComponent.constructor.reopen({
      willInsertElement: function () {
        willInsertRunningBalanceRow.call(this);
        return this;
      }
    });

    // const GridAddRow = toolkitHelper.componentLookup('register/grid-add');
    // debugger; // eslint-disable-line
    // GridAddRow.constructor.reopen({
    //   willInsertElement: function () {
    //     debugger; // eslint-disable-line
    //     $('<div class="ynab-grid-cell ynab-toolkit-grid-cell-running-balance">').
    //       insertAfter($('.ynab-grid-cell-inflow', this.get('element')));
    //   }
    // });
    //
    // const GridSubEdit = toolkitHelper.componentLookup('register/grid-sub-edit');
    // GridSubEdit.constructor.reopen({
    //   willInsertElement: function () {
    //     debugger; // eslint-disable-line
    //     $('<div class="ynab-grid-cell ynab-toolkit-grid-cell-running-balance">').
    //       insertAfter($('.ynab-grid-cell-inflow', this.get('element')));
    //   }
    // });
  }

  observe(changedNodes) {
    if (!this.shouldInvoke()) return;

    const applicationController = toolkitHelper.controllerLookup('application');
    calculateRunningBalance(applicationController.get('selectedAccountId'));

    if (
      changedNodes.has('ynab-grid-body') ||
      changedNodes.has('ynab-grid')
    ) {
      if ($('.ynab-grid-body-row.is-editing', '.ynab-grid-body').length) {
        addDeadColumnOnInsert('register/grid-edit');
      }

      if ($('.ynab-grid-add-rows', '.ynab-grid').length) {
        addDeadColumnOnInsert('register/grid-add');
      }

      if ($('.ynab-grid-body-split.is-editing', '.ynab-grid').length) {
        addDeadColumnOnInsert('register/grid-sub-edit');
      }
    }
  }
}

function addDeadColumnOnInsert(componentName) {
  const GridComponent = toolkitHelper.componentLookup(componentName);

  if (GridComponent.__toolkitInitialized) { return; }

  GridComponent.reopen({
    willInsertElement: function () {
      $('<div class="ynab-grid-cell ynab-toolkit-grid-cell-running-balance">').
        insertAfter($('.ynab-grid-cell-inflow', this.get('element')));
    }
  });

  // we only need to do this for the grid-add rows because all the other rows
  // double render (don't ask me why...but they do lol).
  if (componentName === 'register/grid-add') {
    const $addRows = $('.ynab-grid-add-rows .ynab-grid-body-row.is-editing');

    if ($('.ynab-toolkit-grid-cell-running-balance', $addRows).length === 0) {
      $('<div class="ynab-grid-cell ynab-toolkit-grid-cell-running-balance">')
        .insertAfter($('.ynab-grid-cell-inflow', $addRows));
    }
  }

  GridComponent.__toolkitInitialized = true;
}

// Using ._result here bcause we can guarantee that we've already invoked the
// getBudgetViewModel_AccountTransactionsViewModel() function when we initialized
function calculateRunningBalance(accountId) {
  const accountsController = toolkitHelper.controllerLookup('accounts');
  const accountViewModel = ynab.YNABSharedLib.defaultInstance.
    getBudgetViewModel_AccountTransactionsViewModel(accountId)._result;

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

function initializeRunningBalances() {
  ynab.YNABSharedLib.defaultInstance.entityManager.accountsCollection.forEach((account) => {
    ynab.YNABSharedLib.defaultInstance.getBudgetViewModel_AccountTransactionsViewModel(account.entityId).
      then(() => {
        calculateRunningBalance(account.entityId);
      });
  });
}

function willInsertRunningBalanceRow() {
  const $currentRow = $(this.element);
  const currentRowRunningBalance = $('.ynab-grid-cell-inflow', $currentRow).clone();
  currentRowRunningBalance.removeClass('ynab-grid-cell-inflow');
  currentRowRunningBalance.addClass('ynab-toolkit-grid-cell-running-balance');

  const transaction = this.get('content');
  let runningBalance = transaction.__ynabToolKitRunningBalance;

  if (runningBalance === undefined) {
    const applicationController = toolkitHelper.controllerLookup('application');
    calculateRunningBalance(applicationController.get('selectedAccountId'));
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
}

function insertHeader() {
  if ($('.ynab-grid-header .ynab-toolkit-grid-cell-running-balance').length) return;

  var $headerRow = $('.ynab-grid-header');
  var runningBalanceHeader = $('.ynab-grid-cell-inflow', $headerRow).clone();
  runningBalanceHeader.removeClass('ynab-grid-cell-inflow');
  runningBalanceHeader.addClass('ynab-toolkit-grid-cell-running-balance');
  runningBalanceHeader.text('RUNNING BALANCE');
  runningBalanceHeader.insertAfter($('.ynab-grid-cell-inflow', $headerRow));

  if ($('.ynab-grid-body .ynab-grid-body-row-top .ynab-toolkit-grid-cell-running-balance').length) return;
  var $topRow = $('.ynab-grid-body-row-top');
  var topRowRunningBalance = $('.ynab-grid-cell-inflow', $topRow).clone();
  topRowRunningBalance.removeClass('ynab-grid-cell-inflow');
  topRowRunningBalance.addClass('ynab-toolkit-grid-cell-running-balance');
  topRowRunningBalance.insertAfter($('.ynab-grid-cell-inflow', $topRow));
}
