interface YNABAccountsService {
  selectedAccountId: string | null;
  collapsedSplits: {
    [transactionID: string]: boolean;
  };
}
