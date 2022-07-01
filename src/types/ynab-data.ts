interface DateWithoutTime {
  addMonths(count: number): DateWithoutTime;
  clone(): DateWithoutTime;
  getMonth(): number;
  getYear(): number;
  isAfter(date: DateWithoutTime): boolean;
  isBefore(date: DateWithoutTime): boolean;
  startOfMonth(): DateWithoutTime;
  toISOString(): string;
}

interface MasterCategory {
  entityId: string;
  sortableIndex: number;
}

interface SubCategory {
  entityId?: string;
  masterCategoryId?: string;
  sortableIndex: number;
}

interface Payee {
  entityId?: string;
  isStartingBalancePayee(): boolean;
  name: string;
}

interface Transaction {
  accepted?: boolean;
  account?: any;
  accountId?: string;
  amount?: number;
  baseSubTransactions?: Array<any>;
  budgetVersionId?: string;
  cashAmount?: any;
  checkNumber?: any;
  cleared?: string;
  creditAmount?: any;
  creditAmountAdjusted?: any;
  date?: DateWithoutTime;
  dateEnteredFromSchedule?: any;
  entityId?: string;
  flag?: any;
  importedDate?: any;
  importedPayee?: string;
  isScheduledSubTransaction?: boolean;
  isScheduledTransaction?: boolean;
  isSplit?: boolean;
  isTombstone?: boolean;
  matchedTransaction?: any;
  matchedTransactionId?: any;
  memo?: string;
  month?: any;
  originalImportedPayee?: string;
  parentTransaction?: Transaction;
  payee?: any;
  payeeId?: string;
  scheduledTransactionId?: string;
  scheduledTransactions?: any;
  source?: string;
  subCategory?: any;
  subCategoryCreditAmountPreceding?: any;
  subCategoryId?: string;
  subTransactions?: any;
  transferAccountId?: string;
  transferAccounts?: any;
  transferSubTransaction?: any;
  transferSubTransactionId?: string;
  transferTransaction?: any;
  transferTransactionId?: string;
  ynabId?: string;

  isUncleared?: () => boolean;
}
