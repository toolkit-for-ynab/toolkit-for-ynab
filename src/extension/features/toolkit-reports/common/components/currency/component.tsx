import * as React from 'react';
import { formatCurrency } from 'toolkit/extension/utils/currency';

export const Currency = (props: { value: number }) => (
  <span className="currency">{formatCurrency(props.value)}</span>
);
