import Highcharts from 'highcharts';
import * as React from 'react';
import * as PropTypes from 'prop-types';
import { formatCurrency } from 'toolkit/extension/utils/currency';
import { localizedMonthAndYear, sortByGettableDate } from 'toolkit/extension/utils/date';
import { l10n } from 'toolkit/extension/utils/toolkit';
import { FiltersPropType } from 'toolkit-reports/common/components/report-context/component';

import { Legend } from '../legend';

export const MonthlyReport = ({
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

  let lastMonth = null;
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
    labels.push(localizedMonthAndYear(lastMonth));
  };

  transactions.forEach(transaction => {
    const transactionMonth = transaction
      .get('date')
      .clone()
      .startOfMonth();
    if (lastMonth === null) {
      lastMonth = transactionMonth;
    }

    // we're on a new month
    if (transactionMonth.toISOString() !== lastMonth.toISOString()) {
      pushCurrentAccountData();
      lastMonth = transactionMonth;
    }

    const transactionAccountId = transaction.get('accountId');
    // if (accountFilterIds.has(transactionAccountId)) {
    //   return;
    // }

    const transactionAmount = transaction.get('amount');
    if (accounts.has(transactionAccountId)) {
      accounts.set(transactionAccountId, accounts.get(transactionAccountId) + transactionAmount);
    } else {
      accounts.set(transactionAccountId, transactionAmount);
    }
  });

  if (lastMonth && labels[labels.length - 1] !== localizedMonthAndYear(lastMonth)) {
    pushCurrentAccountData();
  }

  if (transactions.length) {
    let currentIndex = 0;
    const transactionMonth = transactions[0]
      .get('date')
      .clone()
      .startOfMonth();
    const lastFilterMonth = toDate
      .clone()
      .addMonths(1)
      .startOfMonth();
    while (transactionMonth.isBefore(lastFilterMonth)) {
      if (!labels.includes(localizedMonthAndYear(transactionMonth))) {
        labels.splice(currentIndex, 0, localizedMonthAndYear(transactionMonth));
        assets.splice(currentIndex, 0, assets[currentIndex - 1] || 0);
        debts.splice(currentIndex, 0, debts[currentIndex - 1] || 0);
        netWorths.splice(currentIndex, 0, netWorths[currentIndex - 1] || 0);
      }

      currentIndex++;
      transactionMonth.addMonths(1);
    }
  }

  // Net Worth is calculated from the start of time so we need to handle "filters" here
  // rather than using `filteredTransactions` from context.
  let startIndex = labels.findIndex(label => label === localizedMonthAndYear(fromDate));
  startIndex = startIndex === -1 ? 0 : startIndex;
  let endIndex = labels.findIndex(label => label === localizedMonthAndYear(toDate));
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
          id: 'debts',
          type: 'column',
          name: l10n('toolkit.debts', 'Debts'),
          color: 'rgba(234,106,81,1)',
          data: filteredDebts,
          pointPadding: 0,
          // point: pointHover,
        },
        {
          id: 'assets',
          type: 'column',
          name: l10n('toolkit.assets', 'Assets'),
          color: 'rgba(142,208,223,1)',
          data: filteredAssets,
          pointPadding: 0,
          // point: pointHover,
        },
        {
          id: 'networth',
          type: 'area',
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

MonthlyReport.propTypes = {
  filters: PropTypes.shape(FiltersPropType),
  allReportableTransactions: PropTypes.array.isRequired,
};
