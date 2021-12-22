import random from './random';

function range(start, end) {
  // https://jasonwatmore.com/post/2021/10/02/vanilla-js-create-an-array-with-a-range-of-numbers-in-a-javascript
  return [...Array(end - start + 1).keys()].map((x) => x + start);
}

function makeWeeks(transactions) {
  const pool = transactions?.flat() || [];

  if (!pool.length) return [];

  const firstDateNumber = pool[0].date.isoWeek();
  const lastDateNumber = pool[pool.length - 1].date.isoWeek();

  return range(firstDateNumber, lastDateNumber).reduce((accumulator, current) => {
    const matches = pool.filter((t) => t.date.isoWeek() === current);
    return {
      ...accumulator,
      [current]: matches.reduce((acc, cur) => acc + cur.inflow - cur.outflow, 0),
    };
  }, {});
}

function generateForecast(weeks) {
  const weekKeys = Object.keys(weeks);
  const tenYears = Array.from({ length: 10 * 52 }, () => null);

  return tenYears.reduce((accumulator, current, i) => {
    const prev = i > 0 ? accumulator[i - 1] : 0;
    return [...accumulator, prev + weeks[random(weekKeys)]];
  }, []);
}

export function generateForecasts(transactions) {
  const weeks = makeWeeks(transactions);

  return {
    10: generateForecast(weeks),
    25: generateForecast(weeks),
    50: generateForecast(weeks),
    75: generateForecast(weeks),
    90: generateForecast(weeks),
  };
}
