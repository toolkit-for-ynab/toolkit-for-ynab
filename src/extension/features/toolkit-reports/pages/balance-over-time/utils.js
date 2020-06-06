// Common util methods to help generating a running total

export const NEW_DATAPOINT = () => {
  return {
    runningTotal: 0,
    netChange: 0,
    transactions: [],
  };
};

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

  // Map accounts to transactions and dates to transactions (Used to cross reference eachother)
  let accountsToTransactionsMap = mapAccountsToTransactions(reportedTransactions);
  let dateToTransactionsMap = mapDateToTransactions(reportedTransactions);

  accountsToTransactionsMap.forEach((transactionsForAcc, accountId) => {
    calculatedRunningBalanceMap.set(
      accountId,
      generateDataPointsForAccount(accountId, dateToTransactionsMap, firstTransactionDate, now)
    );
  });
  // Want: Account ID -> Map<Date, Object>
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
 * Generate a Map with:
 * keys - accountId
 * values - Array of transactions for that account
 *
 * @param {*} transactions The transactions to use
 * @return {Map} accountToTransactionsMap A Map containing account ids and their corresponding transactions in sorted order
 */
export const mapDateToTransactions = transactions => {
  let dateToTransactionsMap = new Map();
  if (!transactions) return dateToTransactionsMap;

  // Map each transaction to their respective account id. AccountID => [t1, t2, ... , tn]
  transactions.forEach(transaction => {
    if (transaction && transaction.date) {
      let date = moment(transaction.date.getUTCTime())
        .utc()
        .valueOf();
      if (!dateToTransactionsMap.has(date)) {
        dateToTransactionsMap.set(date, []);
      }
      dateToTransactionsMap.get(date).push(transaction);
    }
  });
  return dateToTransactionsMap;
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
    emptyDateMap.set(currDate.utc().valueOf(), NEW_DATAPOINT());
    currDate.add(1, 'days');
  }
  return emptyDateMap;
};

/**
 * Generate a map of datapoints for the given transactions and account
 * Keys: Date (UTC Time)
 * Values: Object
 *    - transactions: All the transactions for the given day
 *    - runningTotal: The current running total based off all transactions given (sum of inflows and outflows up to the current date)
 *    - netChange: How much has changed since the previous day
 * @param {*} accountId The accountId to filter by
 * @param {*} dateToAllTransactions Map of dates in utc to transactions
 * @param {Moment Object} startDate The start date
 * @param {Moment Object} endDate The end date
 */
export function generateDataPointsForAccount(accountId, dateToAllTransactions, startDate, endDate) {
  let datapoints = generateEmptyDateMap(startDate, endDate);

  // Keep track of the relevant dates
  let currDate = startDate.clone();

  // Keep track of a running total and prev runningTotal
  let runningTotal = 0;

  // Iterate through all days and populate the datapoints
  while (currDate.isSameOrBefore(endDate)) {
    let currDateUTC = currDate.utc();
    let datapointKey = currDateUTC.valueOf();

    // Get all the transactions for the current day (only search if theres any transactions for the given day)
    let accountTransactionsForDay = [];
    if (dateToAllTransactions.has(datapointKey)) {
      let transactionsOnDate = dateToAllTransactions.get(datapointKey);
      accountTransactionsForDay = transactionsOnDate.filter(transaction => {
        return transaction.accountId && transaction.accountId === accountId;
      });
    }

    // Sum up all the account transactions for the day add it to the running total
    let totalForDay = accountTransactionsForDay.reduce((accum, transaction) => {
      return accum - transaction.outflow + transaction.inflow;
    }, 0);
    runningTotal += totalForDay;

    // Set the new values
    let newDataPoint = {
      transactions: accountTransactionsForDay,
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
export const dataPointsToHighChartSeries = dataPointsMap => {
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
};

/**
 * Given an array of maps containing dateUTC to corresponding datapoints,
 * combine them into a single map.
 * @param {} datapointsArray
 * @return {Map}
 */
export const combineDataPoints = datapointsArray => {
  let combinedDataPoints = new Map();
  datapointsArray.forEach(datapoints => {
    datapoints.forEach((data, dateUTC) => {
      if (!combinedDataPoints.has(dateUTC)) {
        combinedDataPoints.set(dateUTC, NEW_DATAPOINT());
      }
      let prevDataPoint = combinedDataPoints.get(dateUTC);
      let newDataPoint = NEW_DATAPOINT();
      newDataPoint.runningTotal = prevDataPoint.runningTotal + data.runningTotal;
      newDataPoint.netChange = prevDataPoint.netChange + data.netChange;
      newDataPoint.transactions = prevDataPoint.transactions.concat(data.transactions);
      combinedDataPoints.set(dateUTC, newDataPoint);
    });
  });
  console.log(combinedDataPoints);
  return combinedDataPoints;
};
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
