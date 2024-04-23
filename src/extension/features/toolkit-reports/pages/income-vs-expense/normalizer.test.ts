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

    it('handles initial months with only incomes and no expenses', () => {
      const earlierStartDate = moment.utc('2016-06-01');
      const laterStartDate = moment.utc('2016-08-01');
      const totalMonths = 5;
      const monthsFromLaterStartDate = totalMonths - 2;
      const transactionsPerMonth = 3;

      let mockExpenses: Partial<NormalizedExpenses> = {
        monthlyTotals: generateMockMonthlyTotals(
          laterStartDate,
          monthsFromLaterStartDate,
          transactionsPerMonth,
          true
        ),
      };
      let mockIncome: Partial<NormalizedIncomes> = {
        monthlyTotals: generateMockMonthlyTotals(
          earlierStartDate,
          totalMonths,
          transactionsPerMonth,
          false
        ),
      };

      const normalizedNetIncomes = normalizeNetIncomes(
        mockExpenses as NormalizedExpenses,
        mockIncome as NormalizedIncomes
      );

      expect(normalizedNetIncomes.length).toBe(totalMonths);
      expect(normalizedNetIncomes[0].date.toUTCMoment()).toEqual(earlierStartDate);
    });

    it('handles initial months with only expenses and no incomes', () => {
      const earlierStartDate = moment.utc('2016-06-01');
      const laterStartDate = moment.utc('2016-08-01');
      const totalMonths = 5;
      const monthsFromLaterStartDate = totalMonths - 2;
      const transactionsPerMonth = 3;

      let mockExpenses: Partial<NormalizedExpenses> = {
        monthlyTotals: generateMockMonthlyTotals(
          earlierStartDate,
          totalMonths,
          transactionsPerMonth,
          true
        ),
      };
      let mockIncome: Partial<NormalizedIncomes> = {
        monthlyTotals: generateMockMonthlyTotals(
          laterStartDate,
          monthsFromLaterStartDate,
          transactionsPerMonth,
          false
        ),
      };

      const normalizedNetIncomes = normalizeNetIncomes(
        mockExpenses as NormalizedExpenses,
        mockIncome as NormalizedIncomes
      );

      expect(normalizedNetIncomes.length).toBe(totalMonths);
      expect(normalizedNetIncomes[0].date.toUTCMoment()).toEqual(earlierStartDate);
    });
  });
});
