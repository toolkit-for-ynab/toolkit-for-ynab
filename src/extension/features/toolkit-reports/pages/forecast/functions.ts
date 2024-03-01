import { YNABTransaction } from 'toolkit/types/ynab/data/transaction';
import random from './random';
import moment, { Moment } from 'moment';
import { ReportContextType } from '../../common/components/report-context';

function getWeekNumber(date: Moment) {
  return date.diff(moment([1970, 0, 1]).utc(), 'week');
}

function range(start: number, end: number) {
  // https://jasonwatmore.com/post/2021/10/02/vanilla-js-create-an-array-with-a-range-of-numbers-in-a-javascript
  return [...Array(end - start + 1).keys()].map((x) => x + start);
}

function makeWeeks(transactions: YNABTransaction[]): Record<number, number> {
  if (!transactions?.length) return [];

  const startWeek = getWeekNumber(transactions[0].date.toUTCMoment());
  const endWeek = getWeekNumber(transactions[transactions.length - 1].date.toUTCMoment());

  return range(startWeek, endWeek).reduce((accumulator, current) => {
    const matches = transactions.filter(
      (t) => getWeekNumber(t.date.toUTCMoment()) === current && t.payeeName !== 'Starting Balance'
    );
    return {
      ...accumulator,
      [current]: matches.reduce((acc, cur) => acc + cur.inflow - cur.outflow, 0),
    };
  }, {});
}

function calculateNetWorth(transactions: YNABTransaction[]) {
  return transactions?.reduce((acc, t) => acc + t.inflow - t.outflow, 0) || 0;
}

function generateForecast(weeks: Record<number | string, number>, netWorth: number) {
  const weekKeys = Object.keys(weeks);
  const tenYears = Array.from({ length: 10 * 52 }, () => null);

  return tenYears.reduce((accumulator, _, i) => {
    if (!weekKeys.length) return [...accumulator, 0];
    const prev = i > 0 ? accumulator[i - 1] : netWorth;
    if (Number.isNaN(prev)) {
      throw new Error('Not a number');
    }
    const randKey = random(weekKeys);
    return [...accumulator, prev + weeks[randKey]];
  }, [] as number[]);
}

export function generateForecasts(
  transactions: YNABTransaction[],
  allReportableTransactions: YNABTransaction[],
  filters: ReportContextType['filters']
) {
  const weeks = makeWeeks(transactions);
  const netWorth = calculateNetWorth(
    allReportableTransactions.filter((t) => !filters?.accountFilterIds.has(t.accountId))
  );

  return range(0, 99)
    .map(() => generateForecast(weeks, netWorth))
    .sort((a, b) => b[b.length - 1] - a[a.length - 1]);
}
