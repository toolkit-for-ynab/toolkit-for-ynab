(function poll() {
  if ( typeof ynabToolKit !== "undefined" && ynabToolKit.actOnChangeInit === true ) {

    ynabToolKit.insertPacingColumns = (function(){

      // Supporting functions,
      // or variables, etc
      var storePacingLocally = true;

      // Calculate the proportion of the month that has been spent -- only works for the current month
      function timeSpent() {
        var today = new Date();

        var selectedMonth = ynabToolKit.shared.parseSelectedMonth();
        var lastDayOfThisMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth()+1, 0);
        var daysInMonth = lastDayOfThisMonth.getDate(); // The date of the last day in the month is the number of days in the month
        var day = Math.max(today.getDate()-1,1);

        return day/daysInMonth;
      }

      // Determine whether the selected month is the current month
      function inCurrentMonth() {
        var today = new Date();
        var selectedMonth = ynabToolKit.shared.parseSelectedMonth();
        return selectedMonth.getMonth() == today.getMonth() && selectedMonth.getYear() == today.getYear();
      }

      function getDeemphasizedCategoriesSetting() {
        var userId = ynab.YNABSharedLib.defaultInstance.loggedInUser.entityId;
        return ynab.YNABSharedLib.defaultInstance.entityManager.getUserSettingByUserIdAndSettingName(userId, 'ynab_toolkit_pacing_deemphasized_categories');
      }

      function getDeemphasizedCategories() {
        if(storePacingLocally) {
          return JSON.parse(localStorage.getItem('ynab_toolkit_pacing_deemphasized_categories')) || [];
        } else {
          var value = getDeemphasizedCategoriesSetting();
          if(typeof value !== 'undefined') {
            return JSON.parse(value.getSettingValue());
          } else {
            return [];
          }
        }
      }

      function setDeemphasizedCategories(value) {
        var stringValue = JSON.stringify(value);

        if(storePacingLocally) {
          localStorage.setItem('ynab_toolkit_pacing_deemphasized_categories', stringValue);
        } else {
          var setting = getDeemphasizedCategoriesSetting();
          if(setting === null || typeof setting == 'undefined') {
            var userId = ynab.YNABSharedLib.defaultInstance.loggedInUser.entityId;
            setting = ynab.YNABSharedLib.defaultInstance.entityManager.createNewUserSetting(userId, 'ynab_toolkit_pacing_deemphasized_categories');
          }

          setting.setSettingValue(stringValue);

          if(setting.getEntityState() == "detachedNew") {
            setting.mergeBackDetachedEntity();
          }
        }
      }

      return {
        invoke: function() {
          var tv = ynab.YNABSharedLib.getBudgetViewModel_AllBudgetMonthsViewModel()._result.getAllAccountTransactionsViewModel();
          var month = tv.getBudgetMonthViewModelForCurrentMonth().getMonth();
          var allTransactions = tv.getVisibleTransactionDisplayItemsForMonth(month);

          if($('.ember-view .budget-header').length) {
            if(inCurrentMonth()) {
              // Make room for the column
              $('#ynab-toolkit-pacing-style').remove();
              $('<style type="text/css" id="ynab-toolkit-pacing-style"> .budget-table-cell-available { width: 10% !important; } </style>').appendTo('head');
            } else {
              $('#ynab-toolkit-pacing-style').remove();
              $('<style type="text/css" id="ynab-toolkit-pacing-style"> .budget-table-cell-pacing { display: none; } </style>').appendTo('head');
            }


            $('.budget-table-cell-pacing').remove();

            $(".budget-table-header .budget-table-cell-available").after('<li class="budget-table-cell-pacing">' +
              ((ynabToolKit.l10nData && ynabToolKit.l10nData["toolkit.pacing"]) || 'PACING') + '</li>');

            var deemphasizedCategories = getDeemphasizedCategories();
            $('.budget-table-row').each(function(){
              var available = ynab.YNABSharedLib.defaultInstance.currencyFormatter.unformat($(this).find('.budget-table-cell-available').text());
              var activity = -ynab.YNABSharedLib.defaultInstance.currencyFormatter.unformat($(this).find('.budget-table-cell-activity').text());
              var budgeted = available+activity;
              var burned = activity/budgeted;
              var pace = burned/timeSpent();

              var masterName = $.trim($(this).prevAll('.is-master-category').first().find('.budget-table-cell-name').text());
              var subcatName = $.trim($(this).find('.budget-table-cell-name').text());

              var transactionCount = allTransactions.filter(function(el) {
                return el.transferAccountId === null &&
                el.outflow > 0 &&
                el.subCategoryNameWrapped == (masterName+": "+subcatName);}).length;

              var temperature;
              if (pace > 1) {
                temperature = 'cautious';
              } else {
                temperature = 'positive';
              }

              var deemphasized = (masterName == 'Credit Card Payments') || $.inArray(masterName+': '+subcatName, deemphasizedCategories) >= 0;
              var display = Math.round((budgeted*timeSpent()-activity)*1000);
              var tooltip;
              if(display >= 0) {
                tooltip = 'In '+transactionCount+' transaction'+(transactionCount != 1 ? 's' : '')+' you have spent '+ynabToolKit.shared.formatCurrency(display, false)+
                  ' less than your available budget for this category '+Math.round(timeSpent()*100)+'% of the way through the month.&#13;&#13;'+(deemphasized ? 'Click to unhide.' : 'Click to hide.');
              } else if(display < 0) {
                tooltip = 'In '+transactionCount+' transaction'+(transactionCount != 1 ? 's' : '')+' you have spent '+ynabToolKit.shared.formatCurrency(-display, false)+
                  ' more than your available budget for this category '+Math.round(timeSpent()*100)+'% of the way through the month.&#13;&#13;'+(deemphasized ? 'Click to unhide.' : 'Click to hide.');
              }
              $(this).append('<li class="budget-table-cell-available budget-table-cell-pacing"><span title="'+tooltip+'" class="budget-table-cell-pacing-display '+temperature+' '+(deemphasized ? 'deemphasized' : '')+'" data-name="'+masterName+": "+subcatName+'">'+ynabToolKit.shared.formatCurrency(display, true)+'</span></li>');

            });

            $('.budget-table-cell-pacing-display').click(function(e) {
              var deemphasizedCategories = getDeemphasizedCategories();
              var name = $(this).data("name");

              if($.inArray(name, deemphasizedCategories) >= 0) {
                deemphasizedCategories.splice($.inArray(name, deemphasizedCategories), 1);
                ynab.utilities.ConsoleUtilities.logWithColor(ynab.constants.LogLevels.Debug, 'Re-emphasizing category '+name+', new hide list '+JSON.stringify(deemphasizedCategories));
                setDeemphasizedCategories(deemphasizedCategories);
                $(this).removeClass('deemphasized');
              } else {
                deemphasizedCategories.push(name);
                ynab.utilities.ConsoleUtilities.logWithColor(ynab.constants.LogLevels.Debug, 'De-emphasizing category '+name+', new hide list '+JSON.stringify(deemphasizedCategories));
                setDeemphasizedCategories(deemphasizedCategories);
                $(this).addClass('deemphasized');
              }
              e.stopPropagation();
            });
          }
        },

        observe: function(changedNodes) {
          if (changedNodes.has('budget-inspector')) {
            // The user has returned back to the budget screen
            ynabToolKit.insertPacingColumns.invoke();
          }
        }
      };
    })(); // Keep feature functions contained within this object

    ynabToolKit.insertPacingColumns.invoke();

  } else {
    setTimeout(poll, 250);
  }
})();
