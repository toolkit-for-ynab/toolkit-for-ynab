import { Feature } from 'toolkit/extension/features/feature';
import { getAllBudgetMonthsViewModel } from 'toolkit/extension/utils/ynab';
import { getCurrentDate } from 'toolkit/extension/utils/date';
import { getEmberView } from 'toolkit/extension/utils/ember';
import { formatCurrency } from 'toolkit/extension/utils/currency';

export class ShowCategoryBalance extends Feature {
  shouldInvoke() {
    return true;
  }

  invoke() {
    const valueColumns = [
      'register/grid-sub',
      'register/grid-row',
      'register/grid-scheduled',
      'register/grid-scheduled-sub',
      'register/grid-pending',
      'register/grid-split',
    ];

    valueColumns.forEach((key) => {
      this.addToolkitEmberHook(key, 'didRender', this.addCategoryBalance);
    });
  }

  destroy() {
    $('.ynab-grid-cell-subCategoryName').attr('title', '');
  }

  addCategoryBalance(element) {
    const transaction = getEmberView(element.id).content;
    if (!transaction) {
      return;
    }

    const allBudgetMonthsViewModel = getAllBudgetMonthsViewModel();
    if (!allBudgetMonthsViewModel) {
      return;
    }

    const subCategoryCalculations = allBudgetMonthsViewModel.get(
      'monthlySubCategoryBudgetCalculationsCollection'
    );
    const categoryLookupPrefix = `mcbc/${getCurrentDate('YYYY-MM')}`;

    const budgetData = subCategoryCalculations.findItemByEntityId(
      `${categoryLookupPrefix}/${transaction.subCategoryId}`
    );

    // if there's no budget data (could be an income/credit category) skip it.
    if (!budgetData) return;

    const title = $('.ynab-grid-cell-subCategoryName', element).attr('title');
    const newTitle = `${title.replace(/\(Balance.*/, '').trim()} (Balance: ${formatCurrency(
      budgetData.balance
    )})`;
    $('.ynab-grid-cell-subCategoryName', element).attr('title', newTitle);
  }
}
