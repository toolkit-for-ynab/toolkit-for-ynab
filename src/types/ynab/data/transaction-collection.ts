import type { YNABCollection } from './collection';
import type { YNABTransaction } from './transaction';

export interface YNABTransactionCollection extends YNABCollection<YNABTransaction> {
  findItemByEntityId(entityId: string | null): YNABTransaction;
}
