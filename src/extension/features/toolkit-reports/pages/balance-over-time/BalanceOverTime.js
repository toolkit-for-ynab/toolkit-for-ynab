import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { FiltersPropType } from 'toolkit-reports/common/components/report-context/component';
import { RunningBalanceGraph } from './RunningBalanceGraph';
import {
  dataPointsToHighChartSeries,
  generateRunningBalanceMap,
  applyDateFiltersToDataPoints,
} from './utils';
import { getEntityManager } from '../../../../utils/ynab';

export const BalanceOverTimeComponent = ({ allReportableTransactions, filters }) => {
  // Whether we should group selected accounts together in the graph
  const [shouldGroupAccounts, setShouldGroupAccounts] = useState(false);

  // Map of accounts to their corresponding datapoints for each date
  const [runningBalanceMap, setRunningBalanceMap] = useState(new Map());

  // Array of objects, each object containing name and data to be fed into HighCharts
  const [series, setSeries] = useState([]);

  // Whenver transactions change, update all our datapoints.
  useEffect(() => {
    setRunningBalanceMap(generateRunningBalanceMap(allReportableTransactions));
  }, [allReportableTransactions]);

  // When our filters change, or deciding to group accounts, calculated the new data used for the series.
  useEffect(() => {
    const accountFilters = filters.accountFilterIds;
    const { fromDate, toDate } = filters.dateFilter;
    let newSeries = [];
    runningBalanceMap.forEach((datapoints, accountId) => {
      if (!accountFilters.has(accountId)) {
        newSeries.push({
          name: getEntityManager().getAccountById(accountId).accountName,
          data: dataPointsToHighChartSeries(
            applyDateFiltersToDataPoints(fromDate, toDate, datapoints)
          ),
        });
      }
    });
    setSeries(newSeries);
  }, [allReportableTransactions, filters, shouldGroupAccounts]);

  return <RunningBalanceGraph series={series} />;
};

// Props are given from context
// reported transactions: from context
// filters: from context
BalanceOverTimeComponent.propTypes = {
  filters: PropTypes.shape(FiltersPropType).isRequired,
  allReportableTransactions: PropTypes.array.isRequired,
};
