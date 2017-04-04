(function poll() {
  if (typeof ynabToolKit !== 'undefined' && ynabToolKit.pageReady === true) {
    ynabToolKit.budgetBalanceToGoal = (function () {
      return {
        budgetView: ynab.YNABSharedLib.getBudgetViewModel_AllBudgetMonthsViewModel()._result,

        invoke() {
          let categories = ynabToolKit.budgetBalanceToGoal.getCategories();
          let categoryName = ynabToolKit.budgetBalanceToGoal.getInspectorName();
          let masterCategoryViewId = $('ul.is-checked').prevAll('ul.is-master-category').attr('id');
          let masterCategory = ynabToolKit.shared.getEmberView(masterCategoryViewId).get('data');
          let masterCategoryId = masterCategory.get('categoryId');

          categories.forEach(function (f) {
            if (f.name === categoryName && f.masterCategoryId === masterCategoryId) {
              ynabToolKit.budgetBalanceToGoal.updateInspectorButton(f);

              return false;
            }
          });
        },

        observe(changedNodes) {
          console.log(changedNodes);
          if (changedNodes.has('budget-inspector-goals')) {
            // In theory, if there's a 'budget-inspector-goals' classed node, then the user is or has changed the goal.
            // However, there seems to be some disconnect between this event and when YNAB updates the values.
            setTimeout(function () {
              ynabToolKit.budgetBalanceToGoal.invoke();
            }, 60000);
          } else if (changedNodes.has('budget-inspector')) {
            // User has changed selected budget item or changed budgeted amount.
            ynabToolKit.budgetBalanceToGoal.invoke();
          }
        },

        addBudgetVersionIdObserver() {
          let applicationController = ynabToolKit.shared.containerLookup('controller:application');
          applicationController.addObserver('budgetVersionId', function () {
            Ember.run.scheduleOnce('afterRender', this, resetBudgetView);
          });

          function resetBudgetView() {
            ynabToolKit.budgetBalanceToGoal.budgetView = null;
          }
        },

        getCategories() {
          // After using Budget Quick Switch, budgetView needs to be reset to the new budget. The try catch construct is necessary
          // because this function can be called several times during the budget switch process.
          if (ynabToolKit.budgetBalanceToGoal.budgetView === null) {
            try {
              ynabToolKit.budgetBalanceToGoal.budgetView = ynab.YNABSharedLib.getBudgetViewModel_AllBudgetMonthsViewModel()._result;
            } catch (e) {
              return;
            }
          }

          var categories = [];
          var masterCats = ynabToolKit.budgetBalanceToGoal.budgetView.categoriesViewModel.masterCategoriesCollection._internalDataArray;
          var masterCategories = [];

          masterCats.forEach(function (c) {
            // Filter out "special" categories
            if (c.internalName === null) {
              masterCategories.push(c.entityId);
            }
          });

          masterCategories.forEach(function (c) {
            var accounts = ynabToolKit.budgetBalanceToGoal.budgetView
              .categoriesViewModel.subCategoriesCollection
              .findItemsByMasterCategoryId(c);

            Array.prototype.push.apply(categories, accounts);
          });

          return categories;
        },

        updateInspectorButton(f) {
          var goalAmount = ynabToolKit.budgetBalanceToGoal.getBudgetGoalLeft(f);
          var fGoal = ynabToolKit.shared.formatCurrency(goalAmount);

          if (($('.toolkit-balance-to-goal').length) || (goalAmount === '-0')) {
            return;
          }

          /* check for positive amounts */
          var positive = '';
          if (ynab.unformat(goalAmount) > 0) { positive = '+'; }

          var button = $('<a>', { class: 'budget-inspector-button toolkit-balance-to-goal' })
            .css({ 'text-align': 'center', 'line-height': '30px', display: 'block', cursor: 'pointer' })
            .data('name', f.name)
            .data('amount', goalAmount)
            .click(function () {
              ynabToolKit.budgetBalanceToGoal.updateBudgetedBalance($(this).data('name'), $(this).data('amount'));
            })
            .append(ynabToolKit.l10nData && ynabToolKit.l10nData['toolkit.balanceToGoal'] || 'Balance to Goal: ')
            .append(' ' + positive)
            .append($('<strong>', { class: 'user-data', title: fGoal })
            .append(ynabToolKit.shared.appendFormattedCurrencyHtml($('<span>', { class: 'user-data currency zero' }), goalAmount)));

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

        getBudgetGoalLeft(f) {
          var currentMonth = moment(ynabToolKit.shared.parseSelectedMonth())
            .format('YYYY-MM');
          var monthlyBudget = ynabToolKit.budgetBalanceToGoal.budgetView
            .monthlySubCategoryBudgetCalculationsCollection
            .findItemByEntityId('mcbc/' + currentMonth + '/' + f.entityId);

          return (monthlyBudget.goalOverallLeft);
        }
      };
    }()); // Keep feature functions contained within this object

    // Run once to activate our observer()
    ynabToolKit.budgetBalanceToGoal.addBudgetVersionIdObserver();
  } else {
    setTimeout(poll, 250);
  }
}());
