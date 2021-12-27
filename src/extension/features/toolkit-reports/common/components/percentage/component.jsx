import * as React from 'react';
import * as PropTypes from 'prop-types';

export const Percentage = (props) => {
  let { value, pretty, numbersAfterPoint } = props;
  if (pretty) {
    value *= 100;
  }
  value = value.toFixed(numbersAfterPoint);
  return <span className="percentage">{value}%</span>;
};

Percentage.propTypes = {
  value: PropTypes.number.isRequired,
  pretty: PropTypes.bool,
  numbersAfterPoint: PropTypes.number,
};

Percentage.defaultProps = {
  pretty: true,
  numbersAfterPoint: 2,
};
