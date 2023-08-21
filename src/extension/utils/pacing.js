import { getToolkitStorageKey, setToolkitStorageKey } from 'toolkit/extension/utils/toolkit';
import { getApplicationService } from './ynab';

export const PACING_DEEMPHASIZED_KEY = 'pacing-deemphasized-categories';

export function getDeemphasizedCategories() {
  const budgetVersionId = getApplicationService().budgetVersionId;
  return getToolkitStorageKey(`${PACING_DEEMPHASIZED_KEY}.${budgetVersionId}`, []);
}

export function setDeemphasizedCategories(categories) {
  const budgetVersionId = getApplicationService().budgetVersionId;
  return setToolkitStorageKey(`${PACING_DEEMPHASIZED_KEY}.${budgetVersionId}`, categories);
}

export function pacingForCategory(budgetMonthDisplayItem) {
  if (
    budgetMonthDisplayItem.getDisplayEntityType() !==
    ynab.constants.DisplayEntityType.BudgetMonthDisplayItem
  ) {
    throw new Error('Invalid Argument to calculate pacing. Expected BudgetMonthDisplayItem');
  }

  const subCategory = budgetMonthDisplayItem.subCategory;
  if (!subCategory) {
    throw new Error('Pacing can only be calculated for subCategories.');
  }

  const today = ynab.utilities.DateWithoutTime.createForToday();
  const startOfCurrentMonth = today.clone().startOfMonth();
  const endOfCurrentMonth = today.clone().endOfMonth();
  const categoryMonth = budgetMonthDisplayItem.budgetMonth;

  const balancePriorToSpending = budgetMonthDisplayItem.balancePriorToSpending;
  const activity = budgetMonthDisplayItem.activity;
  const budgetedPace = -activity / balancePriorToSpending;

  let monthPace = today.getDate() / today.daysInMonth();
  if (categoryMonth.isBefore(startOfCurrentMonth)) {
    monthPace = 1;
  } else if (categoryMonth.isAfter(endOfCurrentMonth)) {
    monthPace = 0;
  }

  const subCategoryId = subCategory?.entityId;
  const entityManager = budgetMonthDisplayItem.getEntityManager();
  const allTransactions = entityManager.getTransactionsBySubCategoryId(subCategoryId);
  const allSubTransactions = entityManager.getSubTransactionsBySubCategoryId(subCategoryId);
  const transactions = allTransactions
    .filter((transaction) => {
      return transaction.date.equalsByMonth(today);
    })
    .concat(
      allSubTransactions.filter((transaction) => {
        return transaction.transaction?.date.equalsByMonth(today);
      })
    );

  const paceAmount = Math.round(balancePriorToSpending * monthPace + activity);
  const target = today.getDate();
  const actual = budgetedPace * today.daysInMonth();
  const daysOffTarget = balancePriorToSpending === 0 ? 0 : Math.round(target - actual);
  const deemphasizedCategories = getDeemphasizedCategories();

  return {
    budgetedPace: Number.isNaN(budgetedPace) ? 0 : budgetedPace,
    daysOffTarget,
    isDeemphasized: deemphasizedCategories.contains(subCategoryId),
    monthPace,
    paceAmount,
    transactions,
  };
}
