import { Feature } from 'toolkit/extension/features/feature';
import { getBudgetService } from 'toolkit/extension/utils/ynab';
import { getBudgetMonthDisplaySubCategory } from '../utils';

export class TargetBalanceWarning extends Feature {
  shouldInvoke() {
    return true;
  }

  invoke() {
    this.modifyBudgetRows();
  }

  observe(changedNodes) {
    if (!this.shouldInvoke()) return;

    if (changedNodes.has('budget-inspector-button')) {
      this.modifyInspector();
    }

    // rows used to be handled from an Ember render hook that no longer exists
    if (changedNodes.has('budget-table-row')) {
      this.modifyBudgetRows();
    }
  }

  modifyBudgetRows() {
    document.querySelectorAll('.budget-table-row.is-sub-category').forEach((element) => {
      this.modifyBudgetRow(element);
    });
  }

  destroy() {
    $('.tk-target-underfunded').removeClass('tk-target-underfunded');
  }

  modifyBudgetRow(element) {
    const category = getBudgetMonthDisplaySubCategory(element.dataset.entityId);
    if (!category) {
      return;
    }

    const { goalType } = category;
    if (goalType !== 'TB') {
      return;
    }

    $('.ynab-new-budget-available-number', element).addClass('goal');

    if (category.goalOverallLeft > 0) {
      $('.ynab-new-budget-available-number', element)
        .removeClass(['positive', 'zero'])
        .addClass('cautious');
    }
  }

  modifyInspector() {
    const category = getBudgetService()?.activeCategory;
    if (!category) {
      return;
    }

    const { goalType } = category;
    if (goalType !== 'TB') {
      return;
    }

    const element = $('.budget-inspector');

    $('.ynab-new-budget-available-number', element).addClass('goal');

    if (category.goalOverallLeft > 0) {
      $('.ynab-new-budget-available-number', element)
        .removeClass(['positive', 'zero'])
        .addClass('cautious');
      $('.is-fully-funded', element).removeClass('is-fully-funded').addClass('is-partially-funded');
      $('.is-goal-funded', element).removeClass('is-goal-funded');
    } else {
      $('.is-partially-funded', element)
        .removeClass('is-partially-funded')
        .addClass('is-fully-funded');
    }
  }
}
