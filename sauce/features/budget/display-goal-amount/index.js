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
    $('.budget-table-header .budget-table-cell-name').after('<li class=\'budget-table-cell-goal\' style=\'font-size: .75em; text-align: right;\'>GOAL</li>');
    $('.budget-table-row.is-sub-category li.budget-table-cell-name').after('<li class=\'budget-table-cell-goal\' style=\'text-align: right; font-size: 80%; color: gray;\'></li>');
    $('.budget-table-row.is-sub-category').each((index, element) => {
      const emberId = element.id;
      const viewData = toolkitHelper.getEmberView(emberId).data;
      const { subCategory } = viewData;
      const monthlyFunding = subCategory.get('monthlyFunding');
      const targetBalance = subCategory.get('targetBalance');
      if (targetBalance === 0 || targetBalance === null) {
        $('#' + emberId + '.budget-table-row.is-sub-category li.budget-table-cell-goal').text('$' + monthlyFunding / 1000);
      } else if (monthlyFunding === 0 || monthlyFunding === null) {
        $('#' + emberId + '.budget-table-row.is-sub-category li.budget-table-cell-goal').text('$' + targetBalance / 1000);
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
