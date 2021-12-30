import React from 'react';
import { Feature } from 'toolkit/extension/features/feature';
import { getEmberView } from 'toolkit/extension/utils/ember';
import { componentBefore } from 'toolkit/extension/utils/react';
import {
  getCurrentBudgetDate,
  getEntityManager,
  isCurrentRouteBudgetPage,
} from 'toolkit/extension/utils/ynab';

import { FormattedCurrency } from './FormattedCurrency';
import { InspectorCard } from './InspectorCard';

const BreakdownItem = ({ label, children, className = '' }) => {
  return (
    <div className={className}>
      <div>{label}</div>
      <div>{children}</div>
    </div>
  );
};

export class DisplayMonthlyGoalsOverview extends Feature {
  containerClass = 'tk-monthly-goals-overview-develop';

  get configuration() {
    return this.settings.enabled || 'show-total-only';
  }

  injectCSS() {
    return require('./index.css');
  }

  shouldInvoke() {
    return isCurrentRouteBudgetPage();
  }

  destroy() {
    document.querySelector('.' + this.containerClass)?.remove();
  }

  extractCategoryGoalInformation(element) {
    const category = getEmberView(element.id, 'category');
    if (!category) {
      return;
    }

    return {
      categoryName: category.displayName,
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
      if (!goalData || !goalData.type) {
        return;
      }

      if (['MF', 'TBD'].includes(goalData.type)) savingsGoals += goalData.goal;
      else if (goalData.type === 'NEED') spendingGoals += goalData.goal;
    });

    return [savingsGoals, spendingGoals];
  }

  addMonthlyGoalsOverview(element) {
    const [income, budgeted, spent] = this.calculateTotalAssigned();
    const [savingsGoals, spendingGoals] = this.calculateTotalGoals();

    $('.' + this.containerClass).remove();

    componentBefore(
      this.createInspectorElement(income, budgeted, spent, savingsGoals, spendingGoals),
      $('.card.budget-breakdown-monthly-totals', element)
    );
  }

  createInspectorElement(income, budgeted, spent, savingsGoals, spendingGoals) {
    const totalGoals = savingsGoals + spendingGoals;
    const needed = totalGoals - budgeted;
    const saved = income - -spent;

    const shouldShowGoalBreakdown = this.configuration !== 'show-total-only';
    const shouldShowIncomeVsSpending =
      this.configuration === 'show-goal-breakdown-and-income-vs-spending';

    return (
      <div className={this.containerClass}>
        <InspectorCard
          title="Total Monthly Goals"
          mainAmount={totalGoals}
          className="total-monthly-goals-card"
        >
          {shouldShowGoalBreakdown && (
            <div className="ynab-breakdown">
              <BreakdownItem label="Savings Goals">
                <FormattedCurrency amount={savingsGoals} />
              </BreakdownItem>
              <BreakdownItem label="Spending Goals" className="extra-bottom-space">
                <FormattedCurrency amount={spendingGoals} />
              </BreakdownItem>
              <BreakdownItem label="Budgeted for Goals" className="colorize-currency">
                <FormattedCurrency amount={budgeted} />
              </BreakdownItem>
              <BreakdownItem
                label={`${needed > 0 ? 'Needed for' : 'Exceeded from'} Goals`}
                className={`goal-remaining-balance ${needed > 0 ? 'negative' : 'positive'}`}
              >
                <FormattedCurrency amount={Math.abs(needed)} />
              </BreakdownItem>
            </div>
          )}
        </InspectorCard>

        {shouldShowIncomeVsSpending && (
          <InspectorCard title="Income vs Spending" className="income-vs-expense-card">
            <div className="ynab-breakdown colorize-currency">
              <BreakdownItem
                label="Total Income"
                className={`total-income ${income < -spent ? 'warning' : ''}`}
              >
                <FormattedCurrency amount={income} />
              </BreakdownItem>
              <BreakdownItem label="Total Spent" className="extra-bottom-space">
                <FormattedCurrency amount={spent} />
              </BreakdownItem>
              <BreakdownItem label="Total Saved">
                <FormattedCurrency amount={saved} />
              </BreakdownItem>
            </div>
          </InspectorCard>
        )}
      </div>
    );
  }

  invoke() {
    this.addToolkitEmberHook('budget/budget-inspector', 'didRender', this.addMonthlyGoalsOverview);
  }
}
