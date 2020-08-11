import { Feature } from 'toolkit/extension/features/feature';
import { getEmberView } from 'toolkit/extension/utils/ember';
import { formatCurrency } from 'toolkit/extension/utils/currency';
import { addToolkitEmberHook } from 'toolkit/extension/utils/toolkit';

export class DisplayTotalMonthlyGoals extends Feature {
  shouldInvoke() {
    return true;
  }

  extractCategoryGoalInformation(element) {
    const category = getEmberView(element.id, 'category');
    if (!category) {
      return;
    }

    const categoryInfo = {
      monthlyGoalAmount: 0,
      isChecked: category.get('isChecked'),
    };

    switch (category.goalType) {
      case ynab.constants.SubCategoryGoalType.MonthlyFunding:
      case ynab.constants.SubCategoryGoalType.TargetBalanceOnDate:
        categoryInfo.monthlyGoalAmount = parseInt(category.goalTarget || 0, 10);
        break;
      case ynab.constants.SubCategoryGoalType.Needed:
        categoryInfo.monthlyGoalAmount = parseInt(
          category.goalTarget || category.goalTargetAmount || 0,
          10
        );
    }

    return categoryInfo;
  }

  calculateMonthlyGoals() {
    const categoryGoals = {
      total: 0,
      checkedTotal: 0,
      checkedCount: 0,
    };

    $('.budget-table-row.is-sub-category').each((_, element) => {
      const categoryGoal = this.extractCategoryGoalInformation(element);
      if (!categoryGoal) {
        return;
      }

      categoryGoals.total += categoryGoal.monthlyGoalAmount;
      if (categoryGoal.isChecked) {
        categoryGoals.checkedTotal += categoryGoal.monthlyGoalAmount;
        categoryGoals.checkedCount++;
      }
    });

    return {
      amount: categoryGoals.checkedCount > 0 ? categoryGoals.checkedTotal : categoryGoals.total,
      checkedCategoryCount: categoryGoals.checkedCount,
    };
  }

  createInspectorElement(goalsAmount) {
    const currencyClass = goalsAmount === 0 ? 'zero' : 'positive';

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

  addTotalMonthlyGoals(element) {
    const monthlyGoals = this.calculateMonthlyGoals();

    $('.total-monthly-goals-inspector').remove();

    const shouldShowInspector = monthlyGoals.checkedCategoryCount !== 1;
    if (!shouldShowInspector) {
      return;
    }

    this.createInspectorElement(monthlyGoals.amount).insertBefore(
      $('.inspector-quick-budget', element)
    );
  }

  invoke() {
    addToolkitEmberHook(
      this,
      'budget/inspector/default-inspector',
      'didRender',
      this.addTotalMonthlyGoals
    );
  }
}
