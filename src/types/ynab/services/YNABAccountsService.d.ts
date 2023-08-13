interface YNABAccountsService {
  selectedAccountId: string;
  collapsedSplits: {
    [transactionID: string]: boolean;
  };
}
