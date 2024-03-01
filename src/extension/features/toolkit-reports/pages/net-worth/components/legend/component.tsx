import * as React from 'react';
import * as PropTypes from 'prop-types';
import { Currency } from 'toolkit/extension/features/toolkit-reports/common/components/currency';
import { isFeatureEnabled } from 'toolkit/extension/utils/feature';
import './styles.scss';

export type LegendProps = {
  assets: number;
  debts: number;
  netWorth: number;
  changePreviousMonth: number;
  label: string;
  debtRatio: number;
};

export const Legend = (props: LegendProps) => (
  <React.Fragment>
    <div className="tk-mg-05 tk-pd-r-1 tk-border-r">
      <div className="tk-flex tk-mg-b-05 tk-align-items-center">
        <div className="tk-mg-0">&nbsp;</div>
      </div>
      <div className="tk-net-worth-legend__text-faded">{props.label}</div>
    </div>
    <div className="tk-mg-05 tk-pd-r-1 tk-border-r">
      <div className="tk-flex tk-mg-b-05 tk-align-items-center">
        <div className="tk-net-worth-legend__icon-debts" />
        <div className="tk-mg-l-05">Debts</div>
      </div>
      <div>
        <Currency value={props.debts} />
      </div>
    </div>
    <div className="tk-mg-05 tk-pd-r-1 tk-border-r">
      <div className="tk-flex tk-mg-b-05 tk-align-items-center">
        <div className="tk-net-worth-legend__icon-assets" />
        <div className="tk-mg-l-05">Assets</div>
      </div>
      <div>
        <Currency value={props.assets} />
      </div>
    </div>
    {!isFeatureEnabled(window.ynabToolKit.options.HideDebtRatio) && (
      <div className="tk-debt-ratio">
        <div className="tk-mg-05 tk-pd-r-1 tk-border-r">
          <div className="tk-flex tk-mg-b-05 tk-align-items-center">
            <div className="tk-mg-0">Debt Ratio</div>
          </div>
          <div>{Math.round(props.debtRatio)}%</div>
        </div>
      </div>
    )}
    <div className="tk-mg-05 tk-pd-r-1 tk-border-r">
      <div className="tk-flex tk-mg-b-05 tk-align-items-center">
        <div className="tk-net-worth-legend__icon-net-worths" />
        <div className="tk-mg-l-05">Net Worth</div>
      </div>
      <div>
        <Currency value={props.netWorth} />
      </div>
    </div>
    <div className="tk-mg-05 tk-pd-r-1">
      <div className="tk-flex tk-mg-b-05 tk-align-items-center">
        <div className="tk-net-worth-legend__icon-net-worths" />
        <div className="tk-mg-l-05">Change</div>
      </div>
      <div>
        <Currency value={props.changePreviousMonth} />
      </div>
    </div>
  </React.Fragment>
);
