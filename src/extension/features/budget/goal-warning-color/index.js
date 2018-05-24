import { Feature } from 'toolkit/extension/features/feature';
import { currentRouteIsBudgetPage } from 'toolkit/extension/utils/ynab';
import { controllerLookup, getEmberView, lookupForReopen } from 'toolkit/extension/utils/ember';

const UNDERFUNDED_CLASSNAME = 'toolkit-goal-underfunded';

export class GoalWarningColor extends Feature {
  blockObserve = false;
  useFirstLoadHack = true;

  injectCSS() { return require('./index.css'); }

  shouldInvoke() { return currentRouteIsBudgetPage(); }

  invoke() {
    const BudgetTableRowComponent = lookupForReopen('component:budget/table/budget-table-available');
    const CategoryOverviewComponent = lookupForReopen('component:budget/inspector/category-overview');
    const InspectorGoalsComponent = lookupForReopen('component:budget/inspector/inspector-goals');

    // if the user goes straight to the budget page via bookmark/refresh then we won't have
    // time to reopen the class before YNAB uses it. In this instance we need to perform the
    // same logic directly to the DOM :(
    if (this.useFirstLoadHack) {
      this.firstLoadHack();
    }

    const _this = this;
    BudgetTableRowComponent.reopen({
      willInsertElement() {
        this._super(...arguments);

        _this.useFirstLoadHack = false;
        if (shouldOverrideColor(this.get('category'))) {
          this.element.classList.add('toolkit-goal-underfunded');
        } else {
          this.element.classList.remove(UNDERFUNDED_CLASSNAME);
        }
      },

      willUpdate() {
        this._super(...arguments);

        _this.useFirstLoadHack = false;
        if (shouldOverrideColor(this.get('category'))) {
          this.element.classList.add('toolkit-goal-underfunded');
        } else {
          this.element.classList.remove(UNDERFUNDED_CLASSNAME);
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

  // This is a really bad example of an observe function because it's listening
  // for changes to elements we're mutating which means infinite loops. Unfortunately,
  // this is just the quickest way around the problem introduced by implmenting the feature
  // with Ember. If I ever get around to it -- we'll probably remove this implementation
  // and go back to the original method (using observe for everything).
  observe(changedNodes) {
    if (this.blockObserve || !this.useFirstLoadHack) {
      return;
    }

    if (changedNodes.has('budget-table-cell-available-div user-data')) {
      this.blockObserve = true;
      const activeCategory = controllerLookup('budget').get('activeCategory');
      if (!activeCategory) {
        // if the available div changed but the user doesn't have anything selected
        // they may have moved money or something so just run first load hack in that case
        this.firstLoadHack();
        this.blockObserve = false;
        return;
      }

      const element = document.querySelector(`.budget-table-row[data-entity-id='${activeCategory.get('subCategory.entityId')}'] .budget-table-cell-available-div`);
      if (!element) {
        this.blockObserve = false;
        return;
      }

      if (shouldOverrideColor(activeCategory)) {
        element.classList.add(UNDERFUNDED_CLASSNAME);
      } else {
        element.classList.remove(UNDERFUNDED_CLASSNAME);
      }

      this.blockObserve = false;
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
