import classNames from 'classnames';
import * as React from 'react';
import './styles.scss';

interface PublicProps {
  className?: string;
  children: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  variant?: 'default' | 'primary' | 'hollow';
}

export function Button({
  className,
  children,
  onClick = () => {},
  variant = 'default',
}: PublicProps) {
  return (
    <button
      className={classNames('button', className, {
        button__primary: variant === 'primary' || variant === 'default',
        button__hollow: variant === 'hollow',
      })}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
