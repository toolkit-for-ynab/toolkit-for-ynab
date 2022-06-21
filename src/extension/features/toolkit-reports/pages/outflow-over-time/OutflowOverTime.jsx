import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { FiltersPropType } from 'toolkit-reports/common/components/report-context/component';
import {
  calculateCumulativeOutflowPerDate,
  calculateOutflowPerDate,
  filterTransactions,
  groupTransactions,
  toHighchartsSeries,
} from './utils';
import { OutflowGraph } from './OutflowGraph';
import { useLocalStorage } from 'toolkit/extension/hooks/useLocalStorage';
import { LabeledCheckbox } from 'toolkit/extension/features/toolkit-reports/common/components/labeled-checkbox';

export const OutflowOverTimeComponent = ({ allReportableTransactions, filters }) => {
  const [outflowSeries, setOutflowSeries] = useState([]);
  const [cumulativeSum, setCumulativeSum] = useLocalStorage(
    'outflow-over-time-useCumulativeSum',
    true
  );

  useEffect(() => {
    const filterOutAccounts = filters.accountFilterIds;
    const calculateOutflow = cumulativeSum
      ? calculateCumulativeOutflowPerDate
      : calculateOutflowPerDate;

    setOutflowSeries(
      toHighchartsSeries(
        calculateOutflow(
          groupTransactions(filterTransactions(allReportableTransactions, filterOutAccounts))
        )
      )
    );
  }, [allReportableTransactions, filters, cumulativeSum]);

  return (
    <div className="tk-flex tk-flex-column tk-flex-grow">
      <div className="tk-flex tk-pd-05 tk-border-b">
        <div className="tk-pd-x-1">
          <LabeledCheckbox
            id="tk-balance-over-time-stepgraph-option"
            checked={cumulativeSum}
            label="Cumulative sum"
            onChange={() => setCumulativeSum(!cumulativeSum)}
          />
        </div>
      </div>
      <OutflowGraph series={outflowSeries} />
    </div>
  );
};

OutflowOverTimeComponent.propTypes = {
  filters: PropTypes.shape(FiltersPropType).isRequired,
  allReportableTransactions: PropTypes.array.isRequired,
};
