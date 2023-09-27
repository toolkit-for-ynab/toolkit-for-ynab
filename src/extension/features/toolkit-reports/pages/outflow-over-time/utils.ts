import lodash from 'lodash';
import type { Moment } from 'moment';

declare module 'moment' {
  interface Moment {
    toUTCMoment(): Moment;
  }
}

interface YNABTransaction {
  outflow?: number;
  inflow?: number;
  accountId: string;
  transferAccountId: string | null;
  date: Moment;
  /** YYYY-mm format */
  month: string;
}

export const filterTransactions = (
  transactions: readonly YNABTransaction[],
  filterOutAccounts: ReadonlySet<string>
) => {
  return transactions
    .filter((transaction) => {
      return (
        transaction.outflow !== undefined &&
        transaction.outflow !== 0 &&
        (transaction.inflow === undefined || transaction.inflow === 0)
      );
    })
    .filter((transactionsWithoutInflow) => {
      if (transactionsWithoutInflow.transferAccountId) {
        // discard unless it transfers outside the selected account list
        return filterOutAccounts.has(transactionsWithoutInflow.transferAccountId);
      }
      return !filterOutAccounts.has(transactionsWithoutInflow.accountId);
    });
};

/**
 * Filter the passed transactions to only include those within the specified date range.
 * @param transactions The array of transactions to be filtered.
 * @param startDate The start date of the desired date range.
 * @param endDate The end date of the desired date range.
 * @returns A new array containing only the transactions that fall within the specified date range.
 */
export const filterTransactionsByDate = (
  transactions: readonly YNABTransaction[],
  startDate: Moment,
  endDate: Moment
) => {
  return transactions.filter((transaction) => {
    return transaction.date >= startDate && transaction.date <= endDate;
  });
};

type GroupedTransactions = Record<string, Record<string, YNABTransaction[]>>;

export const groupTransactions = (transactions: readonly YNABTransaction[]) => {
  const groupedByMonth = lodash.groupBy(transactions, 'month');
  const groupedByMonthAndDate: GroupedTransactions = {};

  Object.keys(groupedByMonth).forEach((key) => {
    groupedByMonthAndDate[key] = lodash.groupBy(groupedByMonth[key], (transaction) =>
      transaction.date.toUTCMoment().date()
    );
  });

  return groupedByMonthAndDate;
};

interface OutflowData {
  transactions: YNABTransaction[];
  value: number;
}

export const calculateOutflowPerDate = (transactions: GroupedTransactions) => {
  return lodash.mapValues(transactions, (monthData) => {
    return lodash.mapValues(monthData, (dateData): OutflowData => {
      return {
        transactions: dateData,
        value: dateData.reduce((s, a) => s + a.outflow!, 0),
      };
    });
  });
};

export const calculateCumulativeOutflowPerDate = (transactions: GroupedTransactions) => {
  return lodash.mapValues(calculateOutflowPerDate(transactions), (monthData) => {
    const pairs = lodash.toPairs(monthData);
    const dates = pairs.map((d) => d[0]);
    const outflows = pairs.map((d) => d[1]);
    const cumulativeSum = lodash.reduce(
      outflows,
      (acc, n) => {
        acc.push({
          ...n,
          value: (acc.length > 0 ? acc[acc.length - 1].value : 0) + n.value,
        });
        return acc;
      },
      [] as OutflowData[]
    );
    return lodash.fromPairs(lodash.zip(dates, cumulativeSum) as [string, OutflowData][]);
  });
};

export const toHighchartsSeries = (transactions: Record<string, Record<string, OutflowData>>) => {
  return lodash.toPairs(transactions).map((monthData) => {
    const [month, data] = monthData;
    return {
      name: month,
      data: lodash.toPairs(data).map((dateData) => {
        const [date, { value, transactions }] = dateData;
        return {
          x: parseInt(date),
          y: value,
          custom: transactions,
        };
      }),
    };
  });
};
