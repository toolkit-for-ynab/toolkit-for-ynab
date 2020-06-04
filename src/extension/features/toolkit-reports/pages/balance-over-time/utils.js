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
 * Given transactions list, generate a map of data points of
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

  // Apply the date filters
  let sortedTransactions = transactions.sort(
    (t1, t2) => t1.date.getUTCTime() - t2.date.getUTCTime()
  );

  // Keep track of the running total for the graph, the transactions for each date,
  // along with the amount spend that date
  let runningTotal = 0;
  let lastKnownTotal = 0;
  for (let i = 0; i < sortedTransactions.length; i++) {
    let transaction = sortedTransactions[i];
    let date = transaction.date.getUTCTime();
    lastKnownTotal = runningTotal;
    runningTotal = runningTotal - transaction.outflow + transaction.inflow;

    // Add the date with empty values if it's a new date
    if (!datapoints.has(date)) {
      datapoints.set(date, {
        lastKnownTotal: 0,
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
    newValues.lastKnownTotal = lastKnownTotal;
    datapoints.set(date, newValues);
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

  // Keep track of the first and last known dates
  let firstDataPointDateUTC = Number.MAX_VALUE;
  let lastDataPointDateUTC = Number.MIN_VALUE;

  dataPointsMap.forEach((values, date) => {
    firstDataPointDateUTC = Math.min(firstDataPointDateUTC, date);
    lastDataPointDateUTC = Math.max(lastDataPointDateUTC, date);
    resultData.push({
      x: date,
      y: values.runningTotal,
      netChange: values.netChange,
      transactions: values.transactions,
    });
  });

  // Calculate our boundaries
  // The first day should be the first day of the month of the first data point
  // let firstDataPointDate = new Date(firstDataPointDateUTC);
  // let firstDay = new Date(firstDataPointDate.getFullYear(), firstDataPointDate.getMonth(), 1);
  // // Add an extra data point on the first day if the first data points starts in mid month
  // if (
  //   firstDataPointDate &&
  //   firstDay &&
  //   !moment(firstDay).isSame(moment(firstDataPointDate), 'date') &&
  //   dataPointsMap.size > 0 &&
  //   dataPointsMap.get(firstDataPointDateUTC).lastKnownTotal !== 0
  // ) {
  //   console.log(isSameDay(firstDataPointDate, firstDay));
  //   console.log('Adding new point' + firstDay);
  //   resultData.unshift({
  //     x: moment(firstDay).valueOf(),
  //     y: dataPointsMap.get(firstDataPointDateUTC).lastKnownTotal,
  //     netChange: 0,
  //     transactions: [],
  //   });
  // }

  // let lastDataPointDate = new Date(firstDataPointDateUTC);
  // let lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  // compare with the dates first and last dates of the month
  // case: both first and last date should be applied
  // case: only first date should be applied
  // case: only last date should be applied
  return resultData;
}

/**
 * Generate a date filter to the datapoints and return all datapoints within the date range
 * @param {} fromDate The starting date to filter from
 * @param {*} toDate The end date to filter to
 * @param {Map} datapoints Map of dates in UTC to their corresponding datapoints
 */
export const applyDateFilterToDataPoints = (fromDate, toDate, datapoints) => {
  let filteredDatapoints = new Map();
  datapoints.forEach((data, dateUTC) => {
    if (dateUTC >= fromDate.getUTCTime() && dateUTC <= toDate.getUTCTime()) {
      console.log('Setting datal');
      filteredDatapoints.set(dateUTC, data);
    }
  });
  console.log(filteredDatapoints);
  return filteredDatapoints;
};

const isSameDay = (dayOne, dayTwo) => {
  return (
    dayOne.getFullYear() === dayTwo.getFullYear() &&
    dayOne.getMonth() === dayTwo.getMonth() &&
    dayOne.getDate() === dayTwo.getDate()
  );
};
