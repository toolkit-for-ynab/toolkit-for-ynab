import lodash from 'lodash';

export const filterTransactions = (transactions, filterOutAccounts) => {
  return transactions
    .filter((transaction) => {
      return (
        transaction.outflow !== undefined &&
        transaction.outflow !== 0 &&
        (transaction.inflow === undefined || transaction.inflow === 0)
      );
    })
    .filter((transactionsWithoutInflow) => {
      return !filterOutAccounts.has(transactionsWithoutInflow.accountId);
    });
};

export const groupTransactions = (transactions) => {
  const groupedByMonth = lodash.groupBy(transactions, 'month');
  const groupedByMonthAndDate = {};

  Object.keys(groupedByMonth).forEach((key) => {
    groupedByMonthAndDate[key] = lodash.groupBy(groupedByMonth[key], (transaction) =>
      transaction.date.toUTCMoment().date()
    );
  });

  return groupedByMonthAndDate;
};

export const calculateOutflowPerDate = (transactions) => {
  return lodash.mapValues(transactions, (monthData) => {
    return lodash.mapValues(monthData, (dateData) => {
      return dateData.reduce((s, a) => s + a.outflow, 0);
    });
  });
};

export const calculateCumulativeOutflowPerDate = (transactions) => {
  return lodash.mapValues(calculateOutflowPerDate(transactions), (monthData) => {
    const pairs = lodash.toPairs(monthData);
    const dates = pairs.map((d) => d[0]);
    const outflows = pairs.map((d) => d[1]);
    const cumulativeSum = lodash.reduce(
      outflows,
      (acc, n) => {
        acc.push((acc.length > 0 ? acc[acc.length - 1] : 0) + n);
        return acc;
      },
      []
    );
    return Object.fromEntries(lodash.zip(dates, cumulativeSum));
  });
};

export const toHighchartsSeries = (transactions) => {
  return lodash.toPairs(transactions).map((monthData) => {
    const [month, data] = monthData;
    return {
      name: month,
      data: lodash.toPairs(data).map((dateData) => {
        const [date, amount] = dateData;
        return {
          x: parseInt(date),
          y: amount,
        };
      }),
    };
  });
};
