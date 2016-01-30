(function poll() {
  // Waits until an external function gives us the all clear that we can run (at /shared/main.js)
  if ( typeof ynabToolKit !== "undefined"  && ynabToolKit.pageReady === true ) {

    ynabToolKit.l10n.localize = new function ()  {

      // Shortcuts
      var l10n = ynabToolKit.l10n.Data;
      var months = Object.keys(l10n.Global.Month)
                         .map(function(k){return l10n.Global.Month[k]});
      var monthsFull = Object.keys(l10n.Global.MonthFull)
                         .map(function(k){return l10n.Global.MonthFull[k]});

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
      var dateInfo = getDateInfo();

      // Tool for setting content.
      contentSetter = new function () {
        this.selectorPrefix = '',
        this.resetPrefix = function () {
          this.selectorPrefix = ''
        },
        // Takes contentNum's .contents() of selector and sets it to text.
        this.set = function (text, contentNum, selector) {
          var el = $(this.selectorPrefix + (selector || '')).contents()[contentNum];
          if (el) el.textContent = text;
        },
        // Each argument must be an array of 2 or 3 elements that become this.set arguments in order.
        this.setSeveral = function () {
          for (i = 0; i < arguments.length; i++) {
            if (arguments[i].length == 2) this.set(arguments[i][0], arguments[i][1]);
            if (arguments[i].length == 3) this.set(arguments[i][0], arguments[i][1], arguments[i][2]);
          };
        },
        this.setArray = function(textArray, selector, start, step) {
          for (i = 0; i < textArray.length; i++) {
            contentNum = (start || 0) + i * (step || 1);
            this.set(textArray[i], contentNum, selector);
          };
        }
      }


      this.budgetHeader = function ()  {
        contentSetter.selectorPrefix = '.budget-header-';
        var dateYearText = dateInfo.currentMonthName + " " + dateInfo.selectedMonth.getFullYear()
        contentSetter.setSeveral(
          [dateYearText, 1, 'calendar-date-button'],
          [l10n.Budget.Header.Totals.TBB, 0, 'totals-amount-label']
        );

        contentSetter.selectorPrefix = '.budget-header-totals-cell-name';
        contentSetter.setArray(
          [l10n.Budget.Header.Totals.Funds + " " + dateInfo.currentMonthName,
          l10n.Budget.Header.Totals.Overspent + " " + dateInfo.previousMonthName,
          l10n.Budget.Header.Totals.Budgeted + " " + dateInfo.currentMonthName,
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
          contentSetter.selectorPrefix = '.budget-inspector ';
          contentSetter.setArray(
            [
              l10n.Budget.Inspector.Header.Budgeted,
              l10n.Budget.Inspector.Header.Activity,
              l10n.Budget.Inspector.Header.Available,
              l10n.Budget.Inspector.Header.Inflows,
              l10n.Budget.Inspector.Header.Quick
            ],
            'h3'
          );

          contentSetter.setArray(
            [
              l10n.Budget.Inspector.Button.Underfunded,
              l10n.Budget.Inspector.Button.BudgetedLastMonth,
              l10n.Budget.Inspector.Button.SpentLastMonth,
              l10n.Budget.Inspector.Button.AverageBudgeted,
              l10n.Budget.Inspector.Button.AverageSpent
            ],
            'button',
            1, 5
          );
        }

        // One category selected
        if ($(inspector).find('div').hasClass('budget-inspector-category-header')) {
          // Inspector stats.
          contentSetter.selectorPrefix = '.budget-inspector dt';
          if ($(inspector).find('div').hasClass('budget-inspector-payment')) {
            // Credit category.
            contentSetter.setArray(
              [
                l10n.Budget.Inspector.Title.CashLeft, '', '',
                l10n.Budget.Inspector.Title.BudgetedThisMonth,
                l10n.Budget.Inspector.Title.Activity,
                l10n.Budget.Inspector.Title.Available
              ]
            );
          }
          else {
            // Normal category.
            contentSetter.setArray(
              [
                l10n.Budget.Inspector.Title.CashLeft, '', '',
                l10n.Budget.Inspector.Title.BudgetedThisMonth,
                l10n.Budget.Inspector.Title.CashSpending,
                l10n.Budget.Inspector.Title.CreditSpending,
                l10n.Budget.Inspector.Title.Available
              ]
            );
          }

          // Inspector headers.
          contentSetter.selectorPrefix = '.budget-inspector';
          contentSetter.setSeveral(
            [l10n.Budget.Inspector.Header.Quick, 0, ' .inspector-quick-budget h3'],
            [l10n.Budget.Inspector.Header.Goals, 0, ' .budget-inspector-goals h3'],
            [l10n.Budget.Inspector.Header.Notes, 0, ' .inspector-notes h3'],
            [l10n.Budget.Inspector.Header.Payment, 0, '-payment h3']
          );

          // Inspector buttons.
          contentSetter.resetPrefix();
          contentSetter.setSeveral(
            [l10n.Budget.Inspector.Button.CreateGoal, 3,'.budget-inspector-goals-create'],
            [l10n.Global.Button.Edit, 1,'.edit-goal'],
            [" " + l10n.Global.Button.Edit, 1, '.inspector-category-edit']
          );

          // Inspector credit payment message.
          var paidMessage = $('.budget-inspector-payment .paid-msg').contents();
          if (paidMessage.length > 0) {
            var paidHowMuch = paidMessage[0].textContent.split(' ')[1];
            var paidWhen = paidMessage[2].textContent.split(' ')[2];
            contentSetter.selectorPrefix = '.budget-inspector-payment .paid-msg';
            contentSetter.setSeveral(
              [l10n.Budget.Inspector.Text.Credit.Paid + " " + paidHowMuch, 0],
              [" " + l10n.Budget.Inspector.Text.Credit.On + " " + paidWhen, 2]
            );
          }

          // Inspector message.
          var inspectorMessage = $('.inspector-message').contents();
          contentSetter.selectorPrefix = '.inspector-message';
          if (inspectorMessage.length == 7) {
            // Inspector message for underfunded goal.
            var shortFor = inspectorMessage[1].textContent.split(' ')[1];
            var budgetAnother = inspectorMessage[3].textContent.split(' ')[10];
            contentSetter.setSeveral(
              [l10n.Budget.Inspector.Text.Message.YouRe + " " + shortFor, 1],
              [l10n.Budget.Inspector.Text.Message.ShortOfGoal + " " + budgetAnother, 3],
              [l10n.Budget.Inspector.Text.Message.ToKeepTrack, 5]
            );
          }
          if (inspectorMessage.length == 5) {
            // Inspector message for overspent.
            contentSetter.setSeveral(
              [l10n.Budget.Inspector.Text.Message.Overspent, 1],
              [l10n.Budget.Inspector.Text.Message.Cover, 3]
            );
          }
          // Inspector message for underfunded upcoming.
          contentSetter.selectorPrefix = '.inspector-message.upcoming';
          contentSetter.setSeveral(
            [l10n.Budget.Inspector.Text.Message.HaventBudgeted, 1],
            [l10n.Budget.Inspector.Text.Message.InUpcoming, 3]
          );

          // Inspector credit payment recommendation message.
          contentSetter.selectorPrefix = '.budget-inspector-payment ';
          contentSetter.setSeveral(
            // There is debt.
            [l10n.Budget.Inspector.Text.Credit.IfYouPay + " ", 1, '.recommendation'],
            [", " + l10n.Budget.Inspector.Text.Credit.BalanceWillBe + " ", 3, '.recommendation'],
            [" " + l10n.Budget.Inspector.Text.Credit.YoullIncrease + " ", 5, '.recommendation'],
            // Debt free.
            [l10n.Budget.Inspector.Text.Credit.Nothing, 0, '.recommended .nothing'],
            [l10n.Budget.Inspector.Text.Credit.DebtFree, 0, '.recommended .debt-free']
          );

          // Inspector credit progress.
          contentSetter.selectorPrefix = '.budget-inspector-payment .progress>em';
          contentSetter.setSeveral(
            [" " + l10n.Budget.Inspector.Text.Credit.Spending, 1],
            [" " + l10n.Budget.Inspector.Text.Credit.Available, 3]
          );

          // Inspector quick budgeting buttons.
          var fifthButton = $('.budget-inspector-button').length == 5;
          contentSetter.selectorPrefix = '.budget-inspector-button';
          contentSetter.setArray(
            [
              l10n.Budget.Inspector.Button.BudgetedLastMonth,
              l10n.Budget.Inspector.Button.SpentLastMonth,
              l10n.Budget.Inspector.Button.AverageBudgeted,
              l10n.Budget.Inspector.Button.AverageSpent
            ],
            '', 1 + fifthButton * 5, 5
          );
          // Inspector added button
          if (fifthButton) {
            buttonText = $('.budget-inspector-button').contents()[1];
            if (buttonText.textContent == "Goal Target") {
              buttonText.textContent = l10n.Budget.Inspector.Button.GoalTarget;
            }
            if (buttonText.textContent == "Upcoming Transactions") {
              buttonText.textContent = l10n.Budget.Inspector.Button.UpcomingTransactions;
            }
          }

          // Inspector category note without text.
          categoryNote = $(inspector).find('.inspector-category-note').contents()[3];
          if (categoryNote.textContent == "Enter a note...") {
            categoryNote.textContent = l10n.Global.Placeholder.Note;
          }

          // Inspector edit goal.
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

          // Inspector edit goal checkbox handling.
          var goalLabelText = $(goals).find('dt').contents()[2];
          if (goalLabelText) {
            if (goalLabelText.textContent == "Target Balance") goalLabelText.textContent = l10n.Budget.Inspector.Title.TargetBalance;
            if (goalLabelText.textContent == "Target Budgeted Amount") goalLabelText.textContent = l10n.Budget.Inspector.Title.TargetBudgetedAmount;
          }

          // Inspector edit goal months list.
          contentSetter.resetPrefix();
          contentSetter.set(l10n.Budget.Inspector.Title.TargetMonthYear, 5, '.budget-inspector-goals dt');
          contentSetter.setArray(
            monthsFull,
            '.budget-inspector-goals .goal-target-month>option'
          );

          // Inspector goal message logic.
          // TODO Add messages handling.
          $('.goal-message')[0].remove();
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
      },


      this.calendarModal = function () {
        contentSetter.resetPrefix();
        contentSetter.setArray(
          months,
          '.modal-calendar ul.ynab-calendar-months>li>button',
          2, 5
        );
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
