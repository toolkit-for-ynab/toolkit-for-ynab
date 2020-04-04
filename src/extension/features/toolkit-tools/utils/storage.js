import { getFirstMonthOfBudget, getToday } from 'toolkit/extension/utils/date';
import { getToolkitStorageKey, setToolkitStorageKey } from 'toolkit/extension/utils/toolkit';
import { controllerLookup } from 'toolkit/extension/utils/ember';

const FilterType = {
  Account: 'account-filters',
  Category: 'category-filters',
  Date: 'date-filters',
};

export function getCalculatorValues(storageKey) {
  return {
    accountFilterIds: getStoredAccountFilters(storageKey),
    categoryFilterIds: getStoredCategoryFilters(storageKey),
    dateFilter: getStoredDateFilters(storageKey),
  };
}

export function getStoredFilters(storageKey) {
  return {
    accountFilterIds: getStoredAccountFilters(storageKey),
    categoryFilterIds: getStoredCategoryFilters(storageKey),
    dateFilter: getStoredDateFilters(storageKey),
  };
}

export function storeCalculatorValues(storageKey, accountFilterIds) {
  setToolkitStorageKey(
    generateStorageKey(storageKey, FilterType.Account),
    Array.from(accountFilterIds)
  );
}

export function storeAccountFilters(storageKey, accountFilterIds) {
  setToolkitStorageKey(
    generateStorageKey(storageKey, FilterType.Account),
    Array.from(accountFilterIds)
  );
}

export function storeCategoryFilters(storageKey, categoryFilterIds) {
  setToolkitStorageKey(
    generateStorageKey(storageKey, FilterType.Category),
    Array.from(categoryFilterIds)
  );
}

export function storeDateFilters(storageKey, filters) {
  setToolkitStorageKey(generateStorageKey(storageKey, FilterType.Date), {
    fromDate: filters.fromDate ? filters.fromDate.toISOString() : null,
    toDate: filters.toDate ? filters.toDate.toISOString() : null,
  });
}

function generateStorageKey(storageKey, filterType) {
  const budgetVersionId = controllerLookup('application').get('budgetVersionId');
  return `${budgetVersionId}-${storageKey}-${filterType}`;
}

function getStoredAccountFilters(storageKey) {
  const accountFilterIds = getToolkitStorageKey(
    generateStorageKey(storageKey, FilterType.Account),
    []
  );
  return new Set(accountFilterIds);
}

function getStoredCategoryFilters(storageKey) {
  const categoryFilterIds = getToolkitStorageKey(
    generateStorageKey(storageKey, FilterType.Category),
    []
  );
  return new Set(categoryFilterIds);
}

function getStoredDateFilters(storageKey) {
  const stored = getToolkitStorageKey(generateStorageKey(storageKey, FilterType.Date), {
    fromDate: null,
    toDate: null,
  });

  let fromDate = getFirstMonthOfBudget();
  let toDate = getToday();
  try {
    fromDate = ynab.utilities.DateWithoutTime.createFromISOString(stored.fromDate);
    toDate = ynab.utilities.DateWithoutTime.createFromISOString(stored.toDate);
  } catch (e) {
    /* defaults */
  }

  return { fromDate, toDate };
}
