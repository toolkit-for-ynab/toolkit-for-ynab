/**
 * Generate a Map with keys containing accountIds and value transactions associated with the accountId
 *
 * @param {*} transactions The sorted list of transactions used to map
 * @return {Map} accountToTransactionsMap A Map containing account ids and their corresponding transactions in sorted order
 */
export function mapAccountsToTransactions(transactions) {
  if (!transactions) return;

  // Map each transaction to their respective account id. AccountID => [t1, t2, ... , tn]
  let accountToTransactionsMap = new Map();
  for (let i = 0; i < transactions.length; i++) {
    let transaction = transactions[i];
    if (transaction && transaction.accountId) {
      let accountId = transaction.accountId;
      if (!accountToTransactionsMap.has(accountId)) {
        accountToTransactionsMap.set(accountId, []);
      }
      accountToTransactionsMap.get(accountId).push(transaction);
    }
  }
  return accountToTransactionsMap;
}

/**
 * Given a sorted transactions list, generate a map of data points of
 * Key (Date in UTC Time)
 * Value (object containing, transactions and amount total for that date)
 * Each value contains the following:
 *  - runningTotal: The current amount in the account after a transaction has been applied
 *  - netChange: How much was spent on a particular day
 *  - transactions: An array of transactions for the day
 *
 * @param {Array} transaction The list of transactions to convert to data points
 * @returns Map of date to transactions and amount
 */
export function generateDataPointsMap(transactions) {
  let datapoints = new Map();

  // Keep track of the running total for the graph, the transactions for each date,
  // along with the amount spend that date
  let runningTotal = 0;
  for (let i = 0; i < transactions.length; i++) {
    let transaction = transactions[i];
    let date = transaction.date.getUTCTime();
    runningTotal = runningTotal - transaction.outflow + transaction.inflow;

    // Add the date with empty values if it's a new date
    if (!datapoints.has(date)) {
      datapoints.set(date, {
        runningTotal: 0,
        netChange: 0,
        transactions: [],
      });
    }

    // Update the values of the date with the new values
    let newValues = datapoints.get(date);
    newValues.netChange = newValues.netChange + transaction.inflow - transaction.outflow;
    newValues.transactions.push(transaction);
    newValues.runningTotal = runningTotal;
    datapoints.set(date, newValues);
  }
  return datapoints;
}
