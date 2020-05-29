import { Feature } from 'toolkit/extension/features/feature';
import { isCurrentRouteBudgetPage } from 'toolkit/extension/utils/ynab';
import { controllerLookup, getEmberView } from 'toolkit/extension/utils/ember';
import { Settings as DisplayGoalAmountSettings } from './display-target-goal-amount';

export const GOAL_TABLE_CELL_CLASSNAME = 'tk-goal-table-cell';
export const CategoryAttributes = {
  GoalTarget: 'toolkit-goal-target',
  GoalType: 'toolkit-goal-type',
  GoalUnderFunded: 'toolkit-goal-underfunded',
  NegativeAvailable: 'toolkit-negative-available',
  OverSpent: 'toolkit-overspent',
  UpcomingTransactions: 'toolkit-upcoming-transactions',
};

export class BudgetCategoryFeatures extends Feature {
  shouldCreateGoalContainer =
    ynabToolKit.options.GoalIndicator ||
    ynabToolKit.options.DisplayTargetGoalAmount !== DisplayGoalAmountSettings.Off;

  injectCSS() {
    if (this.shouldCreateGoalContainer) {
      return require('./goal-container.css');
    }
  }

  shouldInvoke() {
    return isCurrentRouteBudgetPage();
  }

  invoke() {
    this.ensureGoalContainer();

    const categories = [...document.getElementsByClassName('budget-table-row')];
    categories.forEach(element => {
      const category = getEmberView(element.id, 'category');
      if (category) {
        const { isMasterCategory, subCategory } = category.getProperties(
          'isMasterCategory',
          'subCategory'
        );
        if (!isMasterCategory && subCategory) {
          const attributes = getCategoryAttributes(category);
          applyCategoryAttributes(element, attributes);
        }
      }
    });

    const activeCategory = controllerLookup('budget').get('activeCategory');
    if (activeCategory) {
      const inspectorElement = document.getElementsByClassName('budget-inspector')[0];
      if (inspectorElement) {
        const attributes = getCategoryAttributes(activeCategory);
        applyCategoryAttributes(inspectorElement, attributes);
      }
    }

    // Sometimes, these features depend on calculations which are performed
    // by the backend and returned to the client. Invoke the features immediately
    // at first and then again on a delay which will hopefully catch any updates.
    const invokeFeatures = () => {
      ynabToolKit.invokeFeature('DisplayTargetGoalAmount');
      ynabToolKit.invokeFeature('GoalIndicator');
      ynabToolKit.invokeFeature('TargetBalanceWarning');
    };

    invokeFeatures();
    Ember.run.later(invokeFeatures, 500);
  }

  observe(changedNodes) {
    if (!this.shouldInvoke()) {
      return;
    }

    if (
      changedNodes.has('ynab-new-inspector-goals') ||
      changedNodes.has('budget-number user-data') ||
      changedNodes.has('budget-table-row is-sub-category') ||
      changedNodes.has('budget-inspector') ||
      changedNodes.has('budget-header-totals-cell-value user-data') ||
      changedNodes.has('budget-inspector-goals') ||
      changedNodes.has('budget-header-item budget-header-calendar toolkit-highlight-current-month')
    ) {
      this.invoke();
    }
  }

  onRouteChanged() {
    if (this.shouldInvoke()) {
      this.invoke();
    }
  }

  ensureGoalContainer() {
    if (this.shouldCreateGoalContainer) {
      const rowsExistQuery = `.budget-table-row:not(.budget-table-hidden-row) .${GOAL_TABLE_CELL_CLASSNAME}`;
      if (document.querySelectorAll(rowsExistQuery).length === 0) {
        $('.budget-table-row .budget-table-cell-name').append(
          $('<div>', { class: GOAL_TABLE_CELL_CLASSNAME })
        );
      }

      const headerExistsQuery = `.budget-table-header .${GOAL_TABLE_CELL_CLASSNAME}`;
      if (!document.querySelector(headerExistsQuery)) {
        $('.budget-table-header .budget-table-cell-name').append(
          $('<div>', { class: GOAL_TABLE_CELL_CLASSNAME }).text('GOAL')
        );
      }
    }
  }
}

function getCategoryAttributes(category) {
  const { available, goalType, goalTarget } = category.getProperties(
    'available',
    'goalTarget',
    'goalType'
  );
  const upcomingTransactionsCount = category.get(
    'monthlySubCategoryBudgetCalculation.upcomingTransactionsCount'
  );

  let targetBalanceUnderFunded = false;
  if (
    ynabToolKit.options.TargetBalanceWarning &&
    goalType === ynab.constants.SubCategoryGoalType.TargetBalance
  ) {
    targetBalanceUnderFunded = category.get('goalOverallLeft') > 0;
  }

  return {
    [CategoryAttributes.GoalTarget]: !!goalType && goalTarget,
    [CategoryAttributes.GoalType]: !!goalType && goalType,
    [CategoryAttributes.GoalUnderFunded]:
      targetBalanceUnderFunded || category.get('isGoalUnderFunded'),
    [CategoryAttributes.NegativeAvailable]: available < 0,
    [CategoryAttributes.OverSpent]: category.get('isOverSpent'),
    [CategoryAttributes.UpcomingTransactions]: upcomingTransactionsCount > 0,
  };
}

function applyCategoryAttributes(element, attributes) {
  Object.keys(attributes).forEach(key => {
    if (typeof attributes[key] === 'boolean' && attributes[key] === false) {
      element.removeAttribute(`data-${key}`);
    } else {
      element.setAttribute(`data-${key}`, attributes[key]);
    }
  });
}
