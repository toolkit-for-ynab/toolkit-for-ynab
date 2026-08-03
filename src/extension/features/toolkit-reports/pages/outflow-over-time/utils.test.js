import {
  filterTransactions,
  groupTransactions,
  calculateOutflowPerDate,
  calculateCumulativeOutflowPerDate,
  toHighchartsSeries,
  calculateAverageDailyForecast,
} from './utils';
import moment from 'moment';

describe('Utils', () => {
  describe('filterTransactions', () => {
    it('should do nothing, when there is nothing to be done', () => {
      expect(filterTransactions([])).toEqual([]);
    });

    it('should filter out inflow transactions', () => {
      const transactions = [{ outflow: 1 }, { inflow: 2 }, { outflow: 3 }];
      const expected = [{ outflow: 1 }, { outflow: 3 }];
      expect(filterTransactions(transactions, false, new Set())).toEqual(expected);
    });

    it('should filter out transactions to filtered accounts', () => {
      const transactions = [
        { outflow: 1, accountId: 1 },
        { outflow: 2, accountId: 2 },
        { outflow: 3, accountId: 3 },
      ];
      const expected = [{ outflow: 2, accountId: 2 }];
      const filteredAccounts = new Set();
      filteredAccounts.add(1);
      filteredAccounts.add(3);
      expect(filterTransactions(transactions, false, filteredAccounts)).toEqual(expected);
    });
  });

  describe('groupTransactions', () => {
    it('should do nothing, when there is nothing to be done', () => {
      expect(groupTransactions([])).toEqual({});
    });

    it('should group transactions first by year-month, then date in month', () => {
      const t1 = {
        outflow: 1,
        month: '2022-01',
        date: { toUTCMoment: () => moment('2022-01-07T13:00:00.000Z') },
      };
      const t2 = {
        outflow: 2,
        month: '2022-01',
        date: { toUTCMoment: () => moment('2022-01-04T13:00:00.000Z') },
      };
      const t3 = {
        outflow: 3,
        month: '2022-01',
        date: { toUTCMoment: () => moment('2022-01-07T13:00:00.000Z') },
      };
      const t4 = {
        outflow: 4,
        month: '2022-02',
        date: { toUTCMoment: () => moment('2022-02-13T13:00:00.000Z') },
      };
      const t5 = {
        outflow: 5,
        month: '2022-02',
        date: { toUTCMoment: () => moment('2022-02-19T13:00:00.000Z') },
      };
      const t6 = {
        outflow: 6,
        month: '2022-03',
        date: { toUTCMoment: () => moment('2022-03-24T13:00:00.000Z') },
      };

      const transactions = [t1, t2, t3, t4, t5, t6];

      const expected = {
        '2022-01': {
          4: [t2],
          7: [t1, t3],
        },
        '2022-02': {
          13: [t4],
          19: [t5],
        },
        '2022-03': {
          24: [t6],
        },
      };

      expect(groupTransactions(transactions)).toEqual(expected);
    });
  });

  describe('calculateOutflowPerDate', () => {
    it('should do nothing, when there is nothing to be done', () => {
      expect(calculateOutflowPerDate({})).toEqual({});
    });

    it('should calculate outflow per date', () => {
      const transactions = {
        '2022-01': {
          4: [{ outflow: 100 }],
          7: [{ outflow: 200 }, { outflow: 300 }],
          8: [{ outflow: 300 }],
          12: [{ outflow: 200 }, { outflow: 600 }, { outflow: 700 }],
          19: [{ outflow: 100 }],
        },
        '2022-02': {
          13: [{ outflow: 200 }],
          19: [{ outflow: 700 }],
        },
      };

      const expected = {
        '2022-01': {
          4: { value: 100, transactions: transactions['2022-01'][4] },
          7: { value: 500, transactions: transactions['2022-01'][7] },
          8: { value: 300, transactions: transactions['2022-01'][8] },
          12: { value: 1500, transactions: transactions['2022-01'][12] },
          19: { value: 100, transactions: transactions['2022-01'][19] },
        },
        '2022-02': {
          13: { value: 200, transactions: transactions['2022-02'][13] },
          19: { value: 700, transactions: transactions['2022-02'][19] },
        },
      };

      expect(calculateOutflowPerDate(transactions)).toEqual(expected);
    });
  });

  describe('calculateCumulativeOutflowPerDate', () => {
    it('should do nothing, when there is nothing to be done', () => {
      expect(calculateCumulativeOutflowPerDate({})).toEqual({});
    });

    it('should calculate the cumulative outflow per date', () => {
      const transactions = {
        '2022-01': {
          4: [{ outflow: 100 }],
          7: [{ outflow: 200 }, { outflow: 300 }],
          8: [{ outflow: 300 }],
          12: [{ outflow: 200 }, { outflow: 600 }, { outflow: 700 }],
          19: [{ outflow: 100 }],
        },
        '2022-02': {
          13: [{ outflow: 200 }],
          19: [{ outflow: 700 }],
        },
      };

      const expected = {
        '2022-01': {
          4: { value: 100, transactions: transactions['2022-01'][4] },
          7: { value: 600, transactions: transactions['2022-01'][7] },
          8: { value: 900, transactions: transactions['2022-01'][8] },
          12: { value: 2400, transactions: transactions['2022-01'][12] },
          19: { value: 2500, transactions: transactions['2022-01'][19] },
        },
        '2022-02': {
          13: { value: 200, transactions: transactions['2022-02'][13] },
          19: { value: 900, transactions: transactions['2022-02'][19] },
        },
      };

      expect(calculateCumulativeOutflowPerDate(transactions)).toEqual(expected);
    });
  });

  describe('toHighchartsSeries', () => {
    it('should do nothing, when there is nothing to be done', () => {
      expect(toHighchartsSeries({})).toEqual([]);
    });

    it('should transform the transactions to Highcharts Series', () => {
      const rawData = Symbol(); // placeholder to check for passthrough
      const transactions = {
        '2022-01': {
          4: { value: 100, transactions: rawData },
          7: { value: 600, transactions: rawData },
          8: { value: 900, transactions: rawData },
          12: { value: 2400, transactions: rawData },
          19: { value: 2500, transactions: rawData },
        },
        '2022-02': {
          13: { value: 200, transactions: rawData },
          19: { value: 900, transactions: rawData },
        },
      };

      const excpected = [
        {
          name: 'Jan 2022',
          type: 'line',
          data: [
            { x: 4, y: 100, custom: rawData },
            { x: 7, y: 600, custom: rawData },
            { x: 8, y: 900, custom: rawData },
            { x: 12, y: 2400, custom: rawData },
            { x: 19, y: 2500, custom: rawData },
          ],
        },
        {
          name: 'Feb 2022',
          type: 'line',
          data: [
            { x: 13, y: 200, custom: rawData },
            { x: 19, y: 900, custom: rawData },
          ],
        },
      ];

      expect(toHighchartsSeries(transactions)).toEqual(excpected);
    });

    it('should append nameSuffix to each series name', () => {
      const transactions = { '2022-01': { 4: { value: 100, transactions: [] } } };
      const result = toHighchartsSeries(transactions, { nameSuffix: ' (Scheduled)' });
      expect(result[0].name).toBe('Jan 2022 (Scheduled)');
    });

    it('should apply dashStyle to each series', () => {
      const transactions = { '2022-01': { 4: { value: 100, transactions: [] } } };
      const result = toHighchartsSeries(transactions, { dashStyle: 'ShortDot' });
      expect(result[0].dashStyle).toBe('ShortDot');
    });

    it('should apply both nameSuffix and dashStyle together', () => {
      const transactions = { '2022-01': { 4: { value: 100, transactions: [] } } };
      const result = toHighchartsSeries(transactions, {
        nameSuffix: ' (Scheduled)',
        dashStyle: 'LongDash',
      });
      expect(result[0].name).toBe('Jan 2022 (Scheduled)');
      expect(result[0].dashStyle).toBe('LongDash');
    });
  });

  describe('calculateAverageDailyForecast', () => {
    // Helpers — mirror the shape the real YNAB objects expose to these functions.
    const tx = (month, isoDate, outflow, inflow = 0) => ({
      month,
      outflow,
      inflow,
      date: { toUTCMoment: () => moment(isoDate) },
    });

    // Anchor: March 29 2024 → 2 days remaining (days 30 and 31).
    // Feb 2024 has 29 days (leap year); last 2 = Feb 28 & Feb 29.
    // Jan 2024 has 31 days;            last 2 = Jan 30 & Jan 31.
    const TODAY = moment('2024-03-29');

    it('should return an empty array when today is the last day of the month', () => {
      expect(calculateAverageDailyForecast([], 3, moment('2024-03-31'))).toEqual([]);
    });

    it('should return one entry per remaining day with the correct day numbers', () => {
      const result = calculateAverageDailyForecast([], 1, TODAY);
      expect(result).toHaveLength(2);
      expect(result[0].day).toBe(30);
      expect(result[1].day).toBe(31);
    });

    it('should return zero values when no lookback months have transactions', () => {
      const result = calculateAverageDailyForecast([], 3, TODAY);
      expect(result.every((r) => r.value === 0)).toBe(true);
    });

    it('should return per-day spending from a single lookback month', () => {
      const transactions = [
        tx('2024-02', '2024-02-28', 100), // position 0 → day 30
        tx('2024-02', '2024-02-29', 200), // position 1 → day 31
      ];
      const result = calculateAverageDailyForecast(transactions, 1, TODAY);
      expect(result[0]).toEqual({ day: 30, value: 100 });
      expect(result[1]).toEqual({ day: 31, value: 200 });
    });

    it('should average spending across multiple lookback months', () => {
      const transactions = [
        tx('2024-02', '2024-02-28', 100), // position 0
        tx('2024-02', '2024-02-29', 200), // position 1
        tx('2024-01', '2024-01-30', 300), // position 0
        tx('2024-01', '2024-01-31', 400), // position 1
      ];
      const result = calculateAverageDailyForecast(transactions, 2, TODAY);
      expect(result[0]).toEqual({ day: 30, value: (100 + 300) / 2 });
      expect(result[1]).toEqual({ day: 31, value: (200 + 400) / 2 });
    });

    it('should skip lookback months with no transactions entirely', () => {
      // Only Feb has data; Jan is empty and must not dilute the average.
      const transactions = [tx('2024-02', '2024-02-28', 100), tx('2024-02', '2024-02-29', 200)];
      const result = calculateAverageDailyForecast(transactions, 2, TODAY);
      // Average is over 1 month, not 2.
      expect(result[0]).toEqual({ day: 30, value: 100 });
      expect(result[1]).toEqual({ day: 31, value: 200 });
    });

    it('should count days with no transactions within a valid month as zero', () => {
      // Feb has a transaction on Feb 29 only; Feb 28 (position 0) is $0.
      const transactions = [tx('2024-02', '2024-02-29', 200)];
      const result = calculateAverageDailyForecast(transactions, 1, TODAY);
      expect(result[0]).toEqual({ day: 30, value: 0 });
      expect(result[1]).toEqual({ day: 31, value: 200 });
    });

    it('should compute net spending as outflow minus inflow', () => {
      const transactions = [
        tx('2024-02', '2024-02-28', 0), // position 0 — no spend
        tx('2024-02', '2024-02-29', 300, 50), // position 1 — net 250
      ];
      const result = calculateAverageDailyForecast(transactions, 1, TODAY);
      expect(result[0]).toEqual({ day: 30, value: 0 });
      expect(result[1]).toEqual({ day: 31, value: 250 });
    });

    it('should handle a short lookback month gracefully (fewer days than daysRemaining)', () => {
      // today = Jan 31 2024 → daysRemaining = 0. Use Jan 30 instead.
      // today = March 3 → daysRemaining = 28. Feb 2024 has 29 days → histStartDay = 2.
      // All 28 positions should map to valid Feb days (Feb 2–29).
      const today = moment('2024-03-03');
      const transactions = [tx('2024-02', '2024-02-29', 100)];
      const result = calculateAverageDailyForecast(transactions, 1, today);
      expect(result).toHaveLength(28);
      // Position 27 (last) → histDay = 2 + 27 = 29 → Feb 29
      expect(result[27]).toEqual({ day: 31, value: 100 });
      // All other positions have no transactions → zero
      expect(result.slice(0, 27).every((r) => r.value === 0)).toBe(true);
    });
  });
});
