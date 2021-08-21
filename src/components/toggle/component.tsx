import classNames from 'classnames';
import * as React from 'react';
import './styles.scss';

interface PublicProps {
  enabledText?: string;
  disabledText?: string;
  checked: boolean;
  htmlFor: string;
  className?: string;
  onChange(checked: boolean): void;
}

export const Toggle = ({
  className,
  enabledText,
  disabledText,
  checked,
  htmlFor,
  onChange,
}: PublicProps) => (
  <div className={classNames('toggle', className)}>
    <input
      id={htmlFor}
      className="toggle__input"
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.currentTarget.checked)}
    ></input>
    <label
      className={classNames('toggle__label', {
        'toggle__label--labeled': enabledText && disabledText,
      })}
      htmlFor={htmlFor}
    >
      {enabledText && disabledText && (
        <>
          <span className="toggle__toggle-text toggle__toggle-text--left">{enabledText}</span>
          <span className="toggle__toggle-text toggle__toggle-text--right">{disabledText}</span>
        </>
      )}
    </label>
  </div>
);
