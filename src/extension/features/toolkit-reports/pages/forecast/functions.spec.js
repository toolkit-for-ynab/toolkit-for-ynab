import { generateForecasts } from './functions';
import random from './random';
import moment from 'moment';

jest.mock('./random');

function makeTransactions(inputs) {
  return inputs.map((input) => ({
    inflow: 0,
    outflow: 0,
    ...input,
    date: {
      toUTCMoment: () => moment(input?.date || '1995-12-25').utc(),
    },
  }));
}

function getForecastsResult(inputGroups) {
  const transactions = makeTransactions(inputGroups);
  return generateForecasts(transactions, transactions, {
    accountFilterIds: new Set(),
  });
}

describe('forecast page functions', () => {
  beforeEach(() => random.mockImplementation((list) => list[0]));

  it('returns various confidences', async () => {
    const result = generateForecasts([], [], {
      accountFilterIds: new Set(),
    });

    expect(result).toHaveLength(100);
  });

  it('generates forecasts using transactions', async () => {
    const result = getForecastsResult([{ inflow: 1 }]);

    // i+2: i is zero-based; 2 adjusts for this and adds initial networth
    const expected = Array.from({ length: 10 * 52 }, (v, i) => i + 2);

    expect(result).toHaveProperty('10', expected);
  });

  it('uses transactions', async () => {
    const result = getForecastsResult([{ inflow: 2 }]);

    const expected = Array.from({ length: 10 * 52 }, (v, i) => (i + 1) * 2 + 2);

    expect(result).toHaveProperty('10', expected);
  });

  it('supports outflows', async () => {
    const result = getForecastsResult([{ outflow: 1 }]);

    const expected = Array.from({ length: 10 * 52 }, (v, i) => (i + 1) * -1 - 1);

    expect(result).toHaveProperty('10', expected);
  });

  it('generates forecasts for all confidences', async () => {
    const result = getForecastsResult([{ inflow: 1 }]);

    const expected = Array.from({ length: 10 * 52 }, (v, i) => i + 2);

    Object.keys(result).forEach((k) => expect(result).toHaveProperty(k, expected));
  });

  it('selects weeks at random', async () => {
    random.mockImplementation((list) => list[1]);

    const result = getForecastsResult([
      { inflow: 1, date: '1995-11-20' },
      { inflow: 2, date: '1995-11-27' },
    ]);

    const expected = Array.from({ length: 10 * 52 }, (v, i) => (i + 1) * 2 + 3);

    expect(result).toHaveProperty('10', expected);
  });

  it('sums weeks', async () => {
    const result = getForecastsResult([
      {
        inflow: 1,
        date: '1995-12-25',
      },
      {
        inflow: 1,
        date: '1995-12-26',
      },
    ]);

    const expected = Array.from({ length: 10 * 52 }, (v, i) => (i + 1) * 2 + 2);

    expect(result).toHaveProperty('10', expected);
  });

  it('uses multiple random weeks in a forecast', async () => {
    let lastCall = 1;

    random.mockImplementation((list) => {
      lastCall = lastCall ? 0 : 1;
      return list[lastCall];
    });

    const result = getForecastsResult([
      {
        inflow: 1,
        date: '1995-11-20',
      },
      {
        inflow: 2,
        date: '1995-11-27',
      },
    ]);

    const expected = [4, 6, 7, 9, 10, 12];

    expect(result[10].slice(0, 6)).toEqual(expected);
  });

  it('includes weeks with no transactions', async () => {
    random.mockImplementation((list) => list[1]);

    const result = getForecastsResult([
      {
        inflow: 1,
        date: '1995-11-25',
      },
      {
        inflow: 2,
        date: '1995-12-25',
      },
    ]);

    expect(result[10][0]).toEqual(3);
  });

  it('sorts forecasts', async () => {
    let i = 0;
    random.mockImplementation((list) => {
      i++;
      if (i > 10 * 52) return list[0];
      return list[1];
    });

    const result = getForecastsResult([
      {
        inflow: 1,
        date: '1995-11-20',
      },
      {
        inflow: 2,
        date: '1995-11-27',
      },
    ]);

    const first = result[0][10 * 52 - 1];
    const last = result[99][10 * 52 - 1];

    expect(last < first).toBeTruthy();
  });

  it('can use last week', async () => {
    random.mockImplementation((list) => {
      return list[list.length - 1];
    });

    const result = getForecastsResult([
      { inflow: 1, date: '1995-11-20' },
      { inflow: 2, date: '1995-11-27' },
    ]);

    const expected = Array.from({ length: 10 * 52 }, (v, i) => (i + 1) * 2 + 3);

    expect(result).toHaveProperty('10', expected);
  });

  it('excludes starting balance from forecasts', async () => {
    random.mockImplementation((list) => list[0]);

    const result = getForecastsResult([
      { inflow: 1, date: '1995-11-20', payeeName: 'Starting Balance' },
    ]);

    // but not initial net worth
    expect(result[0][0]).toEqual(1);
  });
});
