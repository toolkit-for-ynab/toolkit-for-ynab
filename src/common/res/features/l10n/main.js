(function poll() {
  // Waits until an external function gives us the all clear that we can run (at /shared/main.js)
  if ( typeof ynabToolKit !== "undefined"  && ynabToolKit.pageReady === true ) {

    ynabToolKit.l10n.localize = new function ()  {

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

      function setContent(selector, contentNum, text) {
        el = $(selector).contents()[contentNum];
        if (el) el.textContent = text;
      }


      this.budgetHeader = function ()  {
        var date = getDateInfo();
        setContent('.budget-header-calendar-date-button', 1, date.currentMonthName + " " + date.selectedMonth.getFullYear());
        setContent('.budget-header-totals-amount-label', 0, l10n.Budget.Header.Totals.TBB);

        var totalsSelector = '.budget-header-totals-cell-name';
        setContent(totalsSelector, 0, l10n.Budget.Header.Totals.Funds + " " + date.currentMonthName);
        setContent(totalsSelector, 1, l10n.Budget.Header.Totals.Overspent + " " + date.previousMonthName);
        setContent(totalsSelector, 2, l10n.Budget.Header.Totals.Budgeted + " " + date.currentMonthName);
        setContent(totalsSelector, 3, l10n.Budget.Header.Totals.BIF);

        var calendarNote = $('.budget-header-calendar-note').contents()[1];
        // TODO If it doesn't exist?
        if (calendarNote.textContent == "Enter a note...") calendarNote.textContent = l10n.Global.Placeholder.Note;

        if (!ynabToolKit.options.hideAOM) {
          // TODO Add Russian option check.
          var daysNumber = $('.budget-header-days-age').contents()[0];
          setContent('.budget-header-days-age', 2, ynabToolKit.shared.declension('ru', daysNumber, {nom: 'день', gen: 'дня', plu: 'дней'}));
          setContent('.budget-header-days-label', 0, l10n.Budget.Header.Metric.AoM);
        }
      },


      this.budgetTable = function ()  {
        setContent('.budget-table-header .budget-table-cell-name', 0, l10n.Budget.Table.Header.Category);
        setContent('.budget-table-header .budget-table-cell-budgeted', 0, l10n.Budget.Table.Header.Budgeted);
        setContent('.budget-table-header .budget-table-cell-activity', 0, l10n.Budget.Table.Header.Activity);
        setContent('.budget-table-header .budget-table-cell-available', 0, l10n.Budget.Table.Header.Available);

        $('.budget-toolbar-add-category').contents()[4].textContent = " " + l10n.Budget.Table.Button.CategoryGroup;

        $('.is-master-category.is-debt-payment-category .button-truncate')[0].textContent = l10n.Global.Category.CreditCardPayments;
        $('.is-master-category.budget-table-hidden-row .budget-table-cell-edit-category')[0].textContent = l10n.Budget.Table.Category.HiddenCategories;
      },


      this.inspector = function () { // Keep feature functions contained within this
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

          setContent('.budget-inspector-goals-create', 3, l10n.Budget.Inspector.Button.CreateGoal);
          setContent('.edit-goal', 1, l10n.Global.Button.Edit);

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
        setContent('.budget-inspector-goals [data-value=TB]', 4, l10n.Budget.Inspector.Title.GoalTarget);
        setContent('.budget-inspector-goals [data-value=TBD]', 4, l10n.Budget.Inspector.Title.GoalTargetByDate);
        setContent('.budget-inspector-goals [data-value=MF]', 4, l10n.Budget.Inspector.Title.GoalMonthly);
        setContent('.budget-inspector-goals dd.actions>.link-button', 0, l10n.Global.Button.Delete);
        setContent('.budget-inspector-goals dd.actions>.link-button', 1, l10n.Global.Button.Cancel);
        setContent('.budget-inspector-goals dd.actions>.button-primary', 1, l10n.Global.Button.Ok);
        setContent('.budget-inspector-goals .percent-label', 0, l10n.Budget.Inspector.Title.Complete);
        setContent('.budget-inspector-goals .label', 0, l10n.Budget.Inspector.Title.Budgeted);
        setContent('.budget-inspector-goals .label', 1, l10n.Budget.Inspector.Title.ToGo);

        var goalLabelText = $(goals).find('dt').contents()[2];
        if (goalLabelText) {
          if (goalLabelText.textContent == "Target Balance") goalLabelText.textContent = l10n.Budget.Inspector.Title.TargetBalance;
          if (goalLabelText.textContent == "Target Budgeted Amount") goalLabelText.textContent = l10n.Budget.Inspector.Title.TargetBudgetedAmount;
        }

        setContent('.budget-inspector-goals dt', 5, l10n.Budget.Inspector.Title.TargetMonthYear);
        for (var i = 0; i < Object.keys(l10n.Global.Month).length; i++) {
          setContent('.budget-inspector-goals .goal-target-month>option', i, l10n.Global.Month[i + 1]);
        }
      },


      this.calendarModal = function () {
        var calendar = $('.modal-calendar');
        var months = $(calendar).find('ul.ynab-calendar-months>li>button');
        for (var i = 0; i < months.length; i++) {
          months[i].textContent = l10n.Global.Month[i + 1];
        }
      },

      this.addCategoryGroupModal = function () {
        var modal = $('.modal-add-master-category');
        $(modal).find('input')[0].setAttribute("placeholder", l10n.Budget.Table.Placeholder.NewCategoryGroup);
        $(modal).find('.button-primary').contents()[0].textContent = l10n.Global.Button.Ok;
        $(modal).find('.button-cancel').contents()[0].textContent = l10n.Global.Button.Cancel;
      },

      this.addCategoryModal = function () {
        var modal = $('.modal-add-sub-category');
        $(modal).find('input')[0].setAttribute("placeholder", l10n.Budget.Table.Placeholder.NewCategory);
        $(modal).find('.button-primary').contents()[0].textContent = l10n.Global.Button.Ok;
        $(modal).find('.button-cancel').contents()[0].textContent = l10n.Global.Button.Cancel;
      },

      this.hiddenCategoriesModal = function () {
        var modal = $('.modal-budget-hidden-categories');
        $(modal).find('.modal-header').contents()[1].textContent = l10n.HiddenCategoriesModal.Title.ClickCategory;
        $(modal).find('.button')[0].textContent = l10n.HiddenCategoriesModal.Button.ShowAllHidden;
        creditCardPaymentsText = $(modal).find('.modal-budget-hidden-categories-master-unhidden:contains("Credit Card Payments")').contents()[1];
        if (creditCardPaymentsText) creditCardPaymentsText.textContent = l10n.Global.Category.CreditCardPayments + " ";
      },

      this.editCategoryModal = function () {
        var modal = $('.modal-budget-edit-category');
        $(modal).find('.button-primary').contents()[0].textContent = l10n.Global.Button.Ok;
        $(modal).find('.button-cancel').contents()[0].textContent = l10n.Global.Button.Cancel;
        var deleteButtonText = $(modal).find('.button-delete').contents()[2];
        if (deleteButtonText) deleteButtonText.textContent = l10n.Global.Button.Delete;
        $(modal).find('.button-hide').contents()[2].textContent = l10n.EditCategoryModal.Button.Hide;
        var creditCardPaymentsText = $(modal).find('.modal-budget-edit-category-label:contains("Credit Card Payments")')[0];
        if (creditCardPaymentsText) creditCardPaymentsText.textContent = l10n.Global.Category.CreditCardPayments;
      },

      // Modal template
      // ynabToolKit.l10n.localize.someModal = function () {
      //   var modal = $('.modal-class');
      // }

      this.observe = function(changedNodes) {

        if ( changedNodes.has('budget-inspector') || changedNodes.has('is-checked') || changedNodes.has('budget-inspector-goals') ) {
          ynabToolKit.l10n.localize.inspector();
        }

        // Calendar modal
        if ( changedNodes.has('modal-calendar') ) {
          ynabToolKit.l10n.localize.calendarModal();
        }

        // The user has returned back to the budget screen
        if (changedNodes.has('navlink-budget') && changedNodes.has('active')) {
          ynabToolKit.l10n.localize.budgetHeader();
          ynabToolKit.l10n.localize.budgetTable();
        }

        if (changedNodes.has('budget-header')) {
          ynabToolKit.l10n.localize.budgetHeader();
        }

        // Budget table
        if (changedNodes.has('budget-table')) {
          ynabToolKit.l10n.localize.budgetTable();
        }

        // Add master category modal
        if (changedNodes.has('modal-add-master-category')) {
          ynabToolKit.l10n.localize.addCategoryGroupModal();
        }

        // Add sub category modal
        if (changedNodes.has('modal-add-sub-category')) {
          ynabToolKit.l10n.localize.addCategoryModal();
        }

        // Hidden categories modal
        if (changedNodes.has('modal-budget-hidden-categories')) {
          ynabToolKit.l10n.localize.hiddenCategoriesModal();
        }

        // Hidden categories modal
        if (changedNodes.has('modal-budget-edit-category')) {
          ynabToolKit.l10n.localize.editCategoryModal();
        }

      }

    }; // Keep feature functions contained within this object

    // Run your script once on page load
    ynabToolKit.l10n.localize.inspector();
    ynabToolKit.l10n.localize.budgetHeader();
    ynabToolKit.l10n.localize.budgetTable();

  } else {
    setTimeout(poll, 250);
  }
})();
