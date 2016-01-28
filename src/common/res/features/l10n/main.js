(function poll() {
  // Waits until an external function gives us the all clear that we can run (at /shared/main.js)
  if ( typeof ynabToolKit !== "undefined"  && ynabToolKit.pageReady === true ) {

    ynabToolKit.l10n.localize = new function ()  {

      // Shortcut
      var l10n = ynabToolKit.l10n.Data;

      function getDateInfo() {
        var selectedMonth = ynabToolKit.shared.parseSelectedMonth();
        var currentMonthName = l10n.Global.Month[selectedMonth.getMonth()];
        var previousMonthName;
        if (selectedMonth.getMonth() == 0) {
          previousMonthName = l10n.Global.Month[12];
        }
        else {
          previousMonthName = l10n.Global.Month[selectedMonth.getMonth() - 1];
        }
        return {
          selectedMonth: selectedMonth,
          currentMonthName: currentMonthName,
          previousMonthName: previousMonthName
        }
      }

      // Tool for setting content.
      contentSetter = new function () {
        this.selectorPrefix = '',
        this.resetPrefix = function () {
          this.selectorPrefix = ''
        },
        // Takes contentNum's .contents() of selector and sets it to text.
        this.set = function (text, contentNum, selector) {
          el = $(this.selectorPrefix + selector || '').contents()[contentNum];
          if (el) el.textContent = text;
        },
        // Each argument must be an array of 2 or 3 elements that become this.set arguments in order.
        this.setSeveral = function () {
          for (i = 0; i < arguments.length; i++) {
            this.set(arguments[i][0], arguments[i][1], arguments[i][2]);
          };
        },
        this.setArray = function() {
          selector = arguments[0];
          for (i = 0; i < arguments[1].length; i++) {
            this.set(arguments[1][i], i, selector);
          };
        }
      }


      this.budgetHeader = function ()  {
        var date = getDateInfo();
        contentSetter.selectorPrefix = '.budget-header-';
        var dateYearText = date.currentMonthName + " " + date.selectedMonth.getFullYear()
        contentSetter.setSeveral(
          [dateYearText, 1, 'calendar-date-button'],
          [l10n.Budget.Header.Totals.TBB, 0, 'totals-amount-label']
        );

        contentSetter.selectorPrefix = '.budget-header-totals-cell-name';
        contentSetter.setArray(
          '',
          [l10n.Budget.Header.Totals.Funds + " " + date.currentMonthName,
          l10n.Budget.Header.Totals.Overspent + " " + date.previousMonthName,
          l10n.Budget.Header.Totals.Budgeted + " " + date.currentMonthName,
          l10n.Budget.Header.Totals.BIF]
        );

        var calendarNote = $('.budget-header-calendar-note').contents()[1];
        // TODO If it doesn't exist?
        if (calendarNote.textContent == "Enter a note...") calendarNote.textContent = l10n.Global.Placeholder.Note;

        contentSetter.selectorPrefix = '.budget-header-days-';
        if (!ynabToolKit.options.hideAOM) {
          // TODO Add Russian option check.
          var aomDays = $('.budget-header-days-age').contents()[0];
          var aomDaysText = ynabToolKit.shared.declension('ru', aomDays, {nom: 'день', gen: 'дня', plu: 'дней'});
          contentSetter.setSeveral(
            [aomDaysText, 2, 'age'],
            [l10n.Budget.Header.Metric.AoM, 0, 'label']
          );
        }
      },


      this.budgetTable = function ()  {
        contentSetter.selectorPrefix = '.budget-table-header .budget-table-cell-';
        contentSetter.setSeveral(
          [l10n.Budget.Table.Header.Category, 0, 'name'],
          [l10n.Budget.Table.Header.Budgeted, 0, 'budgeted'],
          [l10n.Budget.Table.Header.Activity, 0, 'activity'],
          [l10n.Budget.Table.Header.Available, 0, 'available']
        );

        contentSetter.resetPrefix();
        contentSetter.set(" " + l10n.Budget.Table.Button.CategoryGroup, 4, '.budget-toolbar-add-category');

        contentSetter.selectorPrefix = '.is-master-category.';
        contentSetter.setSeveral(
          [l10n.Global.Category.CreditCardPayments, 1, 'is-debt-payment-category .button-truncate'],
          [l10n.Budget.Table.Category.HiddenCategories, 2, 'budget-table-hidden-row .budget-table-cell-edit-category']
        );
      },


      this.inspector = function () { // Keep feature functions contained within this
        var inspector = $('.budget-inspector');

        // No categories selected
        if ($(inspector).find('div').hasClass('budget-inspector-default-inspector')) {
          contentSetter.resetPrefix();
          contentSetter.setArray(
            '.budget-inspector h3',
            [
              l10n.Budget.Inspector.Header.Budgeted,
              l10n.Budget.Inspector.Header.Activity,
              l10n.Budget.Inspector.Header.Available,
              l10n.Budget.Inspector.Header.Inflows,
              l10n.Budget.Inspector.Header.Quick
            ]
          );

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

          contentSetter.resetPrefix();
          contentSetter.setArray(
            '.budget-inspector dt',
            [
              l10n.Budget.Inspector.Title.CashLeft, '', '',
              l10n.Budget.Inspector.Title.BudgetedThisMonth,
              l10n.Budget.Inspector.Title.CashSpending,
              l10n.Budget.Inspector.Title.CreditSpending,
              l10n.Budget.Inspector.Title.Available
            ]
          );

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

          contentSetter.resetPrefix();
          contentSetter.setSeveral(
            [l10n.Budget.Inspector.Button.CreateGoal, 3,'.budget-inspector-goals-create'],
            [l10n.Global.Button.Edit, 1,'.edit-goal']
          );

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
        contentSetter.selectorPrefix = '.budget-inspector-goals ';
        contentSetter.setSeveral(
          [l10n.Budget.Inspector.Title.GoalTarget, 4, '[data-value=TB]'],
          [l10n.Budget.Inspector.Title.GoalTargetByDate, 4, '[data-value=TBD]'],
          [l10n.Budget.Inspector.Title.GoalMonthly, 4, '[data-value=MF]'],
          [l10n.Global.Button.Delete, 0, 'dd.actions>.link-button'],
          [l10n.Global.Button.Cancel, 1, 'dd.actions>.link-button'],
          [l10n.Global.Button.Ok, 1, 'dd.actions>.button-primary'],
          [l10n.Budget.Inspector.Title.Complete, 0, '.percent-label'],
          [l10n.Budget.Inspector.Title.Budgeted, 0, '.label'],
          [l10n.Budget.Inspector.Title.ToGo, 1, '.label']
        );

        var goalLabelText = $(goals).find('dt').contents()[2];
        if (goalLabelText) {
          if (goalLabelText.textContent == "Target Balance") goalLabelText.textContent = l10n.Budget.Inspector.Title.TargetBalance;
          if (goalLabelText.textContent == "Target Budgeted Amount") goalLabelText.textContent = l10n.Budget.Inspector.Title.TargetBudgetedAmount;
        }

        contentSetter.resetPrefix();
        contentSetter.set('.budget-inspector-goals dt', 5, l10n.Budget.Inspector.Title.TargetMonthYear);
        contentSetter.setArray('.budget-inspector-goals .goal-target-month>option', l10n.Global.Month);
        // for (var i = 0; i < Object.keys(l10n.Global.Month).length; i++) {
          // setContent('.budget-inspector-goals .goal-target-month>option', i, l10n.Global.Month[i]);
        // }
      },


      this.calendarModal = function () {
        contentSetter.setArray('.modal-calendar ul.ynab-calendar-months>li>button');
        var calendar = $('.modal-calendar');
        var months = $(calendar).find('ul.ynab-calendar-months>li>button');
        for (var i = 0; i < months.length; i++) {
          months[i].textContent = l10n.Global.Month[i];
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
