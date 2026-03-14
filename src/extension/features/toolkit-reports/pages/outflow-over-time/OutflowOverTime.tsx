import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  calculateCumulativeOutflowPerDate,
  calculateOutflowPerDate,
  filterTransactions,
  groupTransactions,
  toHighchartsSeries,
  filterTransactionsByDate,
} from './utils';
import { OutflowGraph } from './OutflowGraph';
import { useLocalStorage } from 'toolkit/extension/hooks/useLocalStorage';
import { LabeledCheckbox } from 'toolkit/extension/features/toolkit-reports/common/components/labeled-checkbox';
import { AdditionalReportSettings } from 'toolkit/extension/features/toolkit-reports/common/components/additional-settings';
import { ReportContextType } from '../../common/components/report-context';

export const OutflowOverTimeComponent = ({
  filteredTransactions,
  allScheduledTransactions,
  filters,
}: Pick<
  ReportContextType,
  'filteredTransactions' | 'allScheduledTransactions' | 'filters'
>) => {
  const [outflowSeries, setOutflowSeries] = useState<Highcharts.SeriesLineOptions[]>([]);

  // Using CumulativeSum will show a growing trendline over the dates.
  const [cumulativeSum, setCumulativeSum] = useLocalStorage(
    'outflow-over-time-useCumulativeSum',
    true,
  );

  // Using IncludeInflows will include inflows which are not in category 'Inflow: Ready to Assign').
  const [includeInflows, setIncludeInflows] = useLocalStorage(
    'outflow-over-time-includeInflows',
    true,
  );

  // Show forecast overlays dotted series for scheduled transactions.
  const [showForecast, setShowForecast] = useLocalStorage('outflow-over-time-showForecast', false);

  useEffect(() => {
    if (!filters) return;
    const filterOutAccounts = filters.accountFilterIds;

    // These dates are used to appropriately filter based on the report context.
    const { fromDate, toDate } = filters.dateFilter;
    const calculateOutflow = cumulativeSum
      ? calculateCumulativeOutflowPerDate
      : calculateOutflowPerDate;

    const regularSeries = toHighchartsSeries(
      calculateOutflow(
        groupTransactions(
          filterTransactions(
            filterTransactionsByDate(filteredTransactions, fromDate, toDate),
            includeInflows,
            filterOutAccounts,
          ),
        ),
      ),
    );

    if (showForecast) {
      // Scheduled sub-transactions (split children) carry per-category amounts but not the
      // parent's recurrence frequency, while the split parent carries the total amount (which
      // would double-count against its own children). Summing amounts only needs leaf rows.
      const leafScheduledTransactions = allScheduledTransactions.filter(
        (transaction) => !transaction.isSplit,
      );

      const forecastSeries = toHighchartsSeries(
        calculateOutflow(
          groupTransactions(
            filterTransactions(
              filterTransactionsByDate(leafScheduledTransactions, fromDate, toDate),
              includeInflows,
              filterOutAccounts,
            ),
          ),
        ),
        { dashStyle: 'ShortDot', nameSuffix: ' (Scheduled)' },
      );

      // In cumulative mode, offset each forecast series so it continues from
      // where the actual series for that month ends.
      const adjustedForecastSeries = cumulativeSum
        ? forecastSeries.map((series) => {
            const monthName = (series.name as string).replace(' (Scheduled)', '');
            const actualSeries = regularSeries.find((s) => s.name === monthName);
            const lastActualData = actualSeries?.data as
              | Array<{ x: number; y: number }>
              | undefined;
            const offset =
              lastActualData && lastActualData.length > 0
                ? lastActualData[lastActualData.length - 1].y
                : 0;
            if (offset === 0) return series;
            return {
              ...series,
              data: (series.data as Array<{ x: number; y: number; custom: unknown[] }>).map(
                (point) => ({ ...point, y: point.y + offset }),
              ),
            };
          })
        : forecastSeries;

      setOutflowSeries([...regularSeries, ...adjustedForecastSeries]);
    } else {
      setOutflowSeries(regularSeries);
    }
  }, [
    filteredTransactions,
    allScheduledTransactions,
    filters,
    cumulativeSum,
    includeInflows,
    showForecast,
  ]);

  return (
    <div className="tk-flex tk-flex-column tk-flex-grow">
      <AdditionalReportSettings>
        <LabeledCheckbox
          id="tk-outflow-over-time-cumulative-sum-option"
          checked={cumulativeSum}
          label="Cumulative sum"
          onChange={() => setCumulativeSum(!cumulativeSum)}
        />
        <LabeledCheckbox
          id="tk-outflow-over-time-include-inflows-option"
          checked={includeInflows}
          label="Include inflows which are not in category 'Inflow: Ready to Assign'"
          onChange={() => setIncludeInflows(!includeInflows)}
        />
        <LabeledCheckbox
          id="tk-outflow-over-time-show-forecast-option"
          checked={showForecast}
          label="Show forecast (scheduled transactions)"
          onChange={() => setShowForecast(!showForecast)}
        />
      </AdditionalReportSettings>
      <OutflowGraph series={outflowSeries} />
    </div>
  );
};
