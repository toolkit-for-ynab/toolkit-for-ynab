/* jshint multistr: true */
/* jscs:disable disallowMultipleLineStrings */

(function poll() {
  if (typeof ynabToolKit !== 'undefined'  && ynabToolKit.pageReady === true) {

    ynabToolKit.budgetBalanceToZero = new function() {  // jshint ignore:line

      this.budgetView = ynab.YNABSharedLib
        .getBudgetViewModel_AllBudgetMonthsViewModel()._result; // jscs:ignore requireCamelCaseOrUpperCaseIdentifiers

      this.invoke = function() {
        var categories = ynabToolKit.budgetBalanceToZero.getCategories();
        var categoryName = ynabToolKit.budgetBalanceToZero.getInspectorName();

        categories.forEach(function(f) {
          if (f.name === categoryName) {
            ynabToolKit.budgetBalanceToZero.updateInspectorButton(f);
          }
        });
      };

      this.observe = function(changedNodes) {
        if (changedNodes.has('budget-inspector')) {
          ynabToolKit.budgetBalanceToZero.invoke();
        }
      };

      this.getCategories = function() {
        if (ynabToolKit.budgetBalanceToZero === 'undefined') {
          return [];
        }

        var categories = [];
        var masterCategories = [];
        var masterCats = ynabToolKit.budgetBalanceToZero.budgetView
          .categoriesViewModel.masterCategoriesCollection._internalDataArray;

        masterCats.forEach(function(c) {
          // Filter out "special" categories
          if (c.internalName === null) {
            masterCategories.push(c.entityId);
          }
        });

        masterCategories.forEach(function(c) {
          var accounts = ynabToolKit.budgetBalanceToZero.budgetView
            .categoriesViewModel.subCategoriesCollection
            .findItemsByMasterCategoryId(c);

          Array.prototype.push.apply(categories, accounts);
        });

        return categories;
      };

      this.updateInspectorButton = function(f) {
        if ($('.balance-to-zero').length) {
          return;
        }

        var name = f.name;
        var amount = ynabToolKit.budgetBalanceToZero.getBudgetAmount(f);

        var fhAmount = ynabToolKit.shared
          .formatCurrency(amount, true);
        var fAmount = ynabToolKit.shared
          .formatCurrency(amount, false);
        var button = ' \
        <button class="budget-inspector-button balance-to-zero" \
          onClick="ynabToolKit.budgetBalanceToZero.updateBudgetedBalance(\'' +
          name + '\', ' + amount + ')"> \
          Balance to 0.00: \
            <strong class="user-data" title="' + fAmount + '"> \
              <span class="user-data currency zero"> \
              ' + fhAmount + ' \
            </span> \
          </strong> \
        </button>';

        $('.inspector-quick-budget .ember-view').append(button);
      };

      this.updateBudgetedBalance = function(name, difference) {
        var categories = $('.is-sub-category.is-checked');

        $(categories).each(function() {
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

      this.getInspectorName = function() {
        return $('.inspector-category-name.user-data').text().trim();
      };

      this.getBudgetAmount = function(f) {
        var currentMonth = moment(ynabToolKit.shared.parseSelectedMonth())
          .format('YYYY-MM');
        var monthlyBudget = ynabToolKit.budgetBalanceToZero.budgetView
          .monthlySubCategoryBudgetCalculationsCollection
          .findItemByEntityId('mcbc/' + currentMonth + '/' + f.entityId);

        return (monthlyBudget.balance * -1);
      };

    }();
  } else {
    setTimeout(poll, 250);
  }
})();
