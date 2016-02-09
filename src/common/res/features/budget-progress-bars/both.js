// TODO: Needs refactoring because of copy-paster from pacing.js and goal.js
(function poll() {
  // Waits until an external function gives us the all clear that we can run (at /shared/main.js)
  if ( typeof ynabToolKit !== "undefined"  && ynabToolKit.pageReady === true ) {

    ynabToolKit.options.budgetProgressBars = true;
    ynabToolKit.budgetProgressBars = new function ()  { // Keep feature functions contained within this
      var entityManager = ynab.YNABSharedLib.defaultInstance.entityManager;

      this.invoke = function() {
        function getCalculation(subCategoryName) {
          var crazyInternalId = "mcbc/" + ynabToolKit.shared.parseSelectedMonth().yyyymm() + "/" + entityManager.getSubCategoryByName(subCategoryName).getEntityId();
        var calculation = entityManager.getMonthlySubCategoryBudgetCalculationById(crazyInternalId);
        return calculation;
        }

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
				 // Taget by date
				 // or Montly goal
				 var hasGoal = true;
				 var status = 1 - calculation.goalUnderFunded / calculation.goalTarget;
			  }
			  else if (calculation.upcomingTransactions < 0) {
				 // Upcoming transactions "goal"
				 var hasGoal = true;
				 var status = - calculation.balance / calculation.upcomingTransactions;
			  }

			  var budgetedCell = $(this).find("li.budget-table-cell-budgeted")[0];
			  if (hasGoal) {
				 status = status > 1 ? 1 : status;
				 status = status < 0 ? 0 : status;
				 var percent = Math.round(parseFloat(status)*100);
				 budgetedCell.style.background = "linear-gradient(to right, rgba(22, 163, 54, 0.3) " + percent + "%, white " + percent+ "%)";
			  }
			  else {
				 budgetedCell.removeAttribute("style");
			  }
		  }
        })

        // Takes N colors and N-1 sorted points from (0, 1) to make color1|color2|color3 bg style.
        function generateProgressBarStyle(colors, points) {
        points.unshift(0);
        points.push(1);
        var pointsPercent = Array.from(points, function(p) { return p * 100; });
        style = "linear-gradient(to right, ";
        for (var i = 0; i < colors.length; i++) {
          style += colors[i] + " " + pointsPercent[i] + "%, ";
          style += colors[i] + " " + pointsPercent[i + 1] + "%";
          style += (i + 1 == colors.length) ? ")" : ", ";
          }
          return style;
        }

        var date = new Date();
        var monthProgress = new Date().getDate() / new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
        var s = 0.005; // Current month progress indicator width

        var subCategories = $("ul.is-sub-category");
        $(subCategories).each(function () {
        $(this).addClass('goal-progress-both');
        var subCategoryName = $(this).find("li.budget-table-cell-name>div>div")[0].title;

		  if ( "Uncategorized Transactions" != subCategoryName ) {
			  var nameCell = $(this).find("li.budget-table-cell-name")[0];
			  var calculation = getCalculation(subCategoryName);

			  var budgeted = calculation.balance - calculation.budgetedCashOutflows - calculation.budgetedCreditOutflows;
			  var available = calculation.balance;

			  if (budgeted > 0) {
				 var pacing = (budgeted - available) / budgeted;
				 if (monthProgress > pacing) {
					nameCell.style.background = generateProgressBarStyle(
					  ["#c0e2e9", "white", "#CFD5D8", "white"],
					  [pacing, monthProgress - s, monthProgress]);
				 }
				 else {
					nameCell.style.background = generateProgressBarStyle(
					  ["#c0e2e9", "#CFD5D8", "#c0e2e9", "white"],
					  [monthProgress - s, monthProgress, pacing]);
				 }
			  }
			  else {
				 nameCell.style.background = generateProgressBarStyle(
					  ["white", "#CFD5D8", "white"],
					  [monthProgress - s, monthProgress]);
			  }
		  }
        });

        var masterCategories = $("ul.is-master-category");
        $(masterCategories).each(function () {
          var nameCell = $(this).find("li.budget-table-cell-name")[0];
          nameCell.style.background = generateProgressBarStyle(
                ["#E5F5F9", "#CFD5D8", "#E5F5F9"],
                [monthProgress - s, monthProgress]);
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