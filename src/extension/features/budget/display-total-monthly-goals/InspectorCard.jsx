import React from 'react';
import { useLocalStorage } from 'toolkit/extension/hooks/useLocalStorage';

import { FormattedCurrency } from './FormattedCurrency';

const RightArrow = () => (
  <svg height="12" width="12" id="ember1340" className="ynab-new-icon card-chevron">
    <use href="#icon_sprite_chevron_right"></use>
  </svg>
);

const DownArrow = () => (
  <svg height="12" width="12" id="ember1340" className="ynab-new-icon card-chevron">
    <use href="#icon_sprite_chevron_down"></use>
  </svg>
);

const InspectorCardHeader = ({ onClick, children }) =>
  onClick ? (
    <button className="card-roll-up" onClick={onClick}>
      {children}
    </button>
  ) : (
    <div className="card-roll-up">{children}</div>
  );

const createId = (str) =>
  (str || '')
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');

export const InspectorCard = ({ title, mainAmount, className = '', children }) => {
  const [isOpen, setIsOpen] = useLocalStorage(`inspector-card-${createId(title)}-open`, true);
  const onHeaderClick = children ? () => setIsOpen(!isOpen) : undefined;

  return (
    <section className={`card ${isOpen ? '' : 'is-collapsed'} ${className}`}>
      <InspectorCardHeader onClick={onHeaderClick}>
        <h2>
          {title}
          {onHeaderClick && <>{isOpen ? <DownArrow /> : <RightArrow />}</>}
          {mainAmount !== undefined && <FormattedCurrency amount={mainAmount} />}
        </h2>
      </InspectorCardHeader>
      {children && <div className="card-body">{children}</div>}
    </section>
  );
};
