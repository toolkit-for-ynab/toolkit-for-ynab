import { YNABAccount } from '../../data/account';
import { YNABTransaction } from '../../data/transaction';
import { YNABTransactionCollection } from '../../data/transaction-collection';

interface YNABEntityManager {
  getAccountById(entityId: string): YNABAccount;
  getSubTransactionsBySubCategoryId(subCategoryId: string): YNABTransaction[];
  getTransactionsBySubCategoryId(subCategoryId: string): YNABTransaction[];
  transactionsCollection: YNABTransactionCollection;
}
