import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { FiltersPropType } from 'toolkit-reports/common/components/report-context/component';
import { RunningBalanceGraph } from './RunningBalanceGraph';
import { LabeledCheckbox } from 'toolkit-reports/common/components/labeled-checkbox';
import {
  dataPointsToHighChartSeries,
  generateRunningBalanceMap,
  applyDateFiltersToDataPoints,
  combineDataPoints,
} from './utils';
import { getEntityManager } from '../../../../utils/ynab';
export const BalanceOverTimeComponent = ({ allReportableTransactions, filters }) => {
  const GROUPED_LABEL = 'Selected Accounts';

  // Map of accounts to their corresponding datapoints for each date
  const [runningBalanceMap, setRunningBalanceMap] = useState(new Map());

  // Whether a single graph will be outputted using the selected accounts
  const [shouldGroupAccounts, setShouldGroupAccounts] = useState(false);

  // Whether the graph will be a step graph or not
  const [useStepGraph, setUseStepGraph] = useState(true);

  // The series to be fed into highcharts
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

    // Filter the overall running balance to only the datapoints what we want
    let filteredData = new Map();
    runningBalanceMap.forEach((datapoints, accountId) => {
      if (!accountFilters.has(accountId)) {
        filteredData.set(accountId, applyDateFiltersToDataPoints(fromDate, toDate, datapoints));
      }
    });

    if (shouldGroupAccounts) {
      // When grouping accounts, combined all the selected accounts datapoints to create a single series
      let datapointsToCombine = [];
      filteredData.forEach((datapoints, accountId) => {
        datapointsToCombine.push(datapoints);
      });
      newSeries.push({
        name: GROUPED_LABEL,
        data: dataPointsToHighChartSeries(combineDataPoints(datapointsToCombine)),
      });
    } else {
      // Output a series for each account
      filteredData.forEach((datapoints, accountId) => {
        newSeries.push({
          name: getEntityManager().getAccountById(accountId).accountName,
          data: dataPointsToHighChartSeries(datapoints),
        });
      });
    }

    setSeries(newSeries);
  }, [runningBalanceMap, filters, shouldGroupAccounts, useStepGraph]);

  return (
    <div className="tk-flex tk-flex-column tk-flex-grow">
      <div className="tk-flex tk-pd-05 tk-border-b">
        <div className="tk-pd-x-1">
          <LabeledCheckbox
            checked={shouldGroupAccounts}
            label="Group Accounts"
            onChange={() => setShouldGroupAccounts(!shouldGroupAccounts)}
          />
        </div>
        <div className="tk-pd-x-1">
          <LabeledCheckbox
            checked={useStepGraph}
            label="Use Step Graph"
            onChange={() => setUseStepGraph(!useStepGraph)}
          />
        </div>
      </div>
      <RunningBalanceGraph series={series} useStep={useStepGraph} />;
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
