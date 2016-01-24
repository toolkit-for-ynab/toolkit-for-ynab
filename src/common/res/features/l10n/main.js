(function poll() {
  // Waits until an external function gives us the all clear that we can run (at /shared/main.js)
  if ( typeof ynabToolKit !== "undefined"  && ynabToolKit.pageReady === true ) {
    // Shortcut
    var l10n = ynabToolKit.l10n.Data;

    function getDateInfo() {
      var selectedMonth = ynabToolKit.shared.parseSelectedMonth();
      var currentMonthName = l10n.Global.Month[selectedMonth.getMonth() + 1];
      var previousMonthName;
      if (selectedMonth.getMonth() == 0) {
        previousMonthName = l10n.Global.Month[12];
      }
      else {
        previousMonthName = l10n.Global.Month[selectedMonth.getMonth()];
      }
      return {
        selectedMonth: selectedMonth,
        currentMonthName: currentMonthName,
        previousMonthName: previousMonthName
      }
    }

    function setContent(el, text) {
        if (el) el.textContent = text;
    }

    ynabToolKit.l10n.localize.inspector = function () { // Keep feature functions contained within this
      var inspector = $('.budget-inspector');

      // No categories selected
      if ($(inspector).find('div').hasClass('budget-inspector-default-inspector')) {
        var headers = $(inspector).find("h3");
        headers[0].textContent = l10n.Budget.Inspector.Header.Budgeted;
        headers[1].textContent = l10n.Budget.Inspector.Header.Activity;
        headers[2].textContent = l10n.Budget.Inspector.Header.Available;
        headers[3].textContent = l10n.Budget.Inspector.Header.Inflows;
        headers[4].textContent = l10n.Budget.Inspector.Header.Quick;

        var buttons = $(inspector).find("button");
        buttons[0].childNodes[1].textContent = l10n.Budget.Inspector.Button.Underfunded;
        buttons[1].childNodes[1].textContent = l10n.Budget.Inspector.Button.BudgetedLastMonth;
        buttons[2].childNodes[1].textContent = l10n.Budget.Inspector.Button.SpentLastMonth;
        buttons[3].childNodes[1].textContent = l10n.Budget.Inspector.Button.AverageBudgeted;
        buttons[4].childNodes[1].textContent = l10n.Budget.Inspector.Button.AverageSpent;
      }

      // One category selected
      if ($(inspector).find('div').hasClass('ember-view budget-inspector-category-header')) {
        var date = getDateInfo();

        var titles = $(inspector).find('dt');
        titles[0].textContent = l10n.Budget.Inspector.Title.CashLeft;
        titles[1].textContent = l10n.Budget.Inspector.Title.BudgetedThisMonth;
        titles[2].textContent = l10n.Budget.Inspector.Title.CashSpending;
        titles[3].textContent = l10n.Budget.Inspector.Title.CreditSpending;
        if (titles[4]) titles[4].textContent = l10n.Budget.Inspector.Title.Available;

        // Inspector credit payment.
        try {
          var payment = $(inspector).find(".budget-inspector-payment");
          $(payment).find("h3")[0].textContent = l10n.Budget.Inspector.Header.Payment;

          var paidHowMuch = $(payment).find('.paid-msg').contents()[0].textContent.split(' ')[1];
          $(payment).find('.paid-msg').contents()[0].textContent = l10n.Budget.Inspector.Text.Credit.Paid + " " + paidHowMuch;
          var paidWhen = $(payment).find('.paid-msg').contents()[2].textContent.split(' ')[2];
          $(payment).find('.paid-msg').contents()[2].textContent = " " + l10n.Budget.Inspector.Text.Credit.On + " " + paidWhen;

          var recommendation = $(payment).find('.recommendation');
          recommendation.contents()[1].textContent = l10n.Budget.Inspector.Text.Credit.IfYouPay + " ";
          recommendation.contents()[3].textContent = ", "+ l10n.Budget.Inspector.Text.Credit.BalanceWillBe + " ";
          recommendation.contents()[5].textContent = " " + l10n.Budget.Inspector.Text.Credit.YoullIncrease + " ";

          $(payment).find('.progress>em').contents()[1].textContent = " " + l10n.Budget.Inspector.Text.Credit.Spending;
          $(payment).find('.progress>em').contents()[3].textContent = " " + l10n.Budget.Inspector.Text.Credit.Available;
        }
        catch(err) {
          console.log(err);
        }

        $(inspector).find(".inspector-quick-budget h3")[0].textContent = l10n.Budget.Inspector.Header.Quick;
        $(inspector).find(".budget-inspector-goals h3")[0].textContent = l10n.Budget.Inspector.Header.Goals;
        $(inspector).find(".inspector-notes h3")[0].textContent = l10n.Budget.Inspector.Header.Notes;

        var editButton = $(inspector).find('.inspector-category-edit')[0];
        if (editButton) editButton.childNodes[1].textContent = " " + l10n.Global.Button.Edit;

        var buttons = $(inspector).find('.budget-inspector-button');
        k = 0;
        if (buttons.length == 5) {
            buttons[0].childNodes[1].textContent = l10n.Budget.Inspector.Button.UpcomingTransactions;
            k = 1;
        }
        buttons[k].childNodes[1].textContent = l10n.Budget.Inspector.Button.BudgetedLastMonth;
        buttons[k + 1].childNodes[1].textContent = l10n.Budget.Inspector.Button.SpentLastMonth;
        buttons[k + 2].childNodes[1].textContent = l10n.Budget.Inspector.Button.AverageBudgeted;
        buttons[k + 3].childNodes[1].textContent = l10n.Budget.Inspector.Button.AverageSpent;

        categoryNote = $(inspector).find('.inspector-category-note').contents()[3];
        if (categoryNote.textContent == "Enter a note...") {
          categoryNote.textContent = l10n.Global.Placeholder.Note;
        }

        setContent($(inspector).find('.budget-inspector-goals-create').contents()[3], l10n.Budget.Inspector.Button.CreateGoal);
        setContent($(inspector).find('.edit-goal').contents()[1], l10n.Global.Button.Edit);

      }

      // Multiple categories selected
      if ($(inspector).find('div').hasClass('budget-inspector-multi-select-inspector')) {
        $(inspector).find('h2').contents()[2].textContent = l10n.Budget.Inspector.Header.CategoriesSelected;

        var headers = $(inspector).find('h3');
        headers[0].textContent = l10n.Budget.Inspector.Header.Budgeted;
        headers[1].textContent = l10n.Budget.Inspector.Header.Activity;
        headers[2].textContent = l10n.Budget.Inspector.Header.Available;
        headers[3].textContent = l10n.Budget.Inspector.Header.QuickSelected;

        var buttons = $(inspector).find("button");
        buttons[0].childNodes[1].textContent = l10n.Budget.Inspector.Button.Underfunded;
        buttons[1].childNodes[1].textContent = l10n.Budget.Inspector.Button.BudgetedLastMonth;
        buttons[2].childNodes[1].textContent = l10n.Budget.Inspector.Button.SpentLastMonth;
        buttons[3].childNodes[1].textContent = l10n.Budget.Inspector.Button.AverageBudgeted;
        buttons[4].childNodes[1].textContent = l10n.Budget.Inspector.Button.AverageSpent;
      }

      // TODO Add credit cards inspector handling

      var goals = $('.budget-inspector-goals');
      setContent($(goals).find('[data-value=TB]').contents()[4], l10n.Budget.Inspector.Title.GoalTarget);
      setContent($(goals).find('[data-value=TBD]').contents()[4], l10n.Budget.Inspector.Title.GoalTargetByDate);
      setContent($(goals).find('[data-value=MF]').contents()[4], l10n.Budget.Inspector.Title.GoalMonthly);
      setContent($(goals).find('dd.actions>.link-button').contents()[0], l10n.Global.Button.Delete);
      setContent($(goals).find('dd.actions>.link-button').contents()[1], l10n.Global.Button.Cancel);
      setContent($(goals).find('dd.actions>.button-primary').contents()[1], l10n.Global.Button.Ok);
      setContent($(goals).find('.percent-label').contents()[0], l10n.Budget.Inspector.Title.Complete);
      setContent($(goals).find('.label').contents()[0], l10n.Budget.Inspector.Title.Budgeted);
      setContent($(goals).find('.label').contents()[1], l10n.Budget.Inspector.Title.ToGo);
      var goalLabelText = $(goals).find('dt').contents()[2];
      if (goalLabelText) {
        if (goalLabelText.textContent == "Target Balance") setContent(goalLabelText, l10n.Budget.Inspector.Title.TargetBalance);
        if (goalLabelText.textContent == "Target Budgeted Amount") setContent(goalLabelText, l10n.Budget.Inspector.Title.TargetBudgetedAmount);
      }
      setContent($(goals).find('dt').contents()[5], l10n.Budget.Inspector.Title.TargetMonthYear);
      for (var i = 0; i < Object.keys(l10n.Global.Month).length; i++) {
        setContent($(goals).find('.goal-target-month>option').contents()[i], l10n.Global.Month[i + 1]);
      }


    }; // Keep feature functions contained within this
    ynabToolKit.l10n.localize.inspector();

    ynabToolKit.l10n.localize.calendarModal = function () {
      var calendar = $('.modal-calendar');
      var months = $(calendar).find('ul.ynab-calendar-months>li>button');
      for (var i = 0; i < months.length; i++) {
        months[i].textContent = l10n.Global.Month[i + 1];
      }
    };
    ynabToolKit.l10n.localize.calendarModal();

    ynabToolKit.l10n.localize.budgetHeader = function ()  {
      var date = getDateInfo();

      var button = $('.budget-header-calendar-date-button')[0];
      $(button).contents()[1].textContent = date.currentMonthName + " " + date.selectedMonth.getFullYear();

      $('.budget-header-totals-amount-label')[0].textContent = l10n.Budget.Header.Totals.TBB;
      var stats = $(".budget-header-totals-cell-name");
      stats[0].textContent = l10n.Budget.Header.Totals.Funds + " " + date.currentMonthName;
      stats[1].textContent = l10n.Budget.Header.Totals.Overspent + " " + date.previousMonthName;
      stats[2].textContent = l10n.Budget.Header.Totals.Budgeted + " " + date.currentMonthName;
      stats[3].textContent = l10n.Budget.Header.Totals.BIF;

      var calendarNote = $('.budget-header-calendar-note').contents()[1];
      if (calendarNote.textContent == "Enter a note...") {
        calendarNote.textContent = l10n.Global.Placeholder.Note;
      }

      if (!ynabToolKit.options.hideAOM) {
        // TODO Add Russian option check.
        var daysNumber = $('.budget-header-days-age').contents()[0];
        $('.budget-header-days-age').contents()[2].textContent = ynabToolKit.shared.declension('ru', daysNumber, {nom: 'день', gen: 'дня', plu: 'дней'});
        $('.budget-header-days-label')[0].textContent = l10n.Budget.Header.Metric.AoM;
      }
    };
    ynabToolKit.l10n.localize.budgetHeader();

    ynabToolKit.l10n.localize.budgetTable = function ()  {
      budgetTableHeader = $('.budget-table-header');
      $(budgetTableHeader).find('.budget-table-cell-name')[0].textContent = l10n.Budget.Table.Header.Category;
      $(budgetTableHeader).find('.budget-table-cell-budgeted')[0].textContent = l10n.Budget.Table.Header.Budgeted;
      $(budgetTableHeader).find('.budget-table-cell-activity')[0].textContent = l10n.Budget.Table.Header.Activity;
      $(budgetTableHeader).find('.budget-table-cell-available')[0].textContent = l10n.Budget.Table.Header.Available;

      $('.budget-toolbar-add-category').contents()[4].textContent = " " + l10n.Budget.Table.Button.CategoryGroup;

      $('.is-master-category.is-debt-payment-category .button-truncate')[0].textContent = l10n.Global.Category.CreditCardPayments;
      $('.is-master-category.budget-table-hidden-row .budget-table-cell-edit-category')[0].textContent = l10n.Budget.Table.Category.HiddenCategories;
    }
    ynabToolKit.l10n.localize.budgetTable();

    ynabToolKit.l10n.localize.addCategoryGroupModal = function () {
      var modal = $('.modal-add-master-category');
      $(modal).find('input')[0].setAttribute("placeholder", l10n.Budget.Table.Placeholder.NewCategoryGroup);
      $(modal).find('.button-primary').contents()[0].textContent = l10n.Global.Button.Ok;
      $(modal).find('.button-cancel').contents()[0].textContent = l10n.Global.Button.Cancel;
    }

    ynabToolKit.l10n.localize.addCategoryModal = function () {
      var modal = $('.modal-add-sub-category');
      $(modal).find('input')[0].setAttribute("placeholder", l10n.Budget.Table.Placeholder.NewCategory);
      $(modal).find('.button-primary').contents()[0].textContent = l10n.Global.Button.Ok;
      $(modal).find('.button-cancel').contents()[0].textContent = l10n.Global.Button.Cancel;
    }

    ynabToolKit.l10n.localize.hiddenCategoriesModal = function () {
      var modal = $('.modal-budget-hidden-categories');
      $(modal).find('.modal-header').contents()[1].textContent = l10n.HiddenCategoriesModal.Title.ClickCategory;
      $(modal).find('.button')[0].textContent = l10n.HiddenCategoriesModal.Button.ShowAllHidden;
      creditCardPaymentsText = $(modal).find('.modal-budget-hidden-categories-master-unhidden:contains("Credit Card Payments")').contents()[1];
      if (creditCardPaymentsText) creditCardPaymentsText.textContent = l10n.Global.Category.CreditCardPayments + " ";
    }

    ynabToolKit.l10n.localize.editCategoryModal = function () {
      var modal = $('.modal-budget-edit-category');
      $(modal).find('.button-primary').contents()[0].textContent = l10n.Global.Button.Ok;
      $(modal).find('.button-cancel').contents()[0].textContent = l10n.Global.Button.Cancel;
      var deleteButtonText = $(modal).find('.button-delete').contents()[2];
      if (deleteButtonText) deleteButtonText.textContent = l10n.Global.Button.Delete;
      $(modal).find('.button-hide').contents()[2].textContent = l10n.EditCategoryModal.Button.Hide;
      var creditCardPaymentsText = $(modal).find('.modal-budget-edit-category-label:contains("Credit Card Payments")')[0];
      if (creditCardPaymentsText) creditCardPaymentsText.textContent = l10n.Global.Category.CreditCardPayments;
    }

    // Modal template
    // ynabToolKit.l10n.localize.someModal = function () {
    //   var modal = $('.modal-class');
    // }

  } else {
    setTimeout(poll, 250);
  }
})();
