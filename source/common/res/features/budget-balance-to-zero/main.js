(function poll() {
  if (typeof ynabToolKit !== 'undefined' && ynabToolKit.pageReady === true) {
    ynabToolKit.budgetBalanceToZero = (function () {
      return {
        budgetView: ynab.YNABSharedLib.getBudgetViewModel_AllBudgetMonthsViewModel()._result,

        invoke() {
          let categories = ynabToolKit.budgetBalanceToZero.getCategories();
          let categoryName = ynabToolKit.budgetBalanceToZero.getInspectorName();
          let masterCategoryViewId = $('ul.is-checked').prevAll('ul.is-master-category').attr('id');
          let masterCategory = ynabToolKit.shared.getEmberView(masterCategoryViewId).get('data');
          let masterCategoryId = masterCategory.get('categoryId');

          categories.forEach(function (f) {
            if (f.name === categoryName && f.masterCategoryId === masterCategoryId) {
              ynabToolKit.budgetBalanceToZero.updateInspectorButton(f);

              return false;
            }
          });
        },

        observe(changedNodes) {
          if (changedNodes.has('budget-inspector')) {
            ynabToolKit.budgetBalanceToZero.invoke();
          }
        },

        addBudgetVersionIdObserver() {
          let applicationController = ynabToolKit.shared.containerLookup('controller:application');
          applicationController.addObserver('budgetVersionId', function () {
            Ember.run.scheduleOnce('afterRender', this, resetBudgetView);
          });

          function resetBudgetView() {
            ynabToolKit.budgetBalanceToZero.budgetView = null;
          }
        },

        getCategories() {
          // After using Budget Quick Switch, budgetView needs to be reset to the new budget. The try catch construct is necessary
          // because this function can be called several times during the budget switch process.
          if (ynabToolKit.budgetBalanceToZero.budgetView === null) {
            try {
              ynabToolKit.budgetBalanceToZero.budgetView = ynab.YNABSharedLib.getBudgetViewModel_AllBudgetMonthsViewModel()._result;
            } catch (e) {
              return;
            }
          }

          var categories = [];
          var masterCats = ynabToolKit.budgetBalanceToZero.budgetView.categoriesViewModel.masterCategoriesCollection._internalDataArray;
          var masterCategories = [];

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
            var accountName = $(this).find('.budget-table-cell-name div.button-truncate')
                                     .prop('title')
                                     .match(/.[^\n]*/)[0];

            if (accountName === name) {
              let input = $(this).find('.budget-table-cell-budgeted div.currency-input').click()
                                 .find('input');

              let oldValue = input.val();

              oldValue = ynab.unformat(oldValue);
              difference = ynab.unformat(ynab.convertFromMilliDollars(difference)); // YNAB stores currency values * 1000
              let newValue = oldValue + difference;

              $(input).val(ynab.YNABSharedLib.currencyFormatter.format(ynab.convertToMilliDollars(newValue)));

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

    // Run once to activate our observer()
    ynabToolKit.budgetBalanceToZero.addBudgetVersionIdObserver();
  } else {
    setTimeout(poll, 250);
  }
}());
