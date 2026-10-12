"use client";

import React from "react";

interface VesperLogoProps {
  className?: string;
  size?: number | string;
}

export const VesperLogo: React.FC<VesperLogoProps> = ({
  className = "",
  size = 48,
}) => {
  return (
    <svg
      viewBox="0 0 128 128"
      width={size}
      height={size}
      className={`select-none overflow-visible ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient
          id="vesperGoldBrand"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor="var(--accent-gold)" />
          <stop offset="100%" stopColor="var(--accent-gold-hover)" />
        </linearGradient>
      </defs>

      <g>
        {/* Faceted Outer V */}
        <path
          d="M 32 38 L 64 96 L 96 38"
          stroke="url(#vesperGoldBrand)"
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Diamond Beacon */}
        <path
          d="M 64 26 L 68 33 L 64 40 L 60 33 Z"
          fill="url(#vesperGoldBrand)"
        />

        {/* Inner Secondary Chevron Echo */}
        <path
          d="M 46 44 L 64 76 L 82 44"
          stroke="url(#vesperGoldBrand)"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeOpacity="0.75"
        />

        {/* Harmonic Energy Nodes */}
        <circle cx="32" cy="38" r="3" fill="var(--accent-gold)" />
        <circle cx="96" cy="38" r="3" fill="var(--accent-gold)" />
        <circle cx="64" cy="96" r="3.5" fill="var(--accent-gold)" />
      </g>
    </svg>
  );
};
