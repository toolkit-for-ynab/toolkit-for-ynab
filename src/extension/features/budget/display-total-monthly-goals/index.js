import { Feature } from 'toolkit/extension/features/feature';
import { getEmberView } from 'toolkit/extension/utils/ember';
import { formatCurrency } from 'toolkit/extension/utils/currency';
import { getCurrentBudgetDate, getEntityManager } from 'toolkit/extension/utils/ynab';

export class DisplayTotalMonthlyGoals extends Feature {
  injectCSS() {
    return require('./index.css');
  }

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

  calculateTotalAssigned() {
    // Get current month and year
    const currentBudgetDate = getCurrentBudgetDate();
    const currentYear = parseInt(currentBudgetDate.year);
    const currentMonth = parseInt(currentBudgetDate.month);

    // Get all budget calculations from YNAB
    const allBudgetCalculations = getEntityManager().getAllMonthlyBudgetCalculations();

    // Find current month budget calculations
    const budgetedCalculation = allBudgetCalculations.filter((budgetItem) => {
      const budgetItemDate = budgetItem.monthlyBudgetId.split('/')[1].split('-');
      return (
        currentYear === parseInt(budgetItemDate[0]) && currentMonth === parseInt(budgetItemDate[1])
      );
    })[0];

    console.log(budgetedCalculation);

    const budgeted = budgetedCalculation?.budgeted || 0;
    const income = budgetedCalculation?.immediateIncome || 0;
    const spent = budgetedCalculation?.cashOutflows || 0;

    return { income, budgeted, spent };
  }

  calculateTotalGoals() {
    const totalCategoryGoals = {
      total: 0,
      checkedTotal: 0,
      checkedCount: 0,
    };

    $('.budget-table-row.is-sub-category').each((_, element) => {
      const totalCategoryGoal = this.extractCategoryGoalInformation(element);
      if (!totalCategoryGoal) {
        return;
      }

      totalCategoryGoals.total += totalCategoryGoal.monthlyGoalAmount;
      if (totalCategoryGoal.isChecked) {
        totalCategoryGoals.checkedTotal += totalCategoryGoal.monthlyGoalAmount;
        totalCategoryGoals.checkedCount++;
      }
    });

    const monthlyGoals = {
      amount:
        totalCategoryGoals.checkedCount > 0
          ? totalCategoryGoals.checkedTotal
          : totalCategoryGoals.total,
      checkedCategoryCount: totalCategoryGoals.checkedCount,
    };

    return monthlyGoals;
  }

  calculateMonthlyTotals() {
    const { income, budgeted, spent } = this.calculateTotalAssigned();
    const goals = this.calculateTotalGoals();

    return { income, goals, budgeted, spent };
  }

  addTotalMonthlyGoals(element) {
    const { income, goals, budgeted, spent } = this.calculateMonthlyTotals();

    $('.tk-total-monthly-goals').remove();

    const shouldShowInspector = goals.checkedCategoryCount !== 1;
    if (!shouldShowInspector) {
      return;
    }

    this.createInspectorElement(income, goals.amount, budgeted, spent).insertBefore(
      $('.card.budget-breakdown-monthly-totals', element)
    );
  }

  createInspectorElement(income, goals, budgeted, spent) {
    const needed = goals - budgeted;

    const elementsToCreate = [
      ['Total Monthly Goals', goals, '', true],
      ['Budgeted For Goals', budgeted, '', true],
      ['Needed For Goals', needed, 'negative', true],
      ['Total Income', income, '', true],
      ['Total Spent', spent, '', true],
    ];

    var goalsHTML = `
      <section class="card tk-total-monthly-goals">
        <div class="monthly-goals-header">
          <h2>
            Monthly Goals Overview
          </h2>
        </div>
        <div class="card-roll-up-total-goals">
    `;

    elementsToCreate.forEach(async function (element) {
      const [title, amount, color, active] = element;

      if (active) {
        goalsHTML += `
        <div class="goals-row">
          ${title}
          <svg width="24" height="24" class="card-chevron"></svg>
          <span class="user-data currency ${color}">
              ${formatCurrency(amount)}
          </span>
        </div>
      `;
      }
    });

    goalsHTML += `
      </div>
      </section>
    `;

    return $(goalsHTML);
  }

  invoke() {
    this.addToolkitEmberHook('budget/budget-inspector', 'didRender', this.addTotalMonthlyGoals);
  }
}
