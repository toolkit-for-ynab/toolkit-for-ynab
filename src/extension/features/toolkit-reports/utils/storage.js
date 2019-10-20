import { getFirstMonthOfBudget, getToday } from 'toolkit/extension/utils/date';
import { getToolkitStorageKey, setToolkitStorageKey } from 'toolkit/extension/utils/toolkit';
import { controllerLookup } from 'toolkit/extension/utils/ember';

const FilterType = {
  Account: 'account-filters',
  Category: 'category-filters',
  Date: 'date-filters',
};

export function getStoredFilters(reportKey) {
  return {
    accountFilterIds: getStoredAccountFilters(reportKey),
    categoryFilterIds: getStoredCategoryFilters(reportKey),
    dateFilter: getStoredDateFilters(reportKey),
  };
}

export function storeAccountFilters(reportKey, accountFilterIds) {
  setToolkitStorageKey(
    generateStorageKey(reportKey, FilterType.Account),
    Array.from(accountFilterIds)
  );
}

export function storeCategoryFilters(reportKey, categoryFilterIds) {
  setToolkitStorageKey(
    generateStorageKey(reportKey, FilterType.Category),
    Array.from(categoryFilterIds)
  );
}

export function storeDateFilters(reportKey, filters) {
  setToolkitStorageKey(generateStorageKey(reportKey, FilterType.Date), {
    fromDate: filters.fromDate ? filters.fromDate.toISOString() : null,
    toDate: filters.toDate ? filters.toDate.toISOString() : null,
  });
}

function generateStorageKey(reportKey, filterType) {
  const budgetVersionId = controllerLookup('application').get('budgetVersionId');
  return `${budgetVersionId}-${reportKey}-${filterType}`;
}

function getStoredAccountFilters(reportKey) {
  const accountFilterIds = getToolkitStorageKey(
    generateStorageKey(reportKey, FilterType.Account),
    []
  );
  return new Set(accountFilterIds);
}

function getStoredCategoryFilters(reportKey) {
  const categoryFilterIds = getToolkitStorageKey(
    generateStorageKey(reportKey, FilterType.Category),
    []
  );
  return new Set(categoryFilterIds);
}

function getStoredDateFilters(reportKey) {
  const stored = getToolkitStorageKey(generateStorageKey(reportKey, FilterType.Date), {
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
