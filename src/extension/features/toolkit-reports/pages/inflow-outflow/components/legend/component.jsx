import * as React from 'react';
import * as PropTypes from 'prop-types';
import { Currency } from 'toolkit-reports/common/components/currency';
import './styles.scss';

export const Legend = (props) => (
  <React.Fragment>
    <div className="tk-mg-05 tk-pd-r-1 tk-border-r">
      <div className="tk-flex tk-mg-b-05 tk-align-items-center">
        <div className="tk-mg-0">&nbsp;</div>
      </div>
      <div className="tk-inflow-outflow-legend__text-faded">
        {props.label}
      </div>
    </div>
    <div className="tk-mg-05 tk-pd-r-1 tk-border-r">
      <div className="tk-flex tk-mg-b-05 tk-align-items-center">
        <div className="tk-inflow-outflow-legend__icon-outflows" />
        <div className="tk-mg-l-05">Outflows</div>
      </div>
      <div>
        <Currency value={props.outflows} />
      </div>
    </div>
    <div className="tk-mg-05 tk-pd-r-1 tk-border-r">
      <div className="tk-flex tk-mg-b-05 tk-align-items-center">
        <div className="tk-inflow-outflow-legend__icon-inflows" />
        <div className="tk-mg-l-05">Inflows</div>
      </div>
      <div>
        <Currency value={props.inflows} />
      </div>
    </div>
    <div className="tk-mg-05 tk-pd-r-1">
      <div className="tk-flex tk-mg-b-05 tk-align-items-center">
        <div className="tk-inflow-outflow-legend__icon-inflow-outflows" />
        <div className="tk-mg-l-05">Difference</div>
      </div>
      <div>
        <Currency value={props.diffs} />
      </div>
    </div>
  </React.Fragment>
);

Legend.propTypes = {
  inflows: PropTypes.number.isRequired,
  outflows: PropTypes.number.isRequired,
  diffs: PropTypes.number.isRequired,
};
