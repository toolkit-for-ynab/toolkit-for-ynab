import { Feature } from 'toolkit/extension/features/feature';
import { currentRouteIsBudgetPage } from 'toolkit/extension/utils/ynab';
import { getEmberView, lookupForReopen } from 'toolkit/extension/utils/ember';

const UNDERFUNDED_CLASSNAME = 'toolkit-goal-underfunded';

export class GoalWarningColor extends Feature {
  injectCSS() { return require('./index.css'); }

  shouldInvoke() { return currentRouteIsBudgetPage(); }

  invoke() {
    const BudgetTableRowComponent = lookupForReopen('component:budget/table/budget-table-available');
    const CategoryOverviewComponent = lookupForReopen('component:budget/inspector/category-overview');
    const InspectorGoalsComponent = lookupForReopen('component:budget/inspector/inspector-goals');

    // if the user goes straight to the budget page via bookmark/refresh then we won't have
    // time to reopen the class before YNAB uses it. In this instance we need to perform the
    // same logic directly to the DOM :(
    if (!BudgetTableRowComponent.__toolkitOverrides) {
      this.firstLoadHack();
    }

    BudgetTableRowComponent.reopenClass({ __toolkitOverrides: true });
    BudgetTableRowComponent.reopen({
      willInsertElement() {
        this._super(...arguments);
        if (shouldOverrideColor(this.get('category'))) {
          this.element.classList.add('toolkit-goal-underfunded');
        }
      },

      willUpdate() {
        this._super(...arguments);
        if (shouldOverrideColor(this.get('category'))) {
          this.element.classList.add('toolkit-goal-underfunded');
        }
      }
    });

    CategoryOverviewComponent.reopen({
      willInsertElement() {
        if (shouldOverrideColor(this.get('budgetController.activeCategory'))) {
          this.element.classList.add(UNDERFUNDED_CLASSNAME);
        } else {
          this.element.classList.remove(UNDERFUNDED_CLASSNAME);
        }
      },

      willUpdate() {
        if (shouldOverrideColor(this.get('budgetController.activeCategory'))) {
          this.element.classList.add(UNDERFUNDED_CLASSNAME);
        } else {
          this.element.classList.remove(UNDERFUNDED_CLASSNAME);
        }
      }
    });

    InspectorGoalsComponent.reopen({
      willInsertElement() {
        if (shouldOverrideColor(this.get('budgetController.activeCategory'))) {
          this.element.classList.add(UNDERFUNDED_CLASSNAME);
        } else {
          this.element.classList.remove(UNDERFUNDED_CLASSNAME);
        }
      },

      willUpdate() {
        if (shouldOverrideColor(this.get('budgetController.activeCategory'))) {
          this.element.classList.add(UNDERFUNDED_CLASSNAME);
        } else {
          this.element.classList.remove(UNDERFUNDED_CLASSNAME);
        }
      }
    });
  }

  onRouteChanged() {
    if (this.shouldInvoke()) {
      this.invoke();
    }
  }

  firstLoadHack() {
    const availableRows = document.getElementsByClassName('budget-table-cell-available-div');
    for (const row of availableRows) {
      if (shouldOverrideColor(getEmberView(row.id).category)) {
        row.classList.add(UNDERFUNDED_CLASSNAME);
      } else {
        row.classList.remove(UNDERFUNDED_CLASSNAME);
      }
    }
  }
}

function shouldOverrideColor(category) {
  if (!category) {
    return false;
  }

  const { goalType, isGoalUnderFunded, goalOverallLeft, isOverSpentOnCash, isOverSpentOnCredit } =
    category.getProperties('goalType', 'isGoalUnderFunded', 'goalOverallLeft', 'isOverSpentOnCash', 'isOverSpentOnCredit');
  const isOverSpent = isOverSpentOnCash || isOverSpentOnCredit;
  const isTargetBalanceUnderFunded = (
    ynabToolKit.options.TargetBalanceWarning &&
    goalType === ynab.constants.SubCategoryGoalType.TargetBalance &&
    goalOverallLeft > 0
  );

  return goalType && !isOverSpent && (isGoalUnderFunded || isTargetBalanceUnderFunded);
}
