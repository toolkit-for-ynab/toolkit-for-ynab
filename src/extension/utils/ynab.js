import { containerLookup, controllerLookup } from './ember';

export function transitionTo() {
  const router = containerLookup('router:main');
  router.transitionTo(...arguments);
}

export function getEntityManager() {
  return ynab.YNABSharedLib.defaultInstance.entityManager;
}

export function getCurrentBudgetDate() {
  const date = controllerLookup('application').get('monthString');
  return { year: date.slice(0, 4), month: date.slice(4, 6) };
}

export function getCurrentRouteName() {
  return controllerLookup('application').get('currentRouteName');
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

export function getSidebarViewModel() {
  return controllerLookup('application').get('sidebarViewModel');
}

export function isCurrentMonthSelected() {
  const today = new ynab.utilities.DateWithoutTime();
  const selectedMonth = getBudgetViewModel().get('month');

  if (selectedMonth) {
    return today.equalsByMonth(selectedMonth);
  }

  return false;
}

export function isYNABReady() {
  return (
    typeof Em !== 'undefined' &&
    typeof Ember !== 'undefined' &&
    typeof $ !== 'undefined' &&
    $('.ember-view.layout').length &&
    typeof ynabToolKit !== 'undefined'
  );
}
