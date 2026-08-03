import moment, { Moment } from 'moment';
import { YNABTransaction } from 'toolkit/types/ynab/data/transaction';
import { DateWithoutTime } from 'toolkit/types/ynab/window/ynab-utilities';

declare module 'moment' {
  interface Moment {
    toUTCMoment(): Moment;
  }
}

/**
 * Filter transactions to only outflows, and optionally non-Ready to Assign inflows.
 * Transfers are kept only when the counterpart account is itself filtered out
 * (i.e. the transfer leaves the visible account set).
 * @param transactions The transactions to filter.
 * @param includeInflows When true, inflows not categorised as "Inflow: Ready to Assign" are included.
 * @param filterOutAccounts Account IDs whose transactions should be excluded.
 * @returns Filtered transactions.
 */
export function filterTransactions(
  transactions: YNABTransaction[],
  includeInflows: boolean,
  filterOutAccounts: ReadonlySet<string>,
) {
  return transactions
    .filter((transaction) => {
      const isOutflow =
        transaction.outflow !== undefined &&
        transaction.outflow !== 0 &&
        (transaction.inflow === undefined || transaction.inflow === 0);

      const isInflow =
        includeInflows &&
        transaction.inflow !== undefined &&
        transaction.inflow > 0 &&
        transaction.subCategoryNameWrapped !== 'Inflow: Ready to Assign';

      return isOutflow || isInflow;
    })
    .filter((transactions) => {
      if (transactions.transferAccountId) {
        // discard unless it transfers outside the selected account list
        return filterOutAccounts.has(transactions.transferAccountId);
      }
      return !filterOutAccounts.has(transactions.accountId);
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
  endDate: DateWithoutTime,
) {
  return transactions.filter((transaction) => {
    return transaction.date >= startDate && transaction.date <= endDate;
  });
}

type GroupedTransactions = Record<string, Record<string, YNABTransaction[]>>;

/**
 * Group transactions into a two-level map of month key → day-of-month → transactions.
 * @param transactions The transactions to group.
 * @returns A record keyed by 'YYYY-MM', whose values are records keyed by day-of-month.
 */
export function groupTransactions(transactions: YNABTransaction[]) {
  const groupedByMonth = groupBy(transactions, 'month');
  const groupedByMonthAndDate: GroupedTransactions = {};

  for (const key of Object.keys(groupedByMonth)) {
    groupedByMonthAndDate[key] = groupBy(groupedByMonth[key], (transaction) =>
      transaction.date.toUTCMoment().date(),
    );
  }

  return groupedByMonthAndDate;
}

interface OutflowData {
  transactions: YNABTransaction[];
  value: number;
}

/**
 * Compute the net outflow (outflow minus inflow) for each day within each month.
 * @param transactions Grouped transactions produced by {@link groupTransactions}.
 * @returns A two-level record of month key → day-of-month → OutflowData.
 */
export function calculateOutflowPerDate(transactions: GroupedTransactions) {
  return mapValues(transactions, (monthData) =>
    mapValues(monthData, (dateData): OutflowData => {
      const netOutflow = dateData.reduce((sum, tx) => {
        const outflow = tx.outflow ?? 0;
        const inflow = tx.inflow ?? 0;
        return sum + outflow - inflow;
      }, 0);

      return {
        transactions: dateData,
        value: netOutflow,
      };
    }),
  );
}

/**
 * Compute a running cumulative net outflow per day within each month.
 * Each day's value is the sum of all net outflows from day 1 through that day.
 * @param transactions Grouped transactions produced by {@link groupTransactions}.
 * @returns A two-level record of month key → day-of-month → cumulative OutflowData.
 */
export function calculateCumulativeOutflowPerDate(transactions: GroupedTransactions) {
  const netOutflowByDate = calculateOutflowPerDate(transactions);

  return mapValues(netOutflowByDate, (monthData) => {
    const cumulativeSum = Object.entries(monthData)
      .sort(([dateA], [dateB]) => parseInt(dateA) - parseInt(dateB))
      .reduce((acc, [dayKey, outflowData]) => {
        const previousValue = acc.length > 0 ? acc[acc.length - 1][1].value : 0;
        const newValue = previousValue + outflowData.value;
        acc.push([
          dayKey,
          {
            ...outflowData,
            value: newValue,
          },
        ]);
        return acc;
      }, [] as [string, OutflowData][]);
    return Object.fromEntries(cumulativeSum);
  });
}

/**
 * Forecast the average daily spending for the remaining days of the current month
 * by examining the same positional window (last N calendar days) across recent
 * historical months.
 *
 * For each lookback month, the last `daysRemaining` days of that month are
 * examined.
 * Months with no transactions at all are skipped to avoid diluting the average
 * with periods that predate YNAB tracking.
 *
 * @param transactions All reportable transactions, filtered for accounts and inflows
 *   but NOT filtered by the report date range (lookback needs unrestricted history).
 * @param lookbackMonths Number of historical months to average over (1–12).
 * @param today The current date, used to determine days remaining and the lookback window.
 * @returns An array of `{ day, value }` pairs where `day` is the calendar day in the
 *   current month and `value` is the average net outflow for that positional slot.
 *   Returns an empty array when today is the last day of the month.
 */
export function calculateAverageDailyForecast(
  transactions: YNABTransaction[],
  lookbackMonths: number,
  today: Moment,
): Array<{ day: number; value: number }> {
  const currentDay = today.date();
  const daysInCurrentMonth = today.daysInMonth();
  const daysRemaining = daysInCurrentMonth - currentDay;

  if (daysRemaining === 0) return [];

  // For each positional slot (0 = first remaining day), collect daily spending from historical months.
  const spendingByPosition: number[][] = Array.from({ length: daysRemaining }, () => []);

  for (let i = 1; i <= lookbackMonths; i++) {
    const hist = today.clone().subtract(i, 'months');
    const histMonthKey = hist.format('YYYY-MM');
    const daysInHistMonth = hist.daysInMonth();

    // Option B: take the last `daysRemaining` days of the historical month.
    const histStartDay = daysInHistMonth - daysRemaining + 1;

    const monthTxs = transactions.filter((t) => t.month === histMonthKey);
    // Skip months with no transactions — they likely predate YNAB tracking and
    // would dilute the average with artificial zeros.
    if (monthTxs.length === 0) continue;

    const byDay = groupBy(monthTxs, (t) => t.date.toUTCMoment().date());

    for (let pos = 0; pos < daysRemaining; pos++) {
      const histDay = histStartDay + pos;
      if (histDay < 1 || histDay > daysInHistMonth) continue;
      const dayTxs = byDay[histDay] ?? [];
      const spending = dayTxs.reduce((sum, t) => sum + (t.outflow ?? 0) - (t.inflow ?? 0), 0);
      spendingByPosition[pos].push(spending);
    }
  }

  return spendingByPosition.map((values, pos) => ({
    day: currentDay + 1 + pos,
    value: values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0,
  }));
}

/**
 * Convert a month/day outflow map into Highcharts line series, one series per month.
 * @param transactions A two-level record of month key ('YYYY-MM') → day-of-month → OutflowData.
 * @param options Optional display overrides applied to every produced series.
 * @param options.dashStyle Highcharts dash style (e.g. 'ShortDot' for forecast overlays).
 * @param options.nameSuffix String appended to each series name (e.g. ' (Scheduled)').
 * @returns An array of Highcharts SeriesLineOptions, one entry per month.
 */
export function toHighchartsSeries(
  transactions: Record<string, Record<string, OutflowData>>,
  options?: { dashStyle?: Highcharts.DashStyleValue; nameSuffix?: string },
): Highcharts.SeriesLineOptions[] {
  return Object.entries(transactions).map(([month, data]) => ({
    name: moment(month, 'YYYY-MM').format('MMM YYYY') + (options?.nameSuffix ?? ''),
    type: 'line',
    dashStyle: options?.dashStyle,
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
    Object.entries(obj).map(([key, item]) => [key, map(item)] as const),
  ) as Record<keyof T, V>;
}

// typescript version of lodash's groupBy
// overloads for more precise inference / better errors
// basic version
function groupBy<T extends object, K extends number | string>(
  list: readonly T[],
  key: (item: T) => K,
): Record<K, T[]>;
// shorthand version
function groupBy<T extends object, K extends keyof T>(
  list: readonly (T & Record<K, number | string>)[],
  key: K,
): Record<T[K] & (number | string), T[]>;
// generics in the implementation are more for checking the implementation
// there will be type errors in callsites if the overloads are removed
function groupBy<T extends object, K extends keyof T | ((item: T) => number | string)>(
  list: readonly (T & Record<Extract<K, keyof T>, number | string>)[],
  keyProp: K,
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
