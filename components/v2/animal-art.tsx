"use client";

import { ANIMALS } from "@/lib/v2/types";
import type { RadarDim } from "@/lib/v2/types";
import { ANIMAL_ART, PUP, PUP_ART } from "@/lib/v2/animal-geometry";

/**
 * Low-poly animal portrait for the v2 report. Pure polygon render of
 * ANIMAL_ART — the same data the react-pdf renderer will consume.
 * "pup" renders the Explorer's animal, which has no radar dimension.
 */
export function AnimalArt({
  dim,
  size = 280,
  rounded = true,
}: {
  dim: RadarDim | "pup";
  size?: number;
  /** Round the tile corners (soft card look). */
  rounded?: boolean;
}) {
  const artData = dim === "pup" ? PUP_ART : ANIMAL_ART[dim];
  return (
    <svg
      width={size}
      height={size}
      viewBox={artData.viewBox}
      role="img"
      aria-label={`${dim === "pup" ? PUP.name : ANIMALS[dim].name} illustration`}
      style={rounded ? { borderRadius: "10%", overflow: "hidden", display: "block" } : { display: "block" }}
    >
      <rect width={200} height={200} fill={artData.bg} />
      {artData.polygons.map((p, i) => (
        // stroke matches fill to close antialiasing hairlines between facets
        <polygon key={i} points={p.points} fill={p.fill} stroke={p.fill} strokeWidth={0.6} strokeLinejoin="round" />
      ))}
    </svg>
  );
}

export default AnimalArt;
