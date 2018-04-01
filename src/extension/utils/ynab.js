import { containerLookup, controllerLookup } from './ember';

export function transitionTo() {
  const router = containerLookup('router:main');
  router.transitionTo(...arguments);
}

export function getEntityManager() {
  return ynab.YNABSharedLib.defaultInstance.entityManager;
}

export function getCurrentBudgetDate() {
  let applicationController = controllerLookup('application');
  let date = applicationController.get('monthString');
  return { year: date.slice(0, 4), month: date.slice(4, 6) };
}

export function getCurrentRouteName() {
  let applicationController = controllerLookup('application');
  return applicationController.get('currentRouteName');
}

export function getCategoriesViewModel() {
  const applicationController = controllerLookup('application');
  return applicationController.get('categoriesViewModel');
}

export function getAllBudgetMonthsViewModel() {
  const applicationController = controllerLookup('application');
  return applicationController.get('allBudgetMonthsViewModel');
}

export function getBudgetViewModel() {
  const applicationController = controllerLookup('application');
  return applicationController.get('budgetViewModel');
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
