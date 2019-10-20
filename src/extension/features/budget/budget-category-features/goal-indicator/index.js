import { Feature } from 'toolkit/extension/features/feature';
import { isCurrentRouteBudgetPage } from 'toolkit/extension/utils/ynab';
import {
  CategoryAttributes,
  GOAL_TABLE_CELL_CLASSNAME,
} from 'toolkit/extension/features/budget/budget-category-features';

export class GoalIndicator extends Feature {
  injectCSS() {
    return require('./index.css');
  }

  shouldInvoke() {
    return isCurrentRouteBudgetPage();
  }

  invoke() {
    // these need to be defined inside `invoke` because ynab must be on the window
    const GoalTypeTitle = {
      [ynab.constants.SubCategoryGoalType.MonthlyFunding]: 'Monthly budgeting goal',
      [ynab.constants.SubCategoryGoalType.Needed]: 'Spending goal',
      [ynab.constants.SubCategoryGoalType.TargetBalance]: 'Target balance goal',
      [ynab.constants.SubCategoryGoalType.TargetBalanceOnDate]: 'Target by date goal',
    };

    const GoalTypeIndicator = {
      [ynab.constants.SubCategoryGoalType.MonthlyFunding]: 'M',
      [ynab.constants.SubCategoryGoalType.Needed]: 'S',
      [ynab.constants.SubCategoryGoalType.TargetBalance]: 'T',
      [ynab.constants.SubCategoryGoalType.TargetBalanceOnDate]: 'D',
    };

    const budgetRows = [...document.getElementsByClassName('budget-table-row')];
    budgetRows.forEach(element => {
      const goalContainer = element.querySelector(`.${GOAL_TABLE_CELL_CLASSNAME}`);
      const goalType = element.getAttribute(`data-${CategoryAttributes.GoalType}`);
      const hasUpcomingTransactions =
        element.getAttribute(`data-${CategoryAttributes.UpcomingTransactions}`) !== null;
      const goalTypeElement = element.querySelector(
        '.toolkit-goal-indicator:not(.toolkit-goal-indicator--upcoming)'
      );
      const upcomingElement = element.querySelector('.toolkit-goal-indicator--upcoming');

      if (goalTypeElement) {
        if (!goalType) {
          goalTypeElement.remove();
        }

        $(goalTypeElement).attr('title', GoalTypeTitle[goalType]);
        $(goalTypeElement).text(GoalTypeIndicator[goalType]);
      } else if (goalType) {
        $(goalContainer).append(
          $('<div>', {
            class: 'toolkit-goal-indicator',
            title: GoalTypeTitle[goalType],
            text: GoalTypeIndicator[goalType],
          })
        );
      }

      if (upcomingElement) {
        if (!hasUpcomingTransactions) {
          upcomingElement.remove();
        }
      } else if (hasUpcomingTransactions) {
        $(goalContainer).append(
          $('<div>', {
            class: 'toolkit-goal-indicator toolkit-goal-indicator--upcoming',
            title: 'Upcoming transactions',
            text: 'U',
          })
        );
      }
    });
  }
}
