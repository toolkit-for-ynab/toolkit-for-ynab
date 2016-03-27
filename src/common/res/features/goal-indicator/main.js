(function poll() {
  // Waits until an external function gives us the all clear that we can run (at /shared/main.js)
  if ( typeof ynabToolKit !== "undefined"  && ynabToolKit.pageReady === true ) {
		var loadCategories = true;

    ynabToolKit.goalIndicator = (function(){

      // Supporting functions,
      // or variables, etc
      var entityManager = ynab.YNABSharedLib.defaultInstance.entityManager;
			var subCats = [];
			var internalIdBase;

      function addIndicator (element, indicator, tooltip) {
        var budgetedCell = $(element).find(".budget-table-cell-budgeted");
        if (budgetedCell.has(".goal-indicator").length === 0) {
          budgetedCell.prepend($('<div>', { class: 'goal-indicator', title: tooltip })
            .append(indicator));
        }
      }

      function getCalculation(subCategoryName) {
        //var crazyInternalId = "mcbc/" + ynabToolKit.shared.yyyymm(ynabToolKit.shared.parseSelectedMonth()) + "/" + entityManager.getSubCategoryByName(subCategoryName).getEntityId();
				//var calculation = entityManager.getMonthlySubCategoryBudgetCalculationById(crazyInternalId);
				//return calculation;
				var subCat = subCats.find(getSubCategoryByName);
				var calculation;
				if ( subCat ) { 
					var crazyInternalId = internalIdBase + subCat.entityId;
					calculation = entityManager.getMonthlySubCategoryBudgetCalculationById(crazyInternalId);
				}
        return calculation;

				function getSubCategoryByName(ele) {
					return ele.toolkitName == subCategoryName;
				};
      }

      return {
        invoke: function() {
          //var subCategories = $("ul.is-sub-category");
          var categories = $(".budget-table ul");
					var masterCategoryName = "";

					if ( subCats == null || subCats.length === 0 || loadCategories )
					{
						subCats = ynabToolKit.shared.getCategories();
						loadCategories = false;
					}
					
					selMonth = ynabToolKit.shared.parseSelectedMonth();
					if ( selMonth !== null ) // will be null on YNAB load when the user is not on the budget screen
					{
						internalIdBase = "mcbc/" + ynabToolKit.shared.yyyymm(selMonth) + "/";
					}
          
					$(categories).each(function () {
						if ($(this).hasClass('is-master-category')){
							masterCategoryName = $(this).find("div.budget-table-cell-name-row-label-item>div>div[title]");
							masterCategoryName = (masterCategoryName != 'undefined') ? $(masterCategoryName).attr( "title" ) : "";
						}

            if ($(this).hasClass('is-sub-category')){
							var subCategoryName = $(this).find("li.budget-table-cell-name>div>div")[0].title;

  						if ( "Uncategorized Transactions" === subCategoryName ) {
								return; // iteracte the .each() function
							} else {
								subCategoryName = masterCategoryName + '_' + subCategoryName;
							}

							calculation = getCalculation(subCategoryName);

							//
							// Check monthly first to prevent mis-tagging as a T due to the fact that goalOverallLeft
							// has meaning for both monthly and target goals.
							//
							if (calculation.goalTarget > 0) {
								// Taget by date
								// or Montly goal
								addIndicator(this, "M", "Monthly budgeting or Target by date that is sort of monthly");
							}
							else if (calculation.goalExpectedCompletion > 0 || calculation.goalOverallLeft > 0) {
								// Target total goal
								addIndicator(this, "T", "Target balance");
							}
							else if (calculation.upcomingTransactions < 0) {
								// Upcoming transactions "goal"
								addIndicator(this, "U", "Upcoming transactions");
							}
						}
          });
        },

        observe: function(changedNodes) {
          if ( changedNodes.has('navlink-budget active') || changedNodes.has('budget-inspector') ) {
            ynabToolKit.goalIndicator.invoke();
          } else if ( changedNodes.has("modal-overlay pure-u modal-popup modal-budget-edit-category active") || 
											changedNodes.has("modal-overlay pure-u modal-popup modal-add-master-category active")  ||
											changedNodes.has("modal-overlay pure-u modal-popup modal-add-sub-category active") ) {
						//
						// Seems there should be a more "Embery" way to know when the categories have been 
						// updated, added, or deleted but this'll have to do for now. Note that the flag is
						// set to true here so that next time invoke() is called the categories array will 
						// be rebuilt. Rebuilding at this point won't work becuase the user hasn't completed
						// the update activity at this point.
						//
            loadCategories = true; 
          }
        }
      };
    })(); // Keep feature functions contained within this object

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
