import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { generateForecasts } from './functions';
import Highcharts from 'highcharts';
import moment from 'moment';

export function ForecastComponent({ filteredTransactions }) {
  const [forecasts, setForecasts] = useState([]);
  const [chart, setChart] = useState();
  const chartRef = useRef();

  const confidences = [10, 25, 50, 75, 90];

  useEffect(() => {
    console.log({ filteredTransactions });
    setForecasts(generateForecasts(filteredTransactions));
  }, [filteredTransactions]);

  useEffect(() => {
    if (!chartRef.current) return;

    if (chart) {
      chart.destroy();
    }

    const now = moment();

    setChart(
      new Highcharts.Chart({
        credits: false,
        chart: {
          backgroundColor: 'transparent',
          renderTo: 'tk-forecast-chart',
        },
        title: { text: '' },
        xAxis: {
          labels: {
            formatter: function () {
              return now
                .clone()
                .add(this.value + 1, 'w')
                .format('YYYY-MM-DD');
            },
          },
        },
        yAxis: {
          labels: {
            formatter: function () {
              return `$${Number(this.value / 1000).toLocaleString()}`;
            },
          },
        },
        tooltip: {
          formatter: function () {
            return `${this.series.name}: <b>$${Number(
              this.point.y / 1000
            ).toLocaleString()}</b><br />${now
              .clone()
              .add(this.point.x + 1, 'w')
              .format('YYYY-MM-DD')}`;
          },
        },
        series: confidences.map((c) => ({
          id: c.toString(),
          type: 'line',
          name: `${c}%`,
          data: forecasts[c - 1],
        })),
      })
    );
  }, [chartRef, forecasts]);

  return (
    <>
      <div className={'tk-highcharts-report-container'} id={'tk-forecast-chart'} ref={chartRef} />
    </>
  );
}
