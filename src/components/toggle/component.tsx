import classNames from 'classnames';
import * as React from 'react';
import './styles.scss';

interface PublicProps {
  onText?: string;
  disabled?: boolean;
  offText?: string;
  checked: boolean;
  htmlFor: string;
  className?: string;
  onChange(checked: boolean): void;
}

export const Toggle = ({
  className,
  disabled,
  onText,
  offText,
  checked,
  htmlFor,
  onChange,
}: PublicProps) => (
  <div className={classNames('toggle', className)}>
    <input
      id={htmlFor}
      className="toggle__input"
      type="checkbox"
      checked={!disabled && checked}
      onChange={(e) => onChange(e.currentTarget.checked)}
      disabled={disabled}
    ></input>
    <label
      className={classNames('toggle__label', {
        'toggle__label--labeled': onText && offText,
      })}
      htmlFor={htmlFor}
    >
      {onText && offText && (
        <>
          <span className="toggle__toggle-text toggle__toggle-text--left">{onText}</span>
          <span className="toggle__toggle-text toggle__toggle-text--right">{offText}</span>
        </>
      )}
    </label>
  </div>
);
