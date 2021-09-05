import { Feature } from 'toolkit/extension/features/feature';
import { getEmberView } from 'toolkit/extension/utils/ember';
import { formatCurrency } from 'toolkit/extension/utils/currency';

export class DisplayTotalMonthlyGoals extends Feature {
  shouldInvoke() {
    return true;
  }

  destroy() {
    document.querySelector('.tk-total-monthly-goals')?.remove();
  }

  extractCategoryGoalInformation(element) {
    const category = getEmberView(element.id, 'category');
    if (!category) {
      return;
    }

    return {
      monthlyGoalAmount: parseInt(category.goalTarget || 0, 10),
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
      <section class="card tk-total-monthly-goals">
        <div class="card-roll-up">
          <h2>
            Total Monthly Goals
            <svg width="24" height="24" class="card-chevron"></svg>
            <span class="user-data currency ${currencyClass}">
                ${formatCurrency(goalsAmount)}
            </span>
          </h2>
        </div>
      </section>
    `);
  }

  addTotalMonthlyGoals(element) {
    const monthlyGoals = this.calculateMonthlyGoals();

    $('.tk-total-monthly-goals').remove();

    const shouldShowInspector = monthlyGoals.checkedCategoryCount !== 1;
    if (!shouldShowInspector) {
      return;
    }

    this.createInspectorElement(monthlyGoals.amount).insertBefore(
      $('.card.budget-breakdown-monthly-totals', element)
    );
  }

  invoke() {
    this.addToolkitEmberHook('budget/budget-inspector', 'didRender', this.addTotalMonthlyGoals);
  }
}
