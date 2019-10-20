import { Feature } from 'toolkit/extension/features/feature';
import { isCurrentRouteBudgetPage } from 'toolkit/extension/utils/ynab';
import { getEmberView } from 'toolkit/extension/utils/ember';
import { formatCurrency } from 'toolkit/extension/utils/currency';

export class DisplayUpcomingAmount extends Feature {
  injectCSS() {
    return require('./index.css');
  }

  shouldInvoke() {
    return isCurrentRouteBudgetPage();
  }

  invoke() {
    $('.toolkit-activity-upcoming').removeClass('.toolkit-activity-upcoming');
    $('.toolkit-activity-upcoming-amount').remove();

    $('.budget-table-row.is-sub-category').each((_, element) => {
      const category = getEmberView(element.id, 'category');
      if (!category) {
        return;
      }

      const { monthlySubCategoryBudgetCalculation, subCategory } = category;
      if (
        monthlySubCategoryBudgetCalculation &&
        monthlySubCategoryBudgetCalculation.upcomingTransactions
      ) {
        $('.budget-table-cell-activity', element)
          .addClass('toolkit-activity-upcoming')
          .prepend(
            $('<div>', {
              class: 'toolkit-activity-upcoming-amount currency',
              title: `Total upcoming transaction amount in this month for ${subCategory.get(
                'name'
              )}`,
              text: formatCurrency(monthlySubCategoryBudgetCalculation.upcomingTransactions),
            })
          );
      }
    });
  }

  onRouteChanged() {
    if (!this.shouldInvoke()) return;
    this.invoke();
  }
}
