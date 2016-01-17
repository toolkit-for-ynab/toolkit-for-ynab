(function poll() { 
  // Waits until an external function gives us the all clear that we can run (at /shared/main.js)
  if ( typeof ynabToolKit !== "undefined"  && ynabToolKit.pageReady === true ) {
  
    ynabToolKit.featureOptions.budgetProgressBars = true;
    ynabToolKit.budgetProgressBars = function ()  { // Keep feature functions contained within this
    	var entityManager = ynab.YNABSharedLib.defaultInstance.entityManager;

	   	function getCalculation(subCategoryName) {
    		var crazyInternalId = "mcbc/" + ynabToolKit.parseSelectedMonth().yyyymm() + "/" + entityManager.getSubCategoryByName(subCategoryName).getEntityId();
			var calculation = entityManager.getMonthlySubCategoryBudgetCalculationById(crazyInternalId);
			return calculation;
    	}

    	// TODO: Rewrite this code.

		var subCategories = $("ul.is-sub-category");
		$(subCategories).each(function () {
			var subCategoryName = $(this).find("li.budget-table-cell-name>div>div")[0].title;
			calculation = getCalculation(subCategoryName);

	    	var budgeted = calculation.balance - calculation.budgetedCashOutflows - calculation.budgetedreditOutflows;
    		var available = calculation.balance;
    		var monthProgress = 123;

			var budgetedCell = $(this).find("li.budget-table-cell-budgeted")[0];
			if (budgeted > 0) {
				status = (budgeted - available) / budgeted;
				var percent = Math.round(parseFloat(status)*100);
				this.style.background = "-webkit-linear-gradient(left, #c0e2e9 " + percent + "%, white " + percent+ "%)";				
			}
			else {
				$(budgetedCell).find(".goal-indicator").remove();
				this.removeAttribute("style");
			}
		})
     
    }; // Keep feature functions contained within this
    ynabToolKit.budgetProgressBars(); // Run once and activate setTimeOut()

  } else {
    setTimeout(poll, 250);  
  }
})();
