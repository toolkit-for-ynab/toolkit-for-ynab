import { Feature } from 'toolkit/extension/features/feature';
import { currentRouteIsBudgetPage } from 'toolkit/extension/utils/ynab';
import { controllerLookup, getEmberView } from 'toolkit/extension/utils/ember';
import { Settings as DisplayGoalAmountSettings } from './display-target-goal-amount';

export const GOAL_TABLE_CELL_CLASSNAME = 'toolkit-goal-table-cell';
export const CategoryAttributes = {
  OverSpent: 'toolkit-overspent',
  GoalUnderFunded: 'toolkit-goal-underfunded',
  GoalType: 'toolkit-goal-type',
  GoalTarget: 'toolkit-goal-target',
  NegativeAvailable: 'toolkit-negative-available'
};

export class BudgetCategoryFeatures extends Feature {
  shouldCreateGoalContainer = (
    ynabToolKit.options.GoalIndicator ||
    ynabToolKit.options.DisplayGoalAmount !== DisplayGoalAmountSettings.Off
  );

  injectCSS() {
    if (this.shouldCreateGoalContainer) {
      return require('./goal-container.css');
    }
  }

  shouldInvoke() { return currentRouteIsBudgetPage(); }

  invoke() {
    this.ensureGoalContainer();

    const categories = [...document.getElementsByClassName('budget-table-row')];
    categories.forEach((element) => {
      const { category } = getEmberView(element.id);
      if (category) {
        const { isMasterCategory, subCategory } = category.getProperties('isMasterCategory', 'subCategory');
        if (!isMasterCategory && subCategory) {
          const attributes = getCategoryAttributes(category);
          applyCategoryAttributes(element, attributes);
        }
      }
    });

    const activeCategory = controllerLookup('budget').get('activeCategory');
    if (activeCategory) {
      const inspectorElement = document.getElementsByClassName('budget-inspector')[0];
      const attributes = getCategoryAttributes(activeCategory);
      applyCategoryAttributes(inspectorElement, attributes);
    }

    ynabToolKit.invokeFeature('DisplayTargetGoalAmount');
    ynabToolKit.invokeFeature('GoalIndicator');
    ynabToolKit.invokeFeature('TargetBalanceWarning');
  }

  observe(changedNodes) {
    if (!this.shouldInvoke()) {
      return;
    }

    if (
      changedNodes.has('budget-table-row is-sub-category') ||
      changedNodes.has('budget-inspector') ||
      changedNodes.has('budget-table-cell-available-div user-data') ||
      changedNodes.has('budget-inspector-goals') ||
      changedNodes.has('budget-table-cell-available') ||
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
    if (
      this.shouldCreateGoalContainer &&
      document.getElementsByClassName(GOAL_TABLE_CELL_CLASSNAME).length === 0
    ) {
      $('.budget-table-cell-name').append($('<div>', { class: GOAL_TABLE_CELL_CLASSNAME }));
      $('.budget-table-header .toolkit-goal-table-cell').text('GOAL');
    }
  }
}

function getCategoryAttributes(category) {
  const { available, goalType, goalTarget } = category.getProperties('available', 'goalTarget', 'goalType');

  let targetBalanceUnderFunded = false;
  if (ynabToolKit.options.TargetBalanceWarning && goalType === ynab.constants.SubCategoryGoalType.TargetBalance) {
    targetBalanceUnderFunded = category.get('goalOverallLeft') > 0;
  }

  return {
    [CategoryAttributes.OverSpent]: category.get('isOverSpent'),
    [CategoryAttributes.GoalUnderFunded]: targetBalanceUnderFunded || category.get('isGoalUnderFunded'),
    [CategoryAttributes.GoalType]: !!goalType && goalType,
    [CategoryAttributes.GoalTarget]: !!goalType && goalTarget,
    [CategoryAttributes.NegativeAvailable]: available < 0
  };
}

function applyCategoryAttributes(element, attributes) {
  Object.keys(attributes).forEach((key) => {
    if (typeof attributes[key] === 'boolean' && attributes[key] === false) {
      element.removeAttribute(`data-${key}`);
    } else {
      element.setAttribute(`data-${key}`, attributes[key]);
    }
  });
}