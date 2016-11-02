(function poll() {
  if (typeof ynabToolKit !== 'undefined' && ynabToolKit.pageReady === true) {
    ynabToolKit.compactIncomeExpense = (function () {
      return {
        invoke() {
          let viewWidth = $('.reports-content').width();
          let columnCount = $('.income-expense-column.income-expense-column-header').length;
          let tableWidth = columnCount * 115 + 200 + 32;
          let percentage = Math.ceil(tableWidth / viewWidth * 100);
          $('.income-expense-table').css({
            width: percentage + '%'
          });
        },

        observe(changedNodes) {
          let currentRoute = ynabToolKit.shared.getCurrentRoute();
          if (changedNodes.has('income-expense-column') && currentRoute === 'reports.income-expense') {
            ynabToolKit.compactIncomeExpense.invoke();
          }
        }
      };
    }());

    let currentRoute = ynabToolKit.shared.getCurrentRoute();
    if (currentRoute === 'reports.income-expense') {
      ynabToolKit.compactIncomeExpense.invoke();
    }
  } else {
    setTimeout(poll, 250);
  }
}());
