import { YNABModalService } from 'toolkit/types/ynab/services/YNABModalService';
import { getRouter, serviceLookup } from './ember';
import { YNABBudgetService } from 'toolkit/types/ynab/services/YNABBudgetService';
import type { YNABAccountsService } from 'toolkit/types/ynab/services/YNABAccountsService';
import type { YNABRegisterGridService } from 'toolkit/types/ynab/services/YNABRegisterGridService';
import type { YNABApplicationService } from 'toolkit/types/ynab/services/YNABApplicationService';

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

// YNAB moved its reports from `reports.*` routes to `reflect.*` routes (the old
// names still exist but only redirect), so accept either prefix.
const REPORT_ROUTE_PREFIXES = ['reports.', 'reflect.'];

export function isCurrentRouteReportPage(
  report?: 'spending' | 'income-expense' | 'net-worth' | 'any',
) {
  const currentRoute = getCurrentRouteName();
  if (!currentRoute) {
    return false;
  }

  if (report === 'any' || !report) {
    return REPORT_ROUTE_PREFIXES.some((prefix) => currentRoute.startsWith(prefix));
  }

  return REPORT_ROUTE_PREFIXES.some(
    (prefix) =>
      currentRoute === `${prefix}${report}` || currentRoute.startsWith(`${prefix}${report}-`),
  );
}

// The item in YNAB's plan settings menu that Toolkit toggles are inserted after.
// "Import from..." no longer exists in the menu, so fall back to "Display Options".
export function getSettingsMenuAnchor(menu: Element): HTMLElement | null {
  return (
    menu.querySelector<HTMLElement>('.modal-select-import-from') ??
    menu.querySelector<HTMLElement>('.modal-select-theme-switcher') ??
    menu.querySelector<HTMLElement>('.menu-item:last-child')
  );
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
  return serviceLookup<YNABModalService>('modal');
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
    typeof ynabToolKit !== 'undefined'
  );
}
