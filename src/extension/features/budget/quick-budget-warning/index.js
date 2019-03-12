import { Feature } from 'toolkit/extension/features/feature';
import { isCurrentRouteBudgetPage } from 'toolkit/extension/utils/ynab';

export class QuickBudgetWarning extends Feature {
  shouldInvoke() {
    return isCurrentRouteBudgetPage();
  }

  invoke() {
    // target only buttons so other elements with same class can be added without forcing
    // confirmation, which can break the quick budget functionality for quick budget
    // items added by the Toolkit
    $('button.budget-inspector-button').off('click', this.confirmClick);
    $('button.budget-inspector-button').on('click', this.confirmClick);
  }

  confirmClick(event) {
    // if nothing is budgeted, skip the confirmation
    let allZero = true;
    $(
      'div.budget-table ul.budget-table-row.is-checked li.budget-table-cell-budgeted .currency'
    ).each(function() {
      if (!$(this).hasClass('zero')) {
        allZero = false;
      }
    });
    if (allZero === true) {
      return;
    }

    if (!window.confirm('Are you sure you want to budget this amount?')) {
      // eslint-disable-line no-alert
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
