import { Feature } from 'toolkit/extension/features/feature';
import { isCurrentRouteBudgetPage } from 'toolkit/extension/utils/ynab';
import { CategoryAttributes } from 'toolkit/extension/features/budget/budget-category-features';

export class TargetBalanceWarning extends Feature {
  shouldInvoke() { return isCurrentRouteBudgetPage(); }

  invoke() {
    const targetBalance = ynab.constants.SubCategoryGoalType.TargetBalance;
    const targetBalanceRows = [...document.querySelectorAll(`.budget-table-row[data-${CategoryAttributes.GoalType}="${targetBalance}"`)];
    targetBalanceRows.forEach((element) => {
      const currencyElement = element.querySelector('.ynab-new-budget-available-number .currency');

      if (!currencyElement) {
        return;
      }

      if (element.hasAttribute(`data-${CategoryAttributes.GoalUnderFunded}`)) {
        currencyElement.classList.remove('positive');
        currencyElement.classList.add('cautious');
      } else {
        currencyElement.classList.remove('cautious');
      }
    });
  }
}
