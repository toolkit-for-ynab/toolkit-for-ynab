import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { showTransactionModal } from 'toolkit-reports/utils/show-transaction-modal';
import Highcharts from 'highcharts';
import { formatCurrency } from 'toolkit/extension/utils/currency';
import { NUM_DATAPOINTS_LIMIT } from './utils';

export const RunningBalanceGraph = ({ series }) => {
  const GRAPH_ID = 'tk-balance-over-time-report-graph';

  // On every change of series, rerender our graph to the report container
  useEffect(() => {
    let textColor = 'var(--label_primary)';
    Highcharts.chart(GRAPH_ID, {
      title: {
        text: 'Balance Over Time',
        style: { color: textColor },
      },
      series: series,
      yAxis: {
        title: {
          text: 'Balance',
          style: { color: textColor },
        },
        labels: {
          formatter: e => {
            return formatCurrency(e.value, false);
          },
          style: { color: textColor },
        },
      },
      chart: {
        backgroundColor: 'transparent',
      },
      xAxis: {
        title: {
          text: 'Time',
          style: { color: textColor },
        },
        type: 'datetime',
        dateTimeLabelFormats: {
          day: '%b %d',
          week: '%b %d, %y',
          month: '%b %Y',
        },
        labels: {
          style: { color: textColor },
        },
      },
      legend: {
        layout: 'vertical',
        align: 'right',
        verticalAlign: 'middle',
        itemStyle: {
          color: textColor,
        },
      },
      tooltip: {
        useHTML: true,
        pointFormatter: function() {
          let coloredPoint = `<span style="color:${this.color}">\u25CF</span>`;
          let totalAmount = formatCurrency(this.y, false);
          let tooltip = `${coloredPoint} ${this.series.name}: <b>${totalAmount}</b><br/>`;

          if (this.netChange) {
            let netChange = formatCurrency(this.netChange, false);
            let color = this.netChange < 0 ? '#ea5439' : '#16a336'; // Red or Green
            tooltip += `${coloredPoint} Net Change: <span style="color: ${color}"><b>${netChange}</b> <br/>`;
          }
          return tooltip;
        },
      },
      plotOptions: {
        line: {
          marker: { enabled: false },
        },
        series: {
          turboThreshold: NUM_DATAPOINTS_LIMIT,
          cursor: 'pointer',
          events: {
            click: event => {
              if (event.point.transactions && event.point.transactions.length > 0) {
                let date = new Date(event.point.x);
                let formattedDate = ynab.YNABSharedLib.dateFormatter.formatDate(date);
                showTransactionModal(formattedDate, event.point.transactions);
              }
            },
            legendItemClick: event => {
              event.preventDefault(); // Prevent toggling via the legend
            },
          },
          states: {
            inactive: {
              enabled: false,
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

// Proptypes to use this component
// series The array of datapoints to use
// numDatapointslimit The number of datapoints to control turboThreshold
// https://api.highcharts.com/highcharts/plotOptions.series.turboThreshold
RunningBalanceGraph.propTypes = {
  series: PropTypes.array.isRequired,
  numDatapointsLimit: PropTypes.number.isRequired,
};
