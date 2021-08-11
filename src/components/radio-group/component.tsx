import classNames from 'classnames';
import * as React from 'react';
import './styles.scss';

interface RadioOption {
  value: string;
  name: string;
}

interface PublicProps {
  className?: string;
  name: string;
  options: RadioOption[];
  onChange: (value: string) => void;
  value: string;
}

export const RadioGroup = ({ className, name, onChange, options, value }: PublicProps) => (
  <div className={classNames('radio-group', className)}>
    {options.map((option) => (
      <div className="radio-group__option" key={option.name}>
        <input
          className="radio-group__input"
          type="radio"
          id={`${name}-${option.value}`}
          name={name}
          onChange={(e) => onChange(option.value as string)}
          value={option.value as string}
          checked={value === option.value}
        ></input>
        <label className="radio-group__toggle" htmlFor={`${name}-${option.value}`}></label>
        <label className="radio-group__label" htmlFor={`${name}-${option.value}`}>
          {option.name}
        </label>
      </div>
    ))}
  </div>
);
