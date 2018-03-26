
(function poll() {
  if (typeof ynabToolKit !== 'undefined' && ynabToolKit.actOnChangeInit === true) {
    ynabToolKit.insertPacingColumns = (function () {
      // Supporting functions,
      // or variables, etc
      var storePacingLocally = true;

      function getDaysInMonth() {
        var selectedMonth = ynabToolKit.shared.parseSelectedMonth();
        var lastDayOfThisMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0);
        return lastDayOfThisMonth.getDate(); // The date of the last day in the month is the number of days in the month
      }

      function getCurrentDayOfMonth() {
        var today = new Date();
        return Math.max(today.getDate(), 1);
      }

      // Calculate the proportion of the month that has been spent -- only works for the current month
      function timeSpent() {
        return getCurrentDayOfMonth() / getDaysInMonth();
      }

      // Determine whether the selected month is the current month
      function inCurrentMonth() {
        var today = new Date();
        var selectedMonth = ynabToolKit.shared.parseSelectedMonth();
        return (selectedMonth === null) ? false : selectedMonth.getMonth() === today.getMonth() && selectedMonth.getYear() === today.getYear();
      }

      function getDeemphasizedCategoriesSetting() {
        var userId = ynab.YNABSharedLib.defaultInstance.loggedInUser.entityId;
        return ynab.YNABSharedLib.defaultInstance.entityManager.getUserSettingByUserIdAndSettingName(userId, 'ynab_toolkit_pacing_deemphasized_categories');
      }

      function getDeemphasizedCategories() {
        if (storePacingLocally) {
          return JSON.parse(localStorage.getItem('ynab_toolkit_pacing_deemphasized_categories')) || [];
        }

        var value = getDeemphasizedCategoriesSetting();
        if (typeof value !== 'undefined') {
          return JSON.parse(value.getSettingValue());
        }

        return [];
      }

      function setDeemphasizedCategories(value) {
        var stringValue = JSON.stringify(value);

        if (storePacingLocally) {
          localStorage.setItem('ynab_toolkit_pacing_deemphasized_categories', stringValue);
        } else {
          var setting = getDeemphasizedCategoriesSetting();
          if (setting === null || typeof setting === 'undefined') {
            var userId = ynab.YNABSharedLib.defaultInstance.loggedInUser.entityId;
            setting = ynab.YNABSharedLib.defaultInstance.entityManager.createNewUserSetting(userId, 'ynab_toolkit_pacing_deemphasized_categories');
          }

          setting.setSettingValue(stringValue);

          if (setting.getEntityState() === 'detachedNew') {
            setting.mergeBackDetachedEntity();
          }
        }
      }

      function getDaysAheadOfSchedule(display, budgeted, activity) {
        if (budgeted === 0) {
          return 0;
        }
        const target = getCurrentDayOfMonth();
        const actual = (activity / budgeted) * getDaysInMonth();
        return Math.round((target - actual) * 10) / 10;
      }

      function getTooltip(display, displayInDays, transactionCount, deemphasized) {
        const moreOrLess = display >= 0 ? 'less' : 'more';
        const aheadOrBehind = display >= 0 ? 'ahead of' : 'behind';
        const hideOrUnhide = deemphasized ? 'unhide' : 'hide';
        const formattedDisplay = ynabToolKit.shared.formatCurrency(Math.abs(display), false);
        const formattedDisplayInDays = Math.abs(displayInDays);
        const days = formattedDisplayInDays === 1 ? 'day' : 'days';
        const transactions = transactionCount === 1 ? 'transaction' : 'transactions';
        const percentOfMonth = Math.round(timeSpent() * 100);
        const trimWords = (paragraph) => paragraph.replace(/\s+/g, ' ').trim();

        return trimWords(`
          In ${transactionCount} ${transactions}, you have spent ${formattedDisplay} ${moreOrLess} than
          your available budget for this category ${percentOfMonth}% of the way through the month.
          You are ${formattedDisplayInDays} ${days} ${aheadOrBehind} schedule.
          &#13;&#13;Click to ${hideOrUnhide}.
        `);
      }

      return {
        invoke() {
          var tv = ynab.YNABSharedLib.getBudgetViewModel_AllBudgetMonthsViewModel()._result.getAllAccountTransactionsViewModel();
          var month = tv.visibleTransactionDisplayItemsForMonthCache.month;
          var allTransactions = tv.getVisibleTransactionDisplayItemsForMonth(month);

          if ($('.ember-view .budget-header').length) {
            let currentMonth = inCurrentMonth();

            if (currentMonth) { // Make room for the column
              $('#ynab-toolkit-pacing-style').remove();
              $('<style type="text/css" id="ynab-toolkit-pacing-style"> .budget-table-cell-available { width: 10% !important; } </style>').appendTo('head');
            } else {
              $('#ynab-toolkit-pacing-style').remove();
              $('<style type="text/css" id="ynab-toolkit-pacing-style"> .budget-table-cell-pacing { display: none; } </style>').appendTo('head');
            }

            $('.budget-table-cell-pacing').remove();

            // Only add pacing column if in the current month otherwise the hidden column can cause problems for
            // other features that are not expecting the column to be present but not hidden.
            if (currentMonth) {
              $('.budget-table-header .budget-table-cell-available').after('<li class="budget-table-cell-pacing">' +
                ((ynabToolKit.l10nData && ynabToolKit.l10nData['toolkit.pacing']) || 'PACING') + '</li>');

              var deemphasizedCategories = getDeemphasizedCategories();

              // Select all budget table rows but not the uncategorized category and not master categories.
              $('.budget-table-row')
                .not('.budget-table-uncategorized-transactions')
                .not('.is-debt-payment-category')
                .not('.is-master-category')
                .each(function () {
                  var available = ynab.YNABSharedLib.defaultInstance.currencyFormatter.unformat($(this).find('.budget-table-cell-available').text());
                  var activity = -ynab.YNABSharedLib.defaultInstance.currencyFormatter.unformat($(this).find('.budget-table-cell-activity').text());
                  var budgeted = available + activity;
                  var burned = activity / budgeted;
                  var pace = burned / timeSpent();

                  let masterCategoryViewId = $(this).prevAll('.is-master-category').attr('id');
                  let masterCategory = ynabToolKit.shared.getEmberView(masterCategoryViewId).get('data');
                  let masterCategoryId = masterCategory.get('categoryId');
                  var masterCategoryDisplayName = masterCategory.get('displayName');

                  let subCategoryViewId = $(this).attr('id');
                  let subCategory = ynabToolKit.shared.getEmberView(subCategoryViewId).get('data');
                  let subCategoryId = subCategory.get('categoryId');
                  var subCategoryDisplayName = subCategory.get('displayName');

                  var transactionCount = allTransactions.filter(function (el) {
                    return el.outflow > 0 &&
                      el.masterCategoryId === masterCategoryId &&
                      el.subCategoryId === subCategoryId;
                  }).length;

                  const showIndicator = ynabToolKit.options.pacing === '2';
                  const showDays = ynabToolKit.options.pacing === '3';

                  var deemphasized = masterCategory.get('isDebtPaymentCategory') || $.inArray(masterCategoryDisplayName + '_' + subCategoryDisplayName, deemphasizedCategories) >= 0;
                  var display = Math.round((budgeted * timeSpent() - activity) * 1000);
                  const displayInDays = getDaysAheadOfSchedule(display, budgeted, activity);

                  const days = Math.abs(displayInDays) === 1 ? 'day' : 'days';
                  const formattedDisplay = showDays ? `${displayInDays} ${days}`
                    : ynabToolKit.shared.formatCurrency(display, true);

                  const tooltip = getTooltip(display, displayInDays, transactionCount, deemphasized);
                  const deemphasizedClass = deemphasized ? 'deemphasized' : '';
                  const indicatorClass = showIndicator ? 'indicator' : '';
                  const temperatureClass = (pace > 1) ? 'cautious' : 'positive';
                  $(this).append(`
                    <li class="budget-table-cell-available budget-table-cell-pacing">
                      <span
                        title="${tooltip}"
                        class="budget-table-cell-pacing-display currency ${temperatureClass} ${deemphasizedClass} ${indicatorClass}"
                        data-name="${masterCategoryDisplayName}_${subCategoryDisplayName}"
                      >
                        ${formattedDisplay}
                      </span>
                    </li>
                  `);
                });

              $('.budget-table-cell-pacing-display').click(function (e) {
                var latestDemphasizedCategories = getDeemphasizedCategories();
                var name = $(this).data('name');

                if ($.inArray(name, latestDemphasizedCategories) >= 0) {
                  latestDemphasizedCategories.splice($.inArray(name, latestDemphasizedCategories), 1);
                  setDeemphasizedCategories(latestDemphasizedCategories);
                  $(this).removeClass('deemphasized');
                } else {
                  latestDemphasizedCategories.push(name);
                  setDeemphasizedCategories(latestDemphasizedCategories);
                  $(this).addClass('deemphasized');
                }

                if (['pacing', 'both'].indexOf(ynabToolKit.options.budgetProgressBars) !== -1) {
                  ynabToolKit.shared.invokeExternalFeature('budgetProgressBars');
                }

                e.stopPropagation();
              });
            }
          }
        },

        observe(changedNodes) {
          if (changedNodes.has('budget-inspector')) {
            // The user has returned back to the budget screen
            ynabToolKit.insertPacingColumns.invoke();
          }
        },

        onRouteChanged(currentRoute) {
          if (currentRoute.indexOf('budget') !== -1) {
            ynabToolKit.insertPacingColumns.invoke();
          }
        }
      };
    }()); // Keep feature functions contained within this object

    var href = window.location.href;
    href = href.replace('youneedabudget.com', '');
    if (/budget/.test(href)) {
      ynabToolKit.insertPacingColumns.invoke();
    }
  } else if (typeof Ember !== 'undefined') {
    Ember.run.next(poll, 250);
  } else {
    setTimeout(poll, 250);
  }
}());
