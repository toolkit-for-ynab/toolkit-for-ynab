import React, { useEffect, useState } from 'react';
import { RunningBalanceGraph } from './RunningBalanceGraph';
import { LabeledCheckbox } from 'toolkit/extension/features/toolkit-reports/common/components/labeled-checkbox';
import { WarningMessage } from './WarningMessage';
import { useLocalStorage } from 'toolkit/extension/hooks/useLocalStorage';
import { l10nAccountType } from 'toolkit/extension/utils/toolkit';
import { getEntityManager } from 'toolkit/extension/utils/ynab';
import { AdditionalReportSettings } from 'toolkit/extension/features/toolkit-reports/common/components/additional-settings';
import {
  dataPointsToHighChartSeries,
  generateRunningBalanceMap,
  applyDateFiltersToDataPoints,
  combineDataPoints,
  generateTrendLine,
  checkSeriesLimitReached,
  NUM_DATAPOINTS_LIMIT,
  Datapoint,
  PointPayload,
} from './utils';
import { ReportContextType } from '../../common/components/report-context';
import { YNABAccountType } from 'toolkit/types/ynab/window/ynab-enums';

export type Serie = {
  name: string;
  step: string | undefined;
  data: PointPayload[];
};

export const BalanceOverTimeComponent = ({
  allReportableTransactions,
  filters,
}: Pick<ReportContextType, 'allReportableTransactions' | 'filters'>) => {
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
  const [series, setSeries] = useState<Serie[]>([]);
  const [datapointLimitReached, setDatapointLimitReached] = useState(false);

  // Whenver transactions change, update all our datapoints.
  useEffect(() => {
    setRunningBalanceMap(generateRunningBalanceMap(allReportableTransactions));
  }, [allReportableTransactions]);

  // When our filters change, or deciding to group accounts, calculated the new data used for the series.
  useEffect(() => {
    if (!filters) return;
    const accountFilters = filters.accountFilterIds;
    const { fromDate, toDate } = filters.dateFilter;
    let newSeries = [];

    // Filter the overall running balance to only the datapoints what we want
    let filteredData = new Map<string, Map<number, Datapoint>>();
    runningBalanceMap.forEach((datapoints, accountId) => {
      if (!accountFilters.has(accountId)) {
        filteredData.set(accountId, applyDateFiltersToDataPoints(fromDate, toDate, datapoints));
      }
    });

    if (shouldGroupAccounts && shouldGroupAccountsByType) {
      // Group datapoints by account type
      let groupedData = {
        entities: {} as Record<YNABAccountType, Map<number, Datapoint>[]>,
        ids: [] as YNABAccountType[],
      };
      filteredData.forEach((datapoints, accountId) => {
        const { accountType } = getEntityManager().getAccountById(accountId);

        if (!groupedData.entities[accountType]) {
          groupedData.entities[accountType] = [];
          groupedData.ids.push(accountType);
        }

        groupedData.entities[accountType].push(datapoints);
      });

      groupedData.ids.forEach((accountType) => {
        newSeries.push({
          name: l10nAccountType(accountType),
          step: useStepGraph ? 'right' : undefined,
          data: dataPointsToHighChartSeries(combineDataPoints(groupedData.entities[accountType])),
        });
      });
    } else if (shouldGroupAccounts) {
      // When grouping accounts, combined all the selected accounts datapoints to create a single series
      let datapointsToCombine: Map<number, Datapoint>[] = [];
      filteredData.forEach((datapoints) => {
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
      newSeries.forEach((seriesData) => {
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
      <AdditionalReportSettings>
        <LabeledCheckbox
          id="tk-balance-over-time-groupaccounts-option"
          checked={shouldGroupAccounts}
          label="Group Accounts"
          onChange={() => setShouldGroupAccounts(!shouldGroupAccounts)}
        />
        {shouldGroupAccounts && (
          <LabeledCheckbox
            id="tk-balance-over-time-groupaccounts-option"
            checked={shouldGroupAccountsByType}
            label="by type"
            onChange={() => setShouldGroupAccountsByType(!shouldGroupAccountsByType)}
          />
        )}
        <LabeledCheckbox
          id="tk-balance-over-time-trendline-option"
          checked={useTrendLine}
          label="Show Trendline"
          onChange={() => setUseTrendLine(!useTrendLine)}
        />
        <LabeledCheckbox
          id="tk-balance-over-time-stepgraph-option"
          checked={useStepGraph}
          label="Use Step Graph"
          onChange={() => setUseStepGraph(!useStepGraph)}
        />
      </AdditionalReportSettings>
      <RunningBalanceGraph series={series} />
    </div>
  );
};
