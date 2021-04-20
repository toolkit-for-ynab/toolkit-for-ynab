import * as React from 'react';
import { componentPrepend } from 'toolkit/extension/utils/react';
import { Feature } from 'toolkit/extension/features/feature';
import { BudgetListItem } from './components/budget-list-item';
import { controllerLookup } from 'toolkit/extension/utils/ember';
import { addToolkitEmberHook } from 'toolkit/extension/utils/toolkit';

export class BudgetQuickSwitch extends Feature {
  shouldInvoke() {
    return true;
  }

  invoke() {
    addToolkitEmberHook(this, 'settings-menu', 'didRender', this.injectQuickSwitch);
  }

  injectQuickSwitch(element) {
    if (element.querySelector('#tk-quick-switch') !== null) {
      return;
    }

    const modalList = $('.modal-list', element)[0];
    const activeBudgetVersionId = controllerLookup('application').get('budgetVersionId');

    ynab.YNABSharedLib.getCatalogViewModel_UserViewModel().then(({ userBudgetDisplayItems }) => {
      userBudgetDisplayItems
        .filter(budget => {
          return (
            !budget.get('isTombstone') && budget.get('budgetVersionId') !== activeBudgetVersionId
          );
        })
        // Sort in ascending order as we're prepending the component
        .sort((a, b) => a.get('lastModifiedAt') - b.get('lastModifiedAt'))
        .forEach((budget, i) => {
          const budgetName = budget.get('budgetName');
          const budgetVersionId = budget.get('budgetVersionId');

          if (i === 0) {
            componentPrepend(
              <li id="tk-quick-switch">
                <hr />
              </li>,
              modalList
            );
          }

          componentPrepend(
            <BudgetListItem
              key={budgetVersionId}
              budgetVersionId={budgetVersionId}
              budgetName={budgetName}
            />,
            modalList
          );
        });
    });
  }
}
