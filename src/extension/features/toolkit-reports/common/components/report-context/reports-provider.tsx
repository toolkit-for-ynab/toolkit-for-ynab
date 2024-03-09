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
    get selectedReport() {
      return REPORT_COMPONENTS.find(({ key }) => key === this.state.activeReportKey);
    }

    constructor(props: T) {
      super(props);
      const activeReportKey = getToolkitStorageKey(ACTIVE_REPORT_KEY, REPORT_TYPES[0].key);

      this.state = {
        activeReportKey,
        filteredTransactions: [],
        filters: getStoredFilters(activeReportKey),
        allReportableTransactions: [],
      };
    }

    componentDidMount() {
      ynab.YNABSharedLib.getBudgetViewModel_AllAccountsViewModel().then(
        (transactionsViewModel: any) => {
          const visibleTransactionDisplayItems =
            transactionsViewModel.visibleTransactionDisplayItems as YNABTransaction[];
          const allReportableTransactions = visibleTransactionDisplayItems.filter(
            (transaction) =>
              !transaction.isSplit &&
              !transaction.isScheduledTransaction &&
              !transaction.isScheduledSubTransaction
          );

          this.setState(
            {
              filteredTransactions: [],
              allReportableTransactions,
            },
            () => {
              this._applyFilters(this.state.activeReportKey);
            }
          );
        }
      );
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

    _setActiveReportKey = (activeReportKey: string) => {
      setToolkitStorageKey(ACTIVE_REPORT_KEY, activeReportKey);

      // const filters = getStoredFilters(activeReportKey);
      // this.setState({ activeReportKey, filters }, this._applyFilters);
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
