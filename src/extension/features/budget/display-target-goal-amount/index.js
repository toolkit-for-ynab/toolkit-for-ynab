import debounce from 'debounce';
import { Feature } from 'toolkit/extension/features/feature';
import { formatCurrency } from 'toolkit/extension/utils/currency';
import {
  ensureGoalColumn,
  GOAL_TABLE_CELL_CLASSNAME,
  getBudgetMonthDisplaySubCategory,
  getBudgetMonthDisplayMasterCategory,
} from 'toolkit/extension/features/budget/utils';
import { isCurrentRouteBudgetPage } from 'toolkit/extension/utils/ynab';

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
    return isCurrentRouteBudgetPage();
  }

  observe(changedNodes) {
    if (changedNodes.has('budget-table-row')) {
      this.debouncedInvoke();
    }
  }

  invoke() {
    $('.js-budget-table-row').each((_, el) => {
      this.addTargetGoalAmount(el);
    });
    this._addSums();
  }

  debouncedInvoke = debounce(this.invoke, 100);

  destroy() {
    $('.tk-target-goal-amount').remove();
  }

  _addSums() {
    $('.tk-goal-sum-amount').remove();

    let masterCategories = $('.budget-table-row.is-master-category');
    [...masterCategories].forEach((element) => {
      var categorySum = 0;
      const displayItem = getBudgetMonthDisplayMasterCategory(element);

      if (displayItem?.masterCategory) {
        displayItem.masterCategory.subCategories.forEach((subCat) => {
          const subcategory = getBudgetMonthDisplaySubCategory(subCat.entityId);

          if (subcategory?.monthlySubCategoryBudgetCalculation) {
            if (subcategory.monthlySubCategoryBudgetCalculation.isGoalValidForMonth) {
              switch (subcategory.goalType) {
                case ynab.constants.SubCategoryGoalType.TargetBalance:
                  categorySum += subcategory.goalTargetAmount || 0;
                  break;
                case ynab.constants.SubCategoryGoalType.MonthlyFunding:
                case ynab.constants.SubCategoryGoalType.Needed:
                case ynab.constants.SubCategoryGoalType.TargetBalanceOnDate:
                case ynab.constants.SubCategoryGoalType.DebtPayment:
                  categorySum += subcategory.monthlySubCategoryBudgetCalculation.goalTarget;
                  break;
              }
            }
          }
        });
      }

      var span = document.createElement('span');
      span.classList.add('tk-goal-sum-amount');
      span.innerText = `${formatCurrency(categorySum)}`;

      $(element).children('.tk-budget-table-cell-goal').append(span);
    });
  }

  addTargetGoalAmount(element) {
    if (!ensureGoalColumn(element)) {
      return;
    }

    const userSetting = this.settings.enabled;
    const category = getBudgetMonthDisplaySubCategory(element.dataset.entityId);
    if (!category) {
      return;
    }

    const goalType = category.goalType;
    const { subCategory, monthlySubCategoryBudget, monthlySubCategoryBudgetCalculation } = category;

    if (!subCategory || !monthlySubCategoryBudgetCalculation || !monthlySubCategoryBudget) {
      return;
    }

    const goalTargetAmount = subCategory.goalTargetAmount;
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
        case ynab.constants.SubCategoryGoalType.DebtPayment:
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
