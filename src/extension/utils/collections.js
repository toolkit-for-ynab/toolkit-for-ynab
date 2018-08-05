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
}
