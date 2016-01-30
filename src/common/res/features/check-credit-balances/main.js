
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
              onClick="ynabToolKit.checkCreditBalances.updateCreditBalances(name)"> \
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
      },

      this.updateCreditBalances = function(name) {
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
      },

      this.observe = function(changedNodes) {

        if (changedNodes.has('budget-inspector')) {
          // The user has changed their budget row selection
          ynabToolKit.checkCreditBalances.invoke();
        }
      };
    };

    ynabToolKit.checkCreditBalances.invoke(); // Run itself once

  } else {
    setTimeout(poll, 250);
  }
})();
