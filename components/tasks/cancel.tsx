import React from "react";
import { IconProps } from "@heroui/react"; // Assuming IconProps is available for type consistency
// Removed the conflicting 'import CancelIcon' statement that was likely here

/**
 * CancelIcon component renders a cancel/close SVG icon (circle with an X).
 * It accepts standard SVG props and IconProps for customization.
 */
export const CancelIcon: React.FC<IconProps> = ({
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
    {/* SVG path for the circle */}
    <circle cx="12" cy="12" r="10" />
    {/* SVG path for the 'X' lines */}
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);
