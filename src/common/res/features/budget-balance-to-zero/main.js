/* jshint multistr: true */
/* jscs:disable disallowMultipleLineStrings */

(function poll() {
  if (typeof ynabToolKit !== 'undefined'  && ynabToolKit.pageReady === true) {

    ynabToolKit.budgetBalaceToZero = new function() {  // jshint ignore:line

      this.budgetView = ynab.YNABSharedLib
        .getBudgetViewModel_AllBudgetMonthsViewModel()._result; // jscs:ignore requireCamelCaseOrUpperCaseIdentifiers

      this.invoke = function() {
        var categories = ynabToolKit.budgetBalaceToZero.getCategories();
        var categoryName = ynabToolKit.budgetBalaceToZero.getInspectorName();

        categories.forEach(function(f) {
          if (f.name === categoryName) {
            ynabToolKit.budgetBalaceToZero
              .updateInspectorButton(categoryName, 0);
          }
        });
      };

      this.observe = function(changedNodes) {
        if (changedNodes.has('budget-inspector')) {
          ynabToolKit.budgetBalaceToZero.invoke();
        }
      };

      this.getCategories = function() {
        if (ynabToolKit.budgetBalaceToZero === 'undefined') {
          return [];
        }

        var categories = [];
        var masterCategories = [];
        var masterCats = ynabToolKit.budgetBalaceToZero.budgetView
          .categoriesViewModel.masterCategoriesCollection._internalDataArray;

        masterCats.forEach(function(c) {
          // Filter out "special" categories
          if (c.internalName === null) {
            masterCategories.push(c.entityId);
          }
        });

        masterCategories.forEach(function(c) {
          var accounts = ynabToolKit.checkCreditBalances.budgetView
            .categoriesViewModel.subCategoriesCollection
            .findItemsByMasterCategoryId(c);

          Array.prototype.push.apply(categories, accounts);
        });

        return categories;
      };

      this.updateInspectorButton = function(name, difference) {
        if ($('.rectify-difference').length) {
          return;
        }

        var fhDifference = ynabToolKit.shared
          .formatCurrency(difference, true);
        var fDifference = ynabToolKit.shared
          .formatCurrency(difference, false);
        var button = ' \
        <button class="budget-inspector-button rectify-difference" \
          onClick="ynabToolKit.checkCreditBalances.updateCreditBalances(\'' +
          name + '\', ' + difference + ')"> \
          Balance to 0.00: \
            <strong class="user-data" title="' + fDifference + '"> \
              <span class="user-data currency zero"> \
              ' + fhDifference + ' \
            </span> \
          </strong> \
        </button>';

        $('.inspector-quick-budget .ember-view').append(button);
      };

      this.getInspectorName = function() {
        return $('.inspector-category-name.user-data').text().trim();
      };

    }();
  } else {
    setTimeout(poll, 250);
  }
})();
