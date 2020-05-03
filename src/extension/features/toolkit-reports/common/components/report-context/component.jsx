import * as React from 'react';
import * as PropTypes from 'prop-types';
import { ReportKeys, REPORT_TYPES } from 'toolkit-reports/common/constants/report-types';
import { IncomeVsExpense } from 'toolkit-reports/pages/income-vs-expense';
import { NetWorth } from 'toolkit-reports/pages/net-worth';
import { InflowOutflow } from 'toolkit-reports/pages/inflow-outflow';
import { BalanceOverTime } from 'toolkit-reports/pages/balance-over-time';
import { SpendingByPayee } from 'toolkit-reports/pages/spending-by-payee';
import { SpendingByCategory } from 'toolkit-reports/pages/spending-by-category';
import { getToolkitStorageKey, setToolkitStorageKey } from 'toolkit/extension/utils/toolkit';
import {
  getStoredFilters,
  storeAccountFilters,
  storeCategoryFilters,
  storeDateFilters,
} from 'toolkit-reports/utils/storage';
import { IncomeBreakdown } from '../../../pages/income-breakdown/container';

export const SelectedReportContextPropType = {
  component: PropTypes.func.isRequired,
  key: PropTypes.string.isRequired,
  filterSettings: PropTypes.shape({
    disableCategoryFilter: PropTypes.bool,
    disableTrackingAccounts: PropTypes.bool,
    includeTrackingAccounts: PropTypes.bool,
  }),
};

export const FiltersPropType = {
  accountFilterIds: PropTypes.any.isRequired,
  categoryFilterIds: PropTypes.any.isRequired,
  dateFilter: PropTypes.shape({
    fromDate: PropTypes.any.isRequired,
    toDate: PropTypes.any.isRequired,
  }),
};

const ACTIVE_REPORT_KEY = 'active-report';

const REPORT_COMPONENTS = [
  {
    component: BalanceOverTime,
    key: ReportKeys.BalanceOverTime,
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
];

const { Provider, Consumer } = React.createContext({
  filteredTransactions: [],
  filters: null,
  selectedReport: REPORT_COMPONENTS[0],
  setActiveReportKey: () => {},
  setFilters: () => {},
  allReportableTransactions: [],
});

export function withReportContextProvider(InnerComponent) {
  return class WithReportContextProvider extends React.Component {
    get selectedReport() {
      return REPORT_COMPONENTS.find(({ key }) => key === this.state.activeReportKey);
    }

    constructor(props) {
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
      ynab.YNABSharedLib.getBudgetViewModel_AllAccountTransactionsViewModel().then(
        transactionsViewModel => {
          const visibleTransactionDisplayItems = transactionsViewModel.get(
            'visibleTransactionDisplayItems'
          );
          const allReportableTransactions = visibleTransactionDisplayItems.filter(
            transaction =>
              !transaction.get('isSplit') &&
              !transaction.get('isScheduledTransaction') &&
              !transaction.get('isScheduledSubTransaction')
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

    _setActiveReportKey = activeReportKey => {
      setToolkitStorageKey(ACTIVE_REPORT_KEY, activeReportKey);

      // const filters = getStoredFilters(activeReportKey);
      // this.setState({ activeReportKey, filters }, this._applyFilters);
      this._applyFilters(activeReportKey);
    };

    _setFilters = filters => {
      storeAccountFilters(this.state.activeReportKey, filters.accountFilterIds);
      storeCategoryFilters(this.state.activeReportKey, filters.categoryFilterIds);
      storeDateFilters(this.state.activeReportKey, filters.dateFilter);

      // this.setState({ filters }, this._applyFilters);
      this._applyFilters(this.state.activeReportKey);
    };

    _applyFilters = activeReportKey => {
      const filters = getStoredFilters(activeReportKey);
      const { filterSettings } = this._findReportSettingsByKey(activeReportKey);
      const { allReportableTransactions } = this.state;
      if (!allReportableTransactions || !allReportableTransactions.length || !filters) {
        return;
      }

      const { accountFilterIds, categoryFilterIds, dateFilter } = filters;
      const filteredTransactions = allReportableTransactions.filter(transaction => {
        const { accountId, subCategoryId, date } = transaction;

        const isFilteredAccount = accountFilterIds.has(accountId);
        const isFilteredCategory =
          !filterSettings.disableCategoryFilter && categoryFilterIds.has(subCategoryId);
        const isFilteredDate =
          dateFilter && (date.isBefore(dateFilter.fromDate) || date.isAfter(dateFilter.toDate));

        if (isFilteredAccount || isFilteredCategory || isFilteredDate) {
          return false;
        }

        return true;
      });

      this.setState({ filteredTransactions, filters, activeReportKey });
    };

    _findReportSettingsByKey(findKey) {
      return REPORT_COMPONENTS.find(({ key }) => key === findKey);
    }
  };
}

export function withReportContext(mapContextToProps) {
  return function(InnerComponent) {
    return function WithReportContextProvider(props) {
      return (
        <Consumer>{value => <InnerComponent {...props} {...mapContextToProps(value)} />}</Consumer>
      );
    };
  };
}
