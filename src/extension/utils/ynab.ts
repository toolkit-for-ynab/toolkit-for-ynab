import { YNABModalService } from 'toolkit/types/ynab/services/YNABModalService';
import { getRouter, serviceLookup } from './ember';

export function ynabRequire<T = any>(module: string): T {
  return window.requireModule<T>(module);
}

export function getEntityManager() {
  return ynab.YNABSharedLib.defaultInstance.entityManager;
}

export function getCurrentBudgetDate() {
  const date = getSelectedMonth()?.format('YYYYMM');
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

export function isCurrentRouteReportPage(
  report?: 'spending' | 'income-expense' | 'net-worth' | 'any'
) {
  const currentRoute = getCurrentRouteName();
  if (report === 'any' || !report) {
    return currentRoute?.includes('reports.');
  }

  return currentRoute === `reports.${report}`;
}

export function getSelectedAccount() {
  const selectedAccountId = serviceLookup<YNABAccountsService>('accounts')?.selectedAccountId;
  if (selectedAccountId) {
    return getEntityManager().getAccountById(selectedAccountId);
  }

  return null;
}

export function getCurrentRouteName() {
  return getRouter()?.currentRouteName;
}

export function getAllBudgetMonthsViewModel() {
  return getBudgetService()?.budgetViewModel?.allBudgetMonthsViewModel;
}

export function getBudgetViewModel() {
  return getBudgetService()?.budgetViewModel;
}

export function getSelectedMonth() {
  return getBudgetViewModel()?.month;
}

export function getApplicationService() {
  return serviceLookup<YNABApplicationService>('application');
}

export function getAccountsService() {
  return serviceLookup<YNABAccountsService>('accounts');
}

export function getBudgetService() {
  return serviceLookup<YNABBudgetService>('budget');
}

export function getModalService() {
  return serviceLookup<YNABModalService>('modal') || {};
}

export function getRegisterGridService() {
  return serviceLookup<YNABRegisterGridService>('registerGrid');
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
    typeof $ !== 'undefined' &&
    !$('.ember-view.is-loading').length &&
    typeof ynabToolKit !== 'undefined' &&
    typeof YNABFEATURES !== 'undefined'
  );
}
