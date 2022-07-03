import { Feature } from 'toolkit/extension/features/feature';
import { getEmberView } from 'toolkit/extension/utils/ember';

export class TargetBalanceWarning extends Feature {
  shouldInvoke() {
    return true;
  }

  invoke() {
    this.addToolkitEmberHook('budget-table-row', 'didRender', this.modifyBudgetRow);
    this.addToolkitEmberHook('budget-breakdown', 'didRender', this.modifyInspector);
  }

  destroy() {
    $('.tk-target-underfunded').removeClass('tk-target-underfunded');
  }

  modifyBudgetRow(element) {
    const category = getEmberView(element.id).category;
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

  modifyInspector(element) {
    const category = getEmberView(element.id).activeCategory;
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
      $('.is-fully-funded', element).removeClass('is-fully-funded').addClass('is-partially-funded');
      $('.is-goal-funded', element).removeClass('is-goal-funded');
    } else {
      $('.is-partially-funded', element)
        .removeClass('is-partially-funded')
        .addClass('is-fully-funded');
    }
  }
}
