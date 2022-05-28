import { Feature } from 'toolkit/extension/features/feature';
import { getEmberView } from 'toolkit/extension/utils/ember';

export class TargetBalanceWarning extends Feature {
  shouldInvoke() {
    return true;
  }

  invoke() {
    this.onElements('.budget-table-row', this.modifyBudgetRow, {
      guard: '[data-tk-target-balance-row-warning]',
    });

    this.onElement('.budget-breakdown', this.modifyInspector);
  }

  observe() {
    this.onElements('.budget-table-row', this.modifyBudgetRow, {
      guard: '[data-tk-target-balance-row-warning]',
    });

    this.onElement('.budget-breakdown', this.modifyInspector);
  }

  destroy() {
    this.onElements('[data-tk-target-balance-row-warning]', (element) => {
      const category = getEmberView(element.id, 'category');
      if (!category) {
        return;
      }

      $('.ynab-new-budget-available-number', element).removeClass('goal cautious');
      $('.ynab-new-budget-available-number', element).addClass(
        category.available === 0 ? 'zero' : 'positive'
      );

      delete element.dataset.tkTargetBalanceRowWarning;
    });

    this.onElements('[data-tk-target-balance-inspector-warning]', (element) => {
      const category = getEmberView(element.id, 'activeCategory');
      if (!category) {
        return;
      }

      $('.ynab-new-budget-available-number', element).removeClass('goal cautious');
      $('.ynab-new-budget-available-number', element).addClass(
        category.available === 0 ? 'zero' : 'positive'
      );

      delete element.dataset.tkTargetBalanceInspectorWarning;
    });
  }

  modifyBudgetRow(element) {
    const category = getEmberView(element.id, 'category');
    if (!category) {
      return;
    }

    const { goalType } = category;
    if (goalType !== 'TB') {
      return;
    }

    element.dataset.tkTargetBalanceRowWarning = true;
    $('.ynab-new-budget-available-number', element).addClass('goal');

    if (category.goalOverallLeft > 0) {
      $('.ynab-new-budget-available-number', element)
        .removeClass(['positive', 'zero'])
        .addClass('cautious');
    }
  }

  modifyInspector(element) {
    const category = getEmberView(element.id, 'activeCategory');
    if (!category) {
      return;
    }

    const { goalType } = category;
    if (goalType !== 'TB') {
      return;
    }

    element.dataset.tkTargetBalanceInspectorWarning = true;
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
