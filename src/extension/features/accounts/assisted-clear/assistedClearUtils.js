/**
 * Clear a transaction by clicking on the clear button
 * @param {Transaction} transaction The transaction to clear
 */
export const setTransactionCleared = transaction => {
  if (transaction && transaction.entityId && !transaction.isTombstone) {
    let selector = `[data-row-id='${transaction.entityId}'] .ynab-grid-cell-cleared`;
    let element = document.querySelector(selector);
    if (element && element.querySelector('.is-uncleared-icon')) {
      element.click();
    }
  }
};

/**
 * Generate all subsets for an array
 * @param {Array} array Array to generate powerset for
 * @return {Array<Array>} Array of a all possible subsets
 */
export const generatePowerset = array => {
  let result = [];
  result.push([]);

  let powersetSize = Math.pow(2, array.length);
  for (let i = 1; i < powersetSize; i++) {
    let subset = [];
    for (let j = 0; j < array.length; j++) {
      // eslint-disable-next-line no-bitwise
      if ((i & (1 << j)) > 0) {
        subset.push(array[j]);
      }
    }
    result.push(subset);
  }
  return result;
};

/**
 * See if any possible transaction combination add up to a specific target
 * @param {Array<Array>} transactionsPowerset The array of transaction combinations to compare against
 * @param {Float} target The sum of transactions that is desired
 * @return {Array<Array>} array of possible transaction combination matches
 */
export const findMatchingSum = (transactionsPowerset, target) => {
  let matchingTargets = [];
  transactionsPowerset.forEach(transactionArray => {
    let sum = transactionArray.reduce(transactionReducer, 0);
    let precision = 0.001;
    if (Math.abs(sum - target) < precision) {
      matchingTargets.push(transactionArray);
    }
  });
  return matchingTargets;
};

/**
 * Reducer method to sum up all transactions
 * @param {Number} accumulator The current accumulator
 * @param {Transaction} txn The current transaction
 * @returns {Number} The combined sum
 */
export const transactionReducer = (accumulator, txn) => {
  return accumulator + txn.amount;
};
