import { Feature } from 'toolkit/extension/features/feature';
import { getCurrentRouteName, getAllBudgetMonthsViewModel } from 'toolkit/extension/utils/ynab';
import { getCurrentDate } from 'toolkit/extension/utils/date';
import { componentLookup } from 'toolkit/extension/utils/ember';
import { formatCurrency } from 'toolkit/extension/utils/currency';

export class ShowCategoryBalance extends Feature {
  shouldInvoke() {
    return getCurrentRouteName().indexOf('account') !== -1;
  }

  invoke() {
    getAllBudgetMonthsViewModel().then((allBudgetMonthsViewModel) => {
      let subCategoryCalculations = allBudgetMonthsViewModel.get('monthlySubCategoryBudgetCalculationsCollection');
      let categoryLookupPrefix = `mcbc/${getCurrentDate('YYYY-MM')}`;

      let GridSubComponent = componentLookup('register/grid-sub');
      GridSubComponent.constructor.reopen({
        didRender: function () {
          didRender.call(this, subCategoryCalculations, categoryLookupPrefix);
        }
      });

      let GridRowComponent = componentLookup('register/grid-row');
      GridRowComponent.constructor.reopen({
        didRender: function () {
          didRender.call(this, subCategoryCalculations, categoryLookupPrefix);
        }
      });

      let GridScheduledComponent = componentLookup('register/grid-scheduled');
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
  let newTitle = `${title} (Balance: ${formatCurrency(budgetData.get('balance'))})`;
  $('.ynab-grid-cell-subCategoryName', element).attr('title', newTitle);
}
