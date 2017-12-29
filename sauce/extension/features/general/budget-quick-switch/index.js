import { Feature } from 'toolkit/extension/features/feature';
import { controllerLookup, getRouter } from 'toolkit/extension/helpers/toolkit';

export class BudgetQuickSwitch extends Feature {
  populateBudgetList() {
    const applicationController = controllerLookup('application');
    let currentBudgetId = applicationController.get('activeBudgetVersion').get('entityId');
    let $openBudgetListItem = $('.modal-select-budget').find('.modal-select-budget-open').parent();

    ynab.YNABSharedLib.getCatalogViewModel_UserViewModel().then(({ userBudgetDisplayItems }) => {
      userBudgetDisplayItems.filter(budget => !budget.get('isTombstone')).forEach((budget) => {
        const budgetVersionId = budget.get('budgetVersionId');
        const budgetVersionName = budget.get('budgetVersionName');

        if (budgetVersionId === currentBudgetId) return;

        const budgetListItem = $('<li>').append(
          $('<button>', { text: budgetVersionName }).prepend(
            $('<i>', {
              class: 'flaticon stroke mail-1'
            })
          )
        ).click(() => {
          const router = getRouter();
          router.send('openBudget', budgetVersionId, budgetVersionName);
        });

        $openBudgetListItem.after(budgetListItem);
      });
    });
  }

  observe(changedNodes) {
    if (changedNodes.has('ynab-u modal-popup modal-select-budget ember-view modal-overlay active')) {
      this.populateBudgetList();
    }
  }
}
