import React from "react";

export function WeddingRingsIcon({ size = 40, color = "#1976d2" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      stroke={color}
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Left ring */}
      <circle cx="24" cy="40" r="14" />
      {/* Right ring */}
      <circle cx="40" cy="40" r="14" />
      {/* Left diamond */}
      <polygon
        points="24,26 19,20 24,14 29,20"
        fill="none"
        stroke={color}
        strokeWidth="3"
      />
      {/* Right diamond */}
      <polygon
        points="40,26 35,20 40,14 45,20"
        fill="none"
        stroke={color}
        strokeWidth="3"
      />
    </svg>
  );
}
