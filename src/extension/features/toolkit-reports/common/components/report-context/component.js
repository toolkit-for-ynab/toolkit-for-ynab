import * as React from 'react';
import * as PropTypes from 'prop-types';
import { Collections } from 'toolkit/extension/utils/collections';
import { ReportKeys, REPORT_TYPES } from 'toolkit-reports/common/constants/report-types';
import { IncomeVsExpense } from 'toolkit-reports/pages/income-vs-expense';
import { NetWorth } from 'toolkit-reports/pages/net-worth';
import { SpendingByPayee } from 'toolkit-reports/pages/spending-by-payee';
import { SpendingByCategory } from 'toolkit-reports/pages/spending-by-category';
import { getToolkitStorageKey, setToolkitStorageKey } from 'toolkit/extension/utils/toolkit';

export const SelectedReportContextPropType = {
  component: PropTypes.func.isRequired,
  key: PropTypes.string.isRequired,
  filterSettings: PropTypes.shape({
    disableCategoryFilter: PropTypes.bool,
    disableTrackingAccounts: PropTypes.bool
  })
};

export const FiltersPropType = {
  accountFilterIds: PropTypes.any.isRequired,
  categoryFilterIds: PropTypes.any.isRequired,
  dateFilter: PropTypes.shape({
    fromDate: PropTypes.any.isRequired,
    toDate: PropTypes.any.isRequired
  })
};

const ACTIVE_REPORT_KEY = 'active-report';

const REPORT_COMPONENTS = [{
  component: NetWorth,
  key: ReportKeys.NetWorth,
  filterSettings: {
    disableCategoryFilter: true
  }
}, {
  component: SpendingByPayee,
  key: ReportKeys.SpendingByPayee,
  filterSettings: {
    disableTrackingAccounts: true
  }
}, {
  component: SpendingByCategory,
  key: ReportKeys.SpendingByCategory,
  filterSettings: {
    disableTrackingAccounts: true
  }
}, {
  component: IncomeVsExpense,
  key: ReportKeys.IncomeVsExpense,
  filterSettings: {
    disableTrackingAccounts: true
  }
}];

const { Provider, Consumer } = React.createContext({
  filteredTransactions: [],
  filters: null,
  selectedReport: REPORT_COMPONENTS[0],
  setActiveReportKey: () => {},
  setFilters: () => {},
  visibleTransactions: []
});

export function withReportContextProvider(InnerComponent) {
  return class WithReportContextProvider extends React.Component {
    get selectedReport() {
      return REPORT_COMPONENTS.find(({ key }) => key === this.state.activeReportKey);
    }

    constructor(props) {
      super(props);

      const visibleTransactions = Collections.transactionsCollection.filter((transaction) => {
        return (
          !transaction.get('isTombstone') &&
          ynab.constants.TransactionSource.getDisplayableSources().includes(transaction.getSource())
        );
      });

      this.state = {
        activeReportKey: getToolkitStorageKey(ACTIVE_REPORT_KEY, REPORT_TYPES[0].key),
        filteredTransactions: visibleTransactions,
        filters: null,
        visibleTransactions
      };
    }

    render() {
      return (
        <React.Fragment>
          <Provider
            value={{
              filteredTransactions: this.state.filteredTransactions,
              filters: this.state.filters,
              selectedReport: this.selectedReport,
              setActiveReportKey: this._setActiveReportKey,
              setFilters: this._setFilters,
              visibleTransactions: this.state.visibleTransactions
            }}
          >
            <InnerComponent {...this.props} />
          </Provider>
        </React.Fragment>
      );
    }

    _setActiveReportKey = (activeReportKey) => {
      setToolkitStorageKey(ACTIVE_REPORT_KEY, activeReportKey);
      this.setState({ activeReportKey });
    }

    _setFilters = (filters) => {
      const { visibleTransactions } = this.state;
      const { accountFilterIds, categoryFilterIds, dateFilter } = filters;
      const filteredTransactions = visibleTransactions.filter((transaction) => {
        const { accountId, subCategoryId, date } = transaction;

        const isFilteredAccount = accountFilterIds.has(accountId);
        const isFilteredCategory = !this.selectedReport.filterSettings.disableCategoryFilter && categoryFilterIds.has(subCategoryId);
        const isFilteredDate = dateFilter && (date.isBefore(dateFilter.fromDate) || date.isAfter(dateFilter.toDate));

        if (isFilteredAccount || isFilteredCategory || isFilteredDate) {
          return false;
        }

        return true;
      });

      this.setState({
        filteredTransactions,
        filters
      });
    }
  };
}

export function withReportContext(mapContextToProps) {
  return function (InnerComponent) {
    return class WithReportContextProvider extends React.Component {
      render() {
        return (
          <Consumer>
            {(value) => (
              <InnerComponent {...this.props} {...mapContextToProps(value)} />
            )}
          </Consumer>
        );
      }
    };
  };
}
