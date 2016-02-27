// DoB means Days of Buffering
(function poll() {
  // Waits until an external function gives us the all clear that we can run (at /shared/main.js)
  if ( typeof ynabToolKit !== "undefined"  && ynabToolKit.pageReady === true ) {

    ynabToolKit.daysOfBuffering = (function(){

      // Supporting functions,
      // or variables, etc
      function onlyUnique(value, index, self) {
          return self.indexOf(value) === index;
      }

      function checkTransactionTypes(transactions) {
          // Describe all handled transaction types and check that no other got.
          var handeledTransactionTypes = ["subTransaction", "transaction", "scheduledTransaction", "scheduledSubTransaction"];
          var uniqueTransactionTypes = Array.from(transactions, function(el) { return el.displayItemType; }).filter(onlyUnique);
          var allTypesHandeled = uniqueTransactionTypes.every(function(el) { return uniqueTransactionTypes.includes(el); });
          if (!allTypesHandeled) {
              throw "Found unhandeled transaction type. " + uniqueTransactionTypes;
          }
      }

      function DoBCalculate() {
          // Get outflow transactions.
          var entityManager = ynab.YNABSharedLib.defaultInstance.entityManager;
          var transactions = entityManager.getAllTransactions();
          var outflowTransactions = transactions.filter(function(el) {
            return !el.isTombstone &&
            el.transferAccountId === null &&
            el.amount < 0 &&
            el.getAccount().onBudget; });

          // Filter outflow transactions by Date for history lookup option.
          if (ynabToolKit.options.daysOfBufferingHistoryLookup > 0) {
            dateNow = Date.now();
            outflowTransactions = outflowTransactions.filter(function (el) {
              return (dateNow - el.getDate().getUTCTime()) / 3600/24/1000/(365/12) < ynabToolKit.options.daysOfBufferingHistoryLookup; });
          }

          // Get outflow transactions period
          outflowTransactionsDates = Array.from(outflowTransactions, function (el) { return el.getDate().getUTCTime(); });
          var firstTransactionDate = Math.min.apply(null, outflowTransactionsDates);
          var lastTransactionDate = Math.max.apply(null, outflowTransactionsDates);
          var totalDays = (lastTransactionDate - firstTransactionDate)/3600/24/1000;
          if (totalDays < 15){
              return false;
          }

          var totalOutflow = Array.from(outflowTransactions, function (i) { return -i.amount; }).reduce(function (a, b) { return a + b; }, 0);
          var averageDailyOutflow = totalOutflow / totalDays;
          var budgetAccountsTotal = ynab.YNABSharedLib.getBudgetViewModel_SidebarViewModel()._result.getOnBudgetAccountsBalance();
          return {
              DoB: Math.floor(budgetAccountsTotal/averageDailyOutflow),
              totalOutflow: totalOutflow,
              totalDays: totalDays,
              averageDailyOutflow: averageDailyOutflow,
              averageDailyTransactions: outflowTransactions.length/totalDays,
          };
      }

      return {
        invoke: function() {
          var elementForAoM = document.getElementsByClassName("budget-header-days");
          var elementForDoB = document.getElementsByClassName('days-of-buffering');
          if (elementForAoM.length == 1 && elementForDoB.length === 0) {
              var YNABheader = document.getElementsByClassName("budget-header-flexbox")[0];
              elementForAoM = document.getElementsByClassName("budget-header-days")[0];
              elementForDoB = elementForAoM.cloneNode(true);

              elementForDoB.className = elementForDoB.className + " days-of-buffering";
              elementForDoB.children[1].textContent = (ynabToolKit.l10nData && ynabToolKit.l10nData["toolkit.DoB"]) || "Days of Buffering";
              elementForDoB.children[1].title = "Don't like AoM? Try this out instead!";

              var calculation = DoBCalculate();
              if (!calculation){
                  elementForDoB.children[0].textContent = "???";
                  elementForDoB.children[0].title = "Your budget history is less than 15 days. Go on with YNAB a while.";
              }
              else {
                  var dayText = (ynabToolKit.l10nData && ynabToolKit.l10nData["budget.ageOfMoneyDays.one"]) || "day";
                  if (calculation.DoB > 1) dayText = (ynabToolKit.l10nData && ynabToolKit.l10nData["budget.ageOfMoneyDays.other"]) || "days";
                  // Russian declension dummy.
                  // if (ynabToolKit.options.l10n == 1){
                  //   dayText = ynabToolKit.shared.declension('ru', calculation.DoB, {nom: 'день', gen: 'дня', plu: 'дней'});
                  // }
                  elementForDoB.children[0].textContent = calculation.DoB + " " + dayText;
                  elementForDoB.children[0].title = "Total outflow: " + ynab.YNABSharedLib.currencyFormatter.format(calculation.totalOutflow) +
                      "\nTotal days of budgeting: " + calculation.totalDays +
                      "\nAverage daily outflow: ~" + ynab.YNABSharedLib.currencyFormatter.format(calculation.averageDailyOutflow) +
                      "\nAverage daily transactions: " + calculation.averageDailyTransactions.toFixed(1);
              }

              YNABheader.appendChild(elementForDoB);
          }
        },

        observe: function(changedNodes) {
          // User has returned back to the budget screen
          // User switch budget month
          if (changedNodes.has('budget-header-flexbox') ||
              changedNodes.has('budget-table') ||
              changedNodes.has('pure-g layout user-logged-in')) {
            ynabToolKit.daysOfBuffering.invoke();
          }
        }
      };
    })(); // Keep feature functions contained within this object

    ynabToolKit.daysOfBuffering.invoke(); // Run your script once on page load

  } else {
    setTimeout(poll, 250);
  }
})();
