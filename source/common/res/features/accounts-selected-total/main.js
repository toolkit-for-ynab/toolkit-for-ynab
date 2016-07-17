(function poll() {
  if (typeof ynabToolKit !== 'undefined' && ynabToolKit.pageReady === true) {
    ynabToolKit.enhancedSelectedTotals = (function () {
      function calculateSelectedTotal(transactions) {
        var total = 0;

        transactions.forEach(function (transaction) {
          if (transaction.inflow) {
            total += transaction.inflow;
          } else {
            total -= transaction.outflow;
          }
        });

        return total;
      }

      function updateSelectedTotal(accountsController) {
        var $totalContainer = $('#ynab-toolkit-selected-total');
        var areChecked = accountsController.get('areChecked');
        var total = calculateSelectedTotal(areChecked);

        if ($totalContainer.length === 0) {
          $totalContainer = $('' +
            '<div id="ynab-toolkit-selected-total" class="accounts-header-balances-selected hidden">' +
              '<label class="accounts-header-balances-label">' +
                (ynabToolKit.l10nData && ynabToolKit.l10nData['toolkit.selectedTotal']) || 'Selected Transactions Total' +
              '</label>' +
            '</div>');
        }

        console.log(total);
      }

      return {
        invoke: function () {
          var accounts = ynabToolKit.shared.containerLookup('controller:accounts');
          accounts.addObserver('areChecked', updateSelectedTotal);
        }
      };
    }());

    ynabToolKit.enhancedSelectedTotals.invoke();
  } else {
    setTimeout(poll, 250);
  }
}());
