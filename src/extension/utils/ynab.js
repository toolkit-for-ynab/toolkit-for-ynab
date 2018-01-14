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
  return ynab.YNABSharedLib.getBudgetViewModel_CategoriesViewModel();
}

export function getAllBudgetMonthsViewModel() {
  return ynab.YNABSharedLib.getBudgetViewModel_AllBudgetMonthsViewModel();
}

export function getAllBudgetMonthsViewModelResult() {
  return getAllBudgetMonthsViewModel()._result;
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
