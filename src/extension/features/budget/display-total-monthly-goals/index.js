import { Feature } from 'toolkit/extension/features/feature';
import { getEmberView } from 'toolkit/extension/utils/ember';
import { formatCurrency } from 'toolkit/extension/utils/currency';
import { getCurrentRouteName } from 'toolkit/extension/utils/ynab';

export class DisplayTotalMonthlyGoals extends Feature {
  shouldInvoke() {
    return getCurrentRouteName().indexOf('budget') !== -1 && this.settings.enabled !== '0';
  }

  invoke() {
    let monthlyGoalsTotal = 0;

    $('.budget-table-row.is-sub-category').each((index, element) => {
      const emberId = element.id;
      const viewData = getEmberView(emberId).data;
      const {
        subCategory,
        monthlySubCategoryBudgetCalculation
      } = viewData;

      const goalType = subCategory.get('goalType');
      const monthlyFunding = subCategory.get('monthlyFunding');
      const targetBalanceDate = monthlySubCategoryBudgetCalculation.get('goalTarget');

      switch (goalType) {
        case 'MF': {
          monthlyGoalsTotal += monthlyFunding;
          break;
        }
        case 'TBD': {
          monthlyGoalsTotal += targetBalanceDate;
          break;
        }
      }
    });

    const currencyClass = (monthlyGoalsTotal === 0) ? 'zero' : 'positive';

    const monthlyGoalsInspectorElement = $(`
      <div class="total-monthly-goals-inspector">
        <h3>TOTAL MONTHLY GOALS</h3>
        <h1 title>
          <span class="user-data currency ${currencyClass}">
            ${formatCurrency(monthlyGoalsTotal)}
          </span>
        </h1>
        <hr />
      </div>
    `);

    monthlyGoalsInspectorElement.insertBefore($('.inspector-quick-budget'));
  }

  observe(changedNodes) {
    if (!this.shouldInvoke()) return;
    if (changedNodes.has('budget-table-cell-budgeted')) {
      $('.total-monthly-goals-inspector').remove();
      this.invoke();
    }
  }

  onRouteChanged() {
    if (!this.shouldInvoke()) return;
    this.invoke();
  }
}
