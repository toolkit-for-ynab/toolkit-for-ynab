/*
 * Updates to the budget section to add classes to budget rows and inspector
 * Allows for one shared loop rather than multiple loops per feature
 */

(function poll() {
  // Waits until an external function gives us the all clear that we can run (at /shared/main.js)
  if (typeof ynabToolKit !== 'undefined' && ynabToolKit.pageReady === true) {
    var loadCategories = true;
    var selMonth;

    ynabToolKit.budgetCategoryInfo = (function () {
      // Supporting functions, or variables, etc
      var entityManager = ynab.YNABSharedLib.defaultInstance.entityManager;
      var subCats = [];
      var internalIdBase;

      function getCalculation(subCategoryName) {
        var subCat = subCats.find(getSubCategoryByName);
        var calculation;
        if (subCat) {
          var crazyInternalId = internalIdBase + subCat.entityId;
          calculation = entityManager.getMonthlySubCategoryBudgetCalculationById(crazyInternalId);
          calculation.goalType = subCat.getGoalType();
          calculation.goalCreationMonth = (subCat.goalCreationMonth) ? subCat.goalCreationMonth.toString().substr(0, 7) : '';
          /**
           * If the month the goal was created in is greater than the selected month, null the goal type to prevent further
           * processing.
           */
          if (calculation.goalCreationMonth && calculation.goalCreationMonth > selMonth) {
            calculation.goalType = null;
          }
        }

        return calculation;

        function getSubCategoryByName(ele) {
          return ele.toolkitName === subCategoryName;
        }
      }

      function setClasses(row, name, classes) {
        // inspector title
        var inspectorTitle = $.trim($('h1.inspector-category-name').text());

        // clear all old classes
        $(row)
          .removeClass('toolkit-row-budgetedpositive toolkit-row-budgetednegative toolkit-row-budgetedzero')
          .removeClass(' toolkit-row-availablepositive toolkit-row-availablenegative toolkit-row-availablezero')
          .removeClass(' toolkit-row-goalupcoming toolkit-row-goalTB toolkit-row-goalMF toolkit-row-goalTBD');
        if (inspectorTitle === name) {
          $('dl.inspector-overview-available')
            .removeClass('toolkit-row-budgetedpositive toolkit-row-budgetednegative toolkit-row-budgetedzero')
            .removeClass('toolkit-row-availablepositive toolkit-row-availablenegative toolkit-row-availablezero')
            .removeClass('toolkit-row-goal upcoming toolkit-row-goalTB toolkit-row-goalMF toolkit-row-goalTBD');
        }

        // add all new classes
        for (var i = 0, len = classes.length; i < len; i++) {
          $(row).addClass('toolkit-row-' + classes[i]);
          if (inspectorTitle === name) {
            $('dl.inspector-overview-available').addClass('toolkit-row-' + classes[i]);
          }
        }
      }

      return {
        invoke() {
          var uncategorized = $('.budget-table-uncategorized-transactions');
          $(uncategorized).each(function () {
            var subCategoryName = $(this).find('li.budget-table-cell-name>div>div')[0].title.match(/.[^\n]*/);
            var classes = [];

            // add available balance
            var available = $(this).find('.budget-table-cell-available .currency').text();
            if (ynab.unformat(available) < 0) {
              classes.push('availablenegative');
            } else if (ynab.unformat(available) > 0) {
              classes.push('availablepositive');
            } else {
              classes.push('availablezero');
            }

            // set classes
            setClasses(this, subCategoryName, classes);
          });

          var categories = $('.budget-table ul').not('.budget-table-uncategorized-transactions');
          var masterCategoryName = 'Credit Card Payments';

          if (subCats === null || subCats.length === 0 || loadCategories) {
            subCats = ynabToolKit.shared.getMergedCategories();
            loadCategories = false;
          }

          selMonth = ynabToolKit.shared.parseSelectedMonth();

          // will be null on YNAB load when the user is not on the budget screen
          if (selMonth !== null) {
            selMonth = ynabToolKit.shared.yyyymm(selMonth);
            internalIdBase = 'mcbc/' + selMonth + '/';
          }

          // loop through categories
          $(categories).each(function () {
            if ($(this).hasClass('is-master-category')) {
              masterCategoryName = $(this).find('div.budget-table-cell-name-row-label-item>div>div[title]');
              masterCategoryName = (masterCategoryName !== 'undefined') ? $(masterCategoryName).attr('title') : '';
            }

            if ($(this).hasClass('is-sub-category')) {
              var subCategoryName = $(this).find('li.budget-table-cell-name>div>div')[0].title.match(/.[^\n]*/);
              var classes = [];

              // add budgeted
              var budgeted = $(this).find('.budget-table-cell-budgeted .currency').text();
              if (ynab.unformat(budgeted) < 0) {
                classes.push('budgetednegative');
              } else if (ynab.unformat(budgeted) > 0) {
                classes.push('budgetedpositive');
              } else {
                classes.push('budgetedzero');
              }

              // add available balance
              var available = $(this).find('.budget-table-cell-available:first .currency').text();
              if (ynab.unformat(available) < 0) {
                classes.push('availablenegative');
              } else if (ynab.unformat(available) > 0) {
                classes.push('availablepositive');
              } else {
                classes.push('availablezero');
              }

              // add goals and upcoming
              var calculation = getCalculation(masterCategoryName + '_' + subCategoryName);
              if (calculation.goalType === 'TB' ||
                calculation.goalType === 'MF' ||
                calculation.goalType === 'TBD') {
                classes.push('goal');
                classes.push('goal' + calculation.goalType);
              }

              if (calculation.upcomingTransactions < 0) {
                classes.push('upcoming');
              }

              // set classes
              setClasses(this, subCategoryName, classes);
            }
          });

          // call external features if appropriate
          if (ynabToolKit.options.goalIndicator) {
            ynabToolKit.shared.invokeExternalFeature('goalIndicator');
          }
        },

        observe(changedNodes) {
          // when this is moved to the webpack codebase, hopefully we can just listen to onRouteChanged
          // but until then we'll just have to keep adding stuff to this check that should trigger
          // budget-category related features to update
          if ((changedNodes.has('nav-main') && ynabToolKit.shared.getCurrentRoute().includes('budget')) ||
            changedNodes.has('budget-table-row is-sub-category') ||
            changedNodes.has('budget-inspector') ||
            changedNodes.has('budget-table-cell-available-div user-data') ||
            changedNodes.has('budget-inspector-goals') ||
            changedNodes.has('budget-header-item budget-header-calendar toolkit-highlight-current-month')
          ) {
            ynabToolKit.budgetCategoryInfo.invoke();
          } else if (
            changedNodes.has('modal-overlay ynab-u modal-popup modal-budget-edit-category active') ||
            changedNodes.has('modal-overlay ynab-u modal-popup modal-add-master-category active') ||
            changedNodes.has('modal-overlay ynab-u modal-popup modal-add-sub-category active')) {
            /**
             * Seems there should be a more 'Embery' way to know when the categories have been
             * updated, added, or deleted but this'll have to do for now. Note that the flag is
             * set to true here so that next time invoke() is called the categories array will
             * be rebuilt. Rebuilding at this point won't work because the user hasn't completed
             * the update activity at this point.
             */
            loadCategories = true;
          }
        },

        onRouteChanged() {
          if (ynabToolKit.shared.getCurrentRoute().includes('budget')) {
            loadCategories = true;
            ynabToolKit.budgetCategoryInfo.invoke();
          }
        }
      };
    }()); // Keep feature functions contained within this object

    // Run once and activate setTimeOut()
    ynabToolKit.budgetCategoryInfo.invoke();
  } else if (typeof Ember !== 'undefined') {
    Ember.run.next(poll, 250);
  } else {
    setTimeout(poll, 250);
  }
}());

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
