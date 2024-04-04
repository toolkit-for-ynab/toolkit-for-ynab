import { Feature } from 'toolkit/extension/features/feature';
import {
  ensureGoalColumn,
  getBudgetMonthDisplaySubCategory,
  GOAL_TABLE_CELL_CLASSNAME,
} from 'toolkit/extension/features/budget/utils';
import { isCurrentRouteBudgetPage } from 'toolkit/extension/utils/ynab';

export class GoalIndicator extends Feature {
  injectCSS() {
    return require('./index.css');
  }

  shouldInvoke() {
    return isCurrentRouteBudgetPage();
  }

  destroy() {
    $('.tk-goal-indicator').remove();
  }

  observe(changedNodes) {
    if (!this.shouldInvoke()) return;

    if (changedNodes.has('budget-table-row')) {
      this.invoke();
    }
  }

  invoke() {
    $('.budget-table-row').each((_, element) => {
      this.addGoalIndicator(element);
    });
  }

  addGoalIndicator(element) {
    if (!ensureGoalColumn(element)) {
      return;
    }

    const category = getBudgetMonthDisplaySubCategory(element.dataset.entityId);
    if (!category) {
      return;
    }

    // these need to be defined inside `invoke` because ynab must be on the window
    const GoalTypeLabels = {
      MF: ['M', 'Monthly Savings Builder'],
      NEED: ['S', 'Needed For Spending'],
      TB: ['B', 'Savings Balance'],
      TBD: ['D', 'Savings Balance By Date'],
      DEBT: ['MD', 'Monthly Debt Payment'],
    };

    const goalContainer = element.querySelector(`.${GOAL_TABLE_CELL_CLASSNAME}`);
    const { monthlySubCategoryBudgetCalculation, goalType } = category;
    const hasUpcomingTransactions =
      monthlySubCategoryBudgetCalculation?.upcomingTransactionsCount > 0;
    const goalTypeElement = element.querySelector(
      '.tk-goal-indicator:not(.tk-goal-indicator--upcoming)'
    );
    const upcomingElement = element.querySelector('.tk-goal-indicator--upcoming');

    if (!GoalTypeLabels[goalType]) {
      return;
    }

    if (category.goalCreatedOn) {
      if (goalTypeElement) {
        if (!goalType) {
          goalTypeElement.remove();
        }

        $(goalTypeElement).attr('title', GoalTypeLabels[goalType][1]);
        $(goalTypeElement).text(GoalTypeLabels[goalType][0]);
      } else if (goalType) {
        $(goalContainer).append(
          $('<div>', {
            class: 'tk-goal-indicator',
            title: GoalTypeLabels[goalType][1],
            text: GoalTypeLabels[goalType][0],
          })
        );
      }
    }

    if (upcomingElement) {
      if (!hasUpcomingTransactions) {
        upcomingElement.remove();
      }
    } else if (hasUpcomingTransactions) {
      $(goalContainer).append(
        $('<div>', {
          class: 'tk-goal-indicator tk-goal-indicator--upcoming',
          title: 'Upcoming transactions',
          text: 'U',
        })
      );
    }
  }
}
