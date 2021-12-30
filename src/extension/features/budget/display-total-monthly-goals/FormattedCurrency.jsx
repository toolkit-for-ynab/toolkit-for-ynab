import React from 'react';
import { formatCurrency, getCurrencyClass } from 'toolkit/extension/utils/currency';

export const FormattedCurrency = ({ amount }) => (
  <span className={`user-data currency ${getCurrencyClass(amount)}`}>{formatCurrency(amount)}</span>
);
