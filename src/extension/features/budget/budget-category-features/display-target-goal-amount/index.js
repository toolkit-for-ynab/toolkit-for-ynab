import { Feature } from 'toolkit/extension/features/feature';
import { getEmberView } from 'toolkit/extension/utils/ember';
import { formatCurrency } from 'toolkit/extension/utils/currency';
import { isCurrentRouteBudgetPage } from 'toolkit/extension/utils/ynab';
import { CategoryAttributes, GOAL_TABLE_CELL_CLASSNAME } from 'toolkit/extension/features/budget/budget-category-features';

export const Settings = {
  Off: '0',
  WarnBudgetOverTarget: '1',
  GreenBudgetOverTarget: '2',
  NoEmphasis: '3'
};

const EmphasisColor = {
  [Settings.WarnBudgetOverTarget]: '#ff4545',
  [Settings.GreenBudgetOverTarget]: '#00b300'
};

export class DisplayTargetGoalAmount extends Feature {
  shouldInvoke() { return isCurrentRouteBudgetPage(); }

  invoke() {
    const userSetting = this.settings.enabled;
    const budgetRows = [...document.getElementsByClassName('budget-table-row')];
    budgetRows.forEach((element) => {
      const { category } = getEmberView(element.id);
      if (!category) {
        return;
      }

      const goalType = element.getAttribute(`data-${CategoryAttributes.GoalType}`);
      const { subCategory, monthlySubCategoryBudget, monthlySubCategoryBudgetCalculation }
        = category.getProperties('subCategory', 'monthlySubCategoryBudget', 'monthlySubCategoryBudgetCalculation');

      if (!subCategory || !monthlySubCategoryBudgetCalculation || !monthlySubCategoryBudget) {
        return;
      }

      const { monthlyFunding, targetBalance } = subCategory.getProperties('monthlyFunding', 'targetBalance');
      const targetBalanceDate = monthlySubCategoryBudgetCalculation.get('goalTarget');
      const budgeted = monthlySubCategoryBudget.get('budgeted');

      let goalAmount = null;
      let applyEmphasis = false;
      switch (goalType) {
        case ynab.constants.SubCategoryGoalType.MonthlyFunding:
          goalAmount = monthlyFunding;
          if (userSetting === Settings.WarnBudgetOverTarget && budgeted > monthlyFunding) {
            applyEmphasis = true;
          } else if (userSetting === Settings.GreenBudgetOverTarget && budgeted >= monthlyFunding) {
            applyEmphasis = true;
          }
          break;
        case ynab.constants.SubCategoryGoalType.TargetBalance:
          goalAmount = targetBalance;
          if (userSetting === Settings.WarnBudgetOverTarget && budgeted > targetBalance) {
            applyEmphasis = true;
          } else if (userSetting === Settings.GreenBudgetOverTarget && budgeted >= targetBalance) {
            applyEmphasis = true;
          }
          break;
        case ynab.constants.SubCategoryGoalType.TargetBalanceOnDate:
          goalAmount = targetBalanceDate;
          if (userSetting === Settings.WarnBudgetOverTarget && budgeted > targetBalanceDate) {
            applyEmphasis = true;
          } else if (userSetting === Settings.GreenBudgetOverTarget && budgeted >= targetBalanceDate) {
            applyEmphasis = true;
          }
          break;
      }

      const goalAmountElement = element.querySelector('.toolkit-target-goal-amount');
      if (goalAmountElement) {
        if (!goalAmount) {
          goalAmountElement.remove();
        }

        $(goalAmountElement).text(formatCurrency(goalAmount));

        if (applyEmphasis) {
          $(goalAmountElement).css({ color: EmphasisColor[this.settings.enabled] });
        }
      } else if (goalAmount !== null) {
        $(`.${GOAL_TABLE_CELL_CLASSNAME}`, element).prepend($('<div>', {
          class: 'toolkit-target-goal-amount currency',
          text: formatCurrency(goalAmount)
        }));

        if (applyEmphasis) {
          $('.toolkit-target-goal-amount', element).css({
            color: EmphasisColor[this.settings.enabled]
          });
        }
      }
    });
  }
}
