import Feature from 'core/feature';
import * as toolkitHelper from 'helpers/toolkit';

export default class DisplayTargetGoalAmount extends Feature {
  constructor() {
    super();
  }

  shouldInvoke() {
    return toolkitHelper.getCurrentRouteName().indexOf('budget') !== -1;
  }

  invoke() {
    $('.budget-table-header .budget-table-cell-name').css('position', 'relative');
    $('.budget-table-row.is-sub-category li.budget-table-cell-name').css('position', 'relative');
    $('.budget-table-header .budget-table-cell-name').append('<div class=\'budget-table-cell-goal\' style=\'position: absolute; right: 0; top: 6px;\'>GOAL</div>');
    $('.budget-table-row.is-sub-category li.budget-table-cell-name').append('<div class=\'budget-table-cell-goal\' style=\'background: -webkit-linear-gradient(left, rgba(255,255,255,0) 0%,rgba(255,255,255,1) 30%); position: absolute; font-size: 80%; color: gray; padding-left: 2em; line-height: 2.55em;\'></div>');
    $('.budget-table-row.is-sub-category').each((index, element) => {
      const emberId = element.id;
      const viewData = toolkitHelper.getEmberView(emberId).data;
      const { subCategory } = viewData;
      const { monthlySubCategoryBudgetCalculation } = viewData;
      const goalType = subCategory.get('goalType');
      const monthlyFunding = subCategory.get('monthlyFunding');
      const targetBalance = subCategory.get('targetBalance');
      const targetBalanceDate = monthlySubCategoryBudgetCalculation.get('goalTarget');
      if (goalType === 'MF') {
        $('#' + emberId + '.budget-table-row.is-sub-category div.budget-table-cell-goal').text('$' + monthlyFunding / 1000);
      } else if (goalType === 'TB') {
        $('#' + emberId + '.budget-table-row.is-sub-category div.budget-table-cell-goal').text('$' + targetBalance / 1000);
      } else if (goalType === 'TBD') {
        $('#' + emberId + '.budget-table-row.is-sub-category div.budget-table-cell-goal').text('$' + targetBalanceDate / 1000);
      }
    });
  }

  observe(changedNodes) {
    if (!this.shouldInvoke()) return;
    if (changedNodes.has('fieldset') && changedNodes.has('budget-inspector-goals')) {
      $('.budget-table-cell-goal').remove();
      this.invoke();
    }
  }

  onRouteChanged() {
    if (!this.shouldInvoke()) return;
    this.invoke();
  }
}
