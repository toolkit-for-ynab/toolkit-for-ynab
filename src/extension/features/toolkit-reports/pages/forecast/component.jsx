import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { generateForecasts } from './functions';
import Highcharts from 'highcharts';
import moment from 'moment';

export function ForecastComponent({ filteredTransactions }) {
  const [netWorth, setNetWorth] = useState();
  const [forecasts, setForecasts] = useState([]);
  const [chart, setChart] = useState();
  const chartRef = useRef();

  const confidences = [10, 25, 50, 75, 90];

  useEffect(() => {
    console.log({ filteredTransactions });
    const newForecasts = generateForecasts(filteredTransactions);
    setForecasts(newForecasts);
    setNetWorth(newForecasts[0][0]);
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
                .format('MMM YYYY');
            },
          },
        },
        yAxis: {
          title: { text: '' },
          labels: {
            formatter: function () {
              return `$${Number(this.value / 1000).toLocaleString()}`;
            },
          },
        },
        tooltip: {
          formatter: function () {
            const series = this.series.name;
            const years = this.point.x / 52;
            const dollars = this.point.y / 1000;
            const dollarString = Number(dollars).toLocaleString();
            const apy = Math.log(dollars / (netWorth / 1000)) / years;
            const apyString = `${(apy * 100).toFixed(1)}%`;
            const date = now
              .clone()
              .add(this.point.x + 1, 'w')
              .format('YYYY-MM-DD');

            return `${series}: <b>$${dollarString}</b><br />APY: ${apyString}<br />${date}`;
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
