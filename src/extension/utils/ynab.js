import { getRouter, controllerLookup } from './ember';
export function transitionTo() {
  getRouter().transitionTo(...arguments);
}

export function getEntityManager() {
  return ynab.YNABSharedLib.defaultInstance.entityManager;
}

export function getCurrentBudgetDate() {
  const date = controllerLookup('budget').monthString;
  return { year: date.slice(0, 4), month: date.slice(4, 6) };
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
  const { selectedAccountId } = controllerLookup('accounts');
  return getEntityManager().getAccountById(selectedAccountId);
}

export function getCurrentRouteName() {
  return controllerLookup('application').currentRouteName;
}

export function getAllBudgetMonthsViewModel() {
  return controllerLookup('budget').budgetViewModel.allBudgetMonthsViewModel;
}

export function getBudgetViewModel() {
  return controllerLookup('budget').budgetViewModel;
}

export function getSelectedMonth() {
  const monthString = controllerLookup('budget').get('monthString');
  return ynab.utilities.DateWithoutTime.createFromString(monthString, 'YYYYMM');
}

export function getApplicationService() {
  return controllerLookup('application').get('applicationService');
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
