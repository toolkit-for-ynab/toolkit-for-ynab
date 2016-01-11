(function poll() {
  if (typeof ynabToolKit !== 'undefined') {

    ynabToolKit.featureOptions.checkCreditBalances = true;
    ynabToolKit.checkCreditBalances = function() {

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

        var monthlyBudget = budgetView.monthlySubCategoryBudgetCalculationsCollection
          .findItemByEntityId('mcbc/2016-01/' + a.entityId);

        var available = monthlyBudget.balance;

        if (available != (clearedBalance * -1)) {
          updateRow(a.name);
          updateInspector(a.name);
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

      function updateInspector(name) {
        var inspectorName = $('.inspector-category-name.user-data').text().trim();
        if (name === inspectorName) {
          var inspectorBalance = $('.inspector-overview-available .user-data .user-data.currency');
          inspectorBalance.removeClass('positive negative')
            .addClass('cautious');
        }
      }
    };
  } else {
    setTimeout(poll, 250);
  }
})();
