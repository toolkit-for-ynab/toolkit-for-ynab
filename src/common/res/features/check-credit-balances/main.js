
(function poll() {
  if (typeof ynabToolKit !== 'undefined' && ynabToolKit.actOnChangeInit === true) {

    ynabToolKit.checkCreditBalances = new function() {

      this.budgetView = ynab.YNABSharedLib
        .getBudgetViewModel_AllBudgetMonthsViewModel()._result;

      this.invoke = function() {
        // Get debt accounts to process
        var debtAccounts = ynabToolKit.checkCreditBalances.getDebtAccounts();

        // Process the found debt accounts
        ynabToolKit.checkCreditBalances.processDebtAccounts(debtAccounts);
      };

      this.observe = function(changedNodes) {

        if (changedNodes.has('budget-inspector')) {
          // The user has changed their budget row selection
          ynabToolKit.checkCreditBalances.invoke();
        }
      };

      this.getDebtAccounts = function() {
        var categoryEntityId = ynabToolKit.checkCreditBalances.budgetView
          .categoriesViewModel.debtPaymentMasterCategory.entityId;

        var debtAccounts = ynabToolKit.checkCreditBalances.budgetView
          .categoriesViewModel.subCategoriesCollection
          .findItemsByMasterCategoryId(categoryEntityId);

        return debtAccounts;
      };

      this.processDebtAccounts = function(debtAccounts) {
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

          var available = monthlyBudget.balance;

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
        });
      };

      this.updateRow = function(name) {
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
      };

      this.updateInspectorStyle = function(name) {
        var inspectorName = $('.inspector-category-name.user-data').text().trim();
        if (name === inspectorName) {
          var inspectorBalance = $('.inspector-overview-available .user-data .user-data.currency');
          inspectorBalance.removeClass('positive negative')
            .addClass('cautious');
        }
      };

      this.updateInspectorButton = function(name, difference) {
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
