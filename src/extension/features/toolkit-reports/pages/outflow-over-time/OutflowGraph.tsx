import React, { useEffect } from 'react';
import { showTransactionModal } from 'toolkit/extension/features/toolkit-reports/utils/show-transaction-modal';
import Highcharts from 'highcharts';
import { formatCurrency } from 'toolkit/extension/utils/currency';
import { PointWithPayload } from '../../utils/types';
import { YNABTransaction } from 'toolkit/types/ynab/data/transaction';

type Point = PointWithPayload<{ custom: YNABTransaction[] }>;

export const OutflowGraph = ({ series }: { series: Highcharts.SeriesLineOptions[] }) => {
  const GRAPH_ID = 'tk-outflow-over-time-report-graph';

  useEffect(() => {
    let textColor = 'var(--labelPrimary)';
    Highcharts.chart(GRAPH_ID, {
      title: {
        text: 'Outflow Over Time',
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
          text: 'Date',
          style: { color: textColor },
        },
        type: 'linear',
        min: 1,
        max: 31,
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
        pointFormatter: function () {
          let coloredPoint = `<span style="color:${this.color}">\u25CF</span>`;
          let totalAmount = formatCurrency(this.y, false);
          return `${coloredPoint} ${this.series.name}: <b>${totalAmount}</b><br/>`;
        },
      },
      plotOptions: {
        line: {
          marker: { enabled: false },
        },
        series: {
          cursor: 'pointer',
          events: {
            click: (event) => {
              const point = event.point as Point;
              if (point.custom && point.custom.length > 0) {
                const date = point.custom[0].date.toNativeDate();
                const formattedDate = ynab.YNABSharedLib.dateFormatter.formatDate(date);
                showTransactionModal(formattedDate, point.custom);
              }
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

  return <div className="tk-highcharts-report-container" id={GRAPH_ID} />;
};
