import { getEntityManager } from './ynab';

export class Collections {
  static _accountsCollection = null;
  static _accountCalculationsCollection = null;

  static get accountsCollection() {
    if (!this._accountsCollection) {
      Collections._accountsCollection = new ynab.collections.AccountsCollection();
      Collections._accountsCollection.addItemsFromArray(getEntityManager().getAllAccounts());
    }

    return Collections._accountsCollection;
  }

  static get accountCalculationsCollection() {
    if (!this._accountCalculationsCollection) {
      Collections._accountCalculationsCollection = new ynab.collections.AccountCalculationsCollection();
      Collections._accountCalculationsCollection.addItemsFromArray(getEntityManager().getAllAccountCalculations());
    }

    return Collections._accountCalculationsCollection;
  }
}
