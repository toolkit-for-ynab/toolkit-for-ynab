import Highcharts from 'highcharts';
import * as React from 'react';
import * as PropTypes from 'prop-types';
import { formatCurrency } from 'toolkit/extension/utils/currency';
import { sortByGettableDate } from 'toolkit/extension/utils/date';
import { l10n } from 'toolkit/extension/utils/toolkit';
import { FiltersPropType } from 'toolkit-reports/common/components/report-context/component';

import { Legend } from '../legend';

export const DailyReport = ({
  allReportableTransactions,
  filters: {
    accountFilterIds,
    dateFilter: { toDate, fromDate },
  },
}) => {
  const assets = [];
  const labels = [];
  const debts = [];
  const netWorths = [];

  const accounts = new Map();
  const transactions = allReportableTransactions
    .slice()
    .sort(sortByGettableDate)
    .filter(
      transaction => !accountFilterIds || !accountFilterIds.has(transaction.get('accountId '))
    );

  let lastDate = null;
  const pushCurrentAccountData = () => {
    let _assets = 0;
    let _debts = 0;
    accounts.forEach(total => {
      if (total > 0) {
        _assets += total;
      } else {
        _debts -= total;
      }
    });

    assets.push(_assets);
    debts.push(_debts);
    netWorths.push(_assets - _debts);
    labels.push(lastDate.toISOString());
  };

  transactions.forEach(transaction => {
    const transactionDate = transaction.get('date').clone();
    if (lastDate === null) {
      lastDate = transactionDate;
    }

    // we're on a new month
    if (transactionDate.toISOString() !== lastDate.toISOString()) {
      pushCurrentAccountData();
      lastDate = transactionDate;
    }

    const transactionAccountId = transaction.get('accountId');

    const transactionAmount = transaction.get('amount');
    if (accounts.has(transactionAccountId)) {
      accounts.set(transactionAccountId, accounts.get(transactionAccountId) + transactionAmount);
    } else {
      accounts.set(transactionAccountId, transactionAmount);
    }
  });

  if (lastDate && labels[labels.length - 1] !== lastDate.toISOString()) {
    pushCurrentAccountData();
  }

  if (transactions.length) {
    let currentIndex = 0;
    const transactionDate = transactions[0].get('date').clone();
    const lastFilterDate = toDate.clone();
    while (transactionDate.isBefore(lastFilterDate)) {
      if (!labels.includes(transactionDate.toISOString())) {
        labels.splice(currentIndex, 0, transactionDate.toISOString());
        assets.splice(currentIndex, 0, assets[currentIndex - 1] || 0);
        debts.splice(currentIndex, 0, debts[currentIndex - 1] || 0);
        netWorths.splice(currentIndex, 0, netWorths[currentIndex - 1] || 0);
      }

      currentIndex++;
      transactionDate.addDays(1);
    }
  }

  // Net Worth is calculated from the start of time so we need to handle "filters" here
  // rather than using `filteredTransactions` from context.
  let startIndex = labels.findIndex(label => label === fromDate.toISOString());
  startIndex = startIndex === -1 ? 0 : startIndex;
  let endIndex = labels.findIndex(label => label === toDate.toISOString());
  endIndex = endIndex === -1 ? labels.length + 1 : endIndex + 1;

  const filteredLabels = labels.slice(startIndex, endIndex);
  const filteredDebts = debts.slice(startIndex, endIndex);
  const filteredAssets = assets.slice(startIndex, endIndex);
  const filteredNetWorths = netWorths.slice(startIndex, endIndex);

  React.useEffect(() => {
    Highcharts.chart({
      credits: false,
      chart: { renderTo: 'tk-net-worth-chart' },
      legend: { enabled: false },
      title: { text: '' },
      tooltip: { enabled: false },
      xAxis: { categories: filteredLabels },
      yAxis: {
        title: { text: '' },
        labels: {
          formatter: function() {
            return formatCurrency(this.value);
          },
        },
      },
      series: [
        {
          id: 'assets',
          type: 'area',
          name: l10n('toolkit.assets', 'Assets'),
          color: 'rgba(142,208,223,1)',
          data: filteredAssets,
          pointPadding: 0,
          // point: pointHover,
        },
        {
          id: 'debts',
          type: 'area',
          name: l10n('toolkit.debts', 'Debts'),
          color: 'rgba(234,106,81,1)',
          data: filteredDebts,
          pointPadding: 0,
          // point: pointHover,
        },
        {
          id: 'networth',
          type: 'line',
          name: l10n('toolkit.netWorth', 'Net Worth'),
          fillColor: 'rgba(244,248,226,0.5)',
          negativeFillColor: 'rgba(247, 220, 218, 0.5)',
          data: filteredNetWorths,
          // point: pointHover,
        },
      ],
    });
  }, [filteredLabels, filteredDebts, filteredAssets, filteredNetWorths]);

  return (
    <React.Fragment>
      <div className="tk-flex tk-justify-content-end">
        {/* {hoveredData && (
          <Legend
            assets={hoveredData.assets}
            debts={hoveredData.debts}
            netWorth={hoveredData.netWorth}
          />
        )} */}
      </div>
      <div className="tk-highcharts-report-container" id="tk-net-worth-chart" />;
    </React.Fragment>
  );
};

DailyReport.propTypes = {
  filters: PropTypes.shape(FiltersPropType),
  allReportableTransactions: PropTypes.array.isRequired,
};
