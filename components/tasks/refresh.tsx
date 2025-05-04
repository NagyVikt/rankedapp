import React from "react";
import { IconProps } from "@heroui/react"; // Assuming IconProps is available for type consistency

/**
 * RefreshIcon component renders a refresh/retry SVG icon.
 * It accepts standard SVG props and IconProps for customization.
 */
export const RefreshIcon: React.FC<IconProps> = ({
  size = 24, // Default size
  width,
  height,
  ...props // Spread other props like className, style, onClick, etc.
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={width || size}
    height={height || size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor" // Use currentColor to inherit color
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props} // Apply passed props
  >
    <path d="M21.5 2v6h-6" />
    <path d="M2.5 22v-6h6" />
    <path d="M22 11.5A10 10 0 0 0 3.5 12.5" />
    <path d="M2 12.5a10 10 0 0 0 18.5-1" />
  </svg>
);
