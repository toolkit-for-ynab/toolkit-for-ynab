(function poll() {
  if (typeof ynabToolKit !== 'undefined' && ynabToolKit.pageReady === true) {
    ynabToolKit.budgetQuickSwitch = (function () {
      let applicationController = ynabToolKit.shared.containerLookup('controller:application');
      let userBudgetsController = ynabToolKit.shared.containerLookup('controller:users/budgets');

      function populateBudgetList() {
        let budgets = userBudgetsController.get('budgets');
        let currentBudgetId = applicationController.get('activeBudgetVersion').get('entityId');
        let $openBudgetListItem = $('.modal-select-budget').find('.modal-select-budget-open').parent();

        budgets.forEach((budget) => {
          if (budget.get('budgetVersionId') === currentBudgetId) return;

          let budgetListItem = $('<li>').append(
                                    $('<button>', { text: budget.get('budgetVersionName') }).prepend(
                                      $('<i>', {
                                        class: 'flaticon stroke mail-1'
                                      })
                                    )
                                  )
                                  .click(onBudgetClicked.bind(null, budget));

          $openBudgetListItem.after(budgetListItem);
        });
      }

      function onBudgetClicked(budget) {
        userBudgetsController.send('openBudget', budget.get('budgetVersionId'), budget.get('budgetVersionName'));
      }

      return {
        observe: function observe(changedNodes) {
          if (changedNodes.has('ynab-u modal-popup modal-select-budget ember-view modal-overlay active')) {
            populateBudgetList();
          }
        }
      };
    }());
  } else {
    setTimeout(poll, 250);
  }
}());
