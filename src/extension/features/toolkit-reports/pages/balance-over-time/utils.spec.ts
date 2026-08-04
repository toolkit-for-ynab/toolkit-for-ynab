import moment from 'moment';
import {
  appendScheduledTransactionsToBalanceMap,
  expandScheduledTransactionDates,
  Datapoint,
} from './utils';
import { YNABTransaction } from 'toolkit/types/ynab/data/transaction';

const day = (iso: string) => moment.utc(iso).startOf('day');
const dayUTC = (iso: string) => day(iso).valueOf();

// Minimal scheduled-transaction stub with only the fields the projection utils read.
function makeScheduled(input: {
  accountId: string;
  date: string;
  frequency?: string | null;
  inflow?: number;
  outflow?: number;
}): YNABTransaction {
  return {
    accountId: input.accountId,
    frequency: input.frequency ?? null,
    inflow: input.inflow ?? 0,
    outflow: input.outflow ?? 0,
    date: { getUTCTime: () => dayUTC(input.date) },
  } as unknown as YNABTransaction;
}

describe('balance-over-time projection utils', () => {
  describe('expandScheduledTransactionDates', () => {
    it('returns a single occurrence for a non-repeating schedule', () => {
      const tx = makeScheduled({ accountId: 'a', date: '2026-07-01', frequency: 'never' });
      const dates = expandScheduledTransactionDates(tx, dayUTC('2026-06-26'), day('2027-06-26'));
      expect(dates).toEqual([dayUTC('2026-07-01')]);
    });

    it('expands a monthly schedule across the horizon', () => {
      const tx = makeScheduled({ accountId: 'a', date: '2026-07-01', frequency: 'monthly' });
      const dates = expandScheduledTransactionDates(tx, dayUTC('2026-06-26'), day('2026-10-15'));
      expect(dates).toEqual([
        dayUTC('2026-07-01'),
        dayUTC('2026-08-01'),
        dayUTC('2026-09-01'),
        dayUTC('2026-10-01'),
      ]);
    });

    it('excludes occurrences on or before the cutoff date', () => {
      const tx = makeScheduled({ accountId: 'a', date: '2026-06-26', frequency: 'weekly' });
      const dates = expandScheduledTransactionDates(tx, dayUTC('2026-06-26'), day('2026-07-20'));
      expect(dates).toEqual([dayUTC('2026-07-03'), dayUTC('2026-07-10'), dayUTC('2026-07-17')]);
    });
  });

  describe('appendScheduledTransactionsToBalanceMap', () => {
    it('continues each account balance forward using scheduled transactions', () => {
      const lastActual = dayUTC('2026-06-26');
      const actualMap = new Map<string, Map<number, Datapoint>>([
        [
          'a',
          new Map<number, Datapoint>([
            [lastActual, { runningTotal: 1000, netChange: 0, transactions: [] }],
          ]),
        ],
      ]);

      const scheduled = [
        makeScheduled({ accountId: 'a', date: '2026-07-01', frequency: 'never', outflow: 200 }),
        makeScheduled({ accountId: 'a', date: '2026-07-05', frequency: 'never', inflow: 500 }),
      ];

      const projected = appendScheduledTransactionsToBalanceMap(
        actualMap,
        scheduled,
        day('2026-07-10'),
      );

      const datapoints = projected.get('a')!;
      // Actual datapoint is preserved.
      expect(datapoints.get(lastActual)!.runningTotal).toBe(1000);
      // Outflow on the 1st drops the balance.
      expect(datapoints.get(dayUTC('2026-07-01'))!.runningTotal).toBe(800);
      // Inflow on the 5th raises it.
      expect(datapoints.get(dayUTC('2026-07-05'))!.runningTotal).toBe(1300);
      // Balance carries forward on days without occurrences.
      expect(datapoints.get(dayUTC('2026-07-10'))!.runningTotal).toBe(1300);
    });

    it('only projects scheduled transactions onto their own account', () => {
      const lastActual = dayUTC('2026-06-26');
      const actualMap = new Map<string, Map<number, Datapoint>>([
        ['a', new Map([[lastActual, { runningTotal: 100, netChange: 0, transactions: [] }]])],
        ['b', new Map([[lastActual, { runningTotal: 50, netChange: 0, transactions: [] }]])],
      ]);

      const scheduled = [
        makeScheduled({ accountId: 'a', date: '2026-07-01', frequency: 'never', inflow: 10 }),
      ];

      const projected = appendScheduledTransactionsToBalanceMap(
        actualMap,
        scheduled,
        day('2026-07-02'),
      );

      expect(projected.get('a')!.get(dayUTC('2026-07-01'))!.runningTotal).toBe(110);
      // Account b has no scheduled transactions, so its balance stays flat.
      expect(projected.get('b')!.get(dayUTC('2026-07-01'))!.runningTotal).toBe(50);
    });
  });
});
