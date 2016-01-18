(function poll() { 
  // Waits until an external function gives us the all clear that we can run (at /shared/main.js)
  if ( typeof ynabToolKit !== "undefined"  && ynabToolKit.pageReady === true ) {
  
    ynabToolKit.l10nData = {
      // Inspector
      TOTAL_BUDGETED : "ЗАБЮДЖЕТИРОВАНО",
      TOTAL_ACTIVITY : "АКТИВНОСТЬ",
      TOTAL_AVAILABLE : "ДОСТУПНО",
      TOTAL_INFLOWS : "ПОСТУПЛЕНИЯ",
      QUICK_BUDGET : "БЫСТРОЕ БЮДЖЕТИРОВАНИЕ",
      // Inspector buttons
    } 

    //   buttons = $(inspector).find("button");
    //   buttons[0].childNodes[1].textContent = "Недобюджетировано";
    //   buttons[1].childNodes[1].textContent = "Бюджет предыдущего месяца";
    //   buttons[2].childNodes[1].textContent = "Траты предыдущего месяца";
    //   buttons[3].childNodes[1].textContent = "Средний бюджет";
    //   buttons[4].childNodes[1].textContent = "Средние траты";

    // }; // Keep feature functions contained within this
    // ynabToolKit.l10nInspector($('.budget-inspector')); // Run once and activate setTimeOut()

    // ynabToolKit.l10nBudgetHeaderTotals = function (budgetHeaderTotals)  { // Keep feature functions contained within this

    //   budgetHeaderTotals.find(".budget-header-totals-amount-label")[0].textContent = "К бюджетированию";

    //   budgetHeaderTotals.find(".budget-header-totals-cell-name")[0].textContent = "Средства на январь";
    //   budgetHeaderTotals.find(".budget-header-totals-cell-name")[1].textContent = "Перерасход в январе";
    //   budgetHeaderTotals.find(".budget-header-totals-cell-name")[2].textContent = "Забюджетировано в январе";
    //   budgetHeaderTotals.find(".budget-header-totals-cell-name")[3].textContent = "На будущее";

    // }; // Keep feature functions contained within this
    // ynabToolKit.l10nBudgetHeaderTotals($('.budget-header-totals'));

  } else {
    setTimeout(poll, 250);  
  }
})();
