(function poll() {
  if ( typeof ynabToolKit !== "undefined" && ynabToolKit.actOnChangeInit === true ) {

    ynabToolKit.featureOptions.insertPacingColumns = true;
    ynabToolKit.insertPacingColumns = function ()  {

      function parseSelectedMonth() {
        // TODO: There's probably a better way to reference this view, but this works better than DOM scraping which seems to fail in Firefox
        if($('.ember-view .budget-header').length) {
          var headerView = Ember.View.views[$('.ember-view .budget-header').attr("id")];
          var endOfLastMonth = headerView.get("currentMonth").toNativeDate();
          return new Date(endOfLastMonth.getFullYear(), endOfLastMonth.getMonth()+1, 1);
        } else {
          return null;
        }
      }

      // Calculate the proportion of the month that has been spent -- only works for the current month
      function timeSpent() {
        var today = new Date();

        var selectedMonth = parseSelectedMonth();
        var lastDayOfThisMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth()+1, 0);
        var daysInMonth = lastDayOfThisMonth.getDate(); // The date of the last day in the month is the number of days in the month
        var day = Math.max(today.getDate()-1,1);

        return day/daysInMonth;
      }

      function formatCurrency(e, html) {
        var n, r, a;
        e = ynab.formatCurrency(e);
        n = ynab.YNABSharedLib.currencyFormatter.getCurrency();
        a = Ember.Handlebars.Utils.escapeExpression(n.currency_symbol);
        if (html) {
          a = '<bdi>' + a + '</bdi>';
        }
        n.symbol_first ? (r = '-' === e.charAt(0), e = r ? '-' + a + e.slice(1) : a + e) : e += a;
        return new Ember.Handlebars.SafeString(e);
      }

      // Determine whether the selected month is the current month
      function inCurrentMonth() {
        var today = new Date();
        var selectedMonth = parseSelectedMonth();
        return selectedMonth.getMonth() == today.getMonth() && selectedMonth.getFullYear() == today.getFullYear();
      }

      function getDeemphasizedCategoriesSetting() {
        var userId = ynab.YNABSharedLib.defaultInstance.loggedInUser.entityId;
        return ynab.YNABSharedLib.defaultInstance.entityManager.getUserSettingByUserIdAndSettingName(userId, 'ynab_toolkit_pacing_deemphasized_categories');
      }

      function getDeemphasizedCategories() {
        var value = getDeemphasizedCategoriesSetting();
        if(typeof value !== 'undefined') {
          return JSON.parse(value.getSettingValue());
        } else {
          return [];
        }
      }

      function setDeemphasizedCategories(value) {
        var stringValue = JSON.stringify(value);

        var setting = getDeemphasizedCategoriesSetting();
        if(setting == null || typeof setting == 'undefined') {
          var userId = ynab.YNABSharedLib.defaultInstance.loggedInUser.entityId;
          setting = ynab.YNABSharedLib.defaultInstance.entityManager.createNewUserSetting(userId, 'ynab_toolkit_pacing_deemphasized_categories');
        }  
        
        setting.setSettingValue(stringValue);

        if(setting.getEntityState() == "detachedNew") {
          setting.mergeBackDetachedEntity();
        }
      }

      // Do nothing if the budget window isn't open
      if($('.ember-view .budget-header').length) {
        if(inCurrentMonth()) {
          // Make room for the column
          $('#ynab-toolkit-pacing-style').remove();
          $('<style type="text/css" id="ynab-toolkit-pacing-style"> .budget-table-cell-available { width: 10% !important; } </style>').appendTo('head');
        } else {
          $('#ynab-toolkit-pacing-style').remove();
          $('<style type="text/css" id="ynab-toolkit-pacing-style"> .budget-table-cell-pacing { display: none; } </style>').appendTo('head');
        }

        $('.budget-table-cell-pacing').remove()
        
        $(".budget-table-header .budget-table-cell-available").after($('<li class="budget-table-cell-pacing">PACING</li>'));
       
        var deemphasizedCategories = getDeemphasizedCategories();
        $('.budget-table-row').each(function(){ 
          var available = ynab.YNABSharedLib.defaultInstance.currencyFormatter.unformat($(this).find('.budget-table-cell-available').text());
          var activity = -ynab.YNABSharedLib.defaultInstance.currencyFormatter.unformat($(this).find('.budget-table-cell-activity').text());
          var budgeted = available+activity;
          var burned = activity/budgeted;
          var pace = burned/timeSpent();
       
          var masterName = $.trim($(this).prevAll('.is-master-category').first().find('.budget-table-cell-name').text());
          var subcatName = $.trim($(this).find('.budget-table-cell-name').text());

          var tv = ynab.YNABSharedLib.getBudgetViewModel_AllBudgetMonthsViewModel()._result.getAllAccountTransactionsViewModel();
          var month = tv.getBudgetMonthViewModelForCurrentMonth().getMonth();
          var allTransactions = tv.getVisibleTransactionDisplayItemsForMonth(month);

          var transactionCount = allTransactions.filter((el) => el.transferAccountId == null 
            && el.outflow > 0 && el.subCategoryNameWrapped == (masterName+": "+subcatName)).length;

          var display = Math.round((budgeted*timeSpent()-activity)*1000);
          var deemphasized = (masterName == 'Credit Card Payments') || ($.inArray(masterName+': '+subcatName, deemphasizedCategories) >= 0);
          if(pace > 1) {
            var temperature = 'cautious';
          } else {
            var temperature = 'positive';
          }

          if(display >= 0) {
            var tooltip = 'In '+transactionCount+' transaction'+(transactionCount != 1 ? 's' : '')+' you have spent '+formatCurrency(display, false)+
              ' less than your available budget for this category '+Math.round(timeSpent()*100)+'% of the way through the month.&#13;&#13;'+(deemphasized ? 'Click to unhide.' : 'Click to hide.');
          } else if(display < 0) {
            var tooltip = 'In '+transactionCount+' transaction'+(transactionCount != 1 ? 's' : '')+' you have spent '+formatCurrency(-display, false)+
              ' more than your available budget for this category '+Math.round(timeSpent()*100)+'% of the way through the month.&#13;&#13;'+(deemphasized ? 'Click to unhide.' : 'Click to hide.');
          }
          $(this).append('<li class="budget-table-cell-available budget-table-cell-pacing"><span title="'+tooltip+'" class="budget-table-cell-pacing-display '+temperature+' '+(deemphasized ? 'deemphasized' : '')+'" data-name="'+masterName+": "+subcatName+'">'+formatCurrency(display, true)+'</span></li>');
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
    };
    ynabToolKit.insertPacingColumns();
  } else {
    setTimeout(poll, 250);
  }   
})();
