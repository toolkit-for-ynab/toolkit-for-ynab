import * as React from 'react';
import { ComponentType, createContext } from 'react';
import { YNABTransaction } from 'toolkit/types/ynab/data/transaction';
import { DateWithoutTime } from 'toolkit/types/ynab/window/ynab-utilities';

export type SelectedReportContextPropType = {
  component: React.ComponentType;
  key: string;
  filterSettings: {
    disableCategoryFilter?: boolean;
    disableTrackingAccounts?: boolean;
    includeTrackingAccounts?: boolean;
  };
  filtersExtraComponent?: React.ComponentType<{}>;
};

export type FiltersType = {
  accountFilterIds: Set<string>;
  categoryFilterIds: Set<string>;
  dateFilter: {
    fromDate: DateWithoutTime;
    toDate: DateWithoutTime;
  };
};

export type ReportContextType = {
  filteredTransactions: YNABTransaction[];
  filters: null | FiltersType;
  selectedReport: SelectedReportContextPropType | null;
  setActiveReportKey: (newKey: string) => void;
  setFilters: (newFilters: any) => void;
  allReportableTransactions: YNABTransaction[];
  /**
   * All scheduled transaction rows, unfiltered with respect to splits: this includes both
   * split parent rows (which carry the total amount and the real recurrence `frequency`) and
   * their scheduled sub-transaction children (which carry per-category amounts but always
   * report `frequency: 'Never'`). Consumers must pick one or the other before using this —
   * summing amounts requires filtering to `!isSplit` (leaf rows) to avoid double-counting a
   * split's total against its own children, while anything that needs the recurrence schedule
   * must filter to `!isScheduledSubTransaction` (parent rows), since children don't carry it.
   */
  allScheduledTransactions: YNABTransaction[];
};

const { Provider, Consumer } = createContext<ReportContextType>({
  filteredTransactions: [],
  filters: null,
  selectedReport: null,
  setActiveReportKey: () => {},
  setFilters: () => {},
  allReportableTransactions: [],
  allScheduledTransactions: [],
});

export const ReportContextProvider = Provider;

export function withReportContext<T extends { [key: string]: any }>(
  mapContextToProps: (ctx: ReportContextType) => T,
) {
  return function <P extends object>(InnerComponent: ComponentType<P>) {
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
