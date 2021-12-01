import { Feature } from 'toolkit/extension/features/feature';
import { getEmberView } from 'toolkit/extension/utils/ember';
import { formatCurrency } from 'toolkit/extension/utils/currency';
import { getCurrentBudgetDate, getEntityManager } from 'toolkit/extension/utils/ynab';

export class DisplayMonthlyGoalsOverview extends Feature {
  containerClass = '.tk-monthly-goals-overview';

  injectCSS() {
    return require('./index.css');
  }

  shouldInvoke() {
    return true;
  }

  destroy() {
    document.querySelector(this.containerClass)?.remove();
  }

  extractCategoryGoalInformation(element) {
    const category = getEmberView(element.id, 'category');
    if (!category) {
      return;
    }

    return {
      name: category.name,
      type: category.goalType,
      goal: parseInt(category.goalTarget || 0, 10),
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
    const budgetedCalculation = allBudgetCalculations.find((budgetItem) => {
      const budgetItemDate = budgetItem.monthlyBudgetId.split('/')[1].split('-');
      return (
        currentYear === parseInt(budgetItemDate[0]) && currentMonth === parseInt(budgetItemDate[1])
      );
    });

    return [
      budgetedCalculation?.immediateIncome || 0,
      budgetedCalculation?.budgeted || 0,
      budgetedCalculation?.cashOutflows || 0,
    ];
  }

  calculateTotalGoals() {
    var savingsGoals = 0;
    var spendingGoals = 0;

    $('.budget-table-row.is-sub-category').each((_, element) => {
      const goalData = this.extractCategoryGoalInformation(element);
      if (!goalData) {
        return;
      }

      if (goalData.type === 'MF') savingsGoals += goalData.goal;
      else if (goalData.type === 'NEED') spendingGoals += goalData.goal;
    });

    return [savingsGoals, spendingGoals];
  }

  addMonthlyGoalsOverview(element) {
    const [income, budgeted, spent] = this.calculateTotalAssigned();
    const [savingsGoals, spendingGoals] = this.calculateTotalGoals();

    $(this.containerClass).remove();

    this.createInspectorElement(income, budgeted, spent, savingsGoals, spendingGoals).insertBefore(
      $('.card.budget-breakdown-monthly-totals', element)
    );
  }

  createInspectorElement(income, budgeted, spent, savingsGoals, spendingGoals) {
    const totalGoals = savingsGoals + spendingGoals;
    const needed = totalGoals - budgeted;
    const saved = income - -spent;

    const neededColor = needed > 0 ? 'negative' : 'positive';
    const budgetedColor = budgeted >= totalGoals ? 'positive' : 'warning';

    const incomeColor = income >= -spent ? 'positive' : 'warning';
    const spentColor = -spent >= income ? 'negative' : 'positive';
    const savedColor = saved >= 0 ? 'positive' : 'negative';

    const elementsToCreateForIncome = [
      ['Total Income', income, incomeColor, true, false],
      ['Total Spent', spent, spentColor, true, false],
      ['Total Saved', saved, savedColor, true, true],
    ];

    const elementsToCreateForMonthlyTotals = [
      ['Savings Goals', savingsGoals, '', true, false],
      ['Spending Goals', spendingGoals, '', true, false],
      ['Total Goals', totalGoals, 'zero', true, true],
      ['Budgeted For Goals', budgeted, budgetedColor, true, false],
      ['Needed For Goals', needed, neededColor, true, true],
    ];

    var goalsHTML = '';

    for (var i = 0; i < 2; i++) {
      let elementList = [];
      let elementHeader = '';
      if (i === 0) {
        elementList = elementsToCreateForIncome;
        elementHeader = 'Income VS Spending';
      } else if (i === 1) {
        elementList = elementsToCreateForMonthlyTotals;
        elementHeader = 'Monthly Goals Overview';
      }

      goalsHTML += `
        <section class="card tk-total-monthly-goals">
          <div class="monthly-goals-header">
            <h2>
              ${elementHeader}
            </h2>
          </div>
          <div class="card-roll-up-total-goals">
      `;

      for (var x = 0; x < elementList.length; x++) {
        const [title, amount, color, active, totalRow] = elementList[x];

        if (totalRow) {
          goalsHTML += `
            <div class="goals-row-total-spacer"></div>
          `;
        }
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
      }

      goalsHTML += `
        </div>
        </section>
      `;
    }

    return $(goalsHTML);
  }

  invoke() {
    this.addToolkitEmberHook('budget/budget-inspector', 'didRender', this.addMonthlyGoalsOverview);
  }
}
