import { Feature } from 'core/feature';
import * as toolkitHelper from 'helpers/toolkit';

export class QuickBudgetWarning extends Feature {
  shouldInvoke() {
    return toolkitHelper.getCurrentRouteName().indexOf('budget') > -1;
  }

  invoke() {
    // target only buttons so other elements with same class can be added without forcing
    // confirmation, which can break the quick budget functionality for quick budget
    // items added by the Toolkit
    $('button.budget-inspector-button').off('click', this.confirmClick);
    $('button.budget-inspector-button').on('click', this.confirmClick);
  }

  confirmClick(event) {
    if (!confirm('Are you sure you want to do this?')) { // eslint-disable-line no-alert
      event.preventDefault();
      event.stopPropagation();
    }
  }

  observe(changedNodes) {
    if (
      changedNodes.has('navlink-budget active') ||
      changedNodes.has('budget-inspector') ||
      changedNodes.has('inspector-quick-budget')
    ) {
      this.invoke();
    }
  }
}
