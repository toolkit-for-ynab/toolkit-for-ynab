/* jshint multistr: true */
/* jscs:disable disallowMultipleLineStrings */

(function poll() {
  if (typeof ynabToolKit !== 'undefined'  && ynabToolKit.pageReady === true) {

    ynabToolKit.budgetBalanceToZero = (function(){
      return {
        budgetView: ynab.YNABSharedLib
          .getBudgetViewModel_AllBudgetMonthsViewModel()._result, // jscs:ignore requireCamelCaseOrUpperCaseIdentifiers

        invoke: function() {
          var categories = ynabToolKit.budgetBalanceToZero.getCategories();
          var categoryName = ynabToolKit.budgetBalanceToZero.getInspectorName();

          categories.forEach(function(f) {
            if (f.name === categoryName) {
              ynabToolKit.budgetBalanceToZero.updateInspectorButton(f);
            }
          });
        },

        observe: function(changedNodes) {
          if (changedNodes.has('budget-inspector')) {
            ynabToolKit.budgetBalanceToZero.invoke();
          }
        },

        getCategories: function() {
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
        },

        updateInspectorButton: function(f) {
          if ($('.balance-to-zero').length) {
            return;
          }

          var name = f.name;
          var amount = ynabToolKit.budgetBalanceToZero.getBudgetAmount(f);
          var fAmount = ynabToolKit.shared.formatCurrency(amount);
          var formattedZero = ynabToolKit.shared.formatCurrency(0);

          var button = $('<button>', { class: 'budget-inspector-button balance-to-zero' })
            .data('name', f.name)
            .data('amount', amount)
            .click(function() {
              ynabToolKit.budgetBalanceToZero.updateBudgetedBalance($(this).data('name'), $(this).data('amount'));
            })
            .append(((ynabToolKit.l10nData && ynabToolKit.l10nData["toolkit.balanceToZero"]) || 'Balance to 0.00:'))
            .append($('<strong>', { class: 'user-data', title: fAmount })
              .append(ynabToolKit.shared.appendFormattedCurrencyHtml($('<span>', { class: 'user-data currency zero' }), amount)));

          $('.inspector-quick-budget .ember-view').append(button);
        },

        updateBudgetedBalance: function(name, difference) {
          var categories = $('.is-sub-category.is-checked');

          $(categories).each(function() {
            var accountName = $(this).find('.budget-table-cell-name div.button-truncate').prop('title');
            if (accountName === name) {
              var input = $(this).find('.budget-table-cell-budgeted div.currency-input').click().find('input');
              var oldValue = input.val();

              // If nothing is budgetted, the input will be empty
              oldValue = oldValue ? oldValue : 0;

              // YNAB stores currency values * 1000. What's our actual difference?
              var newValue = (ynab.unformat(oldValue) + difference / 1000);

              $(input).val(newValue);
              $(input).blur();
            }
          });
        },

        getInspectorName: function() {
          return $('.inspector-category-name.user-data').text().trim();
        },

        getBudgetAmount: function(f) {
          var currentMonth = moment(ynabToolKit.shared.parseSelectedMonth())
            .format('YYYY-MM');
          var monthlyBudget = ynabToolKit.budgetBalanceToZero.budgetView
            .monthlySubCategoryBudgetCalculationsCollection
            .findItemByEntityId('mcbc/' + currentMonth + '/' + f.entityId);

          return (monthlyBudget.balance * -1);
        }
      };
    })(); // Keep feature functions contained within this object
  } else {
    setTimeout(poll, 250);
  }
})();
