/*jshint multistr: true */

(function poll() {
// Waits until an external function gives us the all clear that we can run (at /shared/main.js)
if ( typeof ynabToolKit !== "undefined"  && ynabToolKit.pageReady === true && typeof Ember !== "undefined" ) {

  ynabToolKit.incomeFromLastMonth = new function () {
    var monthsShort = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    if (ynabToolKit.l10nData) {
      var l10n = ynabToolKit.l10nData;
      monthsShort = monthsShort.map(function(month) {
        return l10n["months." + month];
      });
    }

    function getDateInfo() {
      var selectedMonth = ynabToolKit.shared.parseSelectedMonth();
      var currentMonthName = monthsShort[selectedMonth.getMonth()];
      var previousMonthName;
      if (selectedMonth.getMonth() === 0) {
        previousMonthName = monthsShort[11];
      }
      else {
        previousMonthName = monthsShort[selectedMonth.getMonth() - 1];
      }
      return {
        selectedMonth: selectedMonth,
        currentMonthName: currentMonthName,
        previousMonthName: previousMonthName
      };
    }

    this.invoke = function() {
      if (ynabToolKit.options.incomeFromLastMonth > 0) {
        if ($('.budget-header-totals-details-values').length === 0) return;
        var selectedMonth = ynabToolKit.shared.parseSelectedMonth().getMonth();
        var previousMonth = selectedMonth - ynabToolKit.options.incomeFromLastMonth;
        var previousYear = ynabToolKit.shared.parseSelectedMonth().getFullYear();
        if (previousMonth < 0) {
          previousMonth += 12;
          previousYear -= 1;
        }
        previousMonthName = monthsShort[previousMonth];

        var entityManager = ynab.YNABSharedLib.defaultInstance.entityManager;
        var transactions = entityManager.getAllTransactions();
        var income = transactions.filter(function(el) {
          return !el.isTombstone &&
          el.transferAccountId === null &&
          el.amount > 0 &&
          el.date.getYear() === previousYear &&
          el.date.getMonth() === previousMonth; });
        var total = Array.from(income, function (i) { return i.amount; }).reduce(function (a, b) { return a + b; }, 0);

        if ($('.income-from-last-month').length === 0) {
          $('.budget-header-totals-details-values').prepend(
          '<div class="budget-header-totals-cell-value income-from-last-month user-data">\
            <span class="user-data currency positive"></span>\
          </div>'
          );
          $('.budget-header-totals-details-names').prepend(
          '<div class="budget-header-totals-cell-name income-from-last-month"></div>'
          );
        }

        $('.budget-header-totals-cell-value.income-from-last-month span').html((total < 0 ? '-' : '+') + ynabToolKit.shared.formatCurrency(total, true));
        $('.budget-header-totals-cell-name.income-from-last-month')[0].textContent =
          ((ynabToolKit.l10nData && ynabToolKit.l10nData["toolkit.incomeFrom"]) || 'Income from') + ' ' + previousMonthName;
      }
    };

    this.observe = function(changedNodes) {
      // User has returned back to the budget screen
      // User switch budget month
      if (changedNodes.has('budget-header-flexbox') || changedNodes.has('budget-table')) {
        ynabToolKit.incomeFromLastMonth.invoke();
      }
    };
  }; // Keep feature functions contained within this object

  ynabToolKit.incomeFromLastMonth.invoke(); // Run your script once on page load

} else {
  setTimeout(poll, 250);
}
})();
