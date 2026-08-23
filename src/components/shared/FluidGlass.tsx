"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface FluidGlassProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export function FluidGlass({ children, className, ...props }: FluidGlassProps) {
  const filterId = React.useId().replace(/:/g, "_");

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-full border border-black/[0.08] dark:border-[#73FFFF]/20",
        "bg-white/80 dark:bg-[#072e33]/50 backdrop-blur-xl backdrop-saturate-150",
        "shadow-[0_4px_24px_0_rgba(0,0,0,0.06),0_1px_2px_0_rgba(0,0,0,0.04)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]",
        className
      )}
      {...props}
    >
      {/* Liquid refraction backdrop layer */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 rounded-[inherit] overflow-hidden"
        style={{ backdropFilter: `url("#${filterId}") blur(20px)` }}
      />

      {/* Optical top highlight reflection */}
      <div className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/80 dark:via-[#73FFFF]/25 to-transparent" />

      {/* Foreground Content */}
      <div className="relative z-10">{children}</div>

      {/* SVG filter for fluid liquid refraction */}
      <svg aria-hidden="true" className="hidden" focusable={false}>
        <defs>
          <filter
            id={filterId}
            colorInterpolationFilters="sRGB"
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.04 0.04"
              numOctaves="1"
              result="noise"
            />
            <feGaussianBlur in="noise" stdDeviation="1.5" result="blurredNoise" />
            <feDisplacementMap
              in="SourceGraphic"
              in2="blurredNoise"
              scale="12"
              xChannelSelector="R"
              yChannelSelector="B"
            />
          </filter>
        </defs>
      </svg>
    </div>
  );
}

export default FluidGlass;
