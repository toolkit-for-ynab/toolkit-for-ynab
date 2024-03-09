export interface YNABSubCategory {
  entityId?: string;
  masterCategoryId?: string;
  note: string;
  sortableIndex: number;
  goalTargetAmount?: number;
  isTombstone: boolean;
  internalName: string;
  name: string;
}
