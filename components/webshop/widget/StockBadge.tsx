// components/webshop/widget/StockBadge.tsx
import React from "react";

export interface StockBadgeProps {
  quantity: number;
}

export function StockBadge({ quantity }: StockBadgeProps) {
  let bg, text, label;
  if (quantity <= 0) {
    bg = "bg-red-100";
    text = "text-red-800";
    label = "Out of stock";
  } else if (quantity < 5) {
    bg = "bg-yellow-100";
    text = "text-yellow-800";
    label = `Low stock (${quantity})`;
  } else {
    bg = "bg-green-100";
    text = "text-green-800";
    label = `In stock (${quantity})`;
  }

  return (
    <span
      className={`inline-block px-2 py-1 rounded-full text-sm font-medium ${bg} ${text}`}
    >
      {label}
    </span>
  );
}
