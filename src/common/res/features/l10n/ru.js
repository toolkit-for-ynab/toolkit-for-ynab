(function poll() { 
  // Waits until an external function gives us the all clear that we can run (at /shared/main.js)
  if ( typeof ynabToolKit !== "undefined"  && ynabToolKit.pageReady === true ) {
  
    ynabToolKit.l10nData = {
      // Global names
      Global_Button_Ok : "OK",
      Global_Button_Cancel : "Отмена",
      Global_Month_1 : "Янв",
      Global_Month_2 : "Фев",
      Global_Month_3 : "Мар",
      Global_Month_4 : "Апр",
      Global_Month_5 : "Май",
      Global_Month_6 : "Июнь",
      Global_Month_7 : "Июль",
      Global_Month_8 : "Авг",
      Global_Month_9 : "Сент",
      Global_Month_10 : "Окт",
      Global_Month_11 : "Ноя",
      Global_Month_12 : "Дек",
      
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
