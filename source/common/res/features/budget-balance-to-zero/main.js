(function poll() {
  if (typeof ynabToolKit !== 'undefined' && ynabToolKit.pageReady === true) {
    ynabToolKit.budgetBalanceToZero = (function () {
      return {
        budgetView: ynab.YNABSharedLib.getBudgetViewModel_AllBudgetMonthsViewModel()._result,

        invoke() {
          var categories = ynabToolKit.budgetBalanceToZero.getCategories();
          var categoryName = ynabToolKit.budgetBalanceToZero.getInspectorName();

          categories.forEach(function (f) {
            if (f.name === categoryName) {
              ynabToolKit.budgetBalanceToZero.updateInspectorButton(f);
            }
          });
        },

        observe(changedNodes) {
          if (changedNodes.has('budget-inspector')) {
            ynabToolKit.budgetBalanceToZero.invoke();
          }
        },

        getCategories() {
          if (ynabToolKit.budgetBalanceToZero === 'undefined') {
            return [];
          }

          var categories = [];
          var masterCategories = [];
          var masterCats = ynabToolKit.budgetBalanceToZero.budgetView
            .categoriesViewModel.masterCategoriesCollection._internalDataArray;

          masterCats.forEach(function (c) {
            // Filter out "special" categories
            if (c.internalName === null) {
              masterCategories.push(c.entityId);
            }
          });

          masterCategories.forEach(function (c) {
            var accounts = ynabToolKit.budgetBalanceToZero.budgetView
              .categoriesViewModel.subCategoriesCollection
              .findItemsByMasterCategoryId(c);

            Array.prototype.push.apply(categories, accounts);
          });

          return categories;
        },

        updateInspectorButton(f) {
          var amount = ynabToolKit.budgetBalanceToZero.getBudgetAmount(f);
          var fAmount = ynabToolKit.shared.formatCurrency(amount);

          if (($('.toolkit-balance-to-zero').length) || (amount === '-0')) {
            return;
          }

          /* check for positive amounts */
          var positive = '';
          if (ynab.unformat(amount) > 0) { positive = '+'; }

          var button = $('<a>', { class: 'budget-inspector-button toolkit-balance-to-zero' })
            .css({ 'text-align': 'center', 'line-height': '30px', display: 'block', cursor: 'pointer' })
            .data('name', f.name)
            .data('amount', amount)
            .click(function () {
              ynabToolKit.budgetBalanceToZero.updateBudgetedBalance($(this).data('name'), $(this).data('amount'));
            })
            .append(ynabToolKit.l10nData && ynabToolKit.l10nData['toolkit.balanceToZero'] || 'Balance to ' + ynabToolKit.shared.formatCurrency('0') + ': ')
            .append(' ' + positive)
            .append($('<strong>', { class: 'user-data', title: fAmount })
            .append(ynabToolKit.shared.appendFormattedCurrencyHtml($('<span>', { class: 'user-data currency zero' }), amount)));

          $('.inspector-quick-budget').append(button);
        },

        updateBudgetedBalance(name, difference) {
          // eslint-disable-next-line no-alert
          if (ynabToolKit.options.warnOnQuickBudget && !confirm('Are you sure you want to do this?')) {
            return;
          }

          var categories = $('.is-sub-category.is-checked');

          $(categories).each(function () {
            var accountName = $(this).find('.budget-table-cell-name div.button-truncate').prop('title');
            if (accountName === name) {
              var input = $(this).find('.budget-table-cell-budgeted div.currency-input').click()
                                 .find('input');

              var oldValue = input.val();

              // If nothing is budgetted, the input will be empty
              oldValue = oldValue || 0;

              // YNAB stores currency values * 1000. What's our actual difference?
              var newValue = (ynab.unformat(oldValue) + difference / 1000);

              $(input).val(newValue);

              if (!ynabToolKit.options.warnOnQuickBudget) {
                // only seems to work if the confirmation doesn't pop up?
                // haven't figured out a way to properly blur otherwise
                input.blur();
              }
            }
          });
        },

        getInspectorName() {
          return $('.inspector-category-name.user-data').text().trim();
        },

        getBudgetAmount(f) {
          var currentMonth = moment(ynabToolKit.shared.parseSelectedMonth())
            .format('YYYY-MM');
          var monthlyBudget = ynabToolKit.budgetBalanceToZero.budgetView
            .monthlySubCategoryBudgetCalculationsCollection
            .findItemByEntityId('mcbc/' + currentMonth + '/' + f.entityId);

          return (monthlyBudget.balance * -1);
        }
      };
    }()); // Keep feature functions contained within this object
  } else {
    setTimeout(poll, 250);
  }
}());
