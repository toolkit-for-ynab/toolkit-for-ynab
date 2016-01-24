(function poll() {
  // Waits until an external function gives us the all clear that we can run (at /shared/main.js)
  if ( typeof ynabToolKit !== "undefined"  && ynabToolKit.pageReady === true ) {
    function getDateInfo() {
      var selectedMonth = ynabToolKit.shared.parseSelectedMonth();
      var currentMonthName = ynabToolKit.l10n.Data.Global.Month[selectedMonth.getMonth() + 1];
      var previousMonthName;
      if (selectedMonth.getMonth() == 0) {
        previousMonthName = ynabToolKit.l10n.Data.Global.Month[12];
      }
      else {
        previousMonthName = ynabToolKit.l10n.Data.Global.Month[selectedMonth.getMonth()];
      }
      return {
        selectedMonth: selectedMonth,
        currentMonthName: currentMonthName,
        previousMonthName: previousMonthName
      }
    }

    ynabToolKit.l10n.localize.inspector = function () { // Keep feature functions contained within this
      var inspector = $('.budget-inspector');

      // No categories selected
      if ($(inspector).find('div').hasClass('budget-inspector-default-inspector')) {
        var headers = $(inspector).find("h3");
        headers[0].textContent = ynabToolKit.l10n.Data.Budget.Inspector.Header.Budgeted;
        headers[1].textContent = ynabToolKit.l10n.Data.Budget.Inspector.Header.Activity;
        headers[2].textContent = ynabToolKit.l10n.Data.Budget.Inspector.Header.Available;
        headers[3].textContent = ynabToolKit.l10n.Data.Budget.Inspector.Header.Inflows;
        headers[4].textContent = ynabToolKit.l10n.Data.Budget.Inspector.Header.Quick;

        var buttons = $(inspector).find("button");
        buttons[0].childNodes[1].textContent = ynabToolKit.l10n.Data.Budget.Inspector.Button.Underfunded;
        buttons[1].childNodes[1].textContent = ynabToolKit.l10n.Data.Budget.Inspector.Button.BudgetedLastMonth;
        buttons[2].childNodes[1].textContent = ynabToolKit.l10n.Data.Budget.Inspector.Button.SpentLastMonth;
        buttons[3].childNodes[1].textContent = ynabToolKit.l10n.Data.Budget.Inspector.Button.AverageBudgeted;
        buttons[4].childNodes[1].textContent = ynabToolKit.l10n.Data.Budget.Inspector.Button.AverageSpent;
      }

      // One category selected
      if ($(inspector).find('div').hasClass('ember-view budget-inspector-category-header')) {
        var date = getDateInfo();

        var titles = $(inspector).find('dt');
        titles[0].textContent = ynabToolKit.l10n.Data.Budget.Inspector.Title.CashLeft;
        titles[1].textContent = ynabToolKit.l10n.Data.Budget.Inspector.Title.Budgeted;
        titles[2].textContent = ynabToolKit.l10n.Data.Budget.Inspector.Title.CashSpending;
        titles[3].textContent = ynabToolKit.l10n.Data.Budget.Inspector.Title.CreditSpending;
        titles[4].textContent = ynabToolKit.l10n.Data.Budget.Inspector.Title.Available;

        var headers = $(inspector).find("h3");
        headers[0].textContent = ynabToolKit.l10n.Data.Budget.Inspector.Header.Quick;
        headers[1].textContent = ynabToolKit.l10n.Data.Budget.Inspector.Header.Goals;
        headers[2].textContent = ynabToolKit.l10n.Data.Budget.Inspector.Header.Notes;

        $('.inspector-category-edit')[0].childNodes[1].textContent = " " + ynabToolKit.l10n.Data.Budget.Inspector.Button.Edit;

        var buttons = $(inspector).find('.budget-inspector-button');
        k = 0;
        if (buttons.length == 5) {
            buttons[0].childNodes[1].textContent = ynabToolKit.l10n.Data.Budget.Inspector.Button.UpcomingTransactions;
            k = 1;
        }
        buttons[k].childNodes[1].textContent = ynabToolKit.l10n.Data.Budget.Inspector.Button.BudgetedLastMonth;
        buttons[k + 1].childNodes[1].textContent = ynabToolKit.l10n.Data.Budget.Inspector.Button.SpentLastMonth;
        buttons[k + 2].childNodes[1].textContent = ynabToolKit.l10n.Data.Budget.Inspector.Button.AverageBudgeted;
        buttons[k + 3].childNodes[1].textContent = ynabToolKit.l10n.Data.Budget.Inspector.Button.AverageSpent;

        $('.budget-inspector-goals-create')[0].childNodes[3].textContent = ynabToolKit.l10n.Data.Budget.Inspector.Button.CreateGoal;

        categoryNote = $(inspector).find('.inspector-category-note').contents()[3];
        if (categoryNote.textContent == "Enter a note...") {
          categoryNote.textContent = ynabToolKit.l10n.Data.Global.Placeholder.Note;
        }
      }

      // Multiple categories selected
      if ($(inspector).find('div').hasClass('budget-inspector-multi-select-inspector')) {
        $(inspector).find('h2').contents()[2].textContent = ynabToolKit.l10n.Data.Budget.Inspector.Header.CategoriesSelected;

        var headers = $(inspector).find('h3');
        headers[0].textContent = ynabToolKit.l10n.Data.Budget.Inspector.Header.Budgeted;
        headers[1].textContent = ynabToolKit.l10n.Data.Budget.Inspector.Header.Activity;
        headers[2].textContent = ynabToolKit.l10n.Data.Budget.Inspector.Header.Available;
        headers[3].textContent = ynabToolKit.l10n.Data.Budget.Inspector.Header.QuickSelected;

        var buttons = $(inspector).find("button");
        buttons[0].childNodes[1].textContent = ynabToolKit.l10n.Data.Budget.Inspector.Button.Underfunded;
        buttons[1].childNodes[1].textContent = ynabToolKit.l10n.Data.Budget.Inspector.Button.BudgetedLastMonth;
        buttons[2].childNodes[1].textContent = ynabToolKit.l10n.Data.Budget.Inspector.Button.SpentLastMonth;
        buttons[3].childNodes[1].textContent = ynabToolKit.l10n.Data.Budget.Inspector.Button.AverageBudgeted;
        buttons[4].childNodes[1].textContent = ynabToolKit.l10n.Data.Budget.Inspector.Button.AverageSpent;
      }

      // TODO Add credit cards inspector handling

    }; // Keep feature functions contained within this
    ynabToolKit.l10n.localize.inspector();

    ynabToolKit.l10n.localize.calendarModal = function () {
      var calendar = $('.modal-calendar');
      var months = $(calendar).find('ul.ynab-calendar-months>li>button');
      for (var i = 0; i < months.length; i++) {
        months[i].textContent = ynabToolKit.l10n.Data.Global.Month[i + 1];
      }
    };
    ynabToolKit.l10n.localize.calendarModal();

    ynabToolKit.l10n.localize.budgetHeader = function ()  {
      var date = getDateInfo();

      var button = $('.budget-header-calendar-date-button')[0];
      $(button).contents()[1].textContent = date.currentMonthName + " " + date.selectedMonth.getFullYear();

      $('.budget-header-totals-amount-label')[0].textContent = ynabToolKit.l10n.Data.Budget.Header.Totals.TBB;
      var stats = $(".budget-header-totals-cell-name");
      stats[0].textContent = ynabToolKit.l10n.Data.Budget.Header.Totals.Funds + " " + date.currentMonthName;
      stats[1].textContent = ynabToolKit.l10n.Data.Budget.Header.Totals.Overspent + " " + date.previousMonthName;
      stats[2].textContent = ynabToolKit.l10n.Data.Budget.Header.Totals.Budgeted + " " + date.currentMonthName;
      stats[3].textContent = ynabToolKit.l10n.Data.Budget.Header.Totals.BIF;

      var calendarNote = $('.budget-header-calendar-note').contents()[1];
      if (calendarNote.textContent == "Enter a note...") {
        calendarNote.textContent = ynabToolKit.l10n.Data.Global.Placeholder.Note;
      }

      if (!ynabToolKit.options.hideAOM) {
        $('.budget-header-days-label')[0].textContent = ynabToolKit.l10n.Data.Budget.Header.Metric.AoM;
      }
    };
    ynabToolKit.l10n.localize.budgetHeader();

    ynabToolKit.l10n.localize.budgetTable = function ()  {
      budgetTableHeader = $('.budget-table-header');
      $(budgetTableHeader).find('.budget-table-cell-name')[0].textContent = ynabToolKit.l10n.Data.Budget.Table.Header.Category;
      $(budgetTableHeader).find('.budget-table-cell-budgeted')[0].textContent = ynabToolKit.l10n.Data.Budget.Table.Header.Budgeted;
      $(budgetTableHeader).find('.budget-table-cell-activity')[0].textContent = ynabToolKit.l10n.Data.Budget.Table.Header.Activity;
      $(budgetTableHeader).find('.budget-table-cell-available')[0].textContent = ynabToolKit.l10n.Data.Budget.Table.Header.Available;

      $('.budget-toolbar-add-category').contents()[4].textContent = " " + ynabToolKit.l10n.Data.Budget.Table.Button.CategoryGroup;

      $('.is-master-category.is-debt-payment-category .button-truncate')[0].textContent = ynabToolKit.l10n.Data.Global.Category.CreditCardPayments;
      $('.is-master-category.budget-table-hidden-row .budget-table-cell-edit-category')[0].textContent = ynabToolKit.l10n.Data.Budget.Table.Category.HiddenCategories;
    }
    ynabToolKit.l10n.localize.budgetTable();

    ynabToolKit.l10n.localize.addCategoryGroupModal = function () {
      var modal = $('.modal-add-master-category');
      $(modal).find('input')[0].setAttribute("placeholder", ynabToolKit.l10n.Data.Budget.Table.Placeholder.NewCategoryGroup);
      $(modal).find('.button-primary').contents()[0].textContent = ynabToolKit.l10n.Data.Global.Button.Ok;
      $(modal).find('.button-cancel').contents()[0].textContent = ynabToolKit.l10n.Data.Global.Button.Cancel;
    }

    ynabToolKit.l10n.localize.addCategoryModal = function () {
      var modal = $('.modal-add-sub-category');
      $(modal).find('input')[0].setAttribute("placeholder", ynabToolKit.l10n.Data.Budget.Table.Placeholder.NewCategory);
      $(modal).find('.button-primary').contents()[0].textContent = ynabToolKit.l10n.Data.Global.Button.Ok;
      $(modal).find('.button-cancel').contents()[0].textContent = ynabToolKit.l10n.Data.Global.Button.Cancel;
    }

    ynabToolKit.l10n.localize.hiddenCategoriesModal = function () {
      var modal = $('.modal-budget-hidden-categories');
      $(modal).find('.modal-header').contents()[1].textContent = ynabToolKit.l10n.Data.HiddenCategoriesModal.Title.ClickCategory;
      $(modal).find('.button')[0].textContent = ynabToolKit.l10n.Data.HiddenCategoriesModal.Button.ShowAllHidden;
      $(modal).find('.modal-budget-hidden-categories-master-unhidden:contains("Credit Card Payments")').contents()[1].textContent =
        ynabToolKit.l10n.Data.Global.Category.CreditCardPayments + " ";
    }

  } else {
    setTimeout(poll, 250);
  }
})();
