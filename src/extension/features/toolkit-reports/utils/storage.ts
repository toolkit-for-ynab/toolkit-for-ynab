import { getFirstMonthOfBudget, getToday } from 'toolkit/extension/utils/date';
import { getToolkitStorageKey, setToolkitStorageKey } from 'toolkit/extension/utils/toolkit';
import { getApplicationService } from 'toolkit/extension/utils/ynab';
import { FiltersType } from '../common/components/report-context';

enum FilterType {
  Account = 'account-filters',
  Category = 'category-filters',
  Date = 'date-filters',
}

export function getStoredFilters(reportKey: string): FiltersType {
  return {
    accountFilterIds: getStoredAccountFilters(reportKey),
    categoryFilterIds: getStoredCategoryFilters(reportKey),
    dateFilter: getStoredDateFilters(reportKey),
  };
}

export function storeAccountFilters(reportKey: string, accountFilterIds: Set<string>) {
  setToolkitStorageKey(
    generateStorageKey(reportKey, FilterType.Account),
    Array.from(accountFilterIds)
  );
}

export function storeCategoryFilters(reportKey: string, categoryFilterIds: Set<string>) {
  setToolkitStorageKey(
    generateStorageKey(reportKey, FilterType.Category),
    Array.from(categoryFilterIds)
  );
}

export function storeDateFilters(reportKey: string, filters: FiltersType['dateFilter']) {
  setToolkitStorageKey(generateStorageKey(reportKey, FilterType.Date), {
    fromDate: filters.fromDate ? filters.fromDate.toISOString() : null,
    toDate: filters.toDate ? filters.toDate.toISOString() : null,
  });
}

function generateStorageKey(reportKey: string, filterType: FilterType) {
  const budgetVersionId = getApplicationService()?.budgetVersionId;
  return `${budgetVersionId}-${reportKey}-${filterType}`;
}

function getStoredAccountFilters(reportKey: string) {
  const accountFilterIds = getToolkitStorageKey(
    generateStorageKey(reportKey, FilterType.Account),
    []
  );
  return new Set<string>(accountFilterIds);
}

function getStoredCategoryFilters(reportKey: string) {
  const categoryFilterIds = getToolkitStorageKey(
    generateStorageKey(reportKey, FilterType.Category),
    []
  );
  return new Set<string>(categoryFilterIds);
}

function getStoredDateFilters(reportKey: string) {
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
