import * as React from 'react';
import * as PropTypes from 'prop-types';
import { ToolKeys, TOOL_TYPES } from '$tools/common/constants/tool-types';
import { DebtReductionCalculator } from '$tools/tools/debt-reduction-calculator'; // 1st user tool
import { Calculator } from '$tools/tools/calculator/container';
import { getToolkitStorageKey, setToolkitStorageKey } from '$toolkit/extension/utils/toolkit';
import {
  getStoredFilters,
  storeAccountFilters,
  storeCategoryFilters,
  storeDateFilters,
} from '$tools/utils/storage';

export const SelectedToolContextPropType = {
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

const ACTIVE_TOOL_KEY = 'active-tool';

const TOOL_COMPONENTS = [
  {
    component: DebtReductionCalculator,
    key: ToolKeys.DebtReductionCalculator,
    filterSettings: {
      disableCategoryFilter: true,
      disableAccountFilter: true,
      disableDateFilter: true,
    },
  },
  {
    component: Calculator,
    key: ToolKeys.Calculator,
    filterSettings: {
      disableCategoryFilter: true,
      disableAccountFilter: true,
      disableDateFilter: true,
    },
  },
];

const { Provider, Consumer } = React.createContext({
  filteredAccounts: [],
  filters: null,
  selectedTool: TOOL_COMPONENTS[0],
  setActiveToolKey: () => {},
  setFilters: () => {},
  // allReportableTransactions: [],
});

export function withToolContextProvider(InnerComponent) {
  return class WithToolContextProvider extends React.Component {
    get selectedTool() {
      return TOOL_COMPONENTS.find(({ key }) => key === this.state.activeToolKey);
    }

    constructor(props) {
      super(props);
      const activeToolKey = getToolkitStorageKey(ACTIVE_TOOL_KEY, TOOL_TYPES[0].key);

      this.state = {
        activeToolKey,
        // values: getCalculatorValues(activeToolKey),
        filters: getStoredFilters(activeToolKey),
        filteredAccounts: [],
      };
    }

    // not sure what this function does
    componentDidMount() {
      // ynab.YNABSharedLib.accountFilterIds().then(); // getBudgetViewModel_AllAccountTransactionsViewModel().then(
    }

    render() {
      return (
        <React.Fragment>
          <Provider
            value={{
              filters: this.state.filters,
              selectedTool: this._findToolSettingsByKey(this.state.activeToolKey),
              setActiveToolKey: this._setActiveToolKey,
              setFilters: this._setFilters,
            }}
          >
            <InnerComponent {...this.props} />
          </Provider>
        </React.Fragment>
      );
    }

    _setActiveToolKey = activeToolKey => {
      setToolkitStorageKey(ACTIVE_TOOL_KEY, activeToolKey);

      this._applyFilters(activeToolKey);
    };

    _setFilters = filters => {
      storeAccountFilters(this.state.activeToolKey, filters.accountFilterIds);
      storeCategoryFilters(this.state.activeToolKey, filters.categoryFilterIds);
      storeDateFilters(this.state.activeToolKey, filters.dateFilter);

      this._applyFilters(this.state.activeToolKey);
    };

    _applyFilters = activeToolKey => {
      const filters = getStoredFilters(activeToolKey);
      const { filterSettings } = this._findToolSettingsByKey(activeToolKey);
      if (!filters && !filterSettings) {
        return;
      }

      // const { accountFilterIds, categoryFilterIds, dateFilter } = filters;

      this.setState({ filterSettings, filters, activeToolKey });
    };

    _findToolSettingsByKey(findKey) {
      return TOOL_COMPONENTS.find(({ key }) => key === findKey);
    }
  };
}

export function withToolContext(mapContextToProps) {
  return function(InnerComponent) {
    return function WithToolContextProvider(props) {
      return (
        <Consumer>{value => <InnerComponent {...props} {...mapContextToProps(value)} />}</Consumer>
      );
    };
  };
}
