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

    	var date = new Date();
   		var monthProgress = new Date().getDate() / new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
   		var monthProgressPercent = Math.round(parseFloat(monthProgress)*100);
   		console.log(monthProgressPercent);
    	var s = 0.5; // Current month progress indicator size

    	// TODO: Fix this for monthProgress = 1

		var subCategories = $("ul.is-sub-category");
		$(subCategories).each(function () {
			var subCategoryName = $(this).find("li.budget-table-cell-name>div>div")[0].title;
			var calculation = getCalculation(subCategoryName);

	    	var budgeted = calculation.balance - calculation.budgetedCashOutflows - calculation.budgetedCreditOutflows;
    		var available = calculation.balance;
    		
			if (budgeted > 0) {
				var pacing = (budgeted - available) / budgeted;
				var pacingPercent = Math.round(parseFloat(pacing)*100);
				if (monthProgressPercent > pacingPercent) {
					this.style.background = "-webkit-linear-gradient(left, #c0e2e9 " + pacingPercent + "%, white " + pacingPercent + "%, white " + monthProgressPercent + "%, #CFD5D8 " + monthProgressPercent + "%, #CFD5D8 " + (monthProgressPercent + s) + "%, white " + (monthProgressPercent + s) + "%)";
				}
				else {
					this.style.background = "-webkit-linear-gradient(left, #c0e2e9 " + monthProgressPercent + "%, #CFD5D8 " + monthProgressPercent + "%, #CFD5D8 " + (monthProgressPercent + s) + "%, #c0e2e9 " + (monthProgressPercent + s) + "%, #c0e2e9 " + pacingPercent + "%, white " + pacingPercent + "%)";
				}
			}
			else {
				this.style.background = "-webkit-linear-gradient(left, white " + monthProgressPercent + "%, #CFD5D8 " + monthProgressPercent + "%, #CFD5D8 " + (monthProgressPercent + s) + "%, white " + (monthProgressPercent + s) + "%)";
			}
		})

		var masterCategories = $("ul.is-master-category");
		$(masterCategories).each(function () {
			this.style.background = "-webkit-linear-gradient(left, #E5F5F9, #E5F5F9 " + monthProgressPercent + "%, #CFD5D8 " + monthProgressPercent + "%, #CFD5D8 " + (monthProgressPercent + s) + "%, #E5F5F9 " + (monthProgressPercent + s) +"%, #E5F5F9)";
		})
     
    }; // Keep feature functions contained within this
    ynabToolKit.budgetProgressBars(); // Run once and activate setTimeOut()

  } else {
    setTimeout(poll, 250);  
  }
})();
