import * as React from 'react';

export const Percentage = ({
  value,
  pretty = true,
  numbersAfterPoint = 2,
}: {
  value: number;
  pretty?: boolean;
  numbersAfterPoint?: number;
}) => {
  if (pretty) {
    value *= 100;
  }
  const stringValue = value.toFixed(numbersAfterPoint);
  return <span className="percentage">{stringValue}%</span>;
};
