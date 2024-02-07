// Not complete definition
export interface YNABAccountsService {
  selectedAccountId: string | null;
  collapsedSplits: {
    [transactionID: string]: boolean;
  };
  filters: {
    reconciled: boolean;
    scheduled: boolean;

    set: (field: string, value: any) => void;
    applyFilters: VoidFunction;
  };
  // Field here might be nested (e.g. 'filters.scheduled')
  addObserver: (field: string, cb: (target: YNABAccountsService, field: string) => void) => void;
}
