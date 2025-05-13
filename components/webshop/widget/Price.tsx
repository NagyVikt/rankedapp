import React from 'react';

export interface PriceProps {
  value: number | string;
  currency: string;
}

export function Price({ value, currency }: PriceProps) {
  const v = typeof value === 'string' ? Number(value) : value;
  const formatted = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
  }).format(v);
  return <span>{formatted}</span>;
}
