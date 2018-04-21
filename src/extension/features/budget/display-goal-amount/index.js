import { Feature } from 'toolkit/extension/features/feature';
import { getEmberView } from 'toolkit/extension/utils/ember';
import { formatCurrency } from 'toolkit/extension/utils/currency';
import { getCurrentRouteName } from 'toolkit/extension/utils/ynab';

const Settings = {
  WarnBudgetOverTarget: '1',
  GreenBudgetOverTarget: '2',
  NoEmphasis: '3'
};

const EmphasisColor = {
  [Settings.WarnBudgetOverTarget]: '#ff4545',
  [Settings.GreenBudgetOverTarget]: '#00b300'
};

export class DisplayTargetGoalAmount extends Feature {
  injectCSS() { return require('./index.css'); }

  shouldInvoke() {
    return getCurrentRouteName().indexOf('budget') !== -1;
  }

  invoke() {
    $('.budget-table-header .budget-table-cell-name')
      .append($('<div>', {
        class: 'toolkit-table-cell-goal-header'
      }).append('GOAL'));

    $('.budget-table-row.is-sub-category li.budget-table-cell-name')
      .append($('<div>', {
        class: 'toolkit-table-cell-goal currency'
      }));

    $('.budget-table-row.is-sub-category').each((index, element) => {
      const userSetting = this.settings.enabled;
      const emberId = element.id;
      const viewData = getEmberView(emberId).data;
      const { subCategory } = viewData;
      const { monthlySubCategoryBudget } = viewData;
      const { monthlySubCategoryBudgetCalculation } = viewData;
      const goalType = subCategory.get('goalType');
      const monthlyFunding = subCategory.get('monthlyFunding');
      const targetBalance = subCategory.get('targetBalance');
      const targetBalanceDate = monthlySubCategoryBudgetCalculation.get('goalTarget');
      const budgetedAmount = monthlySubCategoryBudget.get('budgeted');

      let goalAmount = null;
      let applyEmphasis = false;
      switch (goalType) {
        case ynab.constants.SubCategoryGoalType.MonthlyFunding:
          goalAmount = monthlyFunding;
          if (userSetting === Settings.WarnBudgetOverTarget && budgetedAmount > monthlyFunding) {
            applyEmphasis = true;
          } else if (userSetting === Settings.GreenBudgetOverTarget && budgetedAmount >= monthlyFunding) {
            applyEmphasis = true;
          }
          break;
        case ynab.constants.SubCategoryGoalType.TargetBalance:
          goalAmount = targetBalance;
          if (userSetting === Settings.WarnBudgetOverTarget && budgetedAmount > targetBalance) {
            applyEmphasis = true;
          } else if (userSetting === Settings.GreenBudgetOverTarget && budgetedAmount >= targetBalance) {
            applyEmphasis = true;
          }
          break;
        case ynab.constants.SubCategoryGoalType.TargetBalanceOnDate:
          goalAmount = targetBalanceDate;
          if (userSetting === Settings.WarnBudgetOverTarget && budgetedAmount > targetBalanceDate) {
            applyEmphasis = true;
          } else if (userSetting === Settings.GreenBudgetOverTarget && budgetedAmount >= targetBalanceDate) {
            applyEmphasis = true;
          }
          break;
      }

      if (goalAmount !== null) {
        $('.toolkit-table-cell-goal', element).text(formatCurrency(goalAmount));
      }

      if (applyEmphasis) {
        $('.toolkit-table-cell-goal', element).css({
          color: EmphasisColor[this.settings.enabled]
        });
      }
    });
  }

  observe(changedNodes) {
    if (!this.shouldInvoke()) return;
    if (changedNodes.has('budget-table-cell-budgeted') ||
        changedNodes.has('goal-message')) {
      $('.toolkit-table-cell-goal').remove();
      this.invoke();
    }
  }

  onRouteChanged() {
    if (!this.shouldInvoke()) return;
    this.invoke();
  }
}
