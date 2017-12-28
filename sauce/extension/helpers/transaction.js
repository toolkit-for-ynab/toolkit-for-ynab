export function isTransfer(transaction) {
  let masterCategoryId = transaction.get('masterCategoryId');
  let subCategoryId = transaction.get('subCategoryId');

  return masterCategoryId === null || subCategoryId === null;
}
