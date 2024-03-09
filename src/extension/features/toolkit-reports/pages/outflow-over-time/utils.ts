import moment, { Moment } from 'moment';
import { YNABTransaction } from 'toolkit/types/ynab/data/transaction';
import { DateWithoutTime } from 'toolkit/types/ynab/window/ynab-utilities';

declare module 'moment' {
  interface Moment {
    toUTCMoment(): Moment;
  }
}

export function filterTransactions(
  transactions: YNABTransaction[],
  filterOutAccounts: ReadonlySet<string>
) {
  return transactions
    .filter((transaction) => {
      return (
        transaction.outflow !== undefined &&
        transaction.outflow !== 0 &&
        (transaction.inflow === undefined || transaction.inflow === 0)
      );
    })
    .filter((transactionsWithoutInflow) => {
      if (transactionsWithoutInflow.transferAccountId) {
        // discard unless it transfers outside the selected account list
        return filterOutAccounts.has(transactionsWithoutInflow.transferAccountId);
      }
      return !filterOutAccounts.has(transactionsWithoutInflow.accountId);
    });
}

/**
 * Filter the passed transactions to only include those within the specified date range.
 * @param transactions The array of transactions to be filtered.
 * @param startDate The start date of the desired date range.
 * @param endDate The end date of the desired date range.
 * @returns A new array containing only the transactions that fall within the specified date range.
 */
export function filterTransactionsByDate(
  transactions: YNABTransaction[],
  startDate: DateWithoutTime,
  endDate: DateWithoutTime
) {
  return transactions.filter((transaction) => {
    return transaction.date >= startDate && transaction.date <= endDate;
  });
}

type GroupedTransactions = Record<string, Record<string, YNABTransaction[]>>;

export function groupTransactions(transactions: YNABTransaction[]) {
  const groupedByMonth = groupBy(transactions, 'month');
  const groupedByMonthAndDate: GroupedTransactions = {};

  for (const key of Object.keys(groupedByMonth)) {
    groupedByMonthAndDate[key] = groupBy(groupedByMonth[key], (transaction) =>
      transaction.date.toUTCMoment().date()
    );
  }

  return groupedByMonthAndDate;
}

interface OutflowData {
  transactions: YNABTransaction[];
  value: number;
}

export function calculateOutflowPerDate(transactions: GroupedTransactions) {
  return mapValues(transactions, (monthData) =>
    mapValues(
      monthData,
      (dateData): OutflowData => ({
        transactions: dateData,
        value: dateData.reduce((s, a) => s + a.outflow!, 0),
      })
    )
  );
}

export function calculateCumulativeOutflowPerDate(transactions: GroupedTransactions) {
  return mapValues(calculateOutflowPerDate(transactions), (monthData) => {
    const cumulativeSum = Object.entries(monthData).reduce((acc, [key, n]) => {
      acc.push([
        key,
        {
          ...n,
          value: (acc.length > 0 ? acc[acc.length - 1][1].value : 0) + n.value,
        },
      ]);
      return acc;
    }, [] as [keyof typeof monthData, OutflowData][]);
    return Object.fromEntries(cumulativeSum);
  });
}

export function toHighchartsSeries(
  transactions: Record<string, Record<string, OutflowData>>
): Highcharts.SeriesLineOptions[] {
  return Object.entries(transactions).map(([month, data]) => ({
    name: moment(month, 'YYYY-MM').format('MMM YYYY'),
    type: 'line',
    data: Object.entries(data).map(([date, { value, transactions }]) => ({
      x: parseInt(date),
      y: value,
      custom: transactions,
    })),
  }));
}

// typescript version of lodash's mapValues (without shorthand support)
// it's just a slightly better typed / more readable fromEntries+entries use
function mapValues<T extends object, V>(obj: T, map: (item: T[keyof T]) => V) {
  return Object.fromEntries(
    Object.entries(obj).map(([key, item]) => [key, map(item)] as const)
  ) as Record<keyof T, V>;
}

// typescript version of lodash's groupBy
// overloads for more precise inference / better errors
// basic version
function groupBy<T extends object, K extends number | string>(
  list: readonly T[],
  key: (item: T) => K
): Record<K, T[]>;
// shorthand version
function groupBy<T extends object, K extends keyof T>(
  list: readonly (T & Record<K, number | string>)[],
  key: K
): Record<T[K] & (number | string), T[]>;
// generics in the implementation are more for checking the implementation
// there will be type errors in callsites if the overloads are removed
function groupBy<T extends object, K extends keyof T | ((item: T) => number | string)>(
  list: readonly (T & Record<Extract<K, keyof T>, number | string>)[],
  keyProp: K
) {
  type ResultK =
    | (T[Extract<K, keyof T>] & (number | string))
    | ReturnType<Extract<K, (item: T) => number | string>>;

  const keyFn =
    typeof keyProp === 'function'
      ? (keyProp as (item: T) => ResultK)
      : (item: T) => item[keyProp as keyof T] as ResultK;

  return list.reduce((acc, item) => {
    const key = keyFn(item);
    void (acc[key] ?? (acc[key] = [])).push(item);
    return acc;
  }, {} as Record<ResultK, T[]>);
}
