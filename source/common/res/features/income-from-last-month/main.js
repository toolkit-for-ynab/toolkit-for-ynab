/* eslint-disable no-multi-str */

(function poll() {
  // Waits until an external function gives us the all clear that we can run (at /shared/main.js)
  if (typeof ynabToolKit !== 'undefined' && ynabToolKit.pageReady === true && typeof Ember !== 'undefined') {
    ynabToolKit.incomeFromLastMonth = (function () {
      return {
        invoke() {
          if (ynabToolKit.options.incomeFromLastMonth > 0) {
            // Do nothing if no header found.
            if ($('.budget-header-totals-details-values').length === 0) return;
            var selectedMonth = ynabToolKit.shared.parseSelectedMonth().getMonth();
            var previousMonth = selectedMonth - ynabToolKit.options.incomeFromLastMonth;
            var previousYear = ynabToolKit.shared.parseSelectedMonth().getFullYear();
            if (previousMonth < 0) {
              previousMonth += 12;
              previousYear -= 1;
            }

            var previousMonthName = ynabToolKit.shared.monthsShort[previousMonth];

            var entityManager = ynab.YNABSharedLib.defaultInstance.entityManager;
            var transactions = entityManager.getAllTransactions();
            var income = transactions.filter(function (el) {
              return !el.isTombstone &&
                el.transferAccountId === null &&
                el.amount > 0 &&
                el.date.getYear() === previousYear &&
                el.date.getMonth() === previousMonth &&
                el.getAccount().onBudget &&
                (el.getSubCategory() && el.getSubCategory().isIncomeCategory());
            });

            var total = Array.from(income, function (i) {
              return i.amount;
            }).reduce(function (a, b) {
              return a + b;
            }, 0);

            if ($('.income-from-last-month').length === 0) {
              // jscs:disable disallowMultipleLineStrings
              $('.budget-header-totals-details-values').prepend(
                '<div class="budget-header-totals-cell-value income-from-last-month user-data">\
              <span class="user-data currency positive"></span>\
            </div>'

                // jscs:enable disallowMultipleLineStrings
              );
              $('.budget-header-totals-details-names').prepend(
                '<div class="budget-header-totals-cell-name income-from-last-month" style="padding-left: .3em; text-align:left"></div>'
              );
            }

            $('.budget-header-totals-cell-value.income-from-last-month span').html((total < 0 ? '-' : '+') + ynabToolKit.shared.formatCurrency(total, true));
            $('.budget-header-totals-details-names>.income-from-last-month')[0].textContent =
              ((ynabToolKit.l10nData && ynabToolKit.l10nData['toolkit.incomeFrom']) || 'Income from') + ' ' + previousMonthName;
          }
        },

        observe(changedNodes) {
          // User has returned back to the budget screen
          // User switch budget month
          if (changedNodes.has('budget-header-flexbox') ||
            changedNodes.has('budget-table') ||
            changedNodes.has('layout user-logged-in')) {
            ynabToolKit.incomeFromLastMonth.invoke();
          }
        }
      };
    }()); // Keep feature functions contained within this object

    ynabToolKit.incomeFromLastMonth.invoke(); // Run your script once on page load
  } else {
    setTimeout(poll, 250);
  }
}());
