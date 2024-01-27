import * as React from 'react';
import * as PropTypes from 'prop-types';
import {
  ReportKeys,
  REPORT_TYPES,
} from 'toolkit/extension/features/toolkit-reports/common/constants/report-types';
import { IncomeVsExpense } from 'toolkit-reports/pages/income-vs-expense';
import { NetWorth } from 'toolkit-reports/pages/net-worth';
import { InflowOutflow } from 'toolkit-reports/pages/inflow-outflow';
import { BalanceOverTime } from 'toolkit-reports/pages/balance-over-time';
import { OutflowOverTime } from 'toolkit-reports/pages/outflow-over-time';
import { SpendingByPayee } from 'toolkit-reports/pages/spending-by-payee';
import { SpendingByCategory } from 'toolkit-reports/pages/spending-by-category';
import { getToolkitStorageKey, setToolkitStorageKey } from 'toolkit/extension/utils/toolkit';
import {
  getStoredFilters,
  storeAccountFilters,
  storeCategoryFilters,
  storeDateFilters,
} from 'toolkit/extension/features/toolkit-reports/utils/storage';
import { IncomeBreakdown } from '../../../pages/income-breakdown/container';
import { Forecast } from '../../../pages/forecast';
import { ComponentType, createContext } from 'react';
import { YNABTransaction } from 'toolkit/types/ynab/data/transaction';

export const FiltersPropType = {
  accountFilterIds: PropTypes.any.isRequired,
  categoryFilterIds: PropTypes.any.isRequired,
  dateFilter: PropTypes.shape({
    fromDate: PropTypes.any.isRequired,
    toDate: PropTypes.any.isRequired,
  }),
};

export type SelectedReportContextPropType = {
  component: React.ComponentType;
  key: string;
  filterSettings: {
    disableCategoryFilter?: boolean;
    disableTrackingAccounts?: boolean;
    includeTrackingAccounts?: boolean;
  };
};
export const SelectedReportContextPropType = {
  component: PropTypes.func.isRequired,
  key: PropTypes.string.isRequired,
  filterSettings: PropTypes.shape({
    disableCategoryFilter: PropTypes.bool,
    disableTrackingAccounts: PropTypes.bool,
    includeTrackingAccounts: PropTypes.bool,
  }),
};

export type FiltersType = {
  accountFilterIds: Set<string>;
  categoryFilterIds: Set<string>;
  dateFilter: {
    fromDate: DateWithoutTime;
    toDate: DateWithoutTime;
  };
};

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
  },
];

export type ReportContextType = {
  filteredTransactions: YNABTransaction[];
  filters: null | FiltersType;
  selectedReport: SelectedReportContextPropType;
  setActiveReportKey: (newKey: string) => void;
  setFilters: (newFilters: any) => void;
  allReportableTransactions: YNABTransaction[];
};

const { Provider, Consumer } = createContext<ReportContextType>({
  filteredTransactions: [],
  filters: null,
  selectedReport: REPORT_COMPONENTS[0],
  setActiveReportKey: () => {},
  setFilters: () => {},
  allReportableTransactions: [],
});

export type WithReportContextHocState = {
  activeReportKey: string;
  filteredTransactions: YNABTransaction[];
  filters: FiltersType;
  allReportableTransactions: YNABTransaction[];
};

export function withReportContextProvider<T extends {}>(InnerComponent: ComponentType<T>) {
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
            transactionsViewModel.visibleTransactionDisplayItems;
          console.log('Visible transactions:', visibleTransactionDisplayItems);
          const allReportableTransactions = (
            visibleTransactionDisplayItems as YNABTransaction[]
          ).filter(
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
          <Provider
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
          </Provider>
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

export function withReportContext<T extends { [key: string]: any }>(
  mapContextToProps: (ctx: ReportContextType) => T
) {
  return function <P extends {}>(InnerComponent: ComponentType<P>) {
    return function WithReportContextProvider(props: Omit<P, keyof T>) {
      return (
        <Consumer>
          {/* @ts-ignore */}
          {(value) => <InnerComponent {...props} {...mapContextToProps(value)} />}
        </Consumer>
      );
    };
  };
}
