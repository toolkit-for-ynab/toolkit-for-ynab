import classnames from 'classnames';
import * as PropTypes from 'prop-types';
import * as React from 'react';
import { localizedMonthAndYear } from 'toolkit/extension/utils/date';
import { MonthStyle } from 'toolkit/extension/utils/toolkit';
import { Currency } from 'toolkit-reports/common/components/currency';
import './styles.scss';

function getViewZeroAsEmptySetting() {
  const { ViewZeroAsEmpty } = (window.ynabToolKit && window.ynabToolKit.options) || {};
  return ViewZeroAsEmpty;
}

export const MonthlyTotalsRow = props => {
  const allMonthsTotal =
    props.monthlyTotals &&
    props.monthlyTotals.reduce((reduced, monthData) => reduced + monthData.get('total'), 0);
  const allMonthsSuffix = allMonthsTotal < 0 ? '--negative' : '--positive';
  const allMonthsClassName = classnames('tk-monthly-totals-row__data-cell', {
    [`tk-monthly-totals-row__data-cell${allMonthsSuffix}`]: props.emphasizeTotals,
  });
  const shouldHideZeroCells = getViewZeroAsEmptySetting();

  return (
    <div className={`tk-flex tk-monthly-totals-row ${props.className}`} onClick={props.onClick}>
      {props.titleCell && (
        <div className="tk-monthly-totals-row__title-cell">{props.titleCell}</div>
      )}
      {props.monthlyTotals && (
        <React.Fragment>
          {props.monthlyTotals.map(monthData => {
            const total = monthData.get('total');
            const suffix = total < 0 ? '--negative' : '--positive';
            const className = classnames('tk-monthly-totals-row__data-cell', {
              [`tk-monthly-totals-row__data-cell${suffix}`]: props.emphasizeTotals,
            });
            const monthTotal = monthData.get('total');
            const isTotalZero = monthTotal === 0;
            const shouldHideCurrency = shouldHideZeroCells && isTotalZero;

            return (
              <div key={monthData.get('date').toISOString()} className={className}>
                {props.titles
                  ? localizedMonthAndYear(monthData.get('date'), MonthStyle.Short)
                  : !shouldHideCurrency && <Currency value={monthTotal} />}
              </div>
            );
          })}
          <div key="average" className={allMonthsClassName}>
            {props.titles ? (
              'Average'
            ) : (
              <Currency value={allMonthsTotal / props.monthlyTotals.length} />
            )}
          </div>
          <div key="total" className={allMonthsClassName}>
            {props.titles ? 'Total' : <Currency value={allMonthsTotal} />}
          </div>
        </React.Fragment>
      )}
    </div>
  );
};

MonthlyTotalsRow.propTypes = {
  className: PropTypes.string,
  emphasizeTotals: PropTypes.bool,
  monthlyTotals: PropTypes.array,
  onClick: PropTypes.func,
  titleCell: PropTypes.any.isRequired,
  titles: PropTypes.bool,
};

MonthlyTotalsRow.defaultProps = {
  className: '',
  emphasizeTotals: false,
  onClick: () => {},
  titles: false,
};
