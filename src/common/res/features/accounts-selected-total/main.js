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
          label.textContent = "Selected Transactions Total";
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
          var parent = document.getElementById('accounts-selected-total');
          if (parent == null) {
              return false;
          }
          if ((' ' + parent.className + ' ').indexOf(' hidden ') == -1 && total === false) {
              parent.className += " hidden";
              return true;
          } else if (total === false) {
              return true;
          }
          parent.className = "accounts-header-balances-selected";
          var spans = parent.getElementsByClassName("user-data");
          for (var i = 0; i < spans.length; i++) {
              spans[i].remove();
          }
          var totalFormatted = ynabToolKit.shared.formatCurrency(total, true);
          var totalFormattedNoHtml = ynabToolKit.shared.formatCurrency(total, false);
          var userData = document.createElement("span");
          userData.className = "user-data";
          userData.title = totalFormattedNoHtml;
          var userCurrency = document.createElement("span");
          userCurrency.className = "user-data currency";
          if (total >= 0) {
              userCurrency.className += " positive";
          } else {
              userCurrency.className += " negative";
          }
          userCurrency.innerHTML = totalFormatted;
          userData.appendChild(userCurrency);
          parent.appendChild(userData);
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
