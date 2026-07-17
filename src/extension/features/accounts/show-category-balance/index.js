import { Feature } from 'toolkit/extension/features/feature';
import { getAllBudgetMonthsViewModel, getRegisterGridService } from 'toolkit/extension/utils/ynab';
import { getCurrentDate } from 'toolkit/extension/utils/date';
import { formatCurrency } from 'toolkit/extension/utils/currency';

export class ShowCategoryBalance extends Feature {
  shouldInvoke() {
    return $('.ynab-grid-body-row').length > 0;
  }

  observe(changedNodes) {
    if (changedNodes.has('ynab-grid-body-row')) {
      this.invoke();
    }
  }

  destroy() {
    $('.ynab-grid-cell-subCategoryName').attr('title', '');
  }

  invoke() {
    $('.ynab-grid-body-row').each((_, element) => {
      const transaction = getRegisterGridService().visibleTransactionDisplayItems.find(
        ({ entityId }) => {
          return entityId === element.dataset.rowId;
        },
      );
      if (!transaction) {
        return;
      }

      const allBudgetMonthsViewModel = getAllBudgetMonthsViewModel();
      if (!allBudgetMonthsViewModel) {
        return;
      }

      const subCategoryCalculations =
        allBudgetMonthsViewModel.monthlySubCategoryBudgetCalculationsCollection;
      const categoryLookupPrefix = `mcbc/${getCurrentDate('YYYY-MM')}`;

      const budgetData = subCategoryCalculations.findItemByEntityId(
        `${categoryLookupPrefix}/${transaction.subCategoryId}`,
      );

      // if there's no budget data (could be an income/credit category) skip it.
      if (!budgetData) return;

      const emberTooltipId = $('.ynab-grid-cell-subCategoryName', element).attr('aria-describedby');

      // There should always be an associated ember tooltip, but just in case.
      if (!emberTooltipId) return;

      const emberSelector = `#${emberTooltipId}`;
      const title = $(emberSelector).text();

      const newTitle = `${title.replace(/\(Balance.*/, '').trim()} (Balance: ${formatCurrency(
        budgetData.balance,
      )})`;
      $(emberSelector).text(newTitle);
    });
  }
}
