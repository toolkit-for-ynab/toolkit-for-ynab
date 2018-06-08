import { Feature } from 'toolkit/extension/features/feature';
import { isCurrentRouteBudgetPage } from 'toolkit/extension/utils/ynab';
import { getEmberView } from 'toolkit/extension/utils/ember';
import { formatCurrency } from 'toolkit/extension/utils/currency';

export class DisplayUpcomingAmount extends Feature {
  injectCSS() { return require('./index.css'); }

  shouldInvoke() {
    return isCurrentRouteBudgetPage();
  }

  invoke() {
    $('.budget-table-row.is-sub-category').each((_, element) => {
      const { monthlySubCategoryBudgetCalculation, subCategory } = getEmberView(element.id).category;

      if (monthlySubCategoryBudgetCalculation && monthlySubCategoryBudgetCalculation.upcomingTransactions) {
        $('.budget-table-cell-activity', element)
          .addClass('toolkit-activity-upcoming')
          .prepend($('<div>', {
            class: 'toolkit-activity-upcoming-amount',
            title: `Total upcoming transaction amount in this month for ${subCategory.get('name')}`,
            text: formatCurrency(monthlySubCategoryBudgetCalculation.upcomingTransactions)
          }));
      }
    });
  }

  onRouteChanged() {
    if (!this.shouldInvoke()) return;
    this.invoke();
  }
}
