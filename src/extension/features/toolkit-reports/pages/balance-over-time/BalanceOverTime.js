import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { FiltersPropType } from 'toolkit-reports/common/components/report-context/component';
import { RunningBalanceGraph } from './RunningBalanceGraph';
import {
  dataPointsToHighChartSeries,
  generateRunningBalanceMap,
  applyDateFiltersToDataPoints,
  combineDataPoints,
} from './utils';
import { getEntityManager } from '../../../../utils/ynab';
export const BalanceOverTimeComponent = ({ allReportableTransactions, filters }) => {
  const GROUPED_LABEL = 'Selected Accounts';
  // Whether we should group selected accounts together in the graph
  const [shouldGroupAccounts, setShouldGroupAccounts] = useState(false);

  // Map of accounts to their corresponding datapoints for each date
  const [runningBalanceMap, setRunningBalanceMap] = useState(new Map());

  // Array of objects, each object containing name and data to be fed into HighCharts
  const [series, setSeries] = useState([]);

  // Whenver transactions change, update all our datapoints.
  useEffect(() => {
    setRunningBalanceMap(generateRunningBalanceMap(allReportableTransactions));
  }, [allReportableTransactions.length]);

  // When our filters change, or deciding to group accounts, calculated the new data used for the series.
  useEffect(() => {
    const accountFilters = filters.accountFilterIds;
    const { fromDate, toDate } = filters.dateFilter;
    let newSeries = [];

    // Filter the overall running balance to only the datapoints what we want
    let filteredData = new Map();
    runningBalanceMap.forEach((datapoints, accountId) => {
      if (!accountFilters.has(accountId)) {
        filteredData.set(accountId, applyDateFiltersToDataPoints(fromDate, toDate, datapoints));
      }
    });

    if (shouldGroupAccounts) {
      // When grouping accounts, combined all the selected accounts datapoints
      let datapointsToCombine = [];
      filteredData.forEach((datapoints, accountId) => {
        datapointsToCombine.push(datapoints);
      });
      newSeries.push({
        name: GROUPED_LABEL,
        data: dataPointsToHighChartSeries(combineDataPoints(datapointsToCombine)),
      });
    } else {
      filteredData.forEach((datapoints, accountId) => {
        newSeries.push({
          name: getEntityManager().getAccountById(accountId).accountName,
          data: dataPointsToHighChartSeries(datapoints),
        });
      });
    }
    setSeries(newSeries);
    console.log('Finished Applying filters...');
  }, [runningBalanceMap, filters, shouldGroupAccounts]);

  return (
    <div className="tk-flex tk-flex-column tk-flex-grow">
      <div className="tk-flex tk-pd-l-2 tk-pd-t-05">
        <button onClick={() => setShouldGroupAccounts(!shouldGroupAccounts)}>
          {' '}
          Group Accounts{' '}
        </button>
      </div>
      <RunningBalanceGraph series={series} />;
    </div>
  );
};

// Props are given from context
// reported transactions: from context
// filters: from context
BalanceOverTimeComponent.propTypes = {
  filters: PropTypes.shape(FiltersPropType).isRequired,
  allReportableTransactions: PropTypes.array.isRequired,
};
