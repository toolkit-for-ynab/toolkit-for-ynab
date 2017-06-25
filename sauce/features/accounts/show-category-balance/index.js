import { Feature } from 'core/feature';
import * as toolkitHelper from 'helpers/toolkit';

export class ShowCategoryBalance extends Feature {
  shouldInvoke() {
    return toolkitHelper.getCurrentRouteName().indexOf('account') !== -1;
  }

  invoke() {
    toolkitHelper.getAllBudgetMonthsViewModel().then((allBudgetMonthsViewModel) => {
      let subCategoryCalculations = allBudgetMonthsViewModel.get('monthlySubCategoryBudgetCalculationsCollection');
      let categoryLookupPrefix = `mcbc/${toolkitHelper.getCurrentDate('YYYY-MM')}`;

      let GridSubComponent = toolkitHelper.componentLookup('register/grid-sub');
      GridSubComponent.constructor.reopen({
        didRender: function () {
          didRender.call(this, subCategoryCalculations, categoryLookupPrefix);
        }
      });

      let GridRowComponent = toolkitHelper.componentLookup('register/grid-row');
      GridRowComponent.constructor.reopen({
        didRender: function () {
          didRender.call(this, subCategoryCalculations, categoryLookupPrefix);
        }
      });

      let GridScheduledComponent = toolkitHelper.componentLookup('register/grid-scheduled');
      GridScheduledComponent.constructor.reopen({
        didRender: function () {
          didRender.call(this, subCategoryCalculations, categoryLookupPrefix);
        }
      });
    });
  }

  onRouteChanged() {
    if (!this.shouldInvoke()) return;

    this.invoke();
  }
}

function didRender(subCategoryCalculations, categoryLookupPrefix) {
  let element = this.get('element');
  let subCategoryId = this.get('content.subCategoryId');
  let budgetData = subCategoryCalculations.findItemByEntityId(`${categoryLookupPrefix}/${subCategoryId}`);

  // if there's no budget data (could be an income/credit category) skip it.
  if (!budgetData) return;

  let title = $('.ynab-grid-cell-subCategoryName', element).attr('title');
  let newTitle = `${title} (Balance: ${toolkitHelper.formatCurrency(budgetData.get('balance'))})`;
  $('.ynab-grid-cell-subCategoryName', element).attr('title', newTitle);
}
