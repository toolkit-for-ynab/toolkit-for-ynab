interface YNABPayee {
  entityId?: string;
  isStartingBalancePayee(): boolean;
  name: string;
  get<T extends keyof YNABPayee>(key: T): YNABPayee[T];
}
