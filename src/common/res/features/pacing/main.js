(function poll() {
  if ( typeof ynabToolKit !== "undefined" && ynabToolKit.actOnChangeInit === true ) {

    ynabToolKit.featureOptions.insertPacingColumns = true;
    ynabToolKit.insertPacingColumns = function ()  {

		// Calculate the proportion of the month that has been spent -- only works for the current month
		function timeSpent() {
		  var today = new Date();
		  var daysInMonth = new Date(today.getYear(), today.getMonth(), 0).getDate();
		  var day = Math.max(today.getDate()-1,1);

		  return day/daysInMonth;
		}

		// Determine whether the selected month is the current month
		function inCurrentMonth() {
		  var today = new Date();
		  var selectedMonth = new Date($('.budget-header-calendar-date-button').text());
		  return selectedMonth.getMonth() == today.getMonth() && selectedMonth.getYear() == today.getYear();
		}


		var tv = ynab.YNABSharedLib.getBudgetViewModel_AllBudgetMonthsViewModel()._result.getAllAccountTransactionsViewModel();
		var month = tv.getBudgetMonthViewModelForCurrentMonth().getMonth();
		var allTransactions = tv.getVisibleTransactionDisplayItemsForMonth(month);

		if(inCurrentMonth()) {
		  // Make room for the column
		  $('#ynab-toolkit-pacing-style').remove();
		  $('<style type="text/css" id="ynab-toolkit-pacing-style"> .budget-table-cell-available { width: 10% !important; } </style>').appendTo('head');
		} else {
		  $('#ynab-toolkit-pacing-style').remove();
		  $('<style type="text/css" id="ynab-toolkit-pacing-style"> .budget-table-cell-pacing { display: none; } </style>').appendTo('head');
		}


		$('.budget-table-cell-pacing').remove()

		$(".budget-table-header .budget-table-cell-available").after($('<li class="budget-table-cell-pacing"><strong>PACING</strong></li>'));

		$('.budget-table-row').each(function(){
		  var available = ynab.YNABSharedLib.defaultInstance.currencyFormatter.unformat($(this).find('.budget-table-cell-available').text());
		  var activity = -ynab.YNABSharedLib.defaultInstance.currencyFormatter.unformat($(this).find('.budget-table-cell-activity').text());
		  var budgeted = available+activity;
		  var burned = activity/budgeted;
		  var pace = burned/timeSpent();

		  var masterName = $.trim($(this).prevAll('.is-master-category').first().find('.budget-table-cell-name').text());
		  var subcatName = $.trim($(this).find('.budget-table-cell-name').text());

		  var transactionCount = allTransactions.filter((el) => el.transferAccountId == null
		    && el.outflow > 0 && el.subCategoryNameWrapped == (masterName+": "+subcatName)).length;

		  var displayType = 'dollars';
		  if(displayType == 'percentage') {
		    if(pace > 1) {
		      var temperature = 'warm cautious';
		    } else {
		      var temperature = 'cool positive';
		    }
		    if(!isFinite(pace)) {
		      var display = 999;
		    } else {
		      var display = Math.max(0,Math.round(pace*100));
		    }
		    if(pace > 0) {
		      $(this).append('<li class="budget-table-cell-available budget-table-cell-pacing"><span class="budget-table-cell-pacing-display '+temperature+'">'+display+'%</span></li>');
		    }
		  } else if (displayType == 'dollars') {
		    display = Math.round((budgeted*timeSpent()-activity)*1000);
		    if(available != 0 && activity != 0 && masterName != 'Credit Card Payments') {
		      if(pace > 1) {
		        var temperature = 'warm cautious';
		      } else if(activity != 0) {
		        var temperature = 'cool positive';
		      } else {
		        var temperature = 'neutral';
		      }
		    } else {
		      var temperature = 'neutral';
		    }

		    if(display >= 0) {
		      var tooltip = 'In '+transactionCount+' transaction'+(transactionCount != 1 ? 's' : '')+' you have spent '+ ynabToolKit.formatCurrency(display, false)+
							' less than your available budget for this category '+Math.round(timeSpent()*100)+'% of the way through the month.';
		    } else if(display < 0) {
		      var tooltip = 'In '+transactionCount+' transaction'+(transactionCount != 1 ? 's' : '')+' you have spent '+ ynabToolKit.formatCurrency(-display, false)+
							' more than your available budget for this category '+Math.round(timeSpent()*100)+'% of the way through the month.';
		    }
		    $(this).append('<li class="budget-table-cell-available budget-table-cell-pacing"><span title="'+tooltip+'" class="budget-table-cell-pacing-display '+temperature+'">'+ ynabToolKit.formatCurrency(display, true)+'</span></li>');
		  }
		});


	};
	ynabToolKit.insertPacingColumns();



  } else {
    setTimeout(poll, 250);
  }
})();
