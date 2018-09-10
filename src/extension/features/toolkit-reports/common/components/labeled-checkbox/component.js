import * as React from 'react';
import * as PropTypes from 'prop-types';

export const LabeledCheckbox = ({ id, checked, label, onChange }) => {
  return (
    <label className="tk-flex tk-align-items-center tk-pd-y-05">
      <input checked={checked} name={id} onChange={onChange} type="checkbox"/>
      <span className="tk-mg-l-05">{label}</span>
    </label>
  );
};

LabeledCheckbox.propTypes = {
  id: PropTypes.string.isRequired,
  checked: PropTypes.bool.isRequired,
  label: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired
};
