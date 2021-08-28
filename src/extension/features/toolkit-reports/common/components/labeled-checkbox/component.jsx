import * as React from 'react';
import * as PropTypes from 'prop-types';
import './styles.scss';

export const LabeledCheckbox = ({ id, checked, disabled, label, onChange }) => {
  return (
    <label className="tk-labeled-checkbox tk-flex tk-align-items-center">
      <input checked={checked} name={id} onChange={onChange} disabled={disabled} type="checkbox" />
      <span className="tk-mg-l-05">{label}</span>
    </label>
  );
};

LabeledCheckbox.propTypes = {
  id: PropTypes.string.isRequired,
  checked: PropTypes.bool.isRequired,
  disabled: PropTypes.bool,
  label: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

LabeledCheckbox.defaultProps = {
  disabled: false,
};
