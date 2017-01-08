(function poll() {
  if (typeof ynabToolKit !== 'undefined' && ynabToolKit.actOnChangeInit === true) {
    ynabToolKit.insertPacingColumns = (function () {
      // Supporting functions,
      // or variables, etc
      var storePacingLocally = true;

      // Calculate the proportion of the month that has been spent -- only works for the current month
      function timeSpent() {
        var today = new Date();

        var selectedMonth = ynabToolKit.shared.parseSelectedMonth();
        var lastDayOfThisMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0);
        var daysInMonth = lastDayOfThisMonth.getDate(); // The date of the last day in the month is the number of days in the month
        var day = Math.max(today.getDate(), 1);

        return day / daysInMonth;
      }

      // Determine whether the selected month is the current month
      function inCurrentMonth() {
        var today = new Date();
        var selectedMonth = ynabToolKit.shared.parseSelectedMonth();
        return selectedMonth.getMonth() === today.getMonth() && selectedMonth.getYear() === today.getYear();
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

      return {
        invoke() {
          var tv = ynab.YNABSharedLib.getBudgetViewModel_AllBudgetMonthsViewModel()._result.getAllAccountTransactionsViewModel();
          var month = tv.visibleTransactionDisplayItemsForMonthCache.month;
          var allTransactions = tv.getVisibleTransactionDisplayItemsForMonth(month);

          if ($('.ember-view .budget-header').length) {
            if (inCurrentMonth()) {
              // Make room for the column
              $('#ynab-toolkit-pacing-style').remove();
              $('<style type="text/css" id="ynab-toolkit-pacing-style"> .budget-table-cell-available { width: 10% !important; } </style>').appendTo('head');
            } else {
              $('#ynab-toolkit-pacing-style').remove();
              $('<style type="text/css" id="ynab-toolkit-pacing-style"> .budget-table-cell-pacing { display: none; } </style>').appendTo('head');
            }

            $('.budget-table-cell-pacing').remove();

            $('.budget-table-header .budget-table-cell-available').after('<li class="budget-table-cell-pacing">' +
              ((ynabToolKit.l10nData && ynabToolKit.l10nData['toolkit.pacing']) || 'PACING') + '</li>');

            var deemphasizedCategories = getDeemphasizedCategories();

            var showIndicator = ynabToolKit.options.pacing;
            if (showIndicator === '2') {
              showIndicator = true;
            } else {
              showIndicator = false;
            }

            // Select all budget table rows but not the uncategorized category and not master categories.
            $('.budget-table-row')
              .not('.budget-table-uncategorized-transactions')
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

                var temperature;
                if (pace > 1) {
                  temperature = 'cautious';
                } else {
                  temperature = 'positive';
                }

                var deemphasized = masterCategory.get('isDebtPaymentCategory') || $.inArray(masterCategoryDisplayName + '_' + subCategoryDisplayName, deemphasizedCategories) >= 0;
                var display = Math.round((budgeted * timeSpent() - activity) * 1000);
                var tooltip;

                if (display >= 0) {
                  tooltip = 'In ' + transactionCount + ' transaction' + (transactionCount !== 1 ? 's' : '') +
                    ' you have spent ' + ynabToolKit.shared.formatCurrency(display, false) +
                    ' less than your available budget for this category ' + Math.round(timeSpent() * 100) +
                    '% of the way through the month.&#13;&#13;' + (deemphasized ? 'Click to unhide.' : 'Click to hide.');
                } else if (display < 0) {
                  tooltip = 'In ' + transactionCount + ' transaction' + (transactionCount !== 1 ? 's' : '') +
                    ' you have spent ' + ynabToolKit.shared.formatCurrency(-display, false) +
                    ' more than your available budget for this category ' + Math.round(timeSpent() * 100) +
                    '% of the way through the month.&#13;&#13;' + (deemphasized ? 'Click to unhide.' : 'Click to hide.');
                }

                $(this).append('<li class="budget-table-cell-available budget-table-cell-pacing"><span title="' + tooltip +
                               '" class="budget-table-cell-pacing-display ' + temperature + ' ' +
                               (deemphasized ? 'deemphasized' : '') + (showIndicator ? ' indicator' : '') +
                               '" data-name="' + masterCategoryDisplayName + '_' + subCategoryDisplayName + '">' +
                               ynabToolKit.shared.formatCurrency(display, true) + '</span></li>');
              });

            $('.budget-table-cell-pacing-display').click(function (e) {
              var latestDemphasizedCategories = getDeemphasizedCategories();
              var name = $(this).data('name');

              if ($.inArray(name, latestDemphasizedCategories) >= 0) {
                latestDemphasizedCategories.splice($.inArray(name, latestDemphasizedCategories), 1);
                ynab.utilities.ConsoleUtilities.logWithColor(ynab.constants.LogLevels.Debug, 'Re-emphasizing category ' + name + ', new hide list ' + JSON.stringify(latestDemphasizedCategories));
                setDeemphasizedCategories(latestDemphasizedCategories);
                $(this).removeClass('deemphasized');
              } else {
                latestDemphasizedCategories.push(name);
                ynab.utilities.ConsoleUtilities.logWithColor(ynab.constants.LogLevels.Debug, 'De-emphasizing category ' + name + ', new hide list ' + JSON.stringify(latestDemphasizedCategories));
                setDeemphasizedCategories(latestDemphasizedCategories);
                $(this).addClass('deemphasized');
              }

              if (['pacing', 'both'].indexOf(ynabToolKit.options.budgetProgressBars) !== -1) {
                ynabToolKit.shared.invokeExternalFeature('budgetProgressBars');
              }

              e.stopPropagation();
            });
          }
        },

        observe(changedNodes) {
          if (changedNodes.has('budget-inspector')) {
            // The user has returned back to the budget screen
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
  } else {
    setTimeout(poll, 250);
  }
}());
