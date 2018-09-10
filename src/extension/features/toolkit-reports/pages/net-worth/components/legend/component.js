import * as React from 'react';
import * as PropTypes from 'prop-types';
import { formatCurrency } from 'toolkit/extension/utils/currency';
import './styles.scss';

export const Legend = (props) => ((
  <React.Fragment>
    <div className="tk-mg-05 tk-pd-r-1 tk-border-r">
      <div className="tk-flex tk-mg-b-05 tk-align-items-center">
        <div className="tk-net-worth-legend__icon-debts"></div>
        <div className="tk-mg-l-05">Debts</div>
      </div>
      <div>{formatCurrency(props.debts)}</div>
    </div>
    <div className="tk-mg-05 tk-pd-r-1 tk-border-r">
      <div className="tk-flex tk-mg-b-05 tk-align-items-center">
        <div className="tk-net-worth-legend__icon-assets"></div>
        <div className="tk-mg-l-05">Assets</div>
      </div>
      <div>{formatCurrency(props.assets)}</div>
    </div>
    <div className="tk-mg-05 tk-pd-r-1">
      <div className="tk-flex tk-mg-b-05 tk-align-items-center">
        <div className="tk-net-worth-legend__icon-net-worths"></div>
        <div className="tk-mg-l-05">Net Worth</div>
      </div>
      <div>{formatCurrency(props.netWorth)}</div>
    </div>
  </React.Fragment>
));

Legend.propTypes = {
  assets: PropTypes.number.isRequired,
  debts: PropTypes.number.isRequired,
  netWorth: PropTypes.number.isRequired
};
