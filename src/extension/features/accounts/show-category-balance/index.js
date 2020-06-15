import { Feature } from 'toolkit/extension/features/feature';
import { getAllBudgetMonthsViewModel } from 'toolkit/extension/utils/ynab';
import { getCurrentDate } from 'toolkit/extension/utils/date';
import { getEmberView } from 'toolkit/extension/utils/ember';
import { formatCurrency } from 'toolkit/extension/utils/currency';
import { addToolkitEmberHook } from 'toolkit/extension/utils/toolkit';

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

    valueColumns.forEach(key => {
      addToolkitEmberHook(this, key, 'didRender', this.addCategoryBalance);
    });
  }

  addCategoryBalance(element) {
    const transaction = getEmberView(element.id, 'content');
    if (!transaction) {
      return;
    }

    const allBudgetMonthsViewModel = getAllBudgetMonthsViewModel();
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
