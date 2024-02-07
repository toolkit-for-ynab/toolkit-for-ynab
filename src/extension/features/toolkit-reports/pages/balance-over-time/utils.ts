// Common util methods to help generate a running total
import regression from 'regression';
import moment, { Moment } from 'moment';
import { YNABTransaction } from 'toolkit/types/ynab/data/transaction';
import { DateWithoutTime } from 'toolkit/types/ynab/window/ynab-utilities';

// Constant for how many datapoints to allow per graph line
// https://api.highcharts.com/highcharts/plotOptions.series.turboThreshold
// Change this as necessary. There is a datapoint everyday so 365 * Num Years desired
export const NUM_DATAPOINTS_LIMIT = 20000;

export type Datapoint = {
  runningTotal: number;
  netChange: number;
  transactions: YNABTransaction[];
};

export type PointPayload = {
  x: number;
  y: number;
  netChange: number;
  transactions: YNABTransaction[];
};

export const createEmptyDatapoint = (): Datapoint => {
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
 * @return {Map} Map of account ids to their datapointsMap (date -> datapoint)
 */
export const generateRunningBalanceMap = (reportedTransactions: YNABTransaction[]) => {
  let calculatedRunningBalanceMap = new Map<string, Map<number, Datapoint>>();
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

  // Generate datapoints for each of the accounts
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
 * @return {Map} accountToTransactionsMap A Map containing account ids and their corresponding transactions
 */
export const mapAccountsToTransactions = (transactions: YNABTransaction[]) => {
  let accountToTransactionsMap = new Map();
  if (!transactions) return accountToTransactionsMap;

  // Map each transaction to their respective account id. AccountID => [t1, t2, ... , tn]
  transactions.forEach((transaction) => {
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

export const mapDateToTransactions = (transactions: YNABTransaction[]) => {
  let dateToTransactionsMap = new Map<number, YNABTransaction[]>();
  if (!transactions) return dateToTransactionsMap;

  // Map each transaction to their respective dates. DateUTC => [t1, t2, ... , tn]
  transactions.forEach((transaction) => {
    if (transaction && transaction.date) {
      let date = moment(transaction.date.getUTCTime()).utc().valueOf();
      if (!dateToTransactionsMap.has(date)) {
        dateToTransactionsMap.set(date, []);
      }
      dateToTransactionsMap.get(date)!.push(transaction);
    }
  });
  return dateToTransactionsMap;
};

/**
 * Generate a map with keys of all days between the starting date and the end date
 */
export const generateEmptyDateMap = (startDate: Moment, endDate: Moment) => {
  let emptyDateMap = new Map<number, Datapoint>();
  let currDate = startDate.clone();
  while (currDate.isSameOrBefore(endDate)) {
    emptyDateMap.set(currDate.utc().valueOf(), createEmptyDatapoint());
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
 */
export const generateDataPointsForAccount = (
  accountId: string,
  dateToAllTransactions: Map<number, YNABTransaction[]>,
  startDate: Moment,
  endDate: Moment
) => {
  let datapoints = generateEmptyDateMap(startDate, endDate);
  let currDate = startDate.clone();
  let runningTotal = 0;

  // Iterate through all days and populate the datapoints
  while (currDate.isSameOrBefore(endDate)) {
    let currDateUTC = currDate.utc();
    let datapointKey = currDateUTC.valueOf();

    // Get all the transactions for the current day (only search if theres any transactions for the given day)
    let accountTransactionsForDay: YNABTransaction[] = [];
    if (dateToAllTransactions.has(datapointKey)) {
      let transactionsOnDate = dateToAllTransactions.get(datapointKey)!;
      accountTransactionsForDay = transactionsOnDate.filter((transaction) => {
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
};

/**
 * Generate the series to be fed into HighCharts
 * @param {Map} dataPointsMap Map of dates in UTC to data
 * @returns {Array} Array containing the HighChart Points
 */
export const dataPointsToHighChartSeries = (dataPointsMap: Map<number, Datapoint>) => {
  let resultData: PointPayload[] = [];
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
 * Use a linear regression to calculate a line of best fit based off the given datapoints
 * @param {*} datapoints The datapoints to generate the trendline for
 * @return {Array} array of datapoints for the trendline
 */
export const generateTrendLine = (datapoints: PointPayload[]) => {
  let normalizedDataPoints = datapoints.map((datapoint): [number, number] => [
    datapoint.x,
    datapoint.y,
  ]);
  let linearRegression = regression.linear(normalizedDataPoints, { precision: 10 });
  return linearRegression.points;
};

/**
 * Given an array of maps containing dateUTC to corresponding datapoints,
 * combine them into a single map.
 * @param {} datapointsArray
 * @return {Map} Single map of dateUTC to corresponding datapoints
 */
export const combineDataPoints = (datapointsArray: Map<number, Datapoint>[]) => {
  let combinedDataPoints = new Map();
  datapointsArray.forEach((datapoints) => {
    datapoints.forEach((data, dateUTC) => {
      if (!combinedDataPoints.has(dateUTC)) {
        combinedDataPoints.set(dateUTC, createEmptyDatapoint());
      }
      let prevDataPoint = combinedDataPoints.get(dateUTC);
      let newDataPoint = createEmptyDatapoint();
      newDataPoint.runningTotal = prevDataPoint.runningTotal + data.runningTotal;
      newDataPoint.netChange = prevDataPoint.netChange + data.netChange;
      newDataPoint.transactions = prevDataPoint.transactions.concat(data.transactions);
      combinedDataPoints.set(dateUTC, newDataPoint);
    });
  });
  return combinedDataPoints;
};

/**
 * Apply a date filter to the datapoints and return all datapoints within the date range
 * @param {} fromDate The starting date to filter from
 * @param {*} toDate The end date to filter to
 * @param {Map} datapoints Map of dates in UTC to their corresponding datapoint
 */
export const applyDateFiltersToDataPoints = (
  fromDate: DateWithoutTime,
  toDate: DateWithoutTime,
  datapoints: Map<number, Datapoint>
) => {
  let filteredDatapoints = new Map<number, Datapoint>();
  datapoints.forEach((data, dateUTC) => {
    if (dateUTC >= fromDate.getUTCTime() && dateUTC <= toDate.getUTCTime()) {
      filteredDatapoints.set(dateUTC, data);
    }
  });
  return filteredDatapoints;
};

/**
 * Check if a given series has reached the number of datapoints limit
 * @param {Object} series The individual series to check
 */
export const checkSeriesLimitReached = (series?: { data: unknown[] }) => {
  return series && series.data && series.data.length >= NUM_DATAPOINTS_LIMIT;
};
