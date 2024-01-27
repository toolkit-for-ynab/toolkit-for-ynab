import * as React from 'react';
import './styles.scss';

export type LabeledCheckbox = {
  id: string;
  checked: boolean;
  disabled?: boolean;
  label: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
};

export const LabeledCheckbox = ({
  id,
  checked,
  disabled = false,
  label,
  onChange,
}: LabeledCheckbox) => {
  return (
    <label className="tk-labeled-checkbox tk-flex tk-align-items-center">
      <input checked={checked} name={id} onChange={onChange} disabled={disabled} type="checkbox" />
      <span className="tk-mg-l-05">{label}</span>
    </label>
  );
};
