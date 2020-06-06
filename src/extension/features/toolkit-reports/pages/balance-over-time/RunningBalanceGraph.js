import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { showTransactionModal } from 'toolkit-reports/utils/show-transaction-modal';
import Highcharts from 'highcharts';
import { formatCurrency } from 'toolkit/extension/utils/currency';

export const RunningBalanceGraph = ({ series }) => {
  const GRAPH_ID = 'tk-balance-over-time-report-graph';

  // On every change of series, rerender our graph to the report container
  useEffect(() => {
    Highcharts.chart(GRAPH_ID, {
      title: { text: 'Balance Over Time' },
      series: series,
      yAxis: {
        title: { text: 'Balance' },
        labels: {
          formatter: e => {
            return formatCurrency(e.value, false);
          },
        },
      },
      xAxis: {
        title: { text: 'Time' },
        type: 'datetime',
        dateTimeLabelFormats: {
          day: '%b %d',
          week: '%b %d, %y',
          month: '%b %Y',
        },
      },
      legend: {
        layout: 'vertical',
        align: 'right',
        verticalAlign: 'middle',
      },
      tooltip: {
        useHTML: true,
        pointFormatter: function() {
          let coloredPoint = `<span style="color:${this.color}">\u25CF</span>`;
          let totalAmount = formatCurrency(this.y, false);
          let netChange = formatCurrency(this.netChange, false);

          let tooltip = `${coloredPoint} ${this.series.name}: <b>${totalAmount}</b><br/>`;
          let color = this.netChange < 0 ? '#ea5439' : '#16a336'; // Red or Green
          tooltip += `${coloredPoint} Net Change: <span style="color: ${color}"><b>${netChange}</b> <br/>`;
          return tooltip;
        },
      },
      plotOptions: {
        line: {
          marker: { enabled: false },
        },
        series: {
          step: true,
          cursor: 'pointer',
          events: {
            click: event => {
              let date = new Date(event.point.x);
              let formattedDate = ynab.YNABSharedLib.dateFormatter.formatDate(date);
              showTransactionModal(formattedDate, event.point.transactions);
            },
            legendItemClick: event => {
              event.preventDefault(); // Prevent toggling via the legend
            },
          },
        },
      },
      responsive: {
        rules: [
          {
            condition: { maxWidth: 500 },
            chartOptions: {
              legend: {
                layout: 'horizontal',
                align: 'center',
                verticalAlign: 'bottom',
              },
            },
          },
        ],
      },
    });
  }, [series]);

  // Generate our report container
  return <div className="tk-highcharts-report-container" id={GRAPH_ID} />;
};

RunningBalanceGraph.propTypes = {
  series: PropTypes.array.isRequired,
};
