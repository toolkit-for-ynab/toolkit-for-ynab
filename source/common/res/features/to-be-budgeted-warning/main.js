(function poll() {
  // Waits until an external function gives us the all clear that we can run (at /shared/main.js)
  if (typeof ynabToolKit !== 'undefined' && ynabToolKit.pageReady === true) {
    ynabToolKit.toBeBudgetedWarning = (function () {
      return {
        invoke() {
          // check if TBB > zero, if so, change background color
          if ($('.budget-header-totals-amount-value .currency').hasClass('positive')) {
            $('.budget-header-totals-amount').addClass('toolkit-cautious');
            $('.budget-header-totals-amount-arrow').addClass('toolkit-cautious');
          } else {
            $('.budget-header-totals-amount').removeClass('toolkit-cautious');
            $('.budget-header-totals-amount-arrow').removeClass('toolkit-cautious');
          }
        },

        observe(changedNodes) {
          if (changedNodes.has('budget-header-totals-cell-value user-data') ||
            changedNodes.has('budget-content resizable') ||
            changedNodes.has('layout user-logged-in')) {
            ynabToolKit.toBeBudgetedWarning.invoke();
          }
        }
      };
    }()); // Keep feature functions contained within this object

    var href = window.location.href;
    href = href.replace('youneedabudget.com', '');
    if (/budget/.test(href)) {
      ynabToolKit.toBeBudgetedWarning.invoke();
    }
  } else {
    setTimeout(poll, 250);
  }
}());
