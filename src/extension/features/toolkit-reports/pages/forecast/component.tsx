import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { generateForecasts } from './functions';
import Highcharts from 'highcharts';
import moment from 'moment';
import { formatCurrency } from 'toolkit/extension/utils/currency';
import { ReportContextType } from '../../common/components/report-context';

export function ForecastComponent({
  filteredTransactions,
  allReportableTransactions,
  filters,
}: Pick<ReportContextType, 'allReportableTransactions' | 'filteredTransactions' | 'filters'>) {
  const [netWorth, setNetWorth] = useState<number>(0);
  const [forecasts, setForecasts] = useState<number[][]>([]);
  const [chart, setChart] = useState<Highcharts.Chart | undefined>(undefined);
  const chartRef = useRef<HTMLDivElement>(null);

  const confidences = [10, 25, 50, 75, 90];

  useEffect(() => {
    const newForecasts = generateForecasts(
      filteredTransactions,
      allReportableTransactions,
      filters
    );
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
        credits: { enabled: false },
        chart: {
          backgroundColor: 'transparent',
          renderTo: 'tk-forecast-chart',
        },
        legend: {
          itemStyle: {
            color: '#888888',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 'bold',
            textOverflow: 'ellipsis',
          },
        },
        title: { text: '' },
        xAxis: {
          labels: {
            formatter: function () {
              return now
                .clone()
                .add((this.value as number) + 1, 'w')
                .format('MMM YYYY');
            },
          },
        },
        yAxis: {
          title: { text: '' },
          labels: {
            formatter: function () {
              return formatCurrency(this.value);
            },
          },
        },
        tooltip: {
          formatter: function () {
            const series = this.series.name;
            const years = this.point.x / 52;
            const apy = Math.log(this.point.y! / netWorth) / years;
            const apyString = `${(apy * 100).toFixed(1)}%`;
            const date = now
              .clone()
              .add(this.point.x + 1, 'w')
              .format('YYYY-MM-DD');

            return `${series}: <b>${formatCurrency(
              this.point.y
            )}</b><br />APY: ${apyString}<br />${date}`;
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
