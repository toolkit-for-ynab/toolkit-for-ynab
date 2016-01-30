
(function poll() {
  if (typeof ynabToolKit !== 'undefined' && ynabToolKit.actOnChangeInit === true) {

    ynabToolKit.checkCreditBalances = new function() {

      this.invoke = function() {
        var budgetView = ynab.YNABSharedLib
          .getBudgetViewModel_AllBudgetMonthsViewModel()._result;

        var categoryEntityId = budgetView.categoriesViewModel
          .debtPaymentMasterCategory.entityId;

        var debtAccounts = budgetView.categoriesViewModel.subCategoriesCollection
          .findItemsByMasterCategoryId(categoryEntityId);

        debtAccounts.forEach(function(a) {
          var accountName = a.name;
          var account = budgetView.sidebarViewModel
            .accountCalculationsCollection.findItemByAccountId(a.accountId);

          var clearedBalance = account.clearedBalance;

          var currentMonth = moment(ynabToolKit.shared.parseSelectedMonth()).format('YYYY-MM');
          var monthlyBudget = budgetView.monthlySubCategoryBudgetCalculationsCollection
            .findItemByEntityId('mcbc/' + currentMonth + '/' + a.entityId);

          var available = monthlyBudget.balance;

          var difference = ((available + clearedBalance) * -1);
          updateInspectorButton(a.name, difference);

          if (available != (clearedBalance * -1)) {
            updateRow(a.name);
            updateInspectorStyle(a.name);
          }
        });

        function updateRow(name) {
          var rows = $('.is-sub-category.is-debt-payment-category');
          rows.each(function(i) {
            var accountName = $(this)
              .find('.budget-table-cell-name div.button-truncate').prop('title');
            if (name === accountName) {
              var categoryBalance = $(this)
                .find('.budget-table-cell-available-div .user-data.currency');
              categoryBalance.removeClass('positive negative')
                .addClass('cautious');
            }
          });
        }

        function updateInspectorStyle(name) {
          var inspectorName = $('.inspector-category-name.user-data').text().trim();
          if (name === inspectorName) {
            var inspectorBalance = $('.inspector-overview-available .user-data .user-data.currency');
            inspectorBalance.removeClass('positive negative')
              .addClass('cautious');
          }
        }

        function updateInspectorButton(name, difference) {
          var inspectorName = $('.inspector-category-name.user-data').text().trim();

          if (name && name === inspectorName) {

            if ($('.rectify-difference').length)
              return;

            var fhDifference = ynabToolKit.shared.formatCurrency(difference, true);
            var fDifference = ynabToolKit.shared.formatCurrency(difference, false);
            var button = ' \
            <button class="budget-inspector-button rectify-difference" \
              onClick="ynabToolKit.checkCreditBalances.updateCreditBalances(\'' + name+'\', ' + difference + ')"> \
              Rectify Available for PIF CC: \
                <strong class="user-data" title="' + fDifference + '"> \
                  <span class="user-data currency zero"> \
                  ' + fhDifference + ' \
                </span> \
              </strong> \
            </button>';

            $('.inspector-quick-budget .ember-view').append(button);
          }
        }
      };

      this.observe = function(changedNodes) {

        if (changedNodes.has('budget-inspector')) {
          // The user has changed their budget row selection
          ynabToolKit.checkCreditBalances.invoke();
        }
      };

      this.updateCreditBalances = function(name, difference) {
        var debtPaymentCategories = $('.is-debt-payment-category.is-sub-category');

        $(debtPaymentCategories).each(function() {
          var accountName = $(this).find('.budget-table-cell-name div.button-truncate').prop('title');
          if (accountName === name) {
            var input = $(this).find('.budget-table-cell-budgeted div.currency-input').click().find('input');
            var oldValue = input.val();

            // If nothing is budgetted, the input will be empty
            oldValue = oldValue ? oldValue : 0;

            // Get the formatted currency so we can add it to the budget box correctly
            var fhDifference = ynabToolKit.shared.formatCurrency(difference, true);
            var results = /(-*).*bdi>(.*)/g.exec(fhDifference);
            var addition = results[1] + results[2];

            // Strip out commas since they mess things up
            addition = addition.replace(/,/g, '');

            var newValue = (parseFloat(oldValue) + parseFloat(addition));

            input.val(newValue);
            $(input).blur();
          }
        });
      };
    };

    ynabToolKit.checkCreditBalances.invoke(); // Run itself once

  } else {
    setTimeout(poll, 250);
  }
})();
