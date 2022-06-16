import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { FiltersPropType } from 'toolkit-reports/common/components/report-context/component';
import {
  calculateCumulativeOutflowPerDate,
  filterTransactions,
  groupTransactions,
  toHighchartsSeries,
} from './utils';
import { OutflowGraph } from './OutflowGraph';

export const OutflowOverTimeComponent = ({ allReportableTransactions, filters }) => {
  const [outflowSeries, setOutflowSeries] = useState([]);

  useEffect(() => {
    const filterOutAccounts = filters.accountFilterIds;
    setOutflowSeries(
      toHighchartsSeries(
        calculateCumulativeOutflowPerDate(
          groupTransactions(filterTransactions(allReportableTransactions, filterOutAccounts))
        )
      )
    );
  }, [allReportableTransactions, filters]);

  return <OutflowGraph series={outflowSeries} />;
};

OutflowOverTimeComponent.propTypes = {
  filters: PropTypes.shape(FiltersPropType).isRequired,
  allReportableTransactions: PropTypes.array.isRequired,
};
