(function poll() {
  // Waits until an external function gives us the all clear that we can run (at /shared/main.js)
  if ( typeof ynabToolKit !== "undefined"  && ynabToolKit.pageReady === true ) {

    ynabToolKit.goalIndicator = new function ()  { // Keep feature functions contained within this
      var entityManager = ynab.YNABSharedLib.defaultInstance.entityManager;

      function addIndicator (element, indicator, tooltip) {
        var budgetedCell = $(element).find(".budget-table-cell-budgeted");
        if (budgetedCell.has(".goal-indicator").length == 0) {
          budgetedCell.prepend('<div class="goal-indicator" title="' +
          tooltip + '">' + indicator + '</div>')
        }
      }

      function getCalculation(subCategoryName) {
        var crazyInternalId = "mcbc/" + ynabToolKit.shared.parseSelectedMonth().yyyymm() + "/" + entityManager.getSubCategoryByName(subCategoryName).getEntityId();
      var calculation = entityManager.getMonthlySubCategoryBudgetCalculationById(crazyInternalId);
      return calculation;
      }

      this.invoke = function() {
        var subCategories = $("ul.is-sub-category");
        $(subCategories).each(function () {
          var subCategoryName = $(this).find("li.budget-table-cell-name>div>div")[0].title;

			 if ( "Uncategorized Transactions" != subCategoryName ) {
				 calculation = getCalculation(subCategoryName);

				 if (calculation.goalExpectedCompletion > 0) {
					// Target total goal
					addIndicator(this, "T", "Target balance");
				 }
				 else if (calculation.goalTarget > 0) {
					// Taget by date
					// or Montly goal
					addIndicator(this, "M", "Monthly budgeting or Target by date that is sort of monthly");
				 }
				 else if (calculation.upcomingTransactions < 0) {
					// Upcoming transactions "goal"
					addIndicator(this, "U", "Upcoming transactions");
				 }
			 }
        });
      },

      this.observe = function(changedNodes) {

        if ( changedNodes.has('navlink-budget active') || changedNodes.has('budget-inspector') ) {
          ynabToolKit.goalIndicator.invoke();
        }
      };

    }; // Keep feature functions contained within this
    ynabToolKit.goalIndicator.invoke(); // Run once and activate setTimeOut()

  } else {
    setTimeout(poll, 250);
  }
})();

// calculation variable differences for different types of goals.

// Target
// goalExpectedCompletion: 9
// goalOverallFunded: 100000
// goalOverallLeft: 900000
// goalTarget: 0
// goalUnderFunded: 0

// Target by date
// goalExpectedCompletion: 0
// goalOverallFunded: 100000
// goalOverallLeft: 900000
// goalTarget: 250000
// goalUnderFunded: 150000

// Monthly goal
// goalExpectedCompletion: 0
// goalOverallFunded: 500000
// goalOverallLeft: 500000
// goalTarget: 1000000
// goalUnderFunded: 500000

// Upcoming transactions
// upcomingTransactions: -600000
