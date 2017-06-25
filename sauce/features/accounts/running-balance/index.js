import { Feature } from 'core/feature';
import * as toolkitHelper from 'helpers/toolkit';

export class RunningBalance extends Feature {
  injectCSS() { return require('./index.css'); }

  willInvoke() {
    this.addWillInsertRunningBalanceRow('register/grid-sub');
    this.addWillInsertRunningBalanceRow('register/grid-row');
    this.addWillInsertRunningBalanceRow('register/grid-scheduled');

    return initializeRunningBalances();
  }

  // we always want to invoke this feature if it's enabled because we want
  // to at least initialize running balance on all of the accounts
  shouldInvoke() {
    const applicationController = toolkitHelper.controllerLookup('application');
    return applicationController.get('selectedAccountId') !== null;
  }

  addWillInsertRunningBalanceRow(componentName) {
    const _this = this;
    const GridComponent = toolkitHelper.componentLookup(componentName);

    if (GridComponent.__toolkitInitialized) { return; }

    GridComponent.constructor.reopen({
      willInsertElement: function () {
        if (!_this.shouldInvoke()) { return; }
        willInsertRunningBalanceRow.call(this);
      }
    });

    GridComponent.__toolkitInitialized = true;
  }

  addDeadColumnOnInsert(componentName) {
    const _this = this;
    const GridComponent = toolkitHelper.componentLookup(componentName);

    if (GridComponent.__toolkitInitialized) { return; }

    GridComponent.reopen({
      willInsertElement: function () {
        if (!_this.shouldInvoke()) { return; }
        $('<div class="ynab-grid-cell ynab-grid-cell-toolkit-running-balance">').
          insertAfter($('.ynab-grid-cell-inflow', this.get('element')));
      }
    });

    // this is really hacky but I'm not sure what else to do, most of these components
    // double render so the `willInsertElement` works for those but the add rows
    // and footer are weird. add-rows doesn't double render and will work every time
    // after the component has been cached but footer is _always_ a new component WutFace
    let $appendToRow;
    switch (componentName) {
      case 'register/grid-add':
        $appendToRow = $('.ynab-grid-add-rows .ynab-grid-body-row.is-editing');
        break;
      case 'register/grid-footer':
        $appendToRow = $('.ynab-grid-body-row.ynab-grid-footer');
        break;
    }

    if ($('.ynab-grid-cell-toolkit-running-balance', $appendToRow).length === 0) {
      $('<div class="ynab-grid-cell ynab-grid-cell-toolkit-running-balance">')
        .insertAfter($('.ynab-grid-cell-inflow', $appendToRow));
    }

    GridComponent.__toolkitInitialized = true;
  }

  invoke() {
    insertHeader();

    if ($('.ynab-grid-body-row.is-editing', '.ynab-grid-body').length) {
      this.addDeadColumnOnInsert('register/grid-edit');
    }

    if ($('.ynab-grid-add-rows', '.ynab-grid').length) {
      this.addDeadColumnOnInsert('register/grid-add');
    }

    if ($('.ynab-grid-body-split.is-editing', '.ynab-grid').length) {
      this.addDeadColumnOnInsert('register/grid-sub-edit');
    }

    if ($('.ynab-grid-body-row.ynab-grid-footer', '.ynab-grid').length) {
      this.addDeadColumnOnInsert('register/grid-footer');
    }

    ynabToolKit.invokeFeature('AdjustableColumnWidths');
  }

  observe(changedNodes) {
    if (!this.shouldInvoke()) {
      $('.ynab-grid-cell-toolkit-running-balance').remove();
      return;
    }

    if (
      changedNodes.has('ynab-grid-body') ||
      changedNodes.has('ynab-grid')
    ) {
      this.invoke();
    }
  }
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
  return ynab.YNABSharedLib.defaultInstance.entityManager.accountsCollection.forEach((account) => {
    return ynab.YNABSharedLib.defaultInstance.getBudgetViewModel_AccountTransactionsViewModel(account.entityId).
      then((accountViewModel) => {
        calculateRunningBalance(account.entityId);

        // can you believe it? YNAB has this really interestingly name field
        // on visibleTransactionDisplayItems that sounds exactly like what I need
        // if something changes in that list, you tell me about it, and I'll update
        // the running balance for the account make sure our users always see the fancy
        accountViewModel.get('visibleTransactionDisplayItems')
          .addObserver('anyItemChangedCounter', function () {
            calculateRunningBalance(account.entityId);
          });
      });
  });
}

function willInsertRunningBalanceRow() {
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
}

function insertHeader() {
  if ($('.ynab-grid-header .ynab-grid-cell-toolkit-running-balance').length) return;

  var $headerRow = $('.ynab-grid-header');
  var runningBalanceHeader = $('.ynab-grid-cell-inflow', $headerRow).clone();
  runningBalanceHeader.removeClass('ynab-grid-cell-inflow');
  runningBalanceHeader.addClass('ynab-grid-cell-toolkit-running-balance');
  runningBalanceHeader.text('RUNNING BALANCE');
  runningBalanceHeader.insertAfter($('.ynab-grid-cell-inflow', $headerRow));

  if ($('.ynab-grid-body .ynab-grid-body-row-top .ynab-grid-cell-toolkit-running-balance').length) return;
  var $topRow = $('.ynab-grid-body-row-top');
  var topRowRunningBalance = $('.ynab-grid-cell-inflow', $topRow).clone();
  topRowRunningBalance.removeClass('ynab-grid-cell-inflow');
  topRowRunningBalance.addClass('ynab-grid-cell-toolkit-running-balance');
  topRowRunningBalance.insertAfter($('.ynab-grid-cell-inflow', $topRow));
}
