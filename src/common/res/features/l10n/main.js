(function poll() {
  // Waits until an external function gives us the all clear that we can run (at /shared/main.js)
  if ( typeof ynabToolKit !== "undefined"  && ynabToolKit.pageReady === true ) {

    ynabToolKit.l10n.localize.Inspector = function (inspector)  { // Keep feature functions contained within this

      var headers = $(inspector).find("h3");
      headers[0].textContent = ynabToolKit.l10n.Data.Budget.Inspector.Totals.Budgeted;
      headers[1].textContent = ynabToolKit.l10n.Data.Budget.Inspector.Totals.Activity;
      headers[2].textContent = ynabToolKit.l10n.Data.Budget.Inspector.Totals.Available;
      headers[3].textContent = ynabToolKit.l10n.Data.Budget.Inspector.Totals.Inflows;
      headers[4].textContent = ynabToolKit.l10n.Data.Budget.Inspector.Totals.Quick;

      var buttons = $(inspector).find("button");
      buttons[0].childNodes[1].textContent = "Недобюджетировано";
      buttons[1].childNodes[1].textContent = "Бюджет предыдущего месяца";
      buttons[2].childNodes[1].textContent = "Траты предыдущего месяца";
      buttons[3].childNodes[1].textContent = "Средний бюджет";
      buttons[4].childNodes[1].textContent = "Средние траты";

    }; // Keep feature functions contained within this
    ynabToolKit.l10n.localize.Inspector($('.budget-inspector'));

    ynabToolKit.l10n.localize.ModalCalendar = function (calendar)  {
      months = $(calendar).find('ul.ynab-calendar-months>li>button');
      for (var i = 0; i < months.length; i++) {
        months[i].textContent = ynabToolKit.l10n.Data.Global.Month[i + 1];
      }
    };
    ynabToolKit.l10n.localize.ModalCalendar($('.modal-calendar'));

    ynabToolKit.l10n.localize.BudgetHeaderTotals = function (budgetHeaderTotals)  { // Keep feature functions contained within this

      budgetHeaderTotals.find(".budget-header-totals-amount-label")[0].textContent = "К бюджетированию";

      budgetHeaderTotals.find(".budget-header-totals-cell-name")[0].textContent = "Средства на январь";
      budgetHeaderTotals.find(".budget-header-totals-cell-name")[1].textContent = "Перерасход в январе";
      budgetHeaderTotals.find(".budget-header-totals-cell-name")[2].textContent = "Забюджетировано в январе";
      budgetHeaderTotals.find(".budget-header-totals-cell-name")[3].textContent = "На будущее";

    }; // Keep feature functions contained within this
    ynabToolKit.l10n.localize.BudgetHeaderTotals($('.budget-header-totals'));

  } else {
    setTimeout(poll, 250);
  }
})();
