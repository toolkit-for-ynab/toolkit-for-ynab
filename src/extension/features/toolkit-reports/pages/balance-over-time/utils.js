// Common util methods to help generating a running total

/**
 * Generate a running balance map for each account in the current budget
 * Keys: Account Ids
 * Values: Maps of dates (UTC Time) to datapoints (Object containing runningTotal, transactions for the day, netchange for day)
 *
 * @param {*} reportedTransactions The transactions used to calculate the running total
 */
export const generateRunningBalanceMap = reportedTransactions => {
  let calculatedRunningBalanceMap = new Map();
  if (reportedTransactions.length === 0) return calculatedRunningBalanceMap;

  // Get the date of the very first transaction
  let sortedTransactions = reportedTransactions.sort(
    (t1, t2) => t1.date.getUTCTime() - t2.date.getUTCTime()
  );

  // Add in the datapoints for each of the accounts
  let firstTransactionDate = moment(sortedTransactions[0].date.getUTCTime()).utc();
  let now = moment().utc();

  // Map buckets to their respective datapoints
  let accountsToTransactionsMap = mapAccountsToTransactions(reportedTransactions);
  accountsToTransactionsMap.forEach((transactions, accountId) => {
    calculatedRunningBalanceMap.set(
      accountId,
      generateDataPointsMap(transactions, firstTransactionDate, now)
    );
  });
  return calculatedRunningBalanceMap;
};

/**
 * Generate a Map with:
 * keys - accountId
 * values - Array of transactions for that account
 *
 * @param {*} transactions The transactions to use
 * @return {Map} accountToTransactionsMap A Map containing account ids and their corresponding transactions in sorted order
 */
export const mapAccountsToTransactions = transactions => {
  let accountToTransactionsMap = new Map();
  if (!transactions) return accountToTransactionsMap;

  // Map each transaction to their respective account id. AccountID => [t1, t2, ... , tn]
  transactions.forEach(transaction => {
    if (transaction && transaction.accountId) {
      let accountId = transaction.accountId;
      if (!accountToTransactionsMap.has(accountId)) {
        accountToTransactionsMap.set(accountId, []);
      }
      accountToTransactionsMap.get(accountId).push(transaction);
    }
  });
  return accountToTransactionsMap;
};

/**
 * Generate a map with keys of all days between the starting date and the end date
 *
 * @param {MomentDate} startDate The starting date (Moment Object)
 * @param {MomentDate} endDate The end date (Moment Object)
 * @return {Map} Map containing keys of all days between start and end date, mapping to empty object
 */
export const generateEmptyDateMap = (startDate, endDate) => {
  let emptyDateMap = new Map();
  let currDate = startDate.clone();
  while (currDate.isSameOrBefore(endDate)) {
    emptyDateMap.set(currDate.utc().valueOf(), {});
    currDate.add(1, 'days');
  }
  return emptyDateMap;
};

/**
 * Generate a map of datapoints for the given transactions
 * Keys: Date (UTC Time)
 * Values: Object
 *    - transactions: All the transactions for the given day
 *    - runningTotal: The current running total based off all transactions given (sum of inflows and outflows up to the current date)
 *    - netChange: How much has changed since the previous day
 *
 * @param {Array<Transactions>} transactions Transactions used to generate datapoints for
 * @param {MomentDate} startDate The starting date
 * @param {MomentDate} endDate The ending date
 * @return Map of dates to datapoints
 */
export function generateDataPointsMap(transactions, startDate, endDate) {
  if (transactions.length === 0) return new Map();
  let datapoints = generateEmptyDateMap(startDate, endDate);

  // Keep track of the relevant dates
  let currDate = startDate.clone();

  // Keep track of a running total and prev runningTotal
  let runningTotal = 0;

  // Iterate through all days and populate the datapoints
  while (currDate.isSameOrBefore(endDate)) {
    let currDateUTC = currDate.utc();
    let datapointKey = currDateUTC.valueOf();

    // Get all the transactions for the current day
    let transactionsForDay = transactions.filter(transaction =>
      moment(transaction.date.getUTCTime())
        .utc()
        .isSame(currDateUTC, 'date')
    );

    // Sum up all the transactions for the day add it to the running total
    let totalForDay = transactionsForDay.reduce((accum, transaction) => {
      return accum - transaction.outflow + transaction.inflow;
    }, 0);
    runningTotal += totalForDay;

    // Set the new values
    let newDataPoint = {
      transactions: transactionsForDay,
      runningTotal: runningTotal,
      netChange: totalForDay,
    };
    datapoints.set(datapointKey, newDataPoint);
    currDate = currDate.add(1, 'days');
  }
  return datapoints;
}

/**
 * Generate the series to be fed into HighCharts
 * @param {Map} dataPointsMap Map of dates in UTC to data
 * @returns {Array} Array containing the HighChart Points
 */
export function dataPointsToHighChartSeries(dataPointsMap) {
  let resultData = [];

  dataPointsMap.forEach((datapoint, date) => {
    resultData.push({
      x: date,
      y: datapoint.runningTotal,
      netChange: datapoint.netChange,
      transactions: datapoint.transactions,
    });
  });
  return resultData;
}

/**
 * Generate a date filter to the datapoints and return all datapoints within the date range
 * @param {} fromDate The starting date to filter from
 * @param {*} toDate The end date to filter to
 * @param {Map} datapoints Map of dates in UTC to their corresponding datapoint
 */
export const applyDateFiltersToDataPoints = (fromDate, toDate, datapoints) => {
  let filteredDatapoints = new Map();
  datapoints.forEach((data, dateUTC) => {
    if (dateUTC >= fromDate.getUTCTime() && dateUTC <= toDate.getUTCTime()) {
      filteredDatapoints.set(dateUTC, data);
    }
  });
  return filteredDatapoints;
};
