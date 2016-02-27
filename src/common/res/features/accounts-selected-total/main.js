// TODO: Consider refactoring with example.js logic.
(function poll() {
  if ( typeof ynabToolKit !== "undefined"  && ynabToolKit.pageReady === true ) {

    ynabToolKit.enhancedSelectedTotals = function ()  {

      function enhancedSelectedTotalsApply() {
          var parent = document.getElementsByClassName("accounts-header-balances")[0];
          var totals = document.createElement("div");
          totals.className = "accounts-header-balances-selected hidden";
          totals.id = "accounts-selected-total";
          var label = document.createElement("div");
          label.className = "accounts-header-balances-label";
          label.textContent = (ynabToolKit.l10nData && ynabToolKit.l10nData["toolkit.selectedTotal"]) || "Selected Transactions Total";
          totals.appendChild(label);
          parent.appendChild(totals);
          var dataSetParent = document.getElementsByClassName('ynab-grid-body')[0].getElementsByClassName('ynab-grid-body-row');
          for (var i = 0; i < dataSetParent.length; i++) {
              dataSet.push(dataSetParent[i].id);
          }
          enhancedSelectedTotalsPoll();
      }

      function enhancedSelectedTotalsCalculate() {
          var outflows = 0;
          var inflows = 0;
          var transactionsFound = false;
          var accountId, transactions;
          accountId = 'null';
          if (currentPath.indexOf('/accounts/') > -1) {
              accountId = currentPath.substr(currentPath.lastIndexOf('/') + 1)
          }
          transactions = ynabToolKit.shared.getVisibleTransactions(accountId);
          notSubTransactions = transactions.filter(function(el) { return el.displayItemType != ynab.constants.TransactionDisplayItemType.ScheduledSubTransaction && el.displayItemType != ynab.constants.TransactionDisplayItemType.SubTransaction });
          for (var i = 0; i < notSubTransactions.length; i++) {
              if (notSubTransactions[i].isChecked) {
                  inflows += notSubTransactions[i].inflow;
                  outflows += notSubTransactions[i].outflow;
                  transactionsFound = true;
              }
          }
          var total = inflows - outflows;
          if (!transactionsFound) {
              total = false;
          }
          enhancedSelectedTotalsUpdate(total);

          setTimeout(enhancedSelectedTotalsPoll, 750);
      }

      function enhancedSelectedTotalsUpdate(total) {
          var parent = $('#accounts-selected-total');

          if (parent.length == 0) {
              return false;
          }

          if (total === false) {
              parent.addClass('hidden');
              return true;
          }

          parent.attr('class', 'accounts-header-balances-selected');

          parent.find('.user-data').remove();

          var userData = $('<span>', { class: 'user-data', title: ynabToolKit.shared.formatCurrency(total) });
          var userCurrency = $('<span>', { class: 'user-data currency' });

          if (total >= 0) {
              userCurrency.addClass('positive');
          } else {
              userCurrency.addClass('negative');
          }

          ynabToolKit.shared.appendFormattedCurrencyHtml(userCurrency, total);

          userData.append(userCurrency);
          parent.append(userData);
      }

      function enhancedSelectedTotalsInit() {
          var parentDiv = document.getElementsByClassName('accounts-header-balances');
          n = parentDiv.length;
          if (n > 0) {
              enhancedSelectedTotalsApply();
          } else {
              setTimeout(enhancedSelectedTotalsInit, 250);
          }
      }

      function enhancedSelectedTotalsPoll() {
          var parentDiv = document.getElementsByClassName('accounts-header-balances');
          if (parentDiv.length == 0) {
              setTimeout(enhancedSelectedTotalsInit, 250);
              return true;
          }
          var accountId, transactions;
          var checkedTransactions = new Array();
          var windowPath = window.location.pathname;
          var newDataSetParent = document.getElementsByClassName('ynab-grid-body')[0].getElementsByClassName('ynab-grid-body-row');
          var newDataSet = new Array();
          for (var i = 0; i < newDataSetParent.length; i++) {
              newDataSet.push(newDataSetParent[i].id);
          }
          if (windowPath != currentPath || newDataSet.toString() != dataSet.toString()) {
              currentPath = windowPath;
              previousSet = '';
              dataSet = newDataSet;
              enhancedSelectedTotalsUpdate(-1);
          }
          if (currentPath.indexOf('/accounts/') > -1) {
              accountId = currentPath.substr(currentPath.lastIndexOf('/') + 1)
              transactions = ynab.YNABSharedLib.getBudgetViewModel_AllAccountTransactionsViewModel()._result.transactionDisplayItemsCollection.findItemsByAccountId(accountId);
          } else {
              transactions = ynab.YNABSharedLib.getBudgetViewModel_AllAccountTransactionsViewModel()._result.visibleTransactionDisplayItems;
          }
          for (var i = 0; i < transactions.length; i++) {
              if (transactions[i].isChecked) {
                  checkedTransactions.push(transactions[i].entityId);
              }
          }
          if (checkedTransactions.length == 0) {
              enhancedSelectedTotalsUpdate(false);
              previousSet = checkedTransactions;
          } else {
              if (checkedTransactions.toString() != previousSet.toString()) {
                  previousSet = checkedTransactions;
                  enhancedSelectedTotalsCalculate();
                  return true;
              }
          }
          setTimeout(enhancedSelectedTotalsPoll, 250);
      }
      var currentPath = window.location.pathname;
      var previousSet = '';
      var dataSet = new Array();
      setTimeout(enhancedSelectedTotalsInit, 250);

    };
    ynabToolKit.enhancedSelectedTotals(); // Activate itself

  } else {
    setTimeout(poll, 250);
  }
})();
