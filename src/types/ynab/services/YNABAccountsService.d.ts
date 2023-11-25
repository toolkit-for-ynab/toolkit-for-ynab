// Not complete definition
interface YNABAccountsService {
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
  // Field might be recursive (e.g. 'filters.scheduled')
  addObserver: (field: string, cb: (target: YNABAccountsService, field: string) => void) => void;
}
