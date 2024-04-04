import { Feature } from 'toolkit/extension/features/feature';
import { isCurrentRouteBudgetPage } from 'toolkit/extension/utils/ynab';
import { formatCurrency } from 'toolkit/extension/utils/currency';
import { getBudgetMonthDisplaySubCategory } from '../utils';

export class DisplayUpcomingAmount extends Feature {
  injectCSS() {
    return require('./index.css');
  }

  shouldInvoke() {
    return isCurrentRouteBudgetPage();
  }

  destroy() {
    $('.tk-activity-upcoming').removeClass('tk-activity-upcoming');
    $('.tk-activity-upcoming-amount').remove();
  }

  invoke() {
    $('.tk-activity-upcoming').removeClass('.tk-activity-upcoming');
    $('.tk-activity-upcoming-amount').remove();

    $('.budget-table-row.is-sub-category').each((_, element) => {
      const category = getBudgetMonthDisplaySubCategory(element.dataset.entityId);

      if (!category) {
        return;
      }

      const { monthlySubCategoryBudgetCalculation, subCategory } = category;
      if (
        monthlySubCategoryBudgetCalculation &&
        monthlySubCategoryBudgetCalculation.upcomingTransactions
      ) {
        let activity = $('.budget-table-cell-activity', element);
        activity.addClass('tk-activity-upcoming');

        let upcoming = $('<div>', {
          class: 'tk-activity-upcoming-amount currency',
          title: `Total upcoming transaction amount in this month for ${subCategory.name}`,
          text: formatCurrency(monthlySubCategoryBudgetCalculation.upcomingTransactions),
        });

        let moneyMoves = $('.budget-table-cell-category-moves', activity);
        if (moneyMoves.length === 0) {
          // Shouldn't happen as of time of writing, even when not applicable the element exists
          // Included only to make feature slightly less brittle
          activity.prepend(upcoming);
        } else {
          moneyMoves.after(upcoming);
        }
      }
    });
  }

  observe(changedNodes) {
    if (!this.shouldInvoke()) return;

    // This changes when overspending filter gets toggled
    if (changedNodes.has('budget-table-container')) {
      this.invoke();
    }
  }

  onRouteChanged() {
    if (!this.shouldInvoke()) return;
    this.invoke();
  }
}
