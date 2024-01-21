import type { YNABCollection } from './collection';

export interface YNABPayeeCollection extends YNABCollection<YNABPayee> {
  findItemByEntityId(entityId: string | null): YNABPayee;
}
