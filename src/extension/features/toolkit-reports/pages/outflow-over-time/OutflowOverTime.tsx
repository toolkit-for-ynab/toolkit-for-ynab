import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import {
  calculateAverageDailyForecast,
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
  allReportableTransactions,
  allScheduledTransactions,
  filters,
}: Pick<
  ReportContextType,
  'filteredTransactions' | 'allReportableTransactions' | 'allScheduledTransactions' | 'filters'
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

  // Show average forecast based on historical spending in the last N months.
  const [showAverageForecast, setShowAverageForecast] = useLocalStorage(
    'outflow-over-time-showAverageForecast',
    false,
  );
  const [averageMonths, setAverageMonths] = useLocalStorage('outflow-over-time-averageMonths', 3);

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

    const combined = [...regularSeries];

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

      combined.push(...adjustedForecastSeries);
    }

    if (showAverageForecast) {
      const avgData = calculateAverageDailyForecast(
        filterTransactions(allReportableTransactions, includeInflows, filterOutAccounts),
        averageMonths,
        moment(),
      );

      if (avgData.length > 0) {
        let cumulativeOffset = 0;
        if (cumulativeSum) {
          const currentMonthName = moment().format('MMM YYYY');
          const actualSeries = regularSeries.find((s) => s.name === currentMonthName);
          const actualData = actualSeries?.data as Array<{ x: number; y: number }> | undefined;
          cumulativeOffset = actualData?.length ? actualData[actualData.length - 1].y : 0;
        }

        let runningTotal = cumulativeOffset;
        combined.push({
          name: `${averageMonths}-mo average`,
          type: 'line',
          dashStyle: 'LongDash',
          data: avgData.map(({ day, value }) => {
            if (cumulativeSum) {
              runningTotal += value;
              return { x: day, y: runningTotal, custom: [] };
            }
            return { x: day, y: value, custom: [] };
          }),
        });
      }
    }

    setOutflowSeries(combined);
  }, [
    filteredTransactions,
    allReportableTransactions,
    allScheduledTransactions,
    filters,
    cumulativeSum,
    includeInflows,
    showForecast,
    showAverageForecast,
    averageMonths,
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
        <LabeledCheckbox
          id="tk-outflow-over-time-show-average-forecast-option"
          checked={showAverageForecast}
          label="Show average forecast (historical spending)"
          onChange={() => setShowAverageForecast(!showAverageForecast)}
        />
        {showAverageForecast && (
          <div
            className="tk-flex tk-align-items-center tk-gap-small"
            style={{ marginLeft: '24px' }}
          >
            <label htmlFor="tk-outflow-over-time-average-months">Months to average:</label>
            <select
              id="tk-outflow-over-time-average-months"
              value={averageMonths}
              onChange={(e) => setAverageMonths(parseInt(e.target.value, 10))}
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        )}
      </AdditionalReportSettings>
      <OutflowGraph series={outflowSeries} />
    </div>
  );
};
