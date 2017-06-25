import { Feature } from 'core/feature';
import * as toolkitHelper from 'helpers/toolkit';

export class TargetBalanceWarning extends Feature {
  constructor() {
    super();
  }

  shouldInvoke() {
    return toolkitHelper.getCurrentRouteName().indexOf('budget') !== -1;
  }

  invoke() {
    $('.budget-table-row.is-sub-category').each((index, element) => {
      const emberId = element.id;
      const viewData = toolkitHelper.getEmberView(emberId).data;
      const { subCategory } = viewData;

      if (subCategory.get('goalType') === ynab.constants.SubCategoryGoalType.TargetBalance) {
        const available = viewData.get('available');
        const targetBalance = subCategory.get('targetBalance');
        const currencyElement = $('.budget-table-cell-available .user-data.currency', element);

        if (available < targetBalance && !currencyElement.hasClass('cautious')) {
          if (currencyElement.hasClass('positive')) {
            currencyElement.removeClass('positive');
          }

          currencyElement.addClass('cautious');
        }
      }
    });
  }

  observe(changedNodes) {
    if (!this.shouldInvoke()) return;

    if (changedNodes.has('budget-table-cell-available-div user-data')) {
      this.invoke();
    }
  }

  onRouteChanged() {
    if (!this.shouldInvoke()) return;
    this.invoke();
  }
}
