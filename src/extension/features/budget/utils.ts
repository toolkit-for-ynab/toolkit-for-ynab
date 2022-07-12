export const GOAL_TABLE_CELL_CLASSNAME = 'tk-budget-table-cell-goal';

import './utils.styles.scss';

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
  }).text(isBudgetHeaderLabels ? 'GOAL' : '');

  $('.budget-table-cell-name', element).after($goalContainer);
  if (!isBudgetHeaderLabels) {
    ensureGoalColumn(document.querySelector('.budget-table-header'));
  }

  return true;
}
