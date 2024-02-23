import React, { useEffect } from 'react';
import { showTransactionModal } from 'toolkit/extension/features/toolkit-reports/utils/show-transaction-modal';
import Highcharts from 'highcharts';
import { formatCurrency } from 'toolkit/extension/utils/currency';
import { NUM_DATAPOINTS_LIMIT } from './utils';
import { PointWithPayload } from '../../utils/types';
import { YNABTransaction } from 'toolkit/types/ynab/data/transaction';
import { Serie } from './BalanceOverTime';

type RunningBalanceGraphProps = {
  series: Serie[];
};

type Point = PointWithPayload<{ netChange: number; transactions: YNABTransaction[]; x: number }>;

export const RunningBalanceGraph = ({ series }: RunningBalanceGraphProps) => {
  const GRAPH_ID = 'tk-balance-over-time-report-graph';

  // On every change of series, rerender our graph to the report container
  useEffect(() => {
    let textColor = 'var(--labelPrimary)';
    // @ts-ignore Incorrect typings for point from Highcharts
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
          formatter: (e) => {
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
        pointFormatter: function (this: Point) {
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
            click: (event) => {
              const point = event.point as Point;
              if (point.transactions && point.transactions.length > 0) {
                let date = new Date(point.x);
                let formattedDate = ynab.YNABSharedLib.dateFormatter.formatDate(date);
                showTransactionModal(formattedDate, point.transactions);
              }
            },
            legendItemClick: (event) => {
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
