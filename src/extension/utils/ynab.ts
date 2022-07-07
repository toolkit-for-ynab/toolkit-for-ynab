import { getRouter, controllerLookup } from './ember';

export function getApplicationController() {
  return controllerLookup<YNABApplicationController>('application');
}

export function getAccountsController() {
  return controllerLookup<YNABAccountsController>('accounts');
}

export function getBudgetController() {
  return controllerLookup<YNABBudgetController>('budget');
}

export function getReportsController() {
  return controllerLookup<YNABReportsController>('reports');
}

export function getEntityManager() {
  return ynab.YNABSharedLib.defaultInstance.entityManager;
}

export function getCurrentBudgetDate() {
  const date = getBudgetController()?.monthString;
  return { year: date?.slice(0, 4), month: date?.slice(4, 6) };
}

export function isCurrentRouteBudgetPage() {
  const currentRoute = getCurrentRouteName();

  return (
    currentRoute === ynab.constants.RouteNames.BudgetSelect ||
    currentRoute === ynab.constants.RouteNames.BudgetIndex
  );
}

export function isCurrentRouteAccountsPage() {
  const currentRoute = getCurrentRouteName();

  return (
    currentRoute === ynab.constants.RouteNames.AccountsSelect ||
    currentRoute === ynab.constants.RouteNames.AccountsIndex
  );
}

export function getSelectedAccount() {
  const selectedAccountId = getAccountsController()?.selectedAccountId;
  if (selectedAccountId) {
    return getEntityManager().getAccountById(selectedAccountId);
  }

  return null;
}

export function getCurrentRouteName() {
  return getApplicationController()?.currentRouteName;
}

export function getAllBudgetMonthsViewModel() {
  return getBudgetController()?.budgetViewModel?.allBudgetMonthsViewModel;
}

export function getBudgetViewModel() {
  return getBudgetController()?.budgetViewModel;
}

export function getSelectedMonth() {
  const monthString = getBudgetController()?.monthString;
  if (monthString) {
    return ynab.utilities.DateWithoutTime.createFromString(monthString, 'YYYYMM');
  }

  return null;
}

export function getApplicationService() {
  return getApplicationController()?.applicationService;
}

export function isCurrentMonthSelected() {
  const today = ynab.utilities.DateWithoutTime.createForToday();
  const selectedMonth = getSelectedMonth();

  if (selectedMonth) {
    return today.equalsByMonth(selectedMonth);
  }

  return false;
}

export function isYNABReady() {
  return (
    typeof Ember !== 'undefined' &&
    typeof $ !== 'undefined' &&
    !$('.ember-view.is-loading').length &&
    typeof ynabToolKit !== 'undefined' &&
    typeof YNABFEATURES !== 'undefined'
  );
}
