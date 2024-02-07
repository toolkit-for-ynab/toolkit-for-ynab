import type { YNABAccount } from '../../data/account';
import type { YNABPayeeCollection } from '../../data/payee-collection';
import type { YNABTransaction } from '../../data/transaction';
import type { YNABTransactionCollection } from '../../data/transaction-collection';

export interface YNABEntityManager {
  getAccountById(entityId: string): YNABAccount;
  getTransactionById(transactionId: string): YNABTransaction;
  getSubTransactionsBySubCategoryId(subCategoryId: string): YNABTransaction[];
  getTransactionsBySubCategoryId(subCategoryId: string): YNABTransaction[];
  transactionsCollection: YNABTransactionCollection;
  payeesCollection: YNABPayeeCollection;
}
