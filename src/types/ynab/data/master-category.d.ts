interface YNABMasterCategory {
  entityId: string;
  sortableIndex: number;
  subCategories: Array<YNABSubCategory>;
  isHiddenMasterCategory(): boolean;
  isTombstone: boolean;
  internalName: string;
  isDebtPaymentMasterCategory(): boolean;
  isInternalMasterCategory(): boolean;
  name: string;
}
