import { controllerLookup } from 'toolkit/extension/utils/ember';
import { getToolkitStorageKey, setToolkitStorageKey } from 'toolkit/extension/utils/toolkit';
import { getEntityManager } from 'toolkit/extension/utils/ynab';

export const LEGACY_PACING_DEEMPHASIZED_KEY = 'ynab_toolkit_pacing_deemphasized_categories';
export const PACING_DEEMPHASIZED_KEY = 'pacing-deemphasized-categories';

export function getDeemphasizedCategories() {
  const budgetVersionId = controllerLookup('application').get('budgetVersionId');
  return getToolkitStorageKey(`${PACING_DEEMPHASIZED_KEY}.${budgetVersionId}`, []);
}

export function setDeemphasizedCategories(categories) {
  const budgetVersionId = controllerLookup('application').get('budgetVersionId');
  return setToolkitStorageKey(`${PACING_DEEMPHASIZED_KEY}.${budgetVersionId}`, categories);
}

export function migrateLegacyPacingStorage() {
  let legacyValues;
  const newValues = getDeemphasizedCategories();
  try {
    legacyValues = JSON.parse(localStorage.getItem(LEGACY_PACING_DEEMPHASIZED_KEY));
  } catch (e) {
    /* ignore */
  }

  if (legacyValues && legacyValues.length) {
    let newLegacyValues = legacyValues.slice();
    const entityManager = getEntityManager();
    const { subCategoriesCollection, masterCategoriesCollection } = entityManager;
    const categoryIds = legacyValues.reduce((ids, current) => {
      const [masterCategoryName, subCategoryName] = current.split('_');
      const masterCategory = masterCategoriesCollection.findItemByName(masterCategoryName);

      // if we stored an invalid master category name, then move on
      if (!masterCategory) {
        return ids;
      }

      const subCategory = subCategoriesCollection.find(cat => {
        return (
          cat.get('masterCategoryId') === masterCategory.get('entityId') &&
          cat.get('name') === subCategoryName
        );
      });

      // if we got an invalid subcategory or we've already seen this subcategory, then move on
      if (!subCategory) {
        return ids;
      } else if (ids.includes(subCategory.get('entityId'))) {
        newLegacyValues = newLegacyValues.filter(name => name !== current);
        return ids;
      }

      newLegacyValues = newLegacyValues.filter(name => name !== current);
      ids.push(subCategory.get('entityId'));
      return ids;
    }, newValues);

    if (newLegacyValues.length) {
      localStorage.setItem(LEGACY_PACING_DEEMPHASIZED_KEY, JSON.stringify(newLegacyValues));
    } else {
      localStorage.removeItem(LEGACY_PACING_DEEMPHASIZED_KEY);
    }

    setDeemphasizedCategories(categoryIds);
  } else {
    localStorage.removeItem(LEGACY_PACING_DEEMPHASIZED_KEY);
  }
}

export function pacingForCategory(budgetMonthDisplayItem) {
  if (
    budgetMonthDisplayItem.getEntityType() !==
    ynab.constants.DisplayEntityType.BudgetMonthDisplayItem
  ) {
    throw new Error('Invalid Argument to calculate pacing. Expected BudgetMonthDisplayItem');
  }

  const subCategory = budgetMonthDisplayItem.get('subCategory');
  if (!subCategory) {
    throw new Error('Pacing can only be calculated for subCategories.');
  }

  const today = new ynab.utilities.DateWithoutTime();
  const startOfCurrentMonth = today.clone().startOfMonth();
  const endOfCurrentMonth = today.clone().endOfMonth();
  const categoryMonth = budgetMonthDisplayItem.get('budgetMonth');

  const balancePriorToSpending = budgetMonthDisplayItem.get('balancePriorToSpending');
  const activity = budgetMonthDisplayItem.get('activity');
  const budgetedPace = -activity / balancePriorToSpending;

  let monthPace = today.getDate() / today.daysInMonth();
  if (categoryMonth.isBefore(startOfCurrentMonth)) {
    monthPace = 1;
  } else if (categoryMonth.isAfter(endOfCurrentMonth)) {
    monthPace = 0;
  }

  const subCategoryId = subCategory.get('entityId');
  const entityManager = budgetMonthDisplayItem.getEntityManager();
  const allTransactions = entityManager.getTransactionsBySubCategoryId(subCategoryId);
  const allSubTransactions = entityManager.getSubTransactionsBySubCategoryId(subCategoryId);
  const transactions = allTransactions
    .filter(transaction => {
      return transaction.get('date').equalsByMonth(today);
    })
    .concat(
      allSubTransactions.filter(transaction => {
        return transaction
          .get('transaction')
          .get('date')
          .equalsByMonth(today);
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
