// components/tasks/RefreshIcon.tsx
import React, { SVGProps } from 'react';

export const RefreshIcon: React.FC<SVGProps<SVGSVGElement>> = ({
  width,
  height,
  ...props
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={width}
    height={height}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M21.5 2v6h-6" />
    <path d="M2.5 22v-6h6" />
    <path d="M22 11.5A10 10 0 0 0 3.5 12.5" />
    <path d="M2 12.5a10 10 0 0 0 18.5-1" />
  </svg>
);
