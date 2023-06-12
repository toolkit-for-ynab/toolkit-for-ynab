import { YNABAccount } from '../../data/account';
import { YNABTransaction } from '../../data/transaction';
import { YNABTransactionCollection } from '../../data/transaction-collection';

interface YNABEntityManager {
  getAccountById(entityId: string): YNABAccount;
  getTransactionById(transactionId: string): YNABTransaction;
  getSubTransactionsBySubCategoryId(subCategoryId: string): YNABTransaction[];
  getTransactionsBySubCategoryId(subCategoryId: string): YNABTransaction[];
  transactionsCollection: YNABTransactionCollection;
  payeesCollection: YNABPayeeCollection;
}
