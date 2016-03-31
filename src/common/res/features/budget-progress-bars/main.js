(function poll() {
  // Waits until an external function gives us the all clear that we can run (at /shared/main.js)
  if ( typeof ynabToolKit !== 'undefined'  && ynabToolKit.pageReady === true ) {
		var loadCategories = true;
		var selMonth;

    ynabToolKit.budgetProgressBars = (function(){

      // Supporting functions, or variables, etc
      var entityManager = ynab.YNABSharedLib.defaultInstance.entityManager;
			var subCats = [];
			var internalIdBase;

      // Takes N colors and N-1 sorted points from (0, 1) to make color1|color2|color3 bg style.
      function generateProgressBarStyle(colors, points) {
        points.unshift(0);
        points.push(1);
        var pointsPercent = Array.from(points, function(p) { return p * 100; });
        style = 'linear-gradient(to right, ';
        for (var i = 0; i < colors.length; i++) {
          style += colors[i] + ' ' + pointsPercent[i] + '%, ';
          style += colors[i] + ' ' + pointsPercent[i + 1] + '%';
          style += (i + 1 == colors.length) ? ')' : ', ';
        }
        return style;
      }

      function getCalculation(subCategoryName) {
				var subCat = subCats.find(getSubCategoryByName);
				var calculation;
				if ( subCat ) { 
					var crazyInternalId = internalIdBase + subCat.entityId;
					calculation = entityManager.getMonthlySubCategoryBudgetCalculationById(crazyInternalId);
					/**
					 * Add a few values from the subCat object to the calculation object.
					 */
					calculation.targetBalance			= subCat.getTargetBalance();
					calculation.goalType					= subCat.getGoalType();
					calculation.goalCreationMonth = (subCat.goalCreationMonth) ? subCat.goalCreationMonth.toString().substr(0,7) : '';
					/**
					 * If the month the goal was created in is greater than the selected month, null the goal type to prevent further 
					 * processing.
					 */
					if ( calculation.goalCreationMonth && calculation.goalCreationMonth > selMonth ) {
						calculation.goalType = null;
					}
				}
        return calculation;

				function getSubCategoryByName(ele) {
					return ele.toolkitName == subCategoryName;
				};
      }

      function addGoalProgress(subCategoryName, target) {
        if ( 'Uncategorized Transactions' != subCategoryName ) {
          calculation = getCalculation(subCategoryName);

					var status = 0;
					var tstatus = 0;
					var hasGoal = false;

					switch (calculation.goalType) {
						case 'TB' :
							hasGoal = true;

							if ( calculation.balance >= calculation.targetBalance ) {
								status = 100;
							} else {
								status = calculation.balance / (calculation.balance + calculation.goalOverallLeft);
							}

							break;
						case 'TBD' :
							hasGoal = true;
							
							if ( calculation.balance >= calculation.targetBalance ) {
								status = 100;
							} else {
								status = calculation.balance / (calculation.balance + calculation.goalOverallLeft);
							}
							
							break;
						case 'MF' :
							hasGoal = true;
							
							if ( calculation.balance >= calculation.goalTarget ) {
								status = 100;
							} else {
								status = 1 - calculation.goalUnderFunded / calculation.goalTarget;
							}
							
							break;
						default:
							if (calculation.upcomingTransactions < 0) {
								hasGoal = true;
								status = - calculation.balance / calculation.upcomingTransactions;
							}
					}

					if (hasGoal ) {
						status = status > 1 ? 1 : status;
						status = status < 0 ? 0 : status;
						var percent = Math.round(parseFloat(status)*100);
						target.style.background = 'linear-gradient(to right, rgba(22, 163, 54, 0.3) ' + percent + '%, white ' + percent+ '%)';
					}	else {
						target.removeAttribute('style');
					}
				}
			}

      var date = new Date();
      var monthProgress = new Date().getDate() / new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
			// Current month progress indicator width
      var s = 0.005; 

      function addPacingProgress(subCategoryName, target) {
        if ( 'Uncategorized Transactions' != subCategoryName ) {

          var calculation = getCalculation(subCategoryName);

          var budgeted = calculation.balance - calculation.budgetedCashOutflows - calculation.budgetedCreditOutflows;
          var available = calculation.balance;

          if (budgeted > 0) {
            var pacing = (budgeted - available) / budgeted;
            if (monthProgress > pacing) {
              target.style.background = generateProgressBarStyle(
                ['#c0e2e9', 'white', '#CFD5D8', 'white'],
                [pacing, monthProgress - s, monthProgress]);
            }
            else {
              target.style.background = generateProgressBarStyle(
                ['#c0e2e9', '#CFD5D8', '#c0e2e9', 'white'],
                [monthProgress - s, monthProgress, pacing]);
            }
          }
          else {
            target.style.background = generateProgressBarStyle(
              ['white', '#CFD5D8', 'white'],
              [monthProgress - s, monthProgress]);
          }
        }
      }

      function addPacingProgressToMaster(subCategoryName, target) {

      }

      return {
        invoke: function() {
          var categories = $('.budget-table ul');
					var masterCategoryName = '';

					if ( subCats == null || subCats.length === 0 || loadCategories )
					{
						subCats = ynabToolKit.shared.getMergedCategories();
						loadCategories = false;
					}
					
					selMonth = ynabToolKit.shared.parseSelectedMonth();
					// will be null on YNAB load when the user is not on the budget screen
					if ( selMonth !== null ) 
					{
						selMonth = ynabToolKit.shared.yyyymm(selMonth);
						internalIdBase = 'mcbc/' + selMonth + '/';
					}

          $(categories).each(function () {
            var nameCell, budgetedCell;
						if ($(this).hasClass('is-master-category')){
							masterCategoryName = $(this).find('div.budget-table-cell-name-row-label-item>div>div[title]');
							masterCategoryName = (masterCategoryName != 'undefined') ? $(masterCategoryName).attr( 'title' ) : '';
						}

            if ($(this).hasClass('is-sub-category')){
              var subCategoryName = $(this).find('li.budget-table-cell-name>div>div')[0].title;

							if ( 'Uncategorized Transactions' === subCategoryName ) {
								// iterate the .each() function
								return;	
							} else {
								subCategoryName = masterCategoryName + '_' + subCategoryName;
							}

              switch (ynabToolKit.options.budgetProgressBars) {
                case 'goals':
                  $(this).addClass('goal-progress');
                  addGoalProgress(subCategoryName, this);
                  break;
                case 'pacing':
                  $(this).addClass('goal-progress');
                  addPacingProgress(subCategoryName, this);
                  break;
                case 'both':
                  $(this).addClass('goal-progress-both');
                  budgetedCell = $(this).find('li.budget-table-cell-budgeted')[0];
                  nameCell = $(this).find('li.budget-table-cell-name')[0];
                  addGoalProgress(subCategoryName, budgetedCell);
                  addPacingProgress(subCategoryName, nameCell);
                  break;
              }
            }

            if ($(this).hasClass('is-master-category')){
              switch (ynabToolKit.options.budgetProgressBars) {
                case 'pacing':
                  this.style.background = generateProgressBarStyle(
                    ['#E5F5F9', '#CFD5D8', '#E5F5F9'],
                    [monthProgress - s, monthProgress]);
                  break;
                case 'both':
                  nameCell = $(this).find('li.budget-table-cell-name')[0];
                  nameCell.style.background = generateProgressBarStyle(
                    ['#E5F5F9', '#CFD5D8', '#E5F5F9'],
                    [monthProgress - s, monthProgress]);
                  break;
              }
            }
          });
        },

        observe: function(changedNodes) {
          if ( changedNodes.has('navlink-budget active') || changedNodes.has('budget-inspector') ) {
            ynabToolKit.budgetProgressBars.invoke();
          } else if ( changedNodes.has('modal-overlay pure-u modal-popup modal-budget-edit-category active') || 
											changedNodes.has('modal-overlay pure-u modal-popup modal-add-master-category active')  ||
											changedNodes.has('modal-overlay pure-u modal-popup modal-add-sub-category active') ) {
						/**
						 * Seems there should be a more 'Embery' way to know when the categories have been 
						 * updated, added, or deleted but this'll have to do for now. Note that the flag is
						 * set to true here so that next time invoke() is called the categories array will 
						 * be rebuilt. Rebuilding at this point won't work becuase the user hasn't completed
						 * the update activity at this point.
						 */
            loadCategories = true; 
          }
        }
      };
    })(); // Keep feature functions contained within this object
  
		// Run once and activate setTimeOut()
		ynabToolKit.budgetProgressBars.invoke(); 
  } else {
    setTimeout(poll, 250);
  }
})();
