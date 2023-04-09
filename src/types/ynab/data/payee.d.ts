interface YNABPayee {
  entityId?: string;
  isStartingBalancePayee(): boolean;
  name: string;
}
