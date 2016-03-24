(function poll() {
// Waits until an external function gives us the all clear that we can run (at /shared/main.js)
if ( typeof ynabToolKit !== "undefined"  && ynabToolKit.pageReady === true && typeof Ember !== "undefined" ) {

  ynabToolKit.l10n = (function(){

    // Supporting functions,
    // or variables, etc

    // Shortcuts
    var l10n = ynabToolKit.l10nData;
    ynabToolKit.l10nMissingStrings = {};

    ynabToolKit.shared.monthsShort = ynabToolKit.shared.monthsShort.map(function(month) {
      return l10n["months." + month];
    });
    ynabToolKit.shared.monthsFull = ynabToolKit.shared.monthsFull.map(function(month) {
      return l10n["months." + month];
    });

    function getDateInfo() {
      var selectedMonth = ynabToolKit.shared.parseSelectedMonth();
      var currentMonthName = ynabToolKit.shared.monthsShort[selectedMonth.getMonth()];
      var previousMonthName;
      if (selectedMonth.getMonth() === 0) {
        previousMonthName = ynabToolKit.shared.monthsShort[11];
      }
      else {
        previousMonthName = ynabToolKit.shared.monthsShort[selectedMonth.getMonth() - 1];
      }
      return {
        selectedMonth: selectedMonth,
        currentMonthName: currentMonthName,
        previousMonthName: previousMonthName
      };
    }

    // Tool for setting content.
    contentSetter = (function () {
      return {
        selectorPrefix: '',
        resetPrefix: function () {
          contentSetter.selectorPrefix = '';
        },
        // Takes contentNum's .contents() of selector and sets it to text.
        set: function (text, contentNum, selector) {
          var el = $(contentSetter.selectorPrefix + (selector || '')).contents()[contentNum];
          if (el) el.textContent = text;
        },
        // Each argument must be an array of 2 or 3 elements that become set arguments in order.
        setSeveral: function () {
          for (i = 0; i < arguments.length; i++) {
            if (arguments[i].length == 2) contentSetter.set(arguments[i][0], arguments[i][1]);
            if (arguments[i].length == 3) contentSetter.set(arguments[i][0], arguments[i][1], arguments[i][2]);
          }
        },
        setArray: function(textArray, selector, start, step) {
          for (i = 0; i < textArray.length; i++) {
            contentNum = (start || 0) + i * (step || 1);
            contentSetter.set(textArray[i], contentNum, selector);
          }
        }
      };
    })();

    return {
      invoke: function() {
        ynabToolKit.l10nEmberData = Ember.I18n.translations;
        var toolkitStrings = new Set(Object.keys(ynabToolKit.l10nData));
        var emberStrings = new Set(Object.keys(ynabToolKit.l10nEmberData));
        emberStrings.forEach(function(s) {
          if (!(toolkitStrings.has(s))) {
            ynabToolKit.l10nMissingStrings[s] = ynabToolKit.l10nEmberData[s];
          }
        });
        Ember.I18n.translations = jQuery.extend(true, {}, ynabToolKit.l10nData);
      },

      budgetHeader: function() {
        if (!$('.navlink-budget').hasClass('active')) return ;
        var dateInfo = getDateInfo();
        contentSetter.selectorPrefix = '.budget-header-';
        var dateYearText = dateInfo.currentMonthName + " " + dateInfo.selectedMonth.getFullYear();
        contentSetter.set(dateYearText, 1, 'calendar-date-button');

        contentSetter.selectorPrefix = '.budget-header-totals-cell-name';
        contentSetter.setArray(
          [l10n["budget.fundsFor"].replace("{{currentMonth}}", dateInfo.currentMonthName),
          l10n["budget.overspentIn"].replace("{{previousMonth}}", dateInfo.previousMonthName),
          l10n["budget.fundedIn"].replace("{{currentMonth}}", dateInfo.currentMonthName)]
        );
      },

      observe: function(changedNodes) {
        ynabToolKit.l10n.invoke();

        // User has returned back to the budget screen
        // User switch budget month
        if (changedNodes.has('budget-header-flexbox') || changedNodes.has('budget-table')) {
          ynabToolKit.l10n.budgetHeader();
        }

        if ( changedNodes.has('budget-inspector') || changedNodes.has('is-checked') || changedNodes.has('budget-inspector-goals') ) {
          // Inspector edit goal months list.
          contentSetter.resetPrefix();
          contentSetter.setArray(ynabToolKit.shared.monthsFull, '.budget-inspector-goals .goal-target-month>option');
        }

        // Hidden categories modal
        if (changedNodes.has('modal-overlay pure-u modal-budget-hidden-categories active')) {
          contentSetter.selectorPrefix = '.modal-budget-hidden-categories-master-unhidden:contains("Credit Card Payments")';
          contentSetter.set(l10n["toolkit.creditCardPayments"], 1);
        }

        // User prefs modal
        if (changedNodes.has('modal-overlay pure-u modal-popup modal-user-prefs active')) {
          contentSetter.selectorPrefix = '.modal-user-prefs button';
          contentSetter.set(l10n["toolkit.myAccount"], 1);
        }

        // New transaction fields modals
        if (changedNodes.has('modal-overlay pure-u modal-popup modal-account-flags active')) {
          contentSetter.selectorPrefix = '.modal-account-flags';
          var colors = ["red", "orange", "yellow", "green", "blue", "purple"].map(function(color) {
            return l10n["toolkit." + color];
          });
          contentSetter.setArray(colors, ' .label');
          contentSetter.setArray(colors, ' .label-bg');
        }
        if (changedNodes.has('modal-overlay pure-u modal-popup modal-account-dropdown modal-account-categories active')) {
          contentSetter.selectorPrefix = '.modal-account-categories ';
          contentSetter.setSeveral(
            [l10n["toolkit.inflow"], 0, '.modal-account-categories-section-item'],
            [l10n["budget.leftToBudget"], 1, '.modal-account-categories-category-name']
          );
        }
        if (changedNodes.has('modal-overlay pure-u modal-popup modal-account-dropdown modal-account-payees active')) {
          contentSetter.selectorPrefix = '.modal-account-payees .is-section-item';
          contentSetter.setArray(
            [l10n["toolkit.transfer"],
             l10n["toolkit.memorized"]],
            '', 1, 3
          );
        }
        if (changedNodes.has('modal-overlay pure-u modal-account-calendar active') ||
            changedNodes.has('accounts-calendar')) {
          contentSetter.selectorPrefix = '.modal-account-calendar';
          var days = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(function(day) {
            return l10n["toolkit.dayOfWeek" + day];
          });
          contentSetter.setArray(days, ' .accounts-calendar-weekdays li');
          contentSetter.selectorPrefix = '.modal-account-calendar .accounts-calendar-selected-date';
          var dateText = $(contentSetter.selectorPrefix).contents()[1].textContent;
          var year = dateText.split(' ')[1];
          var month  = l10n["months." + dateText.split(' ')[0]];
          contentSetter.set(month + " " + year, 1);
        }

        // Accounts filters months options
        if (changedNodes.has('modal-overlay pure-u modal-generic modal-account-filters active')) {
          contentSetter.selectorPrefix = '.modal-account-filters ';
          contentSetter.setArray(
            ynabToolKit.shared.monthsFull,
            '.date-range-from-months option'
          );
          contentSetter.setArray(
            ynabToolKit.shared.monthsFull,
            '.date-range-to-months option'
          );
        }

        // Account row
        if (changedNodes.has('ynab-grid-body')) {
          $('.ynab-grid-cell-payeeName[title="Starting Balance"]').contents().each(function() {
            if (this.textContent == 'Starting Balance') this.textContent = l10n["toolkit.startingBalance"];
          });
          $('.ynab-grid-cell-subCategoryName[title="Inflow: To be Budgeted"]').contents().each(function() {
            if (this.textContent == 'Inflow: To be Budgeted') this.textContent = l10n["toolkit.inflowTBB"];
          });
          $('.ynab-grid-cell-subCategoryName[title="Split (Multiple Categories)..."]').contents().each(function() {
            if (this.textContent == 'Split (Multiple Categories)...') this.textContent = l10n["toolkit.splitMultipleCategories"];
          });
        }
      }
    };
  })(); // Keep feature functions contained within this object

  ynabToolKit.l10n.invoke(); // Run your script once on page load
  ynabToolKit.l10n.budgetHeader();

  // Rerender sidebar and content views on page load.
  rerenderClasses = [ '.content', '.nav'];
  for (var i = 0; i < rerenderClasses.length; i++) {
    Ember.View.views[$(rerenderClasses[i])[0].id].rerender();
  }

  // When rerendering sidebar accounts lists are closing, open them.
  // $('.nav-account-block').click();

} else {
  setTimeout(poll, 250);
}
})();

// (function poll() {
//   // Waits until an external function gives us the all clear that we can run (at /shared/main.js)
//   if ( typeof ynabToolKit !== "undefined"  && ynabToolKit.pageReady === true ) {
//     injectScript('res/features/l10n/ru.json');
//
//     ynabToolKit.l10n = new function ()  {
//
//       // Shortcuts
//       var l10n = ynabToolKit.l10nData;
//       var months = Object.keys(l10n.Global.Month)
//                          .map(function(k){return l10n.Global.Month[k]});
//       var ynabToolKit.shared.monthsFull = Object.keys(l10n.Global.MonthFull)
//                          .map(function(k){return l10n.Global.MonthFull[k]});
//
//       function getDateInfo() {
//         var selectedMonth = ynabToolKit.shared.parseSelectedMonth();
//         var currentMonthName = l10n.Global.Month[selectedMonth.getMonth()];
//         var previousMonthName;
//         if (selectedMonth.getMonth() == 0) {
//           previousMonthName = l10n.Global.Month[11];
//         }
//         else {
//           previousMonthName = l10n.Global.Month[selectedMonth.getMonth() - 1];
//         }
//         return {
//           selectedMonth: selectedMonth,
//           currentMonthName: currentMonthName,
//           previousMonthName: previousMonthName
//         }
//       }
//
//       // Tool for setting content.
//       contentSetter = new function () {
//         this.selectorPrefix = '',
//         this.resetPrefix = function () {
//           this.selectorPrefix = ''
//         },
//         // Takes contentNum's .contents() of selector and sets it to text.
//         this.set = function (text, contentNum, selector) {
//           var el = $(this.selectorPrefix + (selector || '')).contents()[contentNum];
//           if (el) el.textContent = text;
//         },
//         // Each argument must be an array of 2 or 3 elements that become this.set arguments in order.
//         this.setSeveral = function () {
//           for (i = 0; i < arguments.length; i++) {
//             if (arguments[i].length == 2) this.set(arguments[i][0], arguments[i][1]);
//             if (arguments[i].length == 3) this.set(arguments[i][0], arguments[i][1], arguments[i][2]);
//           };
//         },
//         this.setArray = function(textArray, selector, start, step) {
//           for (i = 0; i < textArray.length; i++) {
//             contentNum = (start || 0) + i * (step || 1);
//             this.set(textArray[i], contentNum, selector);
//           };
//         },
//         this.setButtons = function() {
//           this.setSeveral(
//             [l10n.Global.Button.Ok, 0, '.button-primary'],
//             [l10n.Global.Button.Cancel, 0, '.button-cancel']
//           )
//         }
//       }
//
//
//       this.budgetHeader = function ()  {
//         if (!$('.navlink-budget').hasClass('active')) return ;
//         var dateInfo = getDateInfo();
//         contentSetter.selectorPrefix = '.budget-header-';
//         var dateYearText = dateInfo.currentMonthName + " " + dateInfo.selectedMonth.getFullYear()
//         contentSetter.setSeveral(
//           [dateYearText, 1, 'calendar-date-button'],
//           [l10n.Budget.Header.Totals.TBB, 0, 'totals-amount-label']
//         );
//
//         contentSetter.selectorPrefix = '.budget-header-totals-cell-name';
//         contentSetter.setArray(
//           [l10n.Budget.Header.Totals.Funds + " " + dateInfo.currentMonthName,
//           l10n.Budget.Header.Totals.Overspent + " " + dateInfo.previousMonthName,
//           l10n.Budget.Header.Totals.Budgeted + " " + dateInfo.currentMonthName,
//           l10n.Budget.Header.Totals.BIF]
//         );
//
//         var calendarNote = $('.budget-header-calendar-note').contents()[1];
//         // TODO If it doesn't exist?
//         if (calendarNote.textContent == "Enter a note...") calendarNote.textContent = l10n.Global.Placeholder.Note;
//
//         contentSetter.selectorPrefix = '.budget-header-days-';
//         if (!ynabToolKit.options.hideAOM) {
//           // TODO Add Russian option check.
//           var aomDays = $('.budget-header-days-age').contents()[0];
//           var aomDaysText = ynabToolKit.shared.declension('ru', aomDays, {nom: 'день', gen: 'дня', plu: 'дней'});
//           contentSetter.setSeveral(
//             [aomDaysText, 2, 'age'],
//             [l10n.Budget.Header.Metric.AoM, 0, 'label']
//           );
//         }
//       },
//
//
//       this.budgetTable = function ()  {
//         contentSetter.selectorPrefix = '.budget-table-header .budget-table-cell-';
//         contentSetter.setSeveral(
//           [l10n.Budget.Table.Header.Category, 0, 'name'],
//           [l10n.Budget.Table.Header.Budgeted, 0, 'budgeted'],
//           [l10n.Budget.Table.Header.Activity, 0, 'activity'],
//           [l10n.Budget.Table.Header.Available, 0, 'available']
//         );
//
//         contentSetter.resetPrefix();
//         contentSetter.set(" " + l10n.Budget.Table.Button.CategoryGroup, 4, '.budget-toolbar-add-category');
//
//         contentSetter.selectorPrefix = '.is-master-category.';
//         contentSetter.setSeveral(
//           [l10n.Global.Category.CreditCardPayments, 1, 'is-debt-payment-category .button-truncate'],
//           [l10n.Budget.Table.Category.HiddenCategories, 2, 'budget-table-hidden-row .budget-table-cell-edit-category']
//         );
//       },
//
//
//       this.inspector = function () { // Keep feature functions contained within this
//         var inspector = $('.budget-inspector');
//
//         // Quick budgeting buttons.
//         var fifthButton = $('.budget-inspector-button').length == 5;
//         contentSetter.selectorPrefix = '.budget-inspector-button';
//         contentSetter.setArray(
//           [
//             l10n.Budget.Inspector.Button.BudgetedLastMonth,
//             l10n.Budget.Inspector.Button.SpentLastMonth,
//             l10n.Budget.Inspector.Button.AverageBudgeted,
//             l10n.Budget.Inspector.Button.AverageSpent
//           ],
//           '', 1 + fifthButton * 5, 5
//         );
//         // Inspector added button
//         if (fifthButton) {
//           buttonText = $('.budget-inspector-button').contents()[1];
//           if (buttonText.textContent == "Goal Target") {
//             buttonText.textContent = l10n.Budget.Inspector.Button.GoalTarget;
//           }
//           if (buttonText.textContent == "Upcoming Transactions") {
//             buttonText.textContent = l10n.Budget.Inspector.Button.UpcomingTransactions;
//           }
//           if (buttonText.textContent == "Underfunded") {
//             buttonText.textContent = l10n.Budget.Inspector.Button.Underfunded;
//           }
//         }
//
//         // No categories selected
//         if ($(inspector).find('div').hasClass('budget-inspector-default-inspector')) {
//           contentSetter.selectorPrefix = '.budget-inspector ';
//           contentSetter.setArray(
//             [
//               l10n.Budget.Inspector.Header.Budgeted,
//               l10n.Budget.Inspector.Header.Activity,
//               l10n.Budget.Inspector.Header.Available,
//               l10n.Budget.Inspector.Header.Inflows,
//               l10n.Budget.Inspector.Header.Quick
//             ],
//             'h3'
//           );
//         }
//
//         // Multiple categories selected
//         if ($(inspector).find('div').hasClass('budget-inspector-multi-select-inspector')) {
//           contentSetter.selectorPrefix = '.budget-inspector-multi-select-inspector ';
//           contentSetter.set(l10n.Budget.Inspector.Header.CategoriesSelected, 2, 'h2');
//           contentSetter.setArray(
//             [l10n.Budget.Inspector.Header.Budgeted,
//             l10n.Budget.Inspector.Header.Activity,
//             l10n.Budget.Inspector.Header.Available,
//             l10n.Budget.Inspector.Header.QuickSelected],
//             'h3'
//           );
//         }
//
//         // One category selected
//         if ($(inspector).find('div').hasClass('budget-inspector-category-header')) {
//           // Inspector stats.
//           contentSetter.selectorPrefix = '.budget-inspector dt';
//           if ($(inspector).find('div').hasClass('budget-inspector-payment')) {
//             // Credit category.
//             contentSetter.setArray(
//               [
//                 l10n.Budget.Inspector.Title.CashLeft, '', '',
//                 l10n.Budget.Inspector.Title.BudgetedThisMonth,
//                 l10n.Budget.Inspector.Title.Activity,
//                 l10n.Budget.Inspector.Title.Available
//               ]
//             );
//           }
//           else {
//             // Normal category.
//             contentSetter.setArray(
//               [
//                 l10n.Budget.Inspector.Title.CashLeft, '', '',
//                 l10n.Budget.Inspector.Title.BudgetedThisMonth,
//                 l10n.Budget.Inspector.Title.CashSpending,
//                 l10n.Budget.Inspector.Title.CreditSpending,
//                 l10n.Budget.Inspector.Title.Available
//               ]
//             );
//           }
//
//           // Inspector headers.
//           contentSetter.selectorPrefix = '.budget-inspector';
//           contentSetter.setSeveral(
//             [l10n.Budget.Inspector.Header.Quick, 0, ' .inspector-quick-budget h3'],
//             [l10n.Budget.Inspector.Header.Goals, 0, ' .budget-inspector-goals h3'],
//             [l10n.Budget.Inspector.Header.Notes, 0, ' .inspector-notes h3'],
//             [l10n.Budget.Inspector.Header.Payment, 0, '-payment h3']
//           );
//
//           // Inspector buttons.
//           contentSetter.resetPrefix();
//           contentSetter.setSeveral(
//             [l10n.Budget.Inspector.Button.CreateGoal, 3,'.budget-inspector-goals-create'],
//             [l10n.Global.Button.Edit, 1,'.edit-goal'],
//             [" " + l10n.Global.Button.Edit, 1, '.inspector-category-edit']
//           );
//
//           // Inspector credit payment message.
//           var paidMessage = $('.budget-inspector-payment .paid-msg').contents();
//           if (paidMessage.length > 0) {
//             var paidHowMuch = paidMessage[0].textContent.split(' ')[1];
//             var paidWhen = paidMessage[2].textContent.split(' ')[2];
//             contentSetter.selectorPrefix = '.budget-inspector-payment .paid-msg';
//             contentSetter.setSeveral(
//               [l10n.Budget.Inspector.Text.Credit.Paid + " " + paidHowMuch, 0],
//               [" " + l10n.Budget.Inspector.Text.Credit.On + " " + paidWhen, 2]
//             );
//           }
//
//           // Inspector message.
//           var inspectorMessage = $('.inspector-message').contents();
//           contentSetter.selectorPrefix = '.inspector-message';
//           if (inspectorMessage.length == 7) {
//             // Inspector message for underfunded goal.
//             var s = inspectorMessage[1].textContent.split(' ');
//             var shortFor = s[s.length - 1];
//             var s = inspectorMessage[3].textContent.split(' ');
//             var budgetAnother = s[s.length - 1];
//             contentSetter.setSeveral(
//               [l10n.Budget.Inspector.Text.Message.YouRe + " " + shortFor, 1],
//               [l10n.Budget.Inspector.Text.Message.ShortOfGoal + " " + budgetAnother, 3],
//               [l10n.Budget.Inspector.Text.Message.ToKeepTrack, 5]
//             );
//           }
//           if (inspectorMessage.length == 5) {
//             // Inspector message for overspent.
//             contentSetter.setSeveral(
//               [l10n.Budget.Inspector.Text.Message.Overspent, 1],
//               [l10n.Budget.Inspector.Text.Message.Cover, 3]
//             );
//           }
//           // Inspector message for underfunded upcoming.
//           contentSetter.selectorPrefix = '.inspector-message.upcoming';
//           contentSetter.setSeveral(
//             [l10n.Budget.Inspector.Text.Message.HaventBudgeted, 1],
//             [l10n.Budget.Inspector.Text.Message.InUpcoming, 3]
//           );
//
//           // Inspector credit payment recommendation message.
//           contentSetter.selectorPrefix = '.budget-inspector-payment ';
//           contentSetter.setSeveral(
//             // There is debt.
//             [l10n.Budget.Inspector.Text.Credit.IfYouPay + " ", 1, '.recommendation'],
//             [", " + l10n.Budget.Inspector.Text.Credit.BalanceWillBe + " ", 3, '.recommendation'],
//             [" " + l10n.Budget.Inspector.Text.Credit.YoullIncrease + " ", 5, '.recommendation'],
//             // Debt free.
//             [l10n.Budget.Inspector.Text.Credit.Nothing, 0, '.recommended .nothing'],
//             [l10n.Budget.Inspector.Text.Credit.DebtFree, 0, '.recommended .debt-free']
//           );
//
//           // Inspector credit progress.
//           contentSetter.selectorPrefix = '.budget-inspector-payment .progress>em';
//           contentSetter.setSeveral(
//             [" " + l10n.Budget.Inspector.Text.Credit.Spending, 1],
//             [" " + l10n.Budget.Inspector.Text.Credit.Available, 3]
//           );
//
//           // Inspector category note without text.
//           categoryNote = $(inspector).find('.inspector-category-note').contents()[3];
//           if (categoryNote.textContent == "Enter a note...") {
//             categoryNote.textContent = l10n.Global.Placeholder.Note;
//           }
//
//           // Inspector edit goal.
//           var goals = $('.budget-inspector-goals');
//           contentSetter.selectorPrefix = '.budget-inspector-goals ';
//           contentSetter.setSeveral(
//             [l10n.Budget.Inspector.Title.GoalTarget, 4, '[data-value=TB]'],
//             [l10n.Budget.Inspector.Title.GoalTargetByDate, 4, '[data-value=TBD]'],
//             [l10n.Budget.Inspector.Title.GoalMonthly, 4, '[data-value=MF]'],
//             [l10n.Global.Button.Delete, 0, 'dd.actions>.link-button'],
//             [l10n.Global.Button.Cancel, 1, 'dd.actions>.link-button'],
//             [l10n.Global.Button.Ok, 1, 'dd.actions>.button-primary'],
//             [l10n.Budget.Inspector.Title.Complete, 0, '.percent-label'],
//             [l10n.Budget.Inspector.Title.Budgeted, 0, '.label'],
//             [l10n.Budget.Inspector.Title.ToGo, 1, '.label']
//           );
//
//           // Inspector edit goal checkbox handling.
//           var goalLabelText = $(goals).find('dt').contents()[2];
//           if (goalLabelText) {
//             if (goalLabelText.textContent == "Target Balance") goalLabelText.textContent = l10n.Budget.Inspector.Title.TargetBalance;
//             if (goalLabelText.textContent == "Target Budgeted Amount") goalLabelText.textContent = l10n.Budget.Inspector.Title.TargetBudgetedAmount;
//           }
//
//           // Inspector edit goal months list.
//           contentSetter.resetPrefix();
//           contentSetter.set(l10n.Budget.Inspector.Title.TargetMonthYear, 5, '.budget-inspector-goals dt');
//           contentSetter.setArray(
//             ynabToolKit.shared.monthsFull,
//             '.budget-inspector-goals .goal-target-month>option'
//           );
//
//           // Inspector goal message logic.
//           // TODO Add messages handling.
//           var goalMessage = $('.goal-message');
//           if (goalMessage.length > 0)goalMessage[0].remove();
//         }
//       },
//
//
//       this.sidebar = function () {
//         // Sidebar navigation buttons
//         contentSetter.resetPrefix()
//         contentSetter.setSeveral(
//           [l10n.Sidebar.Button.AllAccounts, 2, '.navlink-accounts a'],
//           [l10n.Sidebar.Button.Budget, 2, '.navlink-budget a'],
//           [l10n.Sidebar.Button.AddAccount, 4, '.nav-add-account']
//         );
//
//         // Sidebar account types
//         contentSetter.selectorPrefix = '.sidebar .nav-account-name-button';
//         contentSetter.setArray(
//           [
//             l10n.Sidebar.Title.Budget,
//             l10n.Sidebar.Title.Tracking,
//             l10n.Sidebar.Title.Closed
//           ],
//           '', 1, 2
//         );
//
//
//       }
//
//
//       this.accounts = function () {
//         // Accounts notification
//         contentSetter.selectorPrefix = '.accounts-notification-info ';
//         var element = $(contentSetter.selectorPrefix + 'button')[0];
//         if (element) {
//           var transactionsCount = $(contentSetter.selectorPrefix + 'button')[0].textContent.split(' ')[0];
//           contentSetter.setSeveral(
//             [transactionsCount + " " + l10n.Accounts.Header.Transaction + " ", 0, 'button'],
//             [l10n.Accounts.Header.NeedsApproval, 3]
//           );
//         }
//
//         // Accounts header
//         contentSetter.resetPrefix();
//         contentSetter.setSeveral(
//           [l10n.Accounts.Header.AllAccounts, 0, '.accounts-header-total-inner-label[title="All Accounts"]'],
//           [l10n.Accounts.Header.Reconcile, 2, '.accounts-header-reconcile']
//         );
//         contentSetter.selectorPrefix = '.accounts-header-balances-';
//         contentSetter.setSeveral(
//           [l10n.Accounts.Header.Cleared, 0, 'cleared .accounts-header-balances-label'],
//           [l10n.Accounts.Header.Uncleared, 0, 'uncleared .accounts-header-balances-label'],
//           [l10n.Accounts.Header.Working, 0, 'working .accounts-header-balances-label']
//         );
//
//         // Accounts toolbar
//         contentSetter.resetPrefix();
//         contentSetter.setSeveral(
//           [l10n.Accounts.Button.AddTransaction, 4, '.add-transaction'],
//           [l10n.Accounts.Button.EditTransaction, 4, '.accounts-toolbar-edit-transaction'],
//           [l10n.Accounts.Button.Filter, 2, '.accounts-toolbar-all-dates']
//         );
//
//         // Accounts table header
//         contentSetter.selectorPrefix = '.ynab-grid-header-cell.ynab-grid-cell-';
//         contentSetter.setSeveral(
//           [l10n.Accounts.Table.Account, 2, 'accountName'],
//           [l10n.Accounts.Table.Date, 2, 'date'],
//           [l10n.Accounts.Table.Payee, 2, 'payeeName'],
//           [l10n.Accounts.Table.Category, 2, 'subCategoryName'],
//           [l10n.Accounts.Table.Memo, 2, 'memo'],
//           [l10n.Accounts.Table.Outflow, 2, 'outflow'],
//           [l10n.Accounts.Table.Inflow, 2, 'inflow']
//         );
//
//         this.accountsFooter;
//       }
//
//       this.accountsFooter = function () {
//         // Accounts footer
//         contentSetter.selectorPrefix = '.ynab-grid-footer-message span';
//         contentSetter.set(l10n.Accounts.Text.Show, 0, ' button')
//         var hidden = $(contentSetter.selectorPrefix).contents()[1]
//         if (hidden) {
//           var count = hidden.textContent.split(' ')[0];
//           contentSetter.set(count + " " + l10n.Accounts.Text.Hidden, 1);
//         }
//       }
//
//
//       this.calendarModal = function () {
//         contentSetter.resetPrefix();
//         contentSetter.setArray(
//           months,
//           '.modal-calendar ul.ynab-calendar-months>li>button',
//           2, 5
//         );
//       },
//
//       this.addCategoryGroupModal = function () {
//         contentSetter.selectorPrefix = '.modal-add-master-category ';
//         $(contentSetter.selectorPrefix + 'input')[0].setAttribute("placeholder", l10n.Budget.Table.Placeholder.NewCategoryGroup);
//         contentSetter.setButtons();
//       },
//
//       this.addCategoryModal = function () {
//         contentSetter.selectorPrefix = '.modal-add-sub-category ';
//         $(contentSetter.selectorPrefix + 'input')[0].setAttribute("placeholder", l10n.Budget.Table.Placeholder.NewCategory);
//         contentSetter.setButtons();
//       },
//
//       this.hiddenCategoriesModal = function () {
//         contentSetter.selectorPrefix = '.modal-budget-hidden-categories ';
//         contentSetter.setSeveral(
//           [l10n.HiddenCategoriesModal.Title.ClickCategory, 1, '.modal-header'],
//           [l10n.HiddenCategoriesModal.Button.ShowAllHidden, 0, '.button-primary']
//         );
//         contentSetter.selectorPrefix = '.modal-budget-hidden-categories-master-unhidden:contains("Credit Card Payments")';
//         contentSetter.set(l10n.Global.Category.CreditCardPayments + " ", 1);
//       },
//
//       this.editCategoryModal = function () {
//         contentSetter.selectorPrefix = '.modal-budget-edit-category ';
//         contentSetter.setButtons();
//         contentSetter.setSeveral(
//           [l10n.Global.Button.Delete, 2, '.button-delete'],
//           [l10n.EditCategoryModal.Button.Hide, 2, '.button-hide']
//         );
//         contentSetter.selectorPrefix = '.modal-budget-edit-category-label:contains("Credit Card Payments")';
//         contentSetter.set(l10n.Global.Category.CreditCardPayments, 0);
//       },
//
//       this.coverOverspendingModal = function () {
//         var creditSum = $('.modal-budget-overspending li:contains("Credit Card Payments")').contents()[1]
//         if (creditSum) creditSum = creditSum.textContent.split(' ')[3];
//         contentSetter.selectorPrefix = '.modal-budget-overspending ';
//         contentSetter.setButtons();
//         contentSetter.setSeveral(
//           [l10n.CoverOverspendingModal.Label.CoverOverspending, 2, 'label'],
//           [l10n.Global.Category.CreditCardPayments + ": " + creditSum, 1, 'li:contains("Credit Card Payments")']
//         );
//       }
//
//       this.moveMoneyModal = function () {
//         var creditSum = $('.modal-budget-move-money li:contains("Credit Card Payments")').contents()[1]
//         if (creditSum) creditSum = creditSum.textContent.split(' ')[3];
//         contentSetter.selectorPrefix = '.modal-budget-move-money ';
//         $(contentSetter.selectorPrefix + 'input')[0].setAttribute("placeholder", l10n.MoveMoneyModal.Placeholder.EnterAmount);
//         contentSetter.setButtons();
//         contentSetter.setSeveral(
//           [l10n.MoveMoneyModal.Label.Move, 0, 'label'],
//           [l10n.MoveMoneyModal.Label.To, 2, 'label']
//         );
//       }
//
//       this.selectBudgetModal = function () {
//         contentSetter.selectorPrefix = '.modal-select-budget button';
//         contentSetter.setArray(
//           [
//             l10n.SelectBudgetModal.Button.CreateBudget,
//             l10n.SelectBudgetModal.Button.OpenBudget,
//             l10n.SelectBudgetModal.Button.BudgetSettings,
//             l10n.SelectBudgetModal.Button.FreshStart
//           ],
//           '', 3, 5
//         );
//       };
//
//       this.userPrefsModal = function () {
//         contentSetter.selectorPrefix = '.modal-user-prefs button';
//         contentSetter.setSeveral(
//           [l10n.UserPrefsModal.Button.MyAcc, 1],
//           [l10n.UserPrefsModal.Button.Guides, 4],
//           [l10n.UserPrefsModal.Button.Help, 8],
//           [l10n.UserPrefsModal.Button.SignOut, 12]
//         );
//       };
//
//       this.freshStartModal = function () {
//         contentSetter.selectorPrefix = '.modal-budget-fresh-start ';
//         contentSetter.setSeveral(
//           [l10n.FreshStartModal.Header, 1, '.modal-header'],
//           [l10n.FreshStartModal.Text1, 0, 'p'],
//           [l10n.FreshStartModal.Text2, 0, 'strong'],
//           [l10n.Global.Button.Continue, 3, 'button'],
//           [l10n.Global.Button.Cancel, 11, 'button']
//         );
//       };
//
//       this.budgetSettingsModal = function () {
//         var header = $('.modal-budget-settings .modal-header').contents()[1];
//         if (header.textContent == "Budget Settings") header.textContent = l10n.BudgetSettingsModal.Header.Settings;
//         if (header.textContent == "Create a new budget") header.textContent = l10n.BudgetSettingsModal.Header.New;
//         contentSetter.selectorPrefix = '.modal-budget-settings';
//         contentSetter.setArray(
//           [
//             l10n.BudgetSettingsModal.Title.Name,
//             l10n.BudgetSettingsModal.Title.Currency,
//             l10n.BudgetSettingsModal.Title.NumberFormat,
//             l10n.BudgetSettingsModal.Title.CurrencyPlacement,
//             l10n.BudgetSettingsModal.Title.DateFormat
//           ],
//           ' dt'
//         );
//         contentSetter.set(l10n.Global.Button.Cancel, 9, ' .button');
//         var okButton = $('.modal-budget-settings .button').contents()[2];
//         if (okButton.textContent == "Apply Settings") okButton.textContent = l10n.BudgetSettingsModal.Button.Apply;
//         if (okButton.textContent == "Create Budget") okButton.textContent = l10n.BudgetSettingsModal.Button.Apply;
//
//         var before = $('.modal-budget-settings').contents()[4];
//         contentSetter.setSeveral(
//           [l10n.BudgetSettingsModal.Title.Before + " (", 4, ' #currencyPlacement button'],
//           [l10n.BudgetSettingsModal.Title.After + " (123 456,78", 13, ' #currencyPlacement button'],
//           [l10n.BudgetSettingsModal.Title.Off + " (123 456,78)", 22, ' #currencyPlacement button']
//         );
//       };
//
//       this.reconcileAccountModal = function () {
//         contentSetter.selectorPrefix = '.modal-account-reconcile';
//         $(contentSetter.selectorPrefix + '-label')[0].textContent = l10n.ReconcileAccountModal.Label.Balance;
//         contentSetter.setSeveral(
//           [l10n.ReconcileAccountModal.Button.Yes, 2, '-yes'],
//           [l10n.ReconcileAccountModal.Button.No, 2, '-no'],
//           [l10n.ReconcileAccountModal.Label.How, 0, ' a']
//         );
//       };
//
//       this.accountModal = function () {
//         contentSetter.selectorPrefix = '.account-modal ';
//         if ($('.account-modal .edit-todays-balance').length == 1) {
//           // Account settings
//           $(contentSetter.selectorPrefix + 'textarea')[0].setAttribute("placeholder", l10n.AccountSettingsModal.Placeholder.Note);
//           contentSetter.setSeveral(
//             [l10n.AccountSettingsModal.Label.Balance, 0, 'dt'],
//             [l10n.AccountSettingsModal.Label.Import, 0, '.dc-toggle'],
//             [l10n.AccountSettingsModal.Label.Info, 0, '.info'],
//             [l10n.Global.Button.Ok, 0, '.button-primary'],
//             [l10n.Global.Button.Cancel, 3, '.button'],
//             [l10n.AccountSettingsModal.Button.Reopen, 3, '.button-reopen']
//           );
//           var redButton = $(contentSetter.selectorPrefix + '.button-red').contents();
//           if (redButton) {
//             if (redButton[3].textContent == "Close Account") redButton[3].textContent = l10n.AccountSettingsModal.Button.Close;
//             if (redButton[3].textContent == "Delete") redButton[3].textContent = l10n.Global.Button.Delete;
//             if (redButton[3].textContent == "Delete Account") redButton[3].textContent = l10n.Global.Button.Delete;
//           }
//         }
//         else {
//           // Add new account
//           // There is problem if user can't find his bank in the DI list and presses the button.
//           // Changed nodes have no classes.
//           contentSetter.setSeveral(
//             [l10n.AddAccountModal.Title.NewAccount, 1, '.modal-header']
//           )
//           if ($('.account-modal .todays-balance').length > 0) {
//             var balanceInput = $('.account-modal .todays-balance input')[0];
//             balanceInput.placeholder = l10n.AddAccountModal.Placeholder.Balance;
//             contentSetter.set(l10n.AddAccountModal.Title.Balance, 0, '.todays-balance dt');
//           }
//           if ($('.modal-account-settings-account-type').length > 0) {//$('.modal-actions modal-account-settings-name').contents()[0].textContent == "Cancel") {
//             // Add new account 1st page
//             $('.modal-actions button').contents()[7].textContent = l10n.Global.Button.Cancel;
//             if ($('.modal-actions button').contents()[2].textContent == "Next") $('.modal-actions button').contents()[2].textContent = l10n.Global.Button.Next;
//             if ($('.modal-actions button').contents()[2].textContent == "Add Account") $('.modal-actions button').contents()[2].textContent = l10n.AddAccountModal.Button.AddAccount;
//
//             contentSetter.setSeveral(
//               [l10n.AddAccountModal.Title.AccountName, 0, 'dt'],
//               [l10n.AddAccountModal.Title.AccountType, 1, 'dt'],
//               [l10n.AddAccountModal.Title.TransactionImport, 0, '.header'],
//               [l10n.AddAccountModal.Title.Text, 1, '.label-checkbox']
//             );
//             var accountTypes = Object.keys(l10n.AddAccountModal.AccountType)
//                                .map(function(k){return l10n.AddAccountModal.AccountType[k]});
//             contentSetter.setArray(
//               accountTypes,
//               '.modal-account-settings-account-type option'
//             );
//             $('.modal-account-settings-account-type optgroup')[0].label = l10n.AddAccountModal.Title.Budget;
//             $('.modal-account-settings-account-type optgroup')[1].label = l10n.AddAccountModal.Title.Tracking;
//             $('.account-modal input')[0].placeholder = l10n.AddAccountModal.Placeholder.NewAccount;
//           }
//           else if ($('.institution-list').length > 0) {
//             // Add new account 2nd page
//             $('.account-modal input')[0].placeholder = l10n.AddAccountModal.Placeholder.Search;
//             contentSetter.setSeveral(
//               [l10n.Global.Button.Cancel, 0, '.modal-actions button'],
//               [l10n.Global.Button.Back, 3, '.modal-actions button'],
//               [l10n.AddAccountModal.Title.Examples, 5, 'dd'],
//               [l10n.AddAccountModal.Title.Or + " ", 10, 'dd']
//             );
//             var banksListTitle = $('.account-modal dt').contents()[0];
//             if (banksListTitle.textContent == "Popular Options") banksListTitle.textContent = l10n.AddAccountModal.Title.Popular;
//             if (banksListTitle.textContent == "Here's who we found") banksListTitle.textContent = l10n.AddAccountModal.Title.Founded;
//             if ($('.institution-list p').length > 0) {
//               contentSetter.setSeveral(
//                 [l10n.AddAccountModal.Text.CouldntFind, 0, '.institution-list p'],
//                 [l10n.AddAccountModal.Button.Continue, 0, '.institution-list button']
//               )
//             }
//           }
//           else if ($('.modal-actions button').length == 3) {
//             // Manual entering balance after DI not found bank
//             contentSetter.setSeveral(
//               [l10n.AddAccountModal.Button.AddAccount, 2, '.modal-actions button'],
//               [l10n.Global.Button.Cancel, 7, '.modal-actions button'],
//               [l10n.Global.Button.Back, 10, '.modal-actions button']
//             )
//           }
//         }
//       }
//
//       this.accountFiltersModal = function () {
//         contentSetter.selectorPrefix = '.modal-account-filters ';
//         contentSetter.setArray(
//           [
//             l10n.AccountFiltersModal.Label.ThisMonth,
//             l10n.AccountFiltersModal.Label.Latest3Months,
//             l10n.AccountFiltersModal.Label.ThisYear,
//             l10n.AccountFiltersModal.Label.LastYear,
//             l10n.AccountFiltersModal.Label.AllDates
//           ],
//           ' li button'
//         );
//         contentSetter.setArray(
//           [
//             l10n.AccountFiltersModal.Label.From,
//             l10n.AccountFiltersModal.Label.To,
//             l10n.AccountFiltersModal.Label.Show
//           ],
//           ' li.label', 0, 2
//         );
//         contentSetter.setArray(
//           ynabToolKit.shared.monthsFull,
//           '.date-range-from-months option'
//         );
//         contentSetter.setArray(
//           ynabToolKit.shared.monthsFull,
//           '.date-range-to-months option'
//         );
//         contentSetter.setSeveral(
//           [l10n.AccountFiltersModal.Title, 1, '.modal-header'],
//           [l10n.AccountFiltersModal.Label.Reconciled, 1, '.label-checkbox'],
//           [l10n.AccountFiltersModal.Label.Scheduled, 4, '.label-checkbox'],
//           [l10n.Global.Button.Ok, 0, '.button-primary'],
//           [l10n.Global.Button.Cancel, 3, '.button']
//         );
//       }
//
//       this.editTransactionModal = function () {
//         contentSetter.selectorPrefix = '.modal-account-edit-transaction-list>div>ul>li>';
//         contentSetter.setArray(
//           [
//             l10n.EditTransactionModal.Button.MarkAsCleared,
//             l10n.EditTransactionModal.Button.MarkAsUncleared,
//             l10n.EditTransactionModal.Button.Approve,
//             l10n.EditTransactionModal.Button.Reject,
//             l10n.EditTransactionModal.Button.CategorizeAs,
//             l10n.EditTransactionModal.Button.MoveToAccount
//           ],
//           'button', 2, 5
//         );
//         contentSetter.setSeveral(
//           [l10n.EditTransactionModal.Button.Delete, 33, 'button'],
//           [l10n.EditTransactionModal.Button.Inflow, 1, 'ul>li>button'],
//           [l10n.EditTransactionModal.Button.ToBeBudgeted, 0, 'ul>li>ul>li span']
//         );
//       }
//
//       this.accountRow = function () {
//         $('.ynab-grid-cell-payeeName[title="Starting Balance"]').contents().each(function() {
//           if (this.textContent == 'Starting Balance') this.textContent = l10n.Accounts.Table.StartingBalance;
//         });
//         $('.ynab-grid-cell-subCategoryName[title="Inflow: To be Budgeted"]').contents().each(function() {
//           if (this.textContent == 'Inflow: To be Budgeted') this.textContent = l10n.Accounts.Table.InflowTBB;
//         });
//         $('.ynab-grid-cell-subCategoryName[title="Split (Multiple Categories)..."]').contents().each(function() {
//           if (this.textContent == 'Split (Multiple Categories)...') this.textContent = l10n.AddTransaction.Button.Split;
//         });
//         $('.needs-category').contents().each(function() {
//           if (this.textContent == 'This needs a category') this.textContent = l10n.Accounts.Table.NeedsCategory;
//         });
//       }
//
//       this.accountRowEditing = function () {
//         if($('.ynab-grid-body-row.is-editing').length > 0) {
//           $('.ynab-grid-cell-payeeName input').each(function () {this.placeholder = l10n.Accounts.Placeholder.Payee});
//           $('.ynab-grid-cell-subCategoryName input').each( function () {
//             var categoryInput = this;
//             categoryInput.placeholder = l10n.Accounts.Placeholder.Category;
//             if (categoryInput.disabled) categoryInput.placeholder = l10n.Accounts.Placeholder.Disabled;
//           });
//           $('.ynab-grid-cell-outflow input').each(function () {this.placeholder = l10n.Accounts.Placeholder.Outflow});
//           $('.ynab-grid-cell-inflow input').each(function () {this.placeholder = l10n.Accounts.Placeholder.Inflow});
//           contentSetter.selectorPrefix = '.ynab-grid-actions button';
//           contentSetter.setSeveral(
//             [l10n.Accounts.Button.SaveAndAdd, 1],
//             [l10n.Accounts.Button.Save, 7],
//             [l10n.Global.Button.Cancel, 12]
//           );
//           contentSetter.selectorPrefix = '.ynab-grid-body-split ';
//           contentSetter.setSeveral(
//             [l10n.AddTransaction.Title.Remaining, 1, '.ynab-grid-cell-subCategoryName'],
//             [l10n.AddTransaction.Button.AddSplit, 3, 'button']
//           );
//         }
//       }
//
//       this.observe = function(changedNodes) {
//
//         if ( changedNodes.has('budget-inspector') || changedNodes.has('is-checked') || changedNodes.has('budget-inspector-goals') ) {
//           ynabToolKit.l10n.inspector();
//         }
//
//         // Calendar modal
//         if ( changedNodes.has('modal-overlay pure-u modal-calendar active') ||
//              changedNodes.has('ynab-calendar-months') ) { // Changing month
//           ynabToolKit.l10n.calendarModal();
//         }
//
//         // User has returned back to the budget screen
//         if (changedNodes.has('budget-header-flexbox')) {
//           ynabToolKit.l10n.budgetHeader();
//           ynabToolKit.l10n.budgetTable();
//         }
//
//         // User goes to Accounts
//         if (changedNodes.has('ynab-grid-body')) {
//           ynabToolKit.l10n.accounts();
//         }
//
//         // User switch budget month
//         if (changedNodes.has('budget-table')) {
//           ynabToolKit.l10n.budgetHeader();
//         }
//
//         // Add master category modal
//         if (changedNodes.has('modal-overlay pure-u modal-popup modal-add-master-category active')) {
//           ynabToolKit.l10n.addCategoryGroupModal();
//         }
//
//         // Add sub category modal
//         if (changedNodes.has('modal-overlay pure-u modal-popup modal-add-sub-category active')) {
//           ynabToolKit.l10n.addCategoryModal();
//         }
//
//         // Hidden categories modal
//         if (changedNodes.has('modal-overlay pure-u modal-popup modal-budget-hidden-categories active')) {
//           ynabToolKit.l10n.hiddenCategoriesModal();
//         }
//
//         // Edit category modal
//         if (changedNodes.has('modal-overlay pure-u modal-popup modal-budget-edit-category active')) {
//           ynabToolKit.l10n.editCategoryModal();
//         }
//
//         // Cover overspending modal
//         if (changedNodes.has('modal-overlay pure-u modal-popup modal-budget-overspending active')) {
//           ynabToolKit.l10n.coverOverspendingModal();
//         }
//
//         // Move money modal
//         if (changedNodes.has('modal-overlay pure-u modal-popup modal-budget-move-money active')) {
//           ynabToolKit.l10n.moveMoneyModal();
//         }
//
//         // Budget name dropdown
//         if (changedNodes.has('modal-overlay pure-u modal-popup modal-select-budget active')) {
//           ynabToolKit.l10n.selectBudgetModal();
//         }
//
//         // User settings dropdown
//         if (changedNodes.has('modal-overlay pure-u modal-popup modal-user-prefs active')) {
//           ynabToolKit.l10n.userPrefsModal();
//         }
//
//         // Fresh start modal
//         if (changedNodes.has('modal-overlay pure-u modal-popup modal-budget-fresh-start active')) {
//           ynabToolKit.l10n.freshStartModal();
//         }
//
//         // New budget and current budget settings modal
//         if (changedNodes.has('modal-overlay pure-u modal-popup modal-budget-settings active')) {
//           ynabToolKit.l10n.budgetSettingsModal();
//         }
//
//         // Reconcile account modal
//         if (changedNodes.has('modal-overlay pure-u modal-popup modal-account-reconcile active')) {
//           ynabToolKit.l10n.reconcileAccountModal();
//         }
//
//         // Account settings and new account modal
//         if (changedNodes.has('account-modal') || changedNodes.has('modal-content') ||
//             changedNodes.has('right-circle-2') || changedNodes.has('left-circle-2') ||
//             changedNodes.has('institution-list') || changedNodes.has('checkmark-2')) {
//           ynabToolKit.l10n.accountModal();
//         }
//
//         // Edit transaction dropdown
//         if (changedNodes.has('modal-account-edit-transaction-list')) {
//           ynabToolKit.l10n.editTransactionModal();
//         }
//
//         // Selection in modal
//         if (changedNodes.has('ynab-select')) {
//           ynabToolKit.l10n.coverOverspendingModal();
//           ynabToolKit.l10n.moveMoneyModal();
//         }
//
//         // Account footer changing
//         if (changedNodes.has('ynab-grid-footer')) {
//           ynabToolKit.l10n.accountsFooter();
//         }
//
//         // Account filters modal
//         if (changedNodes.has('modal-account-filters')) {
//           ynabToolKit.l10n.accountFiltersModal();
//         }
//
//         // Account row
//         if (changedNodes.has('ynab-grid-body')) {
//           ynabToolKit.l10n.accountRow();
//         }
//
//         // Account row editing
//         if (changedNodes.has('ynab-grid-hide-notification') ||
//             changedNodes.has('closing')) {
//           ynabToolKit.l10n.accountRowEditing();
//         }
//
//         // New transaction fields modals
//         if (changedNodes.has('modal-account-flags')) {
//           contentSetter.selectorPrefix = '.modal-account-flags';
//           var colors = Object.keys(l10n.AddTransaction.FlagsModal)
//                              .map(function(k){return l10n.AddTransaction.FlagsModal[k]});
//           contentSetter.setArray(colors, ' .label');
//           contentSetter.setArray(colors, ' .label-bg');
//         }
//         if (changedNodes.has('modal-account-accounts')) {
//           contentSetter.selectorPrefix = '.modal-account-accounts .modal-header';
//           contentSetter.set(l10n.AddTransaction.ModalTitle.Accounts, 1);
//         }
//         if (changedNodes.has('modal-account-categories')) {
//           contentSetter.selectorPrefix = '.modal-account-categories ';
//           $('.modal-account-categories .button-primary').contents()[2]
//           contentSetter.setSeveral(
//             [l10n.AddTransaction.ModalTitle.Categories, 1, '.modal-header'],
//             [l10n.EditTransactionModal.Button.Inflow, 0, '.modal-account-categories-section-item'],
//             [l10n.EditTransactionModal.Button.ToBeBudgeted, 1, '.modal-account-categories-category-name'],
//             [l10n.AddTransaction.Button.Split, 3, '.button-primary']
//           );
//         }
//         if (changedNodes.has('modal-account-payees')) {
//           contentSetter.selectorPrefix = '.modal-account-payees .modal-header';
//           contentSetter.set(l10n.AddTransaction.ModalTitle.Payees, 1);
//           contentSetter.selectorPrefix = '.modal-account-payees .is-section-item';
//           contentSetter.setArray(
//             [
//               l10n.AddTransaction.Title.Transfer,
//               l10n.AddTransaction.Title.Memorized
//             ],
//             '', 1, 3
//           );
//         }
//         if (changedNodes.has('modal-account-calendar')) {
//           contentSetter.selectorPrefix = '.modal-account-calendar';
//           var days = Object.keys(l10n.AddTransaction.Days)
//                            .map(function(k){return l10n.AddTransaction.Days[k]});
//           contentSetter.setArray(days, ' .accounts-calendar-weekdays li');
//           var options = Object.keys(l10n.AddTransaction.Repeat)
//                            .map(function(k){return l10n.AddTransaction.Repeat[k]});
//           contentSetter.setArray(options, ' option');
//           contentSetter.set(l10n.AddTransaction.Title.Repeat, 0, ' label');
//         }
//
//       }
//
//     }; // Keep feature functions contained within this object
//
//     // Run your script once on page load
//     ynabToolKit.l10n.inspector();
//     ynabToolKit.l10n.budgetHeader();
//     ynabToolKit.l10n.budgetTable();
//     ynabToolKit.l10n.sidebar();
//     ynabToolKit.l10n.accounts();
//
//   } else {
//     setTimeout(poll, 250);
//   }
// })();
