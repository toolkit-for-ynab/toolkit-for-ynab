import * as React from 'react';
import * as PropTypes from 'prop-types';
import { formatCurrency } from 'toolkit/extension/utils/currency';

export const Currency = props => <span className="currency">{formatCurrency(props.value)}</span>;

Currency.propTypes = {
  value: PropTypes.number.isRequired,
};
