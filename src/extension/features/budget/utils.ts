export const GOAL_TABLE_CELL_CLASSNAME = 'tk-budget-table-cell-goal';

import { serviceLookup } from 'toolkit/extension/utils/ember';
import './utils.styles.scss';
import { getBudgetService } from 'toolkit/extension/utils/ynab';

export function ensureGoalColumn(element: HTMLElement | null): boolean {
  if (!element) {
    return false;
  }

  // if we were passed the 'budget-table-header' column, we actually want the
  // 'budget-table-header-labels' column since that's where we'll append the title
  const isBudgetHeaderRow = element.classList.contains('budget-table-header');
  if (isBudgetHeaderRow) {
    return ensureGoalColumn(element.querySelector('.budget-table-header-labels'));
  }

  // if the element already has the cell, there's no need to continue
  if (element.querySelector(`.${GOAL_TABLE_CELL_CLASSNAME}`)) {
    return true;
  }

  const isBudgetHeaderLabels = element.classList.contains('budget-table-header-labels');
  const isMasterCategoryRow = element.classList.contains('is-master-category');
  const isSubCategoryRow = element.classList.contains('is-sub-category');

  if (!isBudgetHeaderLabels && !isMasterCategoryRow && !isSubCategoryRow) {
    return false;
  }

  const $goalContainer = $('<div>', {
    class: `${GOAL_TABLE_CELL_CLASSNAME} budget-table-row-li`,
  }).text(isBudgetHeaderLabels ? 'TARGET' : '');

  $('.budget-table-cell-name', element).after($goalContainer);
  if (!isBudgetHeaderLabels) {
    ensureGoalColumn(document.querySelector('.budget-table-header'));
  }

  return true;
}

export function getBudgetMonthDisplaySubCategory(entityId: string | undefined | null) {
  if (!entityId) {
    return null;
  }

  const budgetService = getBudgetService();
  if (!budgetService) {
    return null;
  }

  return (
    budgetService.budgetMonthDisplaySubCategoryItems.find(({ subCategoryId }) => {
      return entityId === subCategoryId;
    }) ?? null
  );
}

export function getBudgetMonthDisplayMasterCategory(element: HTMLElement) {
  const name = $('.budget-table-cell-name button', element).attr('title');

  const budgetService = getBudgetService();
  if (!budgetService) {
    return null;
  }

  return (
    budgetService.budgetMonthDisplayItems.find(({ isMasterCategory, masterCategory }) => {
      return isMasterCategory && masterCategory.name === name;
    }) ?? null
  );
}
