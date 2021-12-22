import { generateForecasts } from './functions';
import random from './random';
import moment from 'moment';

jest.mock('./random');

function makeTransactions(inputGroups) {
  return inputGroups.map((inputs) =>
    inputs.map((input) => ({
      inflow: 0,
      outflow: 0,
      date: moment('1995-12-25').utc(),
      ...input,
    }))
  );
}

function getForecastsResult(inputGroups) {
  return generateForecasts(makeTransactions(inputGroups));
}

describe('forecast page functions', () => {
  beforeEach(() => random.mockImplementation((list) => list[0]));

  it('returns various confidences', async () => {
    const result = generateForecasts();

    expect(result).toHaveProperty('10');
    expect(result).toHaveProperty('25');
    expect(result).toHaveProperty('50');
    expect(result).toHaveProperty('75');
    expect(result).toHaveProperty('90');
  });

  it('generates forecasts using transactions', async () => {
    const result = getForecastsResult([[{ inflow: 1 }]]);

    const expected = Array.from({ length: 10 * 52 }, (v, i) => i + 1);

    expect(result).toHaveProperty('10', expected);
  });

  it('uses transactions', async () => {
    const result = getForecastsResult([[{ inflow: 2 }]]);

    const expected = Array.from({ length: 10 * 52 }, (v, i) => (i + 1) * 2);

    expect(result).toHaveProperty('10', expected);
  });

  it('supports outflows', async () => {
    const result = getForecastsResult([[{ outflow: 1 }]]);

    const expected = Array.from({ length: 10 * 52 }, (v, i) => (i + 1) * -1);

    expect(result).toHaveProperty('10', expected);
  });

  it('generates forecasts for all confidences', async () => {
    const result = getForecastsResult([[{ inflow: 1 }]]);

    const expected = Array.from({ length: 10 * 52 }, (v, i) => i + 1);

    Object.keys(result).forEach((k) => expect(result).toHaveProperty(k, expected));
  });

  it('selects weeks at random', async () => {
    random.mockImplementation((list) => list[1]);

    const result = getForecastsResult([
      [
        { inflow: 1, date: moment('1995-11-20').utc() },
        { inflow: 2, date: moment('1995-11-27').utc() },
      ],
    ]);

    const expected = Array.from({ length: 10 * 52 }, (v, i) => (i + 1) * 2);

    expect(result).toHaveProperty('10', expected);
  });

  it('uses transactions from all groups', async () => {
    random.mockImplementation((list) => list[0]);

    const result = getForecastsResult([[{ inflow: 1 }], [{ inflow: 1 }]]);

    const expected = Array.from({ length: 10 * 52 }, (v, i) => (i + 1) * 2);

    expect(result).toHaveProperty('10', expected);
  });

  it('sums weeks', async () => {
    const result = getForecastsResult([
      [
        {
          inflow: 1,
          date: moment('1995-12-25').utc(),
        },
        {
          inflow: 1,
          date: moment('1995-12-26').utc(),
        },
      ],
    ]);

    const expected = Array.from({ length: 10 * 52 }, (v, i) => (i + 1) * 2);

    expect(result).toHaveProperty('10', expected);
  });

  it('uses multiple random weeks in a forecast', async () => {
    let lastCall = 1;

    random.mockImplementation((list) => {
      lastCall = lastCall ? 0 : 1;
      return list[lastCall];
    });

    const result = getForecastsResult([
      [
        {
          inflow: 1,
          date: moment('1995-11-20').utc(),
        },
        {
          inflow: 2,
          date: moment('1995-11-27').utc(),
        },
      ],
    ]);

    const expected = [1, 3, 4, 6, 7, 9];

    expect(result[10].slice(0, 6)).toEqual(expected);
  });

  it('includes weeks with no transactions', async () => {
    random.mockImplementation((list) => list[1]);

    const result = getForecastsResult([
      [
        {
          inflow: 1,
          date: moment('1995-11-25').utc(),
        },
        {
          inflow: 2,
          date: moment('1995-12-25').utc(),
        },
      ],
    ]);

    expect(result[10][0]).toEqual(0);
  });
});

// TODO
// Only include last 52 weeks in pool
