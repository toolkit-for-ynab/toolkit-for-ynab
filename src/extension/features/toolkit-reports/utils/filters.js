import { getFirstMonthOfBudget, getToday } from 'toolkit/extension/utils/date';
import { getToolkitStorageKey, setToolkitStorageKey } from 'toolkit/extension/utils/toolkit';

const ACCOUNT_FILTERS_PREFIX = 'account-filters';
const CATEGORY_FILTERS_PREFIX = 'category-filters';
const DATE_FILTERS_PREFIX = 'date-filters';

export function getStoredFilters(reportKey) {
  return {
    accountFilterIds: getStoredAccountFilters(reportKey),
    categoryFilterIds: getStoredCategoryFilters(reportKey),
    dateFilter: getStoredDateFilters(reportKey)
  };
}

export function getStoredAccountFilters(reportKey) {
  const accountFilterIds = getToolkitStorageKey(`${ACCOUNT_FILTERS_PREFIX}-${reportKey}`, []);
  return new Set(accountFilterIds);
}

export function storeAccountFilters(reportKey, accountFilterIds) {
  setToolkitStorageKey(`${ACCOUNT_FILTERS_PREFIX}-${reportKey}`, Array.from(accountFilterIds));
}

export function getStoredCategoryFilters(reportKey) {
  const categoryFilterIds = getToolkitStorageKey(`${CATEGORY_FILTERS_PREFIX}-${reportKey}`, []);
  return new Set(categoryFilterIds);
}

export function storeCategoryFilters(reportKey, categoryFilterIds) {
  setToolkitStorageKey(`${CATEGORY_FILTERS_PREFIX}-${reportKey}`, Array.from(categoryFilterIds));
}

export function getStoredDateFilters(reportKey) {
  const stored = getToolkitStorageKey(`${DATE_FILTERS_PREFIX}-${reportKey}`, { fromDate: null, toDate: null });

  let fromDate = getFirstMonthOfBudget();
  let toDate = getToday();
  try {
    fromDate = ynab.utilities.DateWithoutTime.createFromISOString(stored.fromDate);
    toDate = ynab.utilities.DateWithoutTime.createFromISOString(stored.toDate);
  } catch (e) { /* defaults */ }

  return { fromDate, toDate };
}

export function storeDateFilters(reportKey, filters) {
  setToolkitStorageKey(`${DATE_FILTERS_PREFIX}-${reportKey}`, {
    fromDate: filters.fromDate ? filters.fromDate.toISOString() : null,
    toDate: filters.toDate ? filters.toDate.toISOString() : null
  });
}
