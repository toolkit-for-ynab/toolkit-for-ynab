(function poll() {
  // Waits until an external function gives us the all clear that we can run (at /shared/main.js)
  if ( typeof ynabToolKit !== "undefined"  && ynabToolKit.pageReady === true ) {

    ynabToolKit.budgetProgressBars = new function ()  { // Keep feature functions contained within this

    var entityManager = ynab.YNABSharedLib.defaultInstance.entityManager;

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
			  var hasGoal = true;
			  var status = calculation.balance / (calculation.balance + calculation.goalOverallLeft);
			}
			else if (calculation.goalTarget > 0) {
			  // Target by date
			  // or Monthly goal
			  var hasGoal = true;
			  var status = 1 - calculation.goalUnderFunded / calculation.goalTarget;
			}
			else if (calculation.upcomingTransactions < 0) {
			  // Upcoming transactions "goal"
			  var hasGoal = true;
			  var status = - calculation.balance / calculation.upcomingTransactions;
			}

			if (hasGoal) {
			  $(this).addClass('goal-progress');
			  status = status > 1 ? 1 : status;
			  status = status < 0 ? 0 : status;
			  var percent = Math.round(parseFloat(status)*100);
			  this.style.background = "linear-gradient(to right, #c1e8c0 " + percent + "%, white " + percent+ "%)";
			}
			else {
			  this.removeAttribute("style");
			}
		}
      });
    },

    this.observe = function(changedNodes) {

        if ( changedNodes.has('navlink-budget active') || changedNodes.has('budget-inspector') ) {
          ynabToolKit.budgetProgressBars.invoke();
        }
      };

    }; // Keep feature functions contained within this
    ynabToolKit.budgetProgressBars.invoke(); // Run once and activate setTimeOut()

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
