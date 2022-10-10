import { createElement } from 'react';
import { formatCurrency } from 'toolkit/extension/utils/currency';
import { getEmberView } from 'toolkit/extension/utils/ember';
import { isCurrentRouteBudgetPage } from 'toolkit/extension/utils/ynab';
import { number } from 'yargs';
import { Feature } from '../../feature';

export class SumGoalDisplay extends Feature {
  injectCSS() {
    return require('./index.css');
  }

  shouldInvoke() {
    return isCurrentRouteBudgetPage();
  }

  observe(changedNodes: Set<string>) {
    if (changedNodes.has('budget-table-container')) {
      this._addSums();
    } else {
      console.log(changedNodes);
    }
  }

  invoke(): void {
    this._addSums();
  }

  _addSums() {
    $('.tk-goal-sum-amount').remove();

    let masterCategories = $('.budget-table-row.is-master-category');
    [...masterCategories].forEach((element) => {
      var categorySum: number = 0;
      let category = getEmberView<YNABMasterCategory>(element.id);

      if (category) {
        category.subCategories.forEach((category) => {
          if (category.goalTargetAmount) {
            categorySum += category.goalTargetAmount;
          }
        });
      }

      var span = document.createElement('span');
      span.classList.add('tk-goal-sum-amount');
      span.innerText = `Total Goals: ${formatCurrency(categorySum)}`;

      $(element).children('.budget-table-cell-name').append(span);
    });
  }
}
