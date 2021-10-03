/**
 * Clear a transaction by clicking on the clear button
 * @param {Transaction} transaction The transaction to clear
 */
function setTransactionCleared(transaction: Transaction): void {
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
 * @param {Array} array Array to generate powerset for
 * @return {Array<Array>} Array of a all possible subsets
 */
function generatePowerset(array: Array<Transaction>): Array<Array<Transaction>> {
  let result: Array<Array<Transaction>> = [];
  result.push([]);

  let powersetSize = Math.pow(2, array.length);
  for (let i = 1; i < powersetSize; i++) {
    let subset: Array<Transaction> = [];
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
 * @param {Array<Array>} transactionsPowerset The array of transaction combinations to compare against
 * @param {Number} target The sum of transactions that is desired
 * @return {Array<Array>} array of possible transaction combination matches
 */
function findMatchingSum(
  transactionsPowerset: Array<Array<Transaction>>,
  target: number
): Array<Array<Transaction>> {
  let matchingTargets: Array<Array<Transaction>> = [];
  transactionsPowerset.forEach((transactionArray) => {
    let sum: number = transactionArray.reduce(transactionReducer, 0);
    let precision: number = 0.001;
    if (Math.abs(sum - target) < precision) {
      matchingTargets.push(transactionArray);
    }
  });
  return matchingTargets;
}

function getUnclearedTransactions(transactions: Array<Transaction>): Array<Transaction> {
  return transactions.filter((txn) => txn.cleared && txn.isUncleared() && !txn.isTombstone);
}

/**
 * Reducer method to sum up all transactions
 * @param {Number} accumulator The current accumulator
 * @param {Transaction} txn The current transaction
 * @returns {Number} The combined sum
 */
function transactionReducer(accumulator: number, txn: Transaction): number {
  return accumulator + txn.amount;
}

/**
 * Find any uncleared transactions that add up to the desired sum
 * @param transactions The array of transactions
 * @param targetSum The targeted balance to match
 * @returns Possible sets of transactions adding up to the targeted balance
 */
function findMatchingTransactions(
  transactions: Array<Transaction>,
  targetSum: number
): Array<Array<Transaction>> {
  let unclearedTransactions: Array<Transaction> = getUnclearedTransactions(transactions);
  let transactionPowerset: Array<Array<Transaction>> = generatePowerset(unclearedTransactions);
  return findMatchingSum(transactionPowerset, targetSum);
}

export {
  setTransactionCleared,
  generatePowerset,
  findMatchingSum,
  transactionReducer,
  findMatchingTransactions,
};
