import {
  filterTransactions,
  groupTransactions,
  calculateOutflowPerDate,
  calculateCumulativeOutflowPerDate,
  toHighchartsSeries,
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
      expect(filterTransactions(transactions, new Set())).toEqual(expected);
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
      expect(filterTransactions(transactions, filteredAccounts)).toEqual(expected);
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
          4: 100,
          7: 500,
          8: 300,
          12: 1500,
          19: 100,
        },
        '2022-02': {
          13: 200,
          19: 700,
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
          4: 100,
          7: 600,
          8: 900,
          12: 2400,
          19: 2500,
        },
        '2022-02': {
          13: 200,
          19: 900,
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
      const transactions = {
        '2022-01': {
          4: 100,
          7: 600,
          8: 900,
          12: 2400,
          19: 2500,
        },
        '2022-02': {
          13: 200,
          19: 900,
        },
      };

      const excpected = [
        {
          name: '2022-01',
          data: [
            { x: 4, y: 100 },
            { x: 7, y: 600 },
            { x: 8, y: 900 },
            { x: 12, y: 2400 },
            { x: 19, y: 2500 },
          ],
        },
        {
          name: '2022-02',
          data: [
            { x: 13, y: 200 },
            { x: 19, y: 900 },
          ],
        },
      ];

      expect(toHighchartsSeries(transactions)).toEqual(excpected);
    });
  });
});
