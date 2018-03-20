import { Feature } from 'toolkit/extension/features/feature';
import { getEmberView } from 'toolkit/extension/utils/ember';
import { formatCurrency } from 'toolkit/extension/utils/currency';
import { getCurrentRouteName } from 'toolkit/extension/utils/ynab';

export class DisplayTotalMonthlyGoals extends Feature {
  shouldInvoke() {
    return getCurrentRouteName().indexOf('budget') !== -1 && this.settings.enabled !== '0';
  }

  invoke() {
    const monthlyGoals = {
      total: 0,
      checkedTotal: 0,
      checkedCount: 0
    };

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

      let monthlyCategoryGoal = 0;

      switch (goalType) {
        case 'MF': {
          monthlyCategoryGoal = monthlyFunding;
          break;
        }
        case 'TBD': {
          monthlyCategoryGoal = targetBalanceDate;
          break;
        }
      }

      monthlyGoals.total += monthlyCategoryGoal;
      if ($(element).is('.is-checked')) {
        monthlyGoals.checkedTotal += monthlyCategoryGoal;
        monthlyGoals.checkedCount++;
      }
    });

    const showAmount = monthlyGoals.checkedCount !== 1;
    const amount = monthlyGoals.checkedCount > 0
      ? monthlyGoals.checkedTotal
      : monthlyGoals.total;

    $('.total-monthly-goals-inspector').remove();

    if (!showAmount) {
      return;
    }

    const currencyClass = (amount === 0) ? 'zero' : 'positive';

    const monthlyGoalsInspectorElement = $(`
      <div class="total-monthly-goals-inspector">
        <h3>TOTAL MONTHLY GOALS</h3>
        <h1 title>
          <span class="user-data currency ${currencyClass}">
            ${formatCurrency(amount)}
          </span>
        </h1>
        <hr />
      </div>
    `);

    monthlyGoalsInspectorElement.insertBefore($('.inspector-quick-budget'));
  }

  observe(changedNodes) {
    if (!this.shouldInvoke()) return;
    if (changedNodes.has('budget-table-row is-sub-category is-checked') ||
        changedNodes.has('budget-table-row is-sub-category')) {
      this.invoke();
    }
  }

  onRouteChanged() {
    if (!this.shouldInvoke()) return;
    this.invoke();
  }
}
