import { Feature } from 'toolkit/extension/features/feature';
import { getEmberView } from 'toolkit/extension/utils/ember';
import { formatCurrency } from 'toolkit/extension/utils/currency';
import { isCurrentRouteBudgetPage } from 'toolkit/extension/utils/ynab';

export class DisplayTotalMonthlyGoals extends Feature {
  shouldInvoke() {
    return isCurrentRouteBudgetPage();
  }

  extractCategoryGoalInformation(element) {
    const emberId = element.id;
    const category = getEmberView(emberId, 'category');
    if (!category) {
      return;
    }

    const goalType = category.get('subCategory.goalType');
    const monthlyFunding = category.get('subCategory.monthlyFunding');
    const targetBalanceDate = category.get('monthlySubCategoryBudgetCalculation.goalTarget');

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

    // if the user edits a goal amount, it's turned into a string on the `subCategory`
    // object. just convert everything into a number just in case.
    return {
      monthlyGoalAmount: parseInt(monthlyGoalAmount, 10),
      isChecked: category.get('isChecked'),
    };
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

  invoke() {
    const monthlyGoals = this.calculateMonthlyGoals();

    $('.total-monthly-goals-inspector').remove();

    const shouldShowInspector = monthlyGoals.checkedCategoryCount !== 1;
    if (!shouldShowInspector) {
      return;
    }

    this.createInspectorElement(monthlyGoals.amount).insertBefore($('.inspector-quick-budget'));
  }

  observe(changedNodes) {
    if (!this.shouldInvoke()) return;
    if (
      changedNodes.has('budget-table-row is-sub-category is-checked') ||
      changedNodes.has('budget-table-row is-sub-category')
    ) {
      this.invoke();
    }
  }

  onRouteChanged() {
    if (!this.shouldInvoke()) return;
    this.invoke();
  }
}
