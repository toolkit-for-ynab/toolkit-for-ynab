import { Feature } from 'toolkit/extension/features/feature';
import { isCurrentRouteBudgetPage } from 'toolkit/extension/utils/ynab';
import { CategoryAttributes } from 'toolkit/extension/features/budget/budget-category-features';

const REMOVE_CLASSES = ['positive', 'zero'];

export class TargetBalanceWarning extends Feature {
  shouldInvoke() { return isCurrentRouteBudgetPage(); }

  invoke() {
    const targetBalance = ynab.constants.SubCategoryGoalType.TargetBalance;
    const targetBalanceRows = [...document.querySelectorAll(`.budget-table-row[data-${CategoryAttributes.GoalType}="${targetBalance}"`)];
    targetBalanceRows.forEach((element) => {
      const inspectorSelectors = [
        '.budget-inspector .inspector-overview-available dt',
        '.budget-inspector .inspector-overview-available .ynab-new-budget-available-number',
        '.budget-inspector .inspector-overview-available .ynab-new-budget-available-number .currency'
      ].join(',');
      const rowElements = $('.ynab-new-budget-available-number', element);
      const inspectorElements = $(inspectorSelectors);

      if (element.hasAttribute(`data-${CategoryAttributes.GoalUnderFunded}`)) {
        REMOVE_CLASSES.forEach((className) => {
          rowElements.removeClass(className);
        });

        rowElements.addClass('cautious');
      } else {
        rowElements.removeClass('cautious');
      }

      if ($(`.budget-inspector[data-${CategoryAttributes.GoalUnderFunded}]`).length) {
        REMOVE_CLASSES.forEach((className) => {
          inspectorElements.removeClass(className);
        });

        inspectorElements.addClass('cautious');
      } else {
        inspectorElements.removeClass('cautious');
      }
    });
  }
}
