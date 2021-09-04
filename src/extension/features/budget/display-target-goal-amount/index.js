import { Feature } from 'toolkit/extension/features/feature';
import { getEmberView } from 'toolkit/extension/utils/ember';
import { formatCurrency } from 'toolkit/extension/utils/currency';
import {
  ensureGoalColumn,
  GOAL_TABLE_CELL_CLASSNAME,
} from 'toolkit/extension/features/budget/utils';

export const Settings = {
  WarnBudgetOverTarget: '1',
  GreenBudgetOverTarget: '2',
  NoEmphasis: '3',
};

export class DisplayTargetGoalAmount extends Feature {
  injectCSS() {
    if (this.settings.enabled === Settings.WarnBudgetOverTarget) {
      return require('./emphasis-red.css');
    }

    if (this.settings.enabled === Settings.GreenBudgetOverTarget) {
      return require('./emphasis-green.css');
    }
  }

  shouldInvoke() {
    return true;
  }

  invoke() {
    this.addToolkitEmberHook('budget-table-row', 'didRender', this.addTargetGoalAmount);
    this.addToolkitEmberHook('budget-table-row', 'didRender', this.calculateTotalGoals);
  }

  destroy() {
    $('.tk-target-goal-amount').remove();
  }

  calculateTotalGoals() {
    var categoryGoalTotalsDict = {};

    $('.budget-table-row').each((_, element) => {
      const goalData = this.extractCategoryGoalInformation(element);
      if (!goalData) {
        return;
      }

      if ($(element).hasClass('is-master-category')) {
        categoryGoalTotalsDict[goalData.category] = {
          element: $(element).find('.tk-budget-table-cell-goal'),
          goalTotal: 0,
        };
      }
      if ($(element).hasClass('is-sub-category')) {
        categoryGoalTotalsDict[goalData.category].goalTotal += goalData.goal;
      }
    });

    for (const [categoryName, categoryData] of Object.entries(categoryGoalTotalsDict)) {
      $(categoryData.element).html(
        $('<div>', {
          class: `tk-target-goal-amount currency category-goal-toal ${categoryName}`,
          text: formatCurrency(categoryData.goalTotal),
        })
      );
    }
  }

  extractCategoryGoalInformation(element) {
    const category = getEmberView(element.id, 'category');
    if (!category) {
      return;
    }

    return {
      category: category.masterCategory.name,
      name: category.displayName,
      type: category.goalType,
      goal: parseInt(category.goalTarget || 0, 10),
    };
  }

  addTargetGoalAmount(element) {
    if (!ensureGoalColumn(element)) {
      return;
    }

    const userSetting = this.settings.enabled;
    const category = getEmberView(element.id, 'category');
    if (!category) {
      return;
    }

    const goalType = category.goalType;
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

    const goalAmountElement = element.querySelector('.tk-target-goal-amount');
    if (goalAmountElement) {
      if (goalAmount === null) {
        goalAmountElement.remove();
      }

      $(goalAmountElement).text(formatCurrency(goalAmount));

      if (applyEmphasis) {
        $(goalAmountElement).addClass('tk-goal-emphasis');
      } else {
        $(goalAmountElement).removeClass('tk-goal-emphasis');
      }
    } else if (goalAmount !== null) {
      $(`.${GOAL_TABLE_CELL_CLASSNAME}`, element).prepend(
        $('<div>', {
          class: `tk-target-goal-amount currency ${applyEmphasis ? 'tk-goal-emphasis' : ''}`,
          text: formatCurrency(goalAmount),
        })
      );
    }
  }
}
