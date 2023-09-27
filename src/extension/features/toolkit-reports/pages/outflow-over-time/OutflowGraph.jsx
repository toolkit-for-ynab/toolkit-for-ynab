import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { showTransactionModal } from 'toolkit-reports/utils/show-transaction-modal';
import Highcharts from 'highcharts';
import { formatCurrency } from 'toolkit/extension/utils/currency';

export const OutflowGraph = ({ series }) => {
  const GRAPH_ID = 'tk-outflow-over-time-report-graph';

  useEffect(() => {
    let textColor = 'var(--label_primary)';
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
            click: ({ point: { custom } }) => {
              if (custom && custom.length > 0) {
                const date = custom[0].date.toNativeDate();
                const formattedDate = ynab.YNABSharedLib.dateFormatter.formatDate(date);
                showTransactionModal(formattedDate, custom);
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

OutflowGraph.propTypes = {
  series: PropTypes.array.isRequired,
};
