import React from 'react';
import PropTypes from 'prop-types';
export const WarningMessage = ({ message }) => {
  return <div className="tk-flex tk-justify-content-center tk-align-items-center">{message}</div>;
};

WarningMessage.propTypes = {
  message: PropTypes.string.isRequired,
};
