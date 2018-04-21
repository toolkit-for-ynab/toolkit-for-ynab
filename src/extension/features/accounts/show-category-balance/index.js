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
    const allBudgetMonthsViewModel = getAllBudgetMonthsViewModel();
    const subCategoryCalculations = allBudgetMonthsViewModel.get('monthlySubCategoryBudgetCalculationsCollection');
    const categoryLookupPrefix = `mcbc/${getCurrentDate('YYYY-MM')}`;

    const GridSubComponent = componentLookup('register/grid-sub');
    GridSubComponent.constructor.reopen({
      didRender: function () {
        didRender.call(this, subCategoryCalculations, categoryLookupPrefix);
      }
    });

    const GridRowComponent = componentLookup('register/grid-row');
    GridRowComponent.constructor.reopen({
      didRender: function () {
        didRender.call(this, subCategoryCalculations, categoryLookupPrefix);
      }
    });

    const GridScheduledComponent = componentLookup('register/grid-scheduled');
    GridScheduledComponent.constructor.reopen({
      didRender: function () {
        didRender.call(this, subCategoryCalculations, categoryLookupPrefix);
      }
    });
  }

  onRouteChanged() {
    if (!this.shouldInvoke()) return;

    this.invoke();
  }
}

function didRender(subCategoryCalculations, categoryLookupPrefix) {
  const element = this.get('element');
  const subCategoryId = this.get('content.subCategoryId');
  const budgetData = subCategoryCalculations.findItemByEntityId(`${categoryLookupPrefix}/${subCategoryId}`);

  // if there's no budget data (could be an income/credit category) skip it.
  if (!budgetData) return;

  const title = $('.ynab-grid-cell-subCategoryName', element).attr('title');
  const newTitle = `${title} (Balance: ${formatCurrency(budgetData.get('balance'))})`;
  $('.ynab-grid-cell-subCategoryName', element).attr('title', newTitle);
}
