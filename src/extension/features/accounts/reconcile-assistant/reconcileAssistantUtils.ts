import { YNABTransaction } from 'toolkit/types/ynab/data/transaction';

/**
 * Clear a transaction by clicking on the clear button
 */
export function setTransactionCleared(transaction: YNABTransaction) {
  if (transaction && transaction.entityId && !transaction.isTombstone) {
    let selector: string = `[data-row-id='${transaction.entityId}'] .ynab-grid-cell-cleared`;
    let element: any = document.querySelector(selector);
    if (element && element.querySelector('.is-uncleared-icon')) {
      element.click();
    }
  }
}

/**
 * Generate all subsets for an array
 */
export function generatePowerset(array: Array<YNABTransaction>): Array<Array<YNABTransaction>> {
  let result: Array<Array<YNABTransaction>> = [];
  result.push([]);

  let powersetSize = Math.pow(2, array.length);
  for (let i = 1; i < powersetSize; i++) {
    let subset: Array<YNABTransaction> = [];
    for (let j = 0; j < array.length; j++) {
      // eslint-disable-next-line no-bitwise
      if ((i & (1 << j)) > 0) {
        subset.push(array[j]);
      }
    }
    result.push(subset);
  }
  return result;
}

/**
 * See if any possible transaction combination add up to a specific target
 */
export function findMatchingSum(
  transactionsPowerset: Array<Array<YNABTransaction>>,
  target: number
): Array<Array<YNABTransaction>> {
  let matchingTargets: Array<Array<YNABTransaction>> = [];
  transactionsPowerset.forEach((transactionArray) => {
    let sum: number = transactionArray.reduce(transactionReducer, 0);
    let precision: number = 0.001;
    if (Math.abs(sum - target) < precision) {
      matchingTargets.push(transactionArray);
    }
  });
  return matchingTargets;
}

export function getUnclearedTransactions(
  transactions: Array<YNABTransaction>
): Array<YNABTransaction> {
  return transactions.filter((txn) => txn.cleared && txn.isUncleared?.() && !txn.isTombstone);
}

/**
 * Reducer method to sum up all transactions
 */
export function transactionReducer(accumulator: number, txn: YNABTransaction): number {
  return accumulator + (txn.amount ?? 0);
}
