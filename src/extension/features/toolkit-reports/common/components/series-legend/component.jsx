import * as React from 'react';
import * as PropTypes from 'prop-types';
import { Currency } from 'toolkit-reports/common/components/currency';
import './styles.scss';

export const SeriesLegendComponent = props => {
  const sortedSeries = props.series.slice().sort((a, b) => b.y - a.y);
  const seriesTotal = sortedSeries.reduce((reduced, current) => reduced + current.y, 0);
  const { fromDate, toDate } = props.filters.dateFilter;
  const totalMonths = fromDate.monthsApart(toDate) + 1;

  const totalSummary = (
    <div className="tk-flex tk-flex-column tk-justify-content tk-align-items-center tk-border-b tk-pd-b-1">
      <div>Total {props.tableName}</div>
      <div className="tk-series-legend__summary-total">
        <Currency value={seriesTotal} />
      </div>
      <div>For this time period.</div>
    </div>
  );

  const averageSummary = (
    <div className="tk-flex tk-flex-column tk-justify-content tk-align-items-center tk-border-b tk-pd-y-1">
      <div>Average {props.tableName}</div>
      <div className="tk-series-legend__summary-total">
        <Currency value={seriesTotal / totalMonths} />
      </div>
      <div>Per month.</div>
    </div>
  );

  return (
    <div className="tk-series-legend tk-pd-1 tk-flex-grow tk-overflow-scroll tk-border-l">
      {totalSummary}
      {averageSummary}
      <div className="tk-series-legend__table-row tk-series-legend__table-row--header tk-mg-t-05 tk-flex tk-justify-content-between">
        <div>{props.sourceName}</div>
        <div>{props.tableName}</div>
      </div>
      <div className="tk-full-height">
        {sortedSeries.map(seriesData => (
          <div
            className="tk-series-legend__table-row tk-flex tk-justify-content-between"
            key={seriesData.id}
            onMouseEnter={() => props.onDataHover(seriesData.id)}
          >
            <div className="tk-flex">
              <div
                className="tk-series-legend__legend-icon tk-mg-r-05"
                style={{ backgroundColor: seriesData.color }}
              />
              <div>{seriesData.name}</div>
            </div>
            <div>
              <Currency value={seriesData.y} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

SeriesLegendComponent.propTypes = {
  filters: PropTypes.any.isRequired,
  onDataHover: PropTypes.func.isRequired,
  sourceName: PropTypes.string.isRequired,
  series: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      color: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      y: PropTypes.number.isRequired,
    })
  ),
  tableName: PropTypes.string.isRequired,
};
