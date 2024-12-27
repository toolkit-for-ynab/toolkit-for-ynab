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
  allReportableTransactions,
  filters,
}: Pick<ReportContextType, 'allReportableTransactions' | 'filters'>) => {
  const [outflowSeries, setOutflowSeries] = useState<Highcharts.SeriesLineOptions[]>([]);

  // Using CumulativeSum will show a growing trendline over the dates.
  const [cumulativeSum, setCumulativeSum] = useLocalStorage(
    'outflow-over-time-useCumulativeSum',
    true
  );

  // Using IncludeInflows will include inflows which are not in category 'Inflow: Ready to Assign').
  const [includeInflows, setIncludeInflows] = useLocalStorage(
    'outflow-over-time-includeInflows',
    true
  );

  useEffect(() => {
    if (!filters) return;
    const filterOutAccounts = filters.accountFilterIds;

    // These dates are used to appropriately filter based on the report context.
    const { fromDate, toDate } = filters.dateFilter;
    const calculateOutflow = cumulativeSum
      ? calculateCumulativeOutflowPerDate
      : calculateOutflowPerDate;

    setOutflowSeries(
      toHighchartsSeries(
        calculateOutflow(
          groupTransactions(
            filterTransactions(
              filterTransactionsByDate(allReportableTransactions, fromDate, toDate),
              includeInflows,
              filterOutAccounts
            )
          )
        )
      )
    );
  }, [allReportableTransactions, filters, cumulativeSum, includeInflows]);

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
      </AdditionalReportSettings>
      <OutflowGraph series={outflowSeries} />
    </div>
  );
};
