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
        points="24,18 21,14 24,10 27,14"
        fill="none"
        stroke={color}
        strokeWidth="3"
      />
      {/* Right diamond */}
      <polygon
        points="40,18 37,14 40,10 43,14"
        fill="none"
        stroke={color}
        strokeWidth="3"
      />
    </svg>
  );
}
