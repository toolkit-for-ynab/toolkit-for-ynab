import { DateWithoutTime } from 'toolkit/types/ynab/window/ynab-utilities';
import { MonthlyTotals, NormalizedExpenses, NormalizedIncomes } from './types';
import moment, { Moment } from 'moment';
import { YNABTransaction } from 'toolkit/types/ynab/data/transaction';
import { normalizeNetIncomes } from './normalizer';

class MockDateWithoutTime implements Partial<DateWithoutTime> {
  _date: Moment;

  constructor(date: Moment) {
    this._date = date;
  }

  clone() {
    return new MockDateWithoutTime(moment(this._date)) as unknown as DateWithoutTime;
  }

  toUTCMoment(): Moment {
    return this._date;
  }

  toISOString(): string {
    return this._date.toISOString();
  }

  isBefore(date: DateWithoutTime) {
    return this._date.isBefore(date.toUTCMoment());
  }

  isAfter(date: DateWithoutTime) {
    return this._date.isAfter(date.toUTCMoment());
  }

  equalsByMonth(date: DateWithoutTime) {
    return this._date.isSame(date.toUTCMoment(), 'month');
  }
}

function generateMockMonthlyTotals(
  startDate: Moment,
  numMonths: number,
  numTransactions: number,
  negativeAmounts: boolean
): MonthlyTotals[] {
  const monthlyTotals: MonthlyTotals[] = [];
  let nextDate = startDate;

  for (let i = 0; i < numMonths; i++) {
    const date = moment(nextDate);

    if (i > 0) {
      date.add(1, 'month');
    }

    const transactions: YNABTransaction[] = [];
    let total = 0;

    for (let j = 0; j < numTransactions; j++) {
      const amount = Math.floor(Math.random() * 100) * (negativeAmounts ? -1 : 1);
      total += amount;

      const transaction = {
        amount,
        payeeId: `${i}-${j}`,
      } as YNABTransaction;

      transactions.push(transaction);
    }

    const ynabDate = new MockDateWithoutTime(date);

    const monthlyTotal = {
      date: ynabDate as unknown as DateWithoutTime,
      total,
      transactions: transactions,
    } as MonthlyTotals;

    monthlyTotals.push(monthlyTotal);
    nextDate = date;
  }

  return monthlyTotals;
}

describe('normalizer', () => {
  describe('normalizeNetIncomes', () => {
    it.todo('combines incomes and expenses transactions per month');
    it.todo('sums the totals of incomes and expenses per month');

    it('handles incomes starting in earlier months than expenses, ends in the same month', () => {
      const transactionsPerMonth = 3;

      const totalMonths = 6;
      const numMonthsStartEarly = 2; // Must be less than totalMonths
      const startEarlyMonth = 3; // March
      const startLateMonth = startEarlyMonth + numMonthsStartEarly; // May
      const endMonth = startEarlyMonth + totalMonths - 1; // August, -1 is to offset the fact that we start counting on the startng month, not after

      const numMonthsForEarlyStart = totalMonths;
      const numMonthsForLaterStart = totalMonths - numMonthsStartEarly;

      const earlierStartDate = moment.utc(`2016-${startEarlyMonth.toString().padStart(2, '0')}-01`);
      const laterStartDate = moment.utc(`2016-${startLateMonth.toString().padStart(2, '0')}-01`);
      const expectedEndDate = moment.utc(`2016-${endMonth.toString().padStart(2, '0')}-01`);

      let mockExpenses: Partial<NormalizedExpenses> = {
        monthlyTotals: generateMockMonthlyTotals(
          laterStartDate,
          numMonthsForLaterStart,
          transactionsPerMonth,
          true
        ),
      };
      let mockIncome: Partial<NormalizedIncomes> = {
        monthlyTotals: generateMockMonthlyTotals(
          earlierStartDate,
          numMonthsForEarlyStart,
          transactionsPerMonth,
          false
        ),
      };

      const normalizedNetIncomes = normalizeNetIncomes(
        mockExpenses as NormalizedExpenses,
        mockIncome as NormalizedIncomes
      );

      expect(normalizedNetIncomes.length).toBe(totalMonths);
      expect(normalizedNetIncomes[0].date.toUTCMoment().toISOString()).toEqual(
        earlierStartDate.toISOString()
      );
      expect(
        normalizedNetIncomes[normalizedNetIncomes.length - 1].date.toUTCMoment().toISOString()
      ).toEqual(expectedEndDate.toISOString());
    });

    it('handles expenses starting in earlier months than incomes, ends in the same month', () => {
      const transactionsPerMonth = 3;

      const totalMonths = 6;
      const numMonthsStartEarly = 2; // Must be less than totalMonths
      const startEarlyMonth = 3; // March
      const startLateMonth = startEarlyMonth + numMonthsStartEarly; // May
      const endMonth = startEarlyMonth + totalMonths - 1; // August, -1 is to offset the fact that we start counting on the startng month, not after

      const numMonthsForEarlyStart = totalMonths;
      const numMonthsForLaterStart = totalMonths - numMonthsStartEarly;

      const earlierStartDate = moment.utc(`2016-${startEarlyMonth.toString().padStart(2, '0')}-01`);
      const laterStartDate = moment.utc(`2016-${startLateMonth.toString().padStart(2, '0')}-01`);
      const expectedEndDate = moment.utc(`2016-${endMonth.toString().padStart(2, '0')}-01`);

      let mockExpenses: Partial<NormalizedExpenses> = {
        monthlyTotals: generateMockMonthlyTotals(
          earlierStartDate,
          numMonthsForEarlyStart,
          transactionsPerMonth,
          true
        ),
      };
      let mockIncome: Partial<NormalizedIncomes> = {
        monthlyTotals: generateMockMonthlyTotals(
          laterStartDate,
          numMonthsForLaterStart,
          transactionsPerMonth,
          false
        ),
      };

      const normalizedNetIncomes = normalizeNetIncomes(
        mockExpenses as NormalizedExpenses,
        mockIncome as NormalizedIncomes
      );

      expect(normalizedNetIncomes.length).toBe(totalMonths);
      expect(normalizedNetIncomes[0].date.toUTCMoment().toISOString()).toEqual(
        earlierStartDate.toISOString()
      );
      expect(
        normalizedNetIncomes[normalizedNetIncomes.length - 1].date.toUTCMoment().toISOString()
      ).toEqual(expectedEndDate.toISOString());
    });

    it('handles incomes starting in earlier months than expenses, expenses ending in a later month', () => {
      const transactionsPerMonth = 3;

      const totalMonths = 6;
      const numMonthsStartEarly = 2; // Must be less than totalMonths
      const numMonthsEndLate = 2; // Must be less than totalMonths
      const startEarlyMonth = 3; // March
      const startLateMonth = startEarlyMonth + numMonthsStartEarly; // May
      const endLateMonth = startEarlyMonth + totalMonths - 1; // August, -1 is to offset the fact that we start counting total on the startng month, not after
      const endEarlyMonth = endLateMonth - numMonthsEndLate; // June

      const numMonthsForEarlyStart = endEarlyMonth - startEarlyMonth;
      const numMonthsForLaterStart = totalMonths - numMonthsStartEarly;

      const earlierStartDate = moment.utc(`2016-${startEarlyMonth.toString().padStart(2, '0')}-01`);
      const laterStartDate = moment.utc(`2016-${startLateMonth.toString().padStart(2, '0')}-01`);
      const expectedEndDate = moment.utc(`2016-${endLateMonth.toString().padStart(2, '0')}-01`);

      let mockExpenses: Partial<NormalizedExpenses> = {
        monthlyTotals: generateMockMonthlyTotals(
          earlierStartDate,
          numMonthsForEarlyStart,
          transactionsPerMonth,
          true
        ),
      };
      let mockIncome: Partial<NormalizedIncomes> = {
        monthlyTotals: generateMockMonthlyTotals(
          laterStartDate,
          numMonthsForLaterStart,
          transactionsPerMonth,
          false
        ),
      };

      const normalizedNetIncomes = normalizeNetIncomes(
        mockExpenses as NormalizedExpenses,
        mockIncome as NormalizedIncomes
      );

      expect(normalizedNetIncomes.length).toBe(totalMonths);
      expect(normalizedNetIncomes[0].date.toUTCMoment().toISOString()).toEqual(
        earlierStartDate.toISOString()
      );
      expect(
        normalizedNetIncomes[normalizedNetIncomes.length - 1].date.toUTCMoment().toISOString()
      ).toEqual(expectedEndDate.toISOString());
    });

    it('handles expense starting in earlier months than incomes, incomes ending in a later month', () => {
      const transactionsPerMonth = 3;

      const totalMonths = 6;
      const numMonthsStartEarly = 2; // Must be less than totalMonths
      const numMonthsEndLate = 2; // Must be less than totalMonths
      const startEarlyMonth = 3; // March
      const startLateMonth = startEarlyMonth + numMonthsStartEarly; // May
      const endLateMonth = startEarlyMonth + totalMonths - 1; // August, -1 is to offset the fact that we start counting total on the startng month, not after
      const endEarlyMonth = endLateMonth - numMonthsEndLate; // June

      const numMonthsForEarlyStart = endEarlyMonth - startEarlyMonth;
      const numMonthsForLaterStart = totalMonths - numMonthsStartEarly;

      const earlierStartDate = moment.utc(`2016-${startEarlyMonth.toString().padStart(2, '0')}-01`);
      const laterStartDate = moment.utc(`2016-${startLateMonth.toString().padStart(2, '0')}-01`);
      const expectedEndDate = moment.utc(`2016-${endLateMonth.toString().padStart(2, '0')}-01`);

      let mockExpenses: Partial<NormalizedExpenses> = {
        monthlyTotals: generateMockMonthlyTotals(
          laterStartDate,
          numMonthsForLaterStart,
          transactionsPerMonth,
          true
        ),
      };
      let mockIncome: Partial<NormalizedIncomes> = {
        monthlyTotals: generateMockMonthlyTotals(
          earlierStartDate,
          numMonthsForEarlyStart,
          transactionsPerMonth,
          false
        ),
      };

      const normalizedNetIncomes = normalizeNetIncomes(
        mockExpenses as NormalizedExpenses,
        mockIncome as NormalizedIncomes
      );

      expect(normalizedNetIncomes.length).toBe(totalMonths);
      expect(normalizedNetIncomes[0].date.toUTCMoment().toISOString()).toEqual(
        earlierStartDate.toISOString()
      );
      expect(
        normalizedNetIncomes[normalizedNetIncomes.length - 1].date.toUTCMoment().toISOString()
      ).toEqual(expectedEndDate.toISOString());
    });
  });
});
