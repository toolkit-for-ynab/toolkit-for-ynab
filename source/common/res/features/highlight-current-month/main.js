(function poll() {
  // Waits until an external function gives us the all clear that we can run (at /shared/main.js)
  if (typeof ynabToolKit !== 'undefined' && ynabToolKit.pageReady === true) {
    ynabToolKit.currentMonthIndicator = (function () {
      // Determine whether the selected month is the current month
      function inCurrentMonth() {
        var today = new Date();
        var selectedMonth = ynabToolKit.shared.parseSelectedMonth();
        if (selectedMonth === null) return false;
        return selectedMonth.getMonth() === today.getMonth() && selectedMonth.getYear() === today.getYear();
      }

      return {
        invoke() {
          // check if header bar is current month, if so, change background color
          if (inCurrentMonth()) {
            $('.budget-header .budget-header-calendar').addClass('toolkit-highlight-current-month');
          } else {
            $('.budget-header .budget-header-calendar').removeClass('toolkit-highlight-current-month');
          }
        },

        observe(changedNodes) {
          if (changedNodes.has('budget-header-totals-cell-value user-data') ||
            changedNodes.has('budget-content resizable') ||
            changedNodes.has('layout user-logged-in')) {
            ynabToolKit.currentMonthIndicator.invoke();
          }
        }
      };
    }()); // Keep feature functions contained within this object

    if (ynabToolKit.shared.getCurrentRoute() === 'budget.index') {
      ynabToolKit.currentMonthIndicator.invoke();
    }
  } else {
    setTimeout(poll, 250);
  }
}());
