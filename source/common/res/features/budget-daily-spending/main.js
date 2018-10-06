(function poll() {
  if (typeof ynabToolKit !== 'undefined' && ynabToolKit.pageReady === true) {
    ynabToolKit.dailySpending = (function () {
      return {
        budgetView: ynab.YNABSharedLib.getBudgetViewModel_AllBudgetMonthsViewModel()._result,

        invoke() {
          let categories = ynabToolKit.dailySpending.getCategories();
          let categoryName = ynabToolKit.dailySpending.getInspectorName();
          let masterCategoryViewId = $('ul.is-checked').prevAll('ul.is-master-category').attr('id');
          let masterCategory = ynabToolKit.shared.getEmberView(masterCategoryViewId).get('data');
          let masterCategoryId = masterCategory.get('categoryId');

          categories.forEach(function (f) {
            if (f.name === categoryName && f.masterCategoryId === masterCategoryId) {
              ynabToolKit.dailySpending.updateDailySpending(f);

              return false;
            }
          });
        },

        observe(changedNodes) {
          if (changedNodes.has('budget-inspector')) {
            ynabToolKit.dailySpending.invoke();
          }
        },

        addBudgetVersionIdObserver() {
          const applicationController = ynabToolKit.shared.containerLookup('controller:application');
          applicationController.addObserver('budgetVersionId', function () {
            Ember.run.scheduleOnce('afterRender', this, resetBudgetViewDailySpending);
          });

          function resetBudgetViewDailySpending() {
            ynabToolKit.dailySpending.budgetView = null;
          }
        },

        getCategories() {
          if (ynabToolKit.dailySpending === 'undefined') {
            return [];
          }

          // After using Budget Quick Switch, budgetView needs to be reset to the new budget.
          if (ynabToolKit.dailySpending.budgetView === null) {
            try {
              ynabToolKit.dailySpending.budgetView = ynab.YNABSharedLib.getBudgetViewModel_AllBudgetMonthsViewModel()._result;
            } catch (e) {
              return;
            }
          }
          let categories = [];
          const masterCats = ynabToolKit.dailySpending.budgetView
          .categoriesViewModel.masterCategoriesCollection._internalDataArray;
          const masterCategories = [];

          masterCats.forEach(function (c) {
            // Filter out "special" categories
            if (c.internalName === null) {
              masterCategories.push(c.entityId);
            }
          });

          masterCategories.forEach(function (c) {
            let accounts = ynabToolKit.dailySpending.budgetView
              .categoriesViewModel.subCategoriesCollection
              .findItemsByMasterCategoryId(c);

            Array.prototype.push.apply(categories, accounts);
          });

          return categories;
        },

        updateDailySpending(f) {
          const amount = ynabToolKit.dailySpending.getBalanceAmount(f);
          const date = new Date();
          const remainingDays = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate() - date.getDate();
          const classDt = amount > 0 ? 'positive' : '';
          const classSpan = amount > 0 ? 'positive' : 'zero';
          const dailySpendingAmount = amount > 0 ? amount / remainingDays : 0;
          const fdailySpending = ynabToolKit.shared.formatCurrency(dailySpendingAmount * 1000);
          const available = $('<dl>', { class: 'inspector-overview-available' })
          .append($('<dt>', { class: classDt })
                  .append('Daily Spending')
                  )
          .append($('<dd>', { class: 'user-data' })
                  .append($('<span>', { class: 'user-data currency ' + classSpan })
                          .append(fdailySpending.toString()))
                  );
          $('.budget-inspector-category-overview .inspector').append($('<hr>', { class: 'clearfix' }));
          $('.budget-inspector-category-overview .inspector').append(available);
        },

        getInspectorName() {
          return $('.inspector-category-name.user-data').text().trim();
        },

        getBalanceAmount(f) {
          const currentMonth = moment(ynabToolKit.shared.parseSelectedMonth())
            .format('YYYY-MM');
          const monthlyBudget = ynabToolKit.dailySpending.budgetView
            .monthlySubCategoryBudgetCalculationsCollection
            .findItemByEntityId('mcbc/' + currentMonth + '/' + f.entityId);

          return (monthlyBudget.balance * 0.001);
        }
      };
    }()); // Keep feature functions contained within this object
    // Run once to activate the budget observer()
    ynabToolKit.dailySpending.addBudgetVersionIdObserver();
  } else {
    setTimeout(poll, 250);
  }
}());
