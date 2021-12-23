import random from './random';
import moment from 'moment';

function getWeekNumber(date) {
  return date.diff(moment([1970, 0, 1]).utc(), 'week');
}

function range(start, end) {
  // https://jasonwatmore.com/post/2021/10/02/vanilla-js-create-an-array-with-a-range-of-numbers-in-a-javascript
  return [...Array(end - start + 1).keys()].map((x) => x + start);
}

function makeWeeks(transactions) {
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

function calculateNetWorth(transactions) {
  return transactions?.reduce((acc, t) => acc + t.inflow - t.outflow, 0) || 0;
}

function generateForecast(weeks, netWorth) {
  const weekKeys = Object.keys(weeks);
  const tenYears = Array.from({ length: 10 * 52 }, () => null);

  return tenYears.reduce((accumulator, current, i) => {
    if (!weekKeys.length) return [...accumulator, 0];
    const prev = i > 0 ? accumulator[i - 1] : netWorth;
    if (Number.isNaN(prev)) {
      throw new Error('Not a number');
    }
    const randKey = random(weekKeys);
    return [...accumulator, prev + weeks[randKey]];
  }, []);
}

export function generateForecasts(transactions) {
  const weeks = makeWeeks(transactions);
  const netWorth = calculateNetWorth(transactions);

  return range(0, 99)
    .map(() => generateForecast(weeks, netWorth))
    .sort((a, b) => b[b.length - 1] - a[a.length - 1]);
}
