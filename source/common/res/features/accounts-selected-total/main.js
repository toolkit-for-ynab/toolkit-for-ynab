(function poll() {
  if (typeof ynabToolKit !== 'undefined' && ynabToolKit.pageReady === true) {
    ynabToolKit.enhancedSelectedTotals = (function () {
      function calculateSelectedTotal(accountsController) {
        var total = 0;
        var transactions = accountsController.get('areChecked');

        transactions.forEach(function (transaction) {
          if (transaction.inflow) {
            total += transaction.inflow;
          } else {
            total -= transaction.outflow;
          }
        });

        return total;
      }

      function addSelectedTotalContainer() {
        if ($('.ynab-toolkit-selected-total').length === 0) {
          $('<div class="ynab-toolkit-selected-total">' +
              '<div class="accounts-header-balances-label" title="The total of the current selected transactions.">Selected Total</div>' +
            '</div>').appendTo('.accounts-header-balances');
        }
      }

      function updateSelectedTotal(accountsController) {
        Ember.run.next(function () {
          addSelectedTotalContainer();

          var areChecked = accountsController.get('areChecked');

          if (areChecked.length === 0) {
            return $('.ynab-toolkit-selected-total').hide();
          }

          $('.ynab-toolkit-selected-total').show();
          $('.ynab-toolkit-selected-total .currency-container').remove();

          var total = calculateSelectedTotal(accountsController);
          var formattedCurrency = ynabToolKit.shared.formatCurrency(total);
          var userData = $('<span>', { class: 'user-data currency-container', title: formattedCurrency });
          var userCurrency = $('<span>', { class: 'user-data currency' });

          if (total < 0) {
            userCurrency.addClass('negative');
          } else {
            userCurrency.addClass('positive');
          }

          ynabToolKit.shared.appendFormattedCurrencyHtml(userCurrency, total);
          userCurrency.appendTo(userData);
          userData.appendTo($('.ynab-toolkit-selected-total'));
        });
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
