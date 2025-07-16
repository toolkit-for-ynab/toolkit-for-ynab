import { ReportKeys } from '../common/constants/report-types';

export interface ToolkitReportsURLParams {
  budgetId: string | null;
  reportTab?: string | null;
}

export function isToolkitReportsURL(url: string): boolean {
  return url.includes('#toolkit-reports');
}

export function parseToolkitReportsURL(url: string): ToolkitReportsURLParams | null {
  try {
    const urlObj = new URL(url);
    const hash = urlObj.hash;

    // Expected format: #toolkit-reports/{reportTab?}
    if (!hash.startsWith('#toolkit-reports')) {
      return null;
    }

    const hashParts = hash.substring(1).split('/'); // Remove # and split

    const budgetId = getCurrentBudgetId();
    const reportTab = hashParts[1] || null;

    return {
      budgetId,
      reportTab,
    };
  } catch (error) {
    console.error('Error parsing toolkit reports URL:', error);
    return null;
  }
}

export function buildToolkitReportsURL(reportTab?: string): string {
  const budgetId = getCurrentBudgetId();

  if (!budgetId) {
    return window.location.href;
  }

  const baseURL = `${window.location.origin}/${budgetId}/budget`;
  const hash = reportTab ? `#toolkit-reports/${reportTab}` : '#toolkit-reports';

  return `${baseURL}${hash}`;
}

export function navigateToToolkitReports(reportTab?: string) {
  // If no report tab is specified, get the last visited tab from storage
  let targetReportTab = reportTab;
  if (!targetReportTab) {
    const { getToolkitStorageKey } = require('toolkit/extension/utils/toolkit');
    const ACTIVE_REPORT_KEY = 'active-report';
    targetReportTab = getToolkitStorageKey(ACTIVE_REPORT_KEY, getDefaultReportTab());
  }

  const newURL = buildToolkitReportsURL(targetReportTab);

  // Use pushState to update the URL without triggering a page reload
  window.history.pushState({}, '', newURL);

  // Dispatch a custom event to notify components of the URL change
  window.dispatchEvent(
    new CustomEvent('toolkit-reports-url-changed', {
      detail: { reportTab: targetReportTab },
    }),
  );
}

export function getCurrentBudgetId(): string | null {
  try {
    const pathParts = window.location.pathname.split('/').filter(Boolean);
    // The budgetId is always the first part of the path
    if (pathParts.length > 0) {
      return pathParts[0];
    }
    return null;
  } catch (error) {
    console.error('Error getting current budget ID:', error);
    return null;
  }
}

export function isValidReportTab(reportTab: string): boolean {
  return Object.values(ReportKeys).includes(reportTab as any);
}

export function getDefaultReportTab(): string {
  return ReportKeys.NetWorth;
}

// Helper function to convert URL format back to report key
export function urlToReportKey(urlPath: string): string | null {
  const urlToKeyMap: Record<string, string> = {
    'net-worth': ReportKeys.NetWorth,
    'inflow-outflow': ReportKeys.InflowOutflow,
    'spending-by-category': ReportKeys.SpendingByCategory,
    'spending-by-payee': ReportKeys.SpendingByPayee,
    'income-vs-expense': ReportKeys.IncomeVsExpense,
    'income-breakdown': ReportKeys.IncomeBreakdown,
    'balance-over-time': ReportKeys.BalanceOverTime,
    'outflow-over-time': ReportKeys.OutflowOverTime,
    forecast: ReportKeys.Forecast,
  };

  return urlToKeyMap[urlPath] || null;
}
