(function poll() { 
  // Waits until an external function gives us the all clear that we can run (at /shared/main.js)
  if ( typeof ynabToolKit !== "undefined"  && ynabToolKit.pageReady === true ) {
  
    ynabToolKit.featureOptions.goalIndicator = true;
    ynabToolKit.goalIndicator = function ()  { // Keep feature functions contained within this
    	var entityManager = ynab.YNABSharedLib.getBudgetViewModel_AllAccountTransactionsViewModel()._result.getEntityManager();

    	function addIndicator (element, inticator) {
    		var budgetedCell = $(element).find(".budget-table-cell-budgeted");
    		if (budgetedCell.has(".goal-indicator").length == 0) {
    			budgetedCell.prepend('<div class="goal-indicator">' + inticator + '</div>')
    		}
    	}

    	function pad(num, size) {
		    var s = "0" + num;
		    return s.substr(s.length-size);
		}

    	function getCurrentYM () {
    		dateText = $(".budget-header-calendar-date-button").text();
    		months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    		monthText = dateText.match(/[a-z]{3}/i)[0];
			year = dateText.match(/\d{4}/i)[0];
			month = months.indexOf(dateText.match(/[a-z]{3}/i)[0]) + 1;
			return year + "-" + pad(month, 2);
    	}

    	function getCalculation(subCategoryName) {
    		var crazyInternalId = "mcbc/" + getCurrentYM() + "/" + entityManager.getSubCategoryByName(subCategoryName).getEntityId();
			var calculation = entityManager.getMonthlySubCategoryBudgetCalculationById(crazyInternalId);
			return calculation;
    	}

		var subCategories = $("ul.is-sub-category");
		$(subCategories).each(function () {
			var subCategoryName = $(this).find("li.budget-table-cell-name>div>div")[0].title;
			calculation = getCalculation(subCategoryName);

			if (calculation.goalExpectedCompletion > 0) { 
				// Target total goal
				var hasGoal = true;
				var status = calculation.balance / (calculation.goalOverallFunded + calculation.goalOverallLeft);
				addIndicator(this, "T");
			}
			else if (calculation.goalTarget > 0) {
				// Taget by date
				// or Montly goal
				var hasGoal = true;
				var status = 1 - calculation.goalUnderFunded / calculation.goalTarget;
				addIndicator(this, "M");
			}
			else if (calculation.upcomingTransactions < 0) {
				// Upcoming transactions "goal"
				var hasGoal = true;
				var status = - calculation.balance / calculation.upcomingTransactions;
				addIndicator(this, "U");
			}

			var budgetedCell = $(this).find("li.budget-table-cell-budgeted")[0];
			if (hasGoal) {
				status = status > 1 ? 1 : status;
				status = status < 0 ? 0 : status;
				var percent = Math.round(parseFloat(status)*100);
				budgetedCell.style.background = "-webkit-linear-gradient(top, white, white 13%, rgba(22, 163, 54, 0.0) 13%, rgba(22, 163, 54, 0.00) 87%, white 87%),-webkit-linear-gradient(left, rgba(22, 163, 54, 0.3) " + percent + "%, white " + percent+ "%)";				
			}
			else {
				$(budgetedCell).find(".goal-indicator").remove();
				budgetedCell.removeAttribute("style");
			}
		})
     
    }; // Keep feature functions contained within this
    ynabToolKit.goalIndicator(); // Run once and activate setTimeOut()

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
