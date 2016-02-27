(function poll() {
  // Waits until an external function gives us the all clear that we can run (at /shared/main.js)
  if ( typeof ynabToolKit !== "undefined"  && ynabToolKit.pageReady === true ) {

    ynabToolKit.budgetProgressBars = (function(){

      // Supporting functions,
      // or variables, etc
      var entityManager = ynab.YNABSharedLib.defaultInstance.entityManager;

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

      function getCalculation(subCategoryName) {
        var crazyInternalId = "mcbc/" + ynabToolKit.shared.yyyymm(ynabToolKit.shared.parseSelectedMonth()) + "/" + entityManager.getSubCategoryByName(subCategoryName).getEntityId();
        var calculation = entityManager.getMonthlySubCategoryBudgetCalculationById(crazyInternalId);
        return calculation;
      }

      function addGoalProgress(subCategoryName, target) {
        if ( "Uncategorized Transactions" != subCategoryName ) {
          calculation = getCalculation(subCategoryName);

          var status = 0;
          var hasGoal = false;
          if (calculation.goalExpectedCompletion > 0) {
            // Target total goal
            hasGoal = true;
            status = calculation.balance / (calculation.balance + calculation.goalOverallLeft);
          }
          else if (calculation.goalTarget > 0) {
            // Taget by date
            // or Montly goal
            hasGoal = true;
            status = 1 - calculation.goalUnderFunded / calculation.goalTarget;
          }
          else if (calculation.upcomingTransactions < 0) {
            // Upcoming transactions "goal"
            hasGoal = true;
            status = - calculation.balance / calculation.upcomingTransactions;
          }

          if (hasGoal) {
            status = status > 1 ? 1 : status;
            status = status < 0 ? 0 : status;
            var percent = Math.round(parseFloat(status)*100);
            target.style.background = "linear-gradient(to right, rgba(22, 163, 54, 0.3) " + percent + "%, white " + percent+ "%)";
          }
          else {
            target.removeAttribute("style");
          }
        }
      }

      var date = new Date();
      var monthProgress = new Date().getDate() / new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
      var s = 0.005; // Current month progress indicator width

      function addPacingProgress(subCategoryName, target) {
        if ( "Uncategorized Transactions" != subCategoryName ) {

          var calculation = getCalculation(subCategoryName);

          var budgeted = calculation.balance - calculation.budgetedCashOutflows - calculation.budgetedCreditOutflows;
          var available = calculation.balance;

          if (budgeted > 0) {
            var pacing = (budgeted - available) / budgeted;
            if (monthProgress > pacing) {
              target.style.background = generateProgressBarStyle(
                ["#c0e2e9", "white", "#CFD5D8", "white"],
                [pacing, monthProgress - s, monthProgress]);
            }
            else {
              target.style.background = generateProgressBarStyle(
                ["#c0e2e9", "#CFD5D8", "#c0e2e9", "white"],
                [monthProgress - s, monthProgress, pacing]);
            }
          }
          else {
            target.style.background = generateProgressBarStyle(
              ["white", "#CFD5D8", "white"],
              [monthProgress - s, monthProgress]);
          }
        }
      }
      function addPacingProgressToMaster(subCategoryName, target) {

      }

      return {
        invoke: function() {
          var categories = $(".budget-table ul");
          $(categories).each(function () {
            var nameCell, budgetedCell;
            if ($(this).hasClass('is-sub-category')){
              var subCategoryName = $(this).find("li.budget-table-cell-name>div>div")[0].title;
              switch (ynabToolKit.options.budgetProgressBars) {
                case 1:
                  $(this).addClass('goal-progress');
                  addGoalProgress(subCategoryName, this);
                  break;
                case 2:
                  $(this).addClass('goal-progress');
                  addPacingProgress(subCategoryName, this);
                  break;
                case 3:
                  $(this).addClass('goal-progress-both');
                  budgetedCell = $(this).find("li.budget-table-cell-budgeted")[0];
                  nameCell = $(this).find("li.budget-table-cell-name")[0];
                  addGoalProgress(subCategoryName, budgetedCell);
                  addPacingProgress(subCategoryName, nameCell);
                  break;
              }
            }

            if ($(this).hasClass('is-master-category')){
              switch (ynabToolKit.options.budgetProgressBars) {
                case 2:
                  this.style.background = generateProgressBarStyle(
                    ["#E5F5F9", "#CFD5D8", "#E5F5F9"],
                    [monthProgress - s, monthProgress]);
                  break;
                case 3:
                  nameCell = $(this).find("li.budget-table-cell-name")[0];
                  nameCell.style.background = generateProgressBarStyle(
                    ["#E5F5F9", "#CFD5D8", "#E5F5F9"],
                    [monthProgress - s, monthProgress]);
                  break;
              }
            }
          });
        },

        observe: function(changedNodes) {
          if ( changedNodes.has('navlink-budget active') || changedNodes.has('budget-inspector') ) {
            ynabToolKit.budgetProgressBars.invoke();
          }
        }
      };
    })(); // Keep feature functions contained within this object

    ynabToolKit.budgetProgressBars.invoke(); // Run once and activate setTimeOut()

  } else {
    setTimeout(poll, 250);
  }
})();
