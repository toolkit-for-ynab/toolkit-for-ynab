import { Feature } from 'toolkit/extension/features/feature';
import { getEmberView } from 'toolkit/extension/utils/ember';
import { formatCurrency } from 'toolkit/extension/utils/currency';
import { isCurrentRouteBudgetPage } from 'toolkit/extension/utils/ynab';
import {
  CategoryAttributes,
  GOAL_TABLE_CELL_CLASSNAME,
} from 'toolkit/extension/features/budget/budget-category-features';

export const Settings = {
  Off: '0',
  WarnBudgetOverTarget: '1',
  GreenBudgetOverTarget: '2',
  NoEmphasis: '3',
};

const EmphasisClass = {
  [Settings.WarnBudgetOverTarget]: 'toolkit-display-goal-warn',
  [Settings.GreenBudgetOverTarget]: 'toolkit-display-goal-highlight',
};

export class DisplayTargetGoalAmount extends Feature {
  injectCSS() {
    return require('./index.css');
  }

  shouldInvoke() {
    return isCurrentRouteBudgetPage();
  }

  invoke() {
    const userSetting = this.settings.enabled;
    const budgetRows = [...document.getElementsByClassName('budget-table-row')];
    budgetRows.forEach((element) => {
      const category = getEmberView(element.id, 'category');
      if (!category) {
        return;
      }

      const goalType = element.getAttribute(`data-${CategoryAttributes.GoalType}`);
      const { subCategory, monthlySubCategoryBudget, monthlySubCategoryBudgetCalculation } =
        category.getProperties(
          'subCategory',
          'monthlySubCategoryBudget',
          'monthlySubCategoryBudgetCalculation'
        );

      if (!subCategory || !monthlySubCategoryBudgetCalculation || !monthlySubCategoryBudget) {
        return;
      }

      const goalTargetAmount = subCategory.get('goalTargetAmount');
      const { budgeted, goalTarget, isGoalValidForMonth } = monthlySubCategoryBudgetCalculation;

      let goalAmount = null;
      let goalFundedThreshold = null;
      let applyEmphasis = false;
      if (isGoalValidForMonth) {
        switch (goalType) {
          case ynab.constants.SubCategoryGoalType.TargetBalance:
            goalAmount = goalTargetAmount;
            goalFundedThreshold = goalTargetAmount;
            break;
          case ynab.constants.SubCategoryGoalType.MonthlyFunding:
          case ynab.constants.SubCategoryGoalType.Needed:
          case ynab.constants.SubCategoryGoalType.TargetBalanceOnDate:
            goalAmount = goalTarget;
            goalFundedThreshold = goalTarget;
            break;
        }

        if (goalAmount) {
          if (userSetting === Settings.WarnBudgetOverTarget && budgeted > goalFundedThreshold) {
            applyEmphasis = true;
          } else if (
            userSetting === Settings.GreenBudgetOverTarget &&
            budgeted >= goalFundedThreshold
          ) {
            applyEmphasis = true;
          }
        }
      }

      const goalAmountElement = element.querySelector('.toolkit-target-goal-amount');
      if (goalAmountElement) {
        if (goalAmount === null) {
          goalAmountElement.remove();
        }

        $(goalAmountElement).text(formatCurrency(goalAmount));

        if (applyEmphasis) {
          $(goalAmountElement).addClass(EmphasisClass[this.settings.enabled]);
        } else {
          $(goalAmountElement).removeClass(EmphasisClass[this.settings.enabled]);
        }
      } else if (goalAmount !== null) {
        $(`.${GOAL_TABLE_CELL_CLASSNAME}`, element).prepend(
          $('<div>', {
            class: `toolkit-target-goal-amount currency ${
              applyEmphasis ? EmphasisClass[this.settings.enabled] : ''
            }`,
            text: formatCurrency(goalAmount),
          })
        );
      }
    });
  }
}
