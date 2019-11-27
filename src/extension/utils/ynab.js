import { getRouter, controllerLookup } from './ember';

export function transitionTo() {
  getRouter().transitionTo(...arguments);
}

export function getEntityManager() {
  return ynab.YNABSharedLib.defaultInstance.entityManager;
}

export function getCurrentBudgetDate() {
  const date = controllerLookup('application').get('monthString');
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

export function getCurrentRouteName() {
  return controllerLookup('application').get('activeRoute');
}

export function getCategoriesViewModel() {
  return controllerLookup('application').get('categoriesViewModel');
}

export function getAllBudgetMonthsViewModel() {
  return controllerLookup('application').get('allBudgetMonthsViewModel');
}

export function getBudgetViewModel() {
  return controllerLookup('application').get('budgetViewModel');
}

export function getSelectedMonth() {
  const monthString = controllerLookup('application').get('monthString');
  return ynab.utilities.DateWithoutTime.createFromString(monthString, 'YYYYMM');
}

export function getSidebarViewModel() {
  return controllerLookup('application').get('sidebarViewModel');
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
