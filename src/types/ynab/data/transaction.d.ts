import { YNABAccount } from './account';

export interface YNABTransaction {
  accepted: boolean;
  account: YNABAccount;
  accountId: string;
  amount: number;
  baseSubTransactions: Array<YNABTransaction>;
  budgetVersionId: string;
  cashAmount: number;
  checkNumber: string | null;
  cleared: keyof YNABConstants['TransactionState'];
  creditAmount: number;
  creditAmountAdjusted: number;
  date: DateWithoutTime;
  dateEnteredFromSchedule: DateWithoutTime | null;
  entityId: string;
  flag: string | null;
  importedDate: DateWithoutTime | null;
  importedPayee: YNABPayee | null;
  isScheduledSubTransaction?: boolean;
  isScheduledTransaction?: boolean;
  isSplit?: boolean;
  isTombstone?: boolean;
  matchedTransaction: YNABTransaction | null;
  matchedTransactionId: string | null;
  memo: string;
  month: DateWithoutTime;
  originalImportedPayee: YNABPayee | null;
  parentTransaction?: YNABTransaction;
  payee: YNABPayee | null;
  payeeId: string | null;
  scheduledTransactionId: string | null;
  scheduledTransaction: YNABTransaction | null;
  source: keyof YNABConstants['TransactionSource'] | null;
  subCategory: YNABSubCategory | null;
  subCategoryCreditAmountPreceding: number;
  subCategoryId: string | null;
  subTransactions: YNABTransaction[];
  transferAccountId: string | null;
  transferAccounts: YNABAccount[] | null;
  transferSubTransaction: YNABTransaction | null;
  transferSubTransactionId: string | null;
  transferTransaction: YNABTransaction | null;
  transferTransactionId: string | null;
  ynabId: string | null;

  isUncleared?: () => boolean;
}
