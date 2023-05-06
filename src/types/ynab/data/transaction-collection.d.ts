import { YNABTransaction } from './transaction';

interface YNABTransactionCollection extends YNABCollection<YNABTransaction> {
  findItemByEntityId(entityId: string | null): YNABTransaction;
}
