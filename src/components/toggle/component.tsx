import * as React from 'react';
import './styles.scss';

interface PublicProps {
  checked: boolean;
  htmlFor: string;
  onChange(checked: boolean): void;
}

export const Toggle = ({ checked, htmlFor, onChange }: PublicProps) => (
  <div className="toggle">
    <input
      id={htmlFor}
      className="toggle__input"
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.currentTarget.checked)}
    ></input>
    <label className="toggle__label" htmlFor={htmlFor}></label>
  </div>
);
