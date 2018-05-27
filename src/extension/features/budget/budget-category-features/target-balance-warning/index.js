import { Feature } from 'toolkit/extension/features/feature';
import { currentRouteIsBudgetPage } from 'toolkit/extension/utils/ynab';
import { CategoryAttributes } from 'toolkit/extension/features/budget/budget-category-features';

export class TargetBalanceWarning extends Feature {
  shouldInvoke() { return currentRouteIsBudgetPage(); }

  invoke() {
    const targetBalance = ynab.constants.SubCategoryGoalType.TargetBalance;
    const targetBalanceRows = [...document.querySelectorAll(`.budget-table-row[data-${CategoryAttributes.GoalType}="${targetBalance}"`)];
    targetBalanceRows.forEach((element) => {
      const currencyElement = element.querySelector('.budget-table-cell-available-div .currency');
      if (element.hasAttribute(`data-${CategoryAttributes.GoalUnderFunded}`)) {
        currencyElement.classList.remove('positive');
        currencyElement.classList.add('cautious');
      } else {
        currencyElement.classList.remove('cautious');
      }
    });
  }
}
