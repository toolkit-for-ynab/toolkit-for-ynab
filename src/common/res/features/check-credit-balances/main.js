(function poll() {
  if (typeof ynabToolKit !== 'undefined' && ynabToolKit.actOnChangeInit === true) {

    ynabToolKit.checkCreditBalances = (function(){
      return {
        budgetView: ynab.YNABSharedLib
          .getBudgetViewModel_AllBudgetMonthsViewModel()._result,

        invoke: function() {
          
          if (ynabToolKit.checkCreditBalances.inMonth())
          {
          	var debtAccounts = ynabToolKit.checkCreditBalances.getDebtAccounts();
          	ynabToolKit.checkCreditBalances.processDebtAccounts(debtAccounts);
          }
        },

        observe: function(changedNodes) {

          if (
          	changedNodes.has('navlink-budget active') || 
          	changedNodes.has('budget-table-cell-available-div user-data') ||
          	changedNodes.has('budget-inspector')) {
            ynabToolKit.checkCreditBalances.invoke();
          }
        },

		inMonth: function() {
		  var today = new Date();
		  var selectedMonth = ynabToolKit.shared.parseSelectedMonth();
		  
		  // check for current month or future month
		  return selectedMonth.getMonth() >= today.getMonth() && selectedMonth.getYear() >= today.getYear();
		},

        getDebtAccounts: function() {
          var categoryEntityId = ynabToolKit.checkCreditBalances.budgetView
            .categoriesViewModel.debtPaymentMasterCategory.entityId;

          var debtAccounts = ynabToolKit.checkCreditBalances.budgetView
            .categoriesViewModel.subCategoriesCollection
            .findItemsByMasterCategoryId(categoryEntityId);

          return debtAccounts;
        },

        processDebtAccounts: function(debtAccounts) {
          debtAccounts.forEach(function(a) {
            var accountName = a.name;
            var account = ynabToolKit.checkCreditBalances.budgetView
              .sidebarViewModel.accountCalculationsCollection
              .findItemByAccountId(a.accountId);

            var balance = account.clearedBalance + account.unclearedBalance;

            var currentMonth = moment(ynabToolKit.shared.parseSelectedMonth()).format('YYYY-MM');
            var monthlyBudget = ynabToolKit.checkCreditBalances.budgetView
              .monthlySubCategoryBudgetCalculationsCollection
              .findItemByEntityId('mcbc/' + currentMonth + '/' + a.entityId);

			var available = 0;
			if (monthlyBudget) {
	            available = monthlyBudget.balance;
	        }

            // ensure that available is >= zero, otherwise don't update
			if (available >= 0)
			{
	            // If cleared balance is positive, bring available to 0, otherwise
	            // offset by the correct amount
	            var difference = 0;
	            if (balance > 0) {
	              difference = (available * -1);
	            } else {
	              difference = ((available + balance) * -1);
	            }

	            ynabToolKit.checkCreditBalances.updateInspectorButton(a.name, difference);

	            if (available != (balance * -1)) {
	              ynabToolKit.checkCreditBalances.updateRow(a.name);
	              ynabToolKit.checkCreditBalances.updateInspectorStyle(a.name);
	            }
            }
          });
        },

        updateRow: function(name) {
          var rows = $('.is-sub-category.is-debt-payment-category');
          rows.each(function(i) {
            var accountName = $(this).find('.budget-table-cell-name div.button-truncate').prop('title');

            if (name === accountName) {

              var categoryBalance = $(this).find('.budget-table-cell-available-div .user-data.currency');
              categoryBalance.removeClass('positive zero');
              if (! categoryBalance.hasClass('negative')) {
              	$(this).find('.budget-table-cell-available-div .user-data.currency').addClass('cautious');
              }
            }
          });
        },

        updateInspectorStyle: function(name) {
          var inspectorName = $('.inspector-category-name.user-data').text().trim();
          if (name === inspectorName) {
            var inspectorBalance = $('.inspector-overview-available .user-data .user-data.currency');
            inspectorBalance.removeClass('positive zero');
            if (! inspectorBalance.hasClass('negative')) {
              $('.inspector-overview-available .user-data .user-data.currency, .inspector-overview-available dt').addClass('cautious');
            }
          }
        },

        updateInspectorButton: function(name, difference) {
          var inspectorName = $('.inspector-category-name.user-data').text().trim();

          if (name && name === inspectorName) {

            if ($('.toolkit-toolkit-rectify-difference').length || difference == '-0')
              return;

            var fDifference = ynabToolKit.shared.formatCurrency(difference);
			var positive = '';
			if (ynab.unformat(difference) >= 0) { positive = '+'; }

            var button = $('<a>', { class: 'budget-inspector-button toolkit-rectify-difference '})
              .css({ 'text-align': 'center', 'line-height': '30px', 'display': 'block', 'cursor': 'pointer' })
              .data('name', name)
              .data('difference', difference)
              .click(function() {
                ynabToolKit.checkCreditBalances.updateCreditBalances($(this).data('name'), $(this).data('difference'));
              })
              .append(((ynabToolKit.l10nData && ynabToolKit.l10nData["toolkit.checkCreditBalances"]) || 'Rectify Available for PIF CC:'))
              .append(' ' + positive)
              .append($('<strong>', { class: 'user-data', title: fDifference })
              .append(ynabToolKit.shared.appendFormattedCurrencyHtml($('<span>', { class: 'user-data currency zero' }), difference)));

            $('.inspector-quick-budget .ember-view').append(button);
          }
        },

        updateCreditBalances: function(name, difference) {
          if ((ynabToolKit.options.warnOnQuickBudget != 0) && (!confirm('Are you sure you want to do this?')))
            return;

          var debtPaymentCategories = $('.is-debt-payment-category.is-sub-category');

          $(debtPaymentCategories).each(function() {
            var accountName = $(this).find('.budget-table-cell-name div.button-truncate').prop('title');
            if (accountName === name) {
              var input = $(this).find('.budget-table-cell-budgeted div.currency-input').click().find('input');
              var oldValue = input.val();

              // If nothing is budgeted, the input will be empty
              oldValue = oldValue ? oldValue : 0;

              // YNAB stores values *1000 for decimal places, so just
              // divide by 1000 to get the actual amount.
              var newValue = (ynab.unformat(oldValue) + difference / 1000);

              input.val(newValue);

              if (ynabToolKit.options.warnOnQuickBudget == 0) {
              	// only seems to work if the confirmation doesn't pop up?
              	// haven't figured out a way to properly blur otherwise
	            input.blur();
	          }
            }
          });
        }
      };
    })(); // Keep feature functions contained within this object

    ynabToolKit.checkCreditBalances.invoke(); // Run itself once

  } else {
    setTimeout(poll, 250);
  }
})();
