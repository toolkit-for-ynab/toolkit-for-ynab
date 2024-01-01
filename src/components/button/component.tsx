import classNames from 'classnames';
import * as React from 'react';
import './styles.scss';
import { MouseEventHandler, ReactNode } from 'react';

interface PublicProps {
  className?: string;
  children: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  variant?: 'primary' | 'secondary' | 'transparent';
  size?: 's' | 'm';
}

export function Button({
  className,
  children,
  onClick = () => {},
  variant = 'secondary',
  size = 'm',
}: PublicProps) {
  return (
    <button
      className={classNames('button', className, {
        primary: variant === 'primary',
        secondary: variant === 'secondary',
        transparent: variant === 'transparent',
        'size-s': size === 's',
        'size-m': size === 'm',
      })}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
