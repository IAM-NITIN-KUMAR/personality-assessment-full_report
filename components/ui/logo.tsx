"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  /** Source path. Override if you put your asset somewhere other than /logo.png. */
  src?: string;
}

/**
 * Roots & Routes brand mark.
 *
 * Loads the brand SVG from /public by default. If the file 404s, we fall back
 * to an inline-SVG pinwheel so the layout never breaks.
 */
export function Logo({ className, src = "/Secure%20logo%20black%20svg.svg" }: LogoProps) {
  const [errored, setErrored] = useState(false);

  if (!errored) {
    return (
      <img
        src={src}
        alt="Roots & Routes"
        draggable={false}
        onError={() => setErrored(true)}
        className={cn("size-8 select-none object-contain", className)}
      />
    );
  }

  // Fallback when the image file isn't there yet.
  return (
    <svg
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      stroke="currentColor"
      strokeWidth={8.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-label="Roots & Routes"
      className={cn("size-8", className)}
    >
      <path d="M 6 22 C 18 22, 26 24, 32 32 C 38 40, 46 42, 58 42" />
      <path d="M 42 6 C 42 18, 40 26, 32 32 C 24 38, 22 46, 22 58" />
    </svg>
  );
}
