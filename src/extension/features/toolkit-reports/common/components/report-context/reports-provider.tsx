import { IncomeVsExpense } from 'toolkit/extension/features/toolkit-reports/pages/income-vs-expense';
import { NetWorth } from 'toolkit/extension/features/toolkit-reports/pages/net-worth';
import { InflowOutflow } from 'toolkit/extension/features/toolkit-reports/pages/inflow-outflow';
import { BalanceOverTime } from 'toolkit/extension/features/toolkit-reports/pages/balance-over-time';
import { OutflowOverTime } from 'toolkit/extension/features/toolkit-reports/pages/outflow-over-time';
import { SpendingByPayee } from 'toolkit/extension/features/toolkit-reports/pages/spending-by-payee';
import { SpendingByCategory } from 'toolkit/extension/features/toolkit-reports/pages/spending-by-category';
import { IncomeBreakdown } from 'toolkit/extension/features/toolkit-reports/pages/income-breakdown/container';
import { Forecast } from 'toolkit/extension/features/toolkit-reports/pages/forecast';
import { REPORT_TYPES, ReportKeys } from '../../constants/report-types';
import { FiltersType, ReportContextProvider, SelectedReportContextPropType } from '.';
import React, { ComponentType } from 'react';
import { getToolkitStorageKey, setToolkitStorageKey } from 'toolkit/extension/utils/toolkit';
import {
  getStoredFilters,
  storeAccountFilters,
  storeCategoryFilters,
  storeDateFilters,
} from '../../../utils/storage';
import { YNABTransaction } from 'toolkit/types/ynab/data/transaction';
import { ForecastHelp } from '../../../pages/forecast/help';
import {
  parseToolkitReportsURL,
  isValidReportTab,
  getDefaultReportTab,
  navigateToToolkitReports,
  urlToReportKey,
} from '../../../utils/url-navigation';

const ACTIVE_REPORT_KEY = 'active-report';

const REPORT_COMPONENTS: SelectedReportContextPropType[] = [
  {
    component: BalanceOverTime,
    key: ReportKeys.BalanceOverTime,
    filterSettings: {
      disableCategoryFilter: true,
      includeTrackingAccounts: true,
    },
  },
  {
    component: OutflowOverTime,
    key: ReportKeys.OutflowOverTime,
    filterSettings: {
      disableCategoryFilter: true,
      includeTrackingAccounts: true,
    },
  },
  {
    component: NetWorth,
    key: ReportKeys.NetWorth,
    filterSettings: {
      disableCategoryFilter: true,
      includeTrackingAccounts: true,
    },
  },
  {
    component: InflowOutflow,
    key: ReportKeys.InflowOutflow,
    filterSettings: {
      disableCategoryFilter: false,
      includeTrackingAccounts: true,
    },
  },
  {
    component: SpendingByPayee,
    key: ReportKeys.SpendingByPayee,
    filterSettings: {
      disableTrackingAccounts: true,
      includeTrackingAccounts: false,
    },
  },
  {
    component: SpendingByCategory,
    key: ReportKeys.SpendingByCategory,
    filterSettings: {
      disableTrackingAccounts: true,
      includeTrackingAccounts: false,
    },
  },
  {
    component: IncomeVsExpense,
    key: ReportKeys.IncomeVsExpense,
    filterSettings: {
      disableTrackingAccounts: true,
      includeTrackingAccounts: false,
    },
  },
  {
    component: IncomeBreakdown,
    key: ReportKeys.IncomeBreakdown,
    filterSettings: {
      disableTrackingAccounts: true,
      includeTrackingAccounts: false,
    },
  },
  {
    component: Forecast,
    key: ReportKeys.Forecast,
    filterSettings: {
      disableTrackingAccounts: false,
      includeTrackingAccounts: true,
    },
    filtersExtraComponent: ForecastHelp,
  },
];

export type WithReportContextHocState = {
  activeReportKey: string;
  filteredTransactions: YNABTransaction[];
  filters: FiltersType;
  allReportableTransactions: YNABTransaction[];
};

export function withReportContextProvider<T extends object>(InnerComponent: ComponentType<T>) {
  return class WithReportContextProvider extends React.Component<T, WithReportContextHocState> {
    private isUpdatingFromURL = false;

    get selectedReport() {
      return REPORT_COMPONENTS.find(({ key }) => key === this.state.activeReportKey);
    }

    _isURLNavigationEnabled() {
      return ynabToolKit?.options?.ToolkitReportsURLNavigation || false;
    }

    constructor(props: T) {
      super(props);

      // Determine the initial active report key from URL or storage
      const initialReportKey = this._getInitialReportKey();

      this.state = {
        activeReportKey: initialReportKey,
        filteredTransactions: [],
        filters: getStoredFilters(initialReportKey),
        allReportableTransactions: [],
      };
    }

    componentDidMount() {
      // Add event listener for URL changes (only if URL navigation is enabled)
      if (this._isURLNavigationEnabled()) {
        window.addEventListener(
          'toolkit-reports-url-changed',
          this._handleURLChanged as EventListener,
        );
        window.addEventListener('hashchange', this._handleHashChange as EventListener);
      }

      ynab.YNABSharedLib.getBudgetViewModel_AllAccountsViewModel().then(
        (transactionsViewModel: any) => {
          const visibleTransactionDisplayItems =
            transactionsViewModel.visibleTransactionDisplayItems as YNABTransaction[];
          const allReportableTransactions = visibleTransactionDisplayItems.filter(
            (transaction) =>
              !transaction.isSplit &&
              !transaction.isScheduledTransaction &&
              !transaction.isScheduledSubTransaction,
          );

          this.setState(
            {
              filteredTransactions: [],
              allReportableTransactions,
            },
            () => {
              this._applyFilters(this.state.activeReportKey);
            },
          );
        },
      );
    }

    componentWillUnmount() {
      // Remove event listeners (only if URL navigation was enabled)
      if (this._isURLNavigationEnabled()) {
        window.removeEventListener(
          'toolkit-reports-url-changed',
          this._handleURLChanged as EventListener,
        );
        window.removeEventListener('hashchange', this._handleHashChange as EventListener);
      }
    }

    render() {
      return (
        <React.Fragment>
          <ReportContextProvider
            value={{
              filteredTransactions: this.state.filteredTransactions,
              filters: this.state.filters,
              selectedReport: this._findReportSettingsByKey(this.state.activeReportKey),
              setActiveReportKey: this._setActiveReportKey,
              setFilters: this._setFilters,
              allReportableTransactions: this.state.allReportableTransactions,
            }}
          >
            <InnerComponent {...this.props} />
          </ReportContextProvider>
        </React.Fragment>
      );
    }

    _getInitialReportKey(): string {
      // First, try to get the report tab from the URL (only if URL navigation is enabled)
      if (!this._isURLNavigationEnabled()) {
        return getToolkitStorageKey(ACTIVE_REPORT_KEY, getDefaultReportTab());
      }

      const urlParams = parseToolkitReportsURL(window.location.href);
      if (!urlParams?.reportTab) {
        return getToolkitStorageKey(ACTIVE_REPORT_KEY, getDefaultReportTab());
      }

      const reportKey = urlToReportKey(urlParams.reportTab);
      if (!reportKey || !isValidReportTab(reportKey)) {
        return getToolkitStorageKey(ACTIVE_REPORT_KEY, getDefaultReportTab());
      }

      return reportKey;
    }

    _handleURLChanged = (event: Event) => {
      // Prevent handling if we're already updating from URL
      if (this.isUpdatingFromURL) {
        return;
      }

      const customEvent = event as CustomEvent;
      const { reportTab } = customEvent.detail || {};

      // Don't process if the report tab is the same as current
      if (reportTab && isValidReportTab(reportTab) && reportTab !== this.state.activeReportKey) {
        this.isUpdatingFromURL = true;
        this._setActiveReportKeyFromURL(reportTab);
        // Reset flag after a short delay
        setTimeout(() => {
          this.isUpdatingFromURL = false;
        }, 100);
      }
    };

    _handleHashChange = (event: Event) => {
      // Prevent handling if we're already updating from URL
      if (this.isUpdatingFromURL) {
        return;
      }

      // Check if the new hash is a toolkit reports URL
      const urlParams = parseToolkitReportsURL(window.location.href);
      if (urlParams?.reportTab) {
        const reportKey = urlToReportKey(urlParams.reportTab);
        // Don't process if the report key is the same as current
        if (reportKey && isValidReportTab(reportKey) && reportKey !== this.state.activeReportKey) {
          this.isUpdatingFromURL = true;
          this._setActiveReportKeyFromURL(reportKey);
          // Reset flag after a short delay
          setTimeout(() => {
            this.isUpdatingFromURL = false;
          }, 100);
        }
      }
    };

    _setActiveReportKey = (activeReportKey: string) => {
      // Prevent updating if we're already updating from URL
      if (this.isUpdatingFromURL) {
        return;
      }

      setToolkitStorageKey(ACTIVE_REPORT_KEY, activeReportKey);

      // Update the URL to reflect the new report tab (only if URL navigation is enabled)
      if (this._isURLNavigationEnabled()) {
        navigateToToolkitReports(activeReportKey);
      }

      this._applyFilters(activeReportKey);
    };

    _setActiveReportKeyFromURL = (activeReportKey: string) => {
      setToolkitStorageKey(ACTIVE_REPORT_KEY, activeReportKey);

      // Don't update the URL since this was triggered by a URL change
      this._applyFilters(activeReportKey);
    };

    _setFilters = (filters: FiltersType) => {
      storeAccountFilters(this.state.activeReportKey, filters.accountFilterIds);
      storeCategoryFilters(this.state.activeReportKey, filters.categoryFilterIds);
      storeDateFilters(this.state.activeReportKey, filters.dateFilter);

      // this.setState({ filters }, this._applyFilters);
      this._applyFilters(this.state.activeReportKey);
    };

    _applyFilters = (activeReportKey: string) => {
      const filters = getStoredFilters(activeReportKey);
      const { filterSettings } = this._findReportSettingsByKey(activeReportKey);
      const { allReportableTransactions } = this.state;
      if (!allReportableTransactions || !allReportableTransactions.length || !filters) {
        return;
      }

      const { accountFilterIds, categoryFilterIds, dateFilter } = filters;
      const filteredTransactions = allReportableTransactions.filter((transaction) => {
        const { accountId, subCategoryId, date } = transaction;

        const isFilteredAccount = accountFilterIds.has(accountId);
        const isFilteredCategory =
          !filterSettings.disableCategoryFilter &&
          subCategoryId &&
          categoryFilterIds.has(subCategoryId);
        const isFilteredDate =
          dateFilter && (date.isBefore(dateFilter.fromDate) || date.isAfter(dateFilter.toDate));

        if (isFilteredAccount || isFilteredCategory || isFilteredDate) {
          return false;
        }

        return true;
      });

      this.setState({ filteredTransactions, filters, activeReportKey });
    };

    _findReportSettingsByKey(findKey: string) {
      return REPORT_COMPONENTS.find(({ key }) => key === findKey)!;
    }
  };
}
