import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { FiltersPropType } from 'toolkit-reports/common/components/report-context/component';
import { RunningBalanceGraph } from './RunningBalanceGraph';
import { getEntityManager } from 'toolkit/extension/utils/ynab';
import {
  mapAccountsToTransactions,
  generateDataPointsMap,
  dataPointsToHighChartSeries,
  applyDateFilterToDataPoints,
} from './utils';
export const BalanceOverTimeComponent = ({ allReportableTransactions, filters }) => {
  const [accountToDataPointsMap, setAccountToDataPointsMap] = useState(new Map());
  const [series, setSeries] = useState([]);

  // Whenever transactions or filters change, update our state
  useEffect(() => {
    // Generate a map from account to transactions
    let accountToTransactionsMap = mapAccountsToTransactions(allReportableTransactions);

    // Map each account to their corresponding data points
    accountToTransactionsMap.forEach((transactionsForAcc, accountId) => {
      let datapoints = generateDataPointsMap(transactionsForAcc);
      accountToDataPointsMap.set(accountId, datapoints);
    });
    setAccountToDataPointsMap(accountToTransactionsMap);

    // Get the account filters and date filters and apply to the data
    let filteredData = new Map();
    const accountFilters = filters.accountFilterIds;
    const { fromDate, toDate } = filters.dateFilter;
    accountToDataPointsMap.forEach((datapoints, accountId) => {
      if (!accountFilters.has(accountId)) {
        filteredData.set(accountId, applyDateFilterToDataPoints(fromDate, toDate, datapoints));
      }
    });

    // Generate a series from the datapoints
    let newSeries = [];
    filteredData.forEach((datapoints, accountId) => {
      newSeries.push({
        name: getEntityManager().getAccountById(accountId).accountName,
        data: dataPointsToHighChartSeries(datapoints),
      });
    });
    setSeries(newSeries);
    console.log(newSeries);
  }, [allReportableTransactions, filters]);

  return <RunningBalanceGraph series={series} />;
};

// Props are given from context
// reported transactions: from context
// filters: from context
BalanceOverTimeComponent.propTypes = {
  filters: PropTypes.shape(FiltersPropType).isRequired,
  allReportableTransactions: PropTypes.array.isRequired,
};
