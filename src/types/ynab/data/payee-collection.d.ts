interface YNABPayeeCollection extends YNABCollection<YNABPayee> {
  findItemByEntityId(entityId: string | null): YNABPayee;
}
