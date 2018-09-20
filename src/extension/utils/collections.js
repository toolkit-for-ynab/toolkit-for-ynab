import { getEntityManager } from './ynab';

export class Collections {
  static get accountsCollection() {
    const collection = new ynab.collections.AccountsCollection();
    collection.addItemsFromArray(getEntityManager().getAllAccounts());
    return collection;
  }

  static get accountCalculationsCollection() {
    const collection = new ynab.collections.AccountCalculationsCollection();
    collection.addItemsFromArray(getEntityManager().getAllAccountCalculations());
    return collection;
  }

  static get masterCategoriesCollection() {
    const collection = new ynab.collections.MasterCategoriesCollection();
    collection.addItemsFromArray(getEntityManager().getAllMasterCategories());
    return collection;
  }

  static get payeesCollection() {
    const collection = new ynab.collections.PayeesCollection();
    collection.addItemsFromArray(getEntityManager().getAllPayees());
    return collection;
  }

  static get subCategoriesCollection() {
    const collection = new ynab.collections.SubCategoriesCollection();
    collection.addItemsFromArray(getEntityManager().getAllSubCategories());
    return collection;
  }

  static get subTransactionsCollection() {
    const collection = new ynab.collections.SubTransactionsCollection();
    collection.addItemsFromArray(getEntityManager().getAllSubTransactions());
    return collection;
  }

  static get transactionsCollection() {
    const collection = new ynab.collections.TransactionsCollection();
    collection.addItemsFromArray(getEntityManager().getAllTransactions());
    return collection;
  }
}
