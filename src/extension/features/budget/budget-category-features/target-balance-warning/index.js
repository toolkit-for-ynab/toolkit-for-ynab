import { Feature } from 'toolkit/extension/features/feature';
import { isCurrentRouteBudgetPage } from 'toolkit/extension/utils/ynab';
import { getEmberView } from 'toolkit/extension/utils/ember';
import { CategoryAttributes } from 'toolkit/extension/features/budget/budget-category-features';

const REMOVE_CLASSES = ['positive', 'zero'];

export class TargetBalanceWarning extends Feature {
  shouldInvoke() {
    return isCurrentRouteBudgetPage();
  }

  invoke() {
    const targetBalance = ynab.constants.SubCategoryGoalType.TargetBalance;
    const targetBalanceRows = [
      ...document.querySelectorAll(
        `.budget-table-row[data-${CategoryAttributes.GoalType}="${targetBalance}"`
      ),
    ];
    targetBalanceRows.forEach(element => {
      const inspectorSelectors = [
        '.budget-inspector .inspector-overview-available dt',
        '.budget-inspector .inspector-overview-available .ynab-new-budget-available-number',
        '.budget-inspector .inspector-overview-available .ynab-new-budget-available-number .currency',
      ].join(',');
      const availableNumberElement = $('.ynab-new-budget-available-number', element);
      const originalCurrencyClass = getEmberView(
        availableNumberElement.attr('id'),
        'currencyClass'
      );
      const inspectorElements = $(inspectorSelectors);

      if (element.hasAttribute(`data-${CategoryAttributes.GoalUnderFunded}`)) {
        REMOVE_CLASSES.forEach(className => {
          availableNumberElement.removeClass(className);
        });

        availableNumberElement.addClass('cautious');
      } else {
        availableNumberElement.removeClass('cautious');
        availableNumberElement.addClass(originalCurrencyClass);
      }

      const activeCategoryId = getEmberView(
        $('.budget-inspector').attr('id'),
        'activeCategory.categoryId'
      );
      if (activeCategoryId && activeCategoryId === element.dataset.entityId) {
        if ($(`.budget-inspector[data-${CategoryAttributes.GoalUnderFunded}]`).length) {
          REMOVE_CLASSES.forEach(className => {
            inspectorElements.removeClass(className);
          });

          inspectorElements.addClass('cautious');
        } else {
          inspectorElements.removeClass('cautious');
          inspectorElements.addClass(originalCurrencyClass);
        }
      }
    });
  }
}
