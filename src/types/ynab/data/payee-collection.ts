import type { YNABCollection } from './collection';
import type { YNABPayee } from './payee';

export interface YNABPayeeCollection extends YNABCollection<YNABPayee> {
  findItemByEntityId(entityId: string | null): YNABPayee;
}
