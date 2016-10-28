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
              '<div id="ynab-toolkit-selected-total-message" class="accounts-header-balances-label" title="The total of the current selected transactions."></div>' +
            '</div>').appendTo('.accounts-header-balances');
        }
      }

      function updateSelectedTotal(accountsController) {
        Ember.run.next(function () {
          addSelectedTotalContainer();

          let areChecked = accountsController.get('areChecked');

          if (areChecked.length === 0) {
            return $('.ynab-toolkit-selected-total').hide();
          }

          $('.ynab-toolkit-selected-total').show();
          $('.ynab-toolkit-selected-total .currency-container').remove();

          let message = areChecked.length + ' selected transaction' + (areChecked.length > 1 ? 's' : '') + ' totaling:';

          let total = calculateSelectedTotal(accountsController);
          let formattedCurrency = ynabToolKit.shared.formatCurrency(total);
          let userData = $('<span>', { class: 'user-data currency-container', title: formattedCurrency });
          let userCurrency = $('<span>', { class: 'user-data currency' });

          if (total < 0) {
            userCurrency.addClass('negative');
          } else {
            userCurrency.addClass('positive');
          }

          $('#ynab-toolkit-selected-total-message').text(message);

          ynabToolKit.shared.appendFormattedCurrencyHtml(userCurrency, total);
          userCurrency.appendTo(userData);
          userData.appendTo($('.ynab-toolkit-selected-total'));
        });
      }

      return {
        invoke: function () {
          let accounts = ynabToolKit.shared.containerLookup('controller:accounts');
          accounts.addObserver('areChecked', updateSelectedTotal);
        }
      };
    }());

    ynabToolKit.enhancedSelectedTotals.invoke();
  } else {
    setTimeout(poll, 250);
  }
}());
