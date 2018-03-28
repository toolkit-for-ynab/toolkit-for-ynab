import { Feature } from 'toolkit/extension/features/feature';
import { getEmberView } from 'toolkit/extension/utils/ember';
import { formatCurrency } from 'toolkit/extension/utils/currency';
import { getCurrentRouteName } from 'toolkit/extension/utils/ynab';

export class DisplayTotalMonthlyGoals extends Feature {
  shouldInvoke() {
    return getCurrentRouteName().indexOf('budget') !== -1;
  }

  extractCategoryGoalInformation(element) {
    const emberId = element.id;
    const viewData = getEmberView(emberId).data;

    const goalType = viewData.get('subCategory.goalType');
    const monthlyFunding = viewData.get('subCategory.monthlyFunding');
    const targetBalanceDate = viewData.get('monthlySubCategoryBudgetCalculation.goalTarget');

    let monthlyGoalAmount = 0;

    switch (goalType) {
      case 'MF': {
        monthlyGoalAmount = monthlyFunding;
        break;
      }
      case 'TBD': {
        monthlyGoalAmount = targetBalanceDate;
        break;
      }
    }

    return {
      monthlyGoalAmount,
      isChecked: viewData.get('isChecked')
    };
  }

  calculateMonthlyGoals() {
    const categoryGoals = {
      total: 0,
      checkedTotal: 0,
      checkedCount: 0
    };

    $('.budget-table-row.is-sub-category').each((index, element) => {
      const categoryGoal = this.extractCategoryGoalInformation(element);

      categoryGoals.total += categoryGoal.monthlyGoalAmount;
      if (categoryGoal.isChecked) {
        categoryGoals.checkedTotal += categoryGoal.monthlyGoalAmount;
        categoryGoals.checkedCount++;
      }
    });

    return {
      amount: categoryGoals.checkedCount > 0
        ? categoryGoals.checkedTotal
        : categoryGoals.total,
      checkedCategoryCount: categoryGoals.checkedCount
    };
  }

  createInspectorElement(goalsAmount) {
    const currencyClass = (goalsAmount === 0) ? 'zero' : 'positive';

    return $(`
      <div class="total-monthly-goals-inspector">
        <h3>TOTAL MONTHLY GOALS</h3>
        <h1 title>
          <span class="user-data currency ${currencyClass}">
            ${formatCurrency(goalsAmount)}
          </span>
        </h1>
        <hr />
      </div>
    `);
  }

  invoke() {
    const monthlyGoals = this.calculateMonthlyGoals();

    $('.total-monthly-goals-inspector').remove();

    const shouldShowInspector = monthlyGoals.checkedCategoryCount !== 1;
    if (!shouldShowInspector) {
      return;
    }

    this.createInspectorElement(monthlyGoals.amount)
      .insertBefore($('.inspector-quick-budget'));
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
