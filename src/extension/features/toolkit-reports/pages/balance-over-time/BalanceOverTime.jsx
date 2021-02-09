import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { FiltersPropType } from 'toolkit-reports/common/components/report-context/component';
import { RunningBalanceGraph } from './RunningBalanceGraph';
import { LabeledCheckbox } from 'toolkit-reports/common/components/labeled-checkbox';
import { WarningMessage } from './WarningMessage';
import { useLocalStorage } from 'toolkit/extension/hooks/useLocalStorage';
import { l10n } from 'toolkit/extension/utils/toolkit';
import { getEntityManager } from 'toolkit/extension/utils/ynab';
import {
  dataPointsToHighChartSeries,
  generateRunningBalanceMap,
  applyDateFiltersToDataPoints,
  combineDataPoints,
  generateTrendLine,
  checkSeriesLimitReached,
  NUM_DATAPOINTS_LIMIT,
} from './utils';

export const BalanceOverTimeComponent = ({ allReportableTransactions, filters }) => {
  const GROUPED_LABEL = 'Selected Accounts';
  const TRENDLINE_PREFIX = 'Trendline for ';

  // Options to group accounts, use a step graph and/or generate trendlines
  const [shouldGroupAccounts, setShouldGroupAccounts] = useLocalStorage(
    'balance-over-time-shouldGroupAccounts',
    false
  );
  const [shouldGroupAccountsByType, setShouldGroupAccountsByType] = useLocalStorage(
    'balance-over-time-shouldGroupAccountsByType',
    false
  );
  const [useStepGraph, setUseStepGraph] = useLocalStorage('balance-over-time-useStepGraph', true);
  const [useTrendLine, setUseTrendLine] = useLocalStorage('balance-over-time-useTrendline', false);

  // Map of accounts to their corresponding datapoints for each date
  const [runningBalanceMap, setRunningBalanceMap] = useState(new Map());
  // The series to be fed into highcharts
  const [series, setSeries] = useState([]);
  const [datapointLimitReached, setDatapointLimitReached] = useState(false);

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

    if (shouldGroupAccounts && shouldGroupAccountsByType) {
      // Group datapoints by account type
      let groupedData = {
        entities: {},
        ids: [],
      };
      filteredData.forEach((datapoints, accountId) => {
        const { accountType } = getEntityManager().getAccountById(accountId);

        if (!groupedData.entities[accountType]) {
          groupedData.entities[accountType] = [];
          groupedData.ids.push(accountType);
        }

        groupedData.entities[accountType].push(datapoints);
      });

      groupedData.ids.forEach(accountType => {
        newSeries.push({
          name: l10n(`accountTypes.${accountType}`),
          step: useStepGraph ? 'right' : undefined,
          data: dataPointsToHighChartSeries(combineDataPoints(groupedData.entities[accountType])),
        });
      });
    } else if (shouldGroupAccounts) {
      // When grouping accounts, combined all the selected accounts datapoints to create a single series
      let datapointsToCombine = [];
      filteredData.forEach(datapoints => {
        datapointsToCombine.push(datapoints);
      });
      newSeries.push({
        name: GROUPED_LABEL,
        step: useStepGraph ? 'right' : undefined,
        data: dataPointsToHighChartSeries(combineDataPoints(datapointsToCombine)),
      });
    } else {
      // Output a series for each account
      filteredData.forEach((datapoints, accountId) => {
        newSeries.push({
          name: getEntityManager().getAccountById(accountId).accountName,
          step: useStepGraph ? 'right' : undefined,
          data: dataPointsToHighChartSeries(datapoints),
        });
      });
    }

    // Trendline option
    if (useTrendLine) {
      newSeries.forEach(seriesData => {
        newSeries.push({
          name: `${TRENDLINE_PREFIX}${seriesData.name}`,
          dashStyle: 'dash',
          data: generateTrendLine(seriesData.data),
        });
      });
    }

    // Add a check to see if we've reached the max number of datapoints
    setDatapointLimitReached(newSeries.some(checkSeriesLimitReached));
    setSeries(newSeries);
  }, [
    runningBalanceMap,
    filters,
    shouldGroupAccounts,
    shouldGroupAccountsByType,
    useStepGraph,
    useTrendLine,
  ]);

  if (datapointLimitReached) {
    return (
      <WarningMessage
        message={`You have reached the datapoint limit of ${NUM_DATAPOINTS_LIMIT} datapoints per series. Please try reducing the filter`}
      />
    );
  }
  return (
    <div className="tk-flex tk-flex-column tk-flex-grow">
      <div className="tk-flex tk-pd-05 tk-border-b">
        <div className="tk-pd-x-1">
          <LabeledCheckbox
            id="tk-balance-over-time-groupaccounts-option"
            checked={shouldGroupAccounts}
            label="Group Accounts"
            onChange={() => setShouldGroupAccounts(!shouldGroupAccounts)}
          />
        </div>
        {shouldGroupAccounts && (
          <div className="tk-pd-x-1">
            <LabeledCheckbox
              id="tk-balance-over-time-groupaccounts-option"
              checked={shouldGroupAccountsByType}
              label="by type"
              onChange={() => setShouldGroupAccountsByType(!shouldGroupAccountsByType)}
            />
          </div>
        )}
        <div className="tk-pd-x-1">
          <LabeledCheckbox
            id="tk-balance-over-time-trendline-option"
            checked={useTrendLine}
            label="Show Trendline"
            onChange={() => setUseTrendLine(!useTrendLine)}
          />
        </div>
        <div className="tk-pd-x-1">
          <LabeledCheckbox
            id="tk-balance-over-time-stepgraph-option"
            checked={useStepGraph}
            label="Use Step Graph"
            onChange={() => setUseStepGraph(!useStepGraph)}
          />
        </div>
      </div>
      <RunningBalanceGraph series={series} numDatapointsLimit={NUM_DATAPOINTS_LIMIT} />
    </div>
  );
};

// Props are given from context
BalanceOverTimeComponent.propTypes = {
  filters: PropTypes.shape(FiltersPropType).isRequired,
  allReportableTransactions: PropTypes.array.isRequired,
};
