import type { Mobility, SliderResult, SlidersResult, V2Answers } from "../types";

type SideMap = Record<string, string | null>;

// Side classification per item (spec §4 step 2). null = neutral.
const A1_SIDE: SideMap = { a: "Outgoing", b: null, c: "Reflective", d: "Outgoing" };
const A2_SIDE: SideMap = { a: "Reflective", b: null, c: "Outgoing", d: "Outgoing" };
const A3_SIDE: SideMap = { a: "Deliberate", b: "Instinctive", c: null, d: "Deliberate" };
const A4_SIDE: SideMap = { a: "Deliberate", b: "Instinctive", c: null, d: "Deliberate" };
const A5_SIDE: SideMap = { a: "Structured", b: "Open-ended", c: null, d: null };
const A6_SIDE: SideMap = { a: "Structured", b: "Structured", c: "Open-ended", d: "Open-ended" };

const MOBILITY: Record<string, Mobility> = { a: "global", b: "national", c: "conditional", d: "rooted" };

function band(sideA: string | null, sideB: string | null): SliderResult {
  if (sideA && sideB && sideA === sideB) return { band: "Clearly", side: sideA };
  if (sideA && !sideB) return { band: "Lean", side: sideA };
  if (sideB && !sideA) return { band: "Lean", side: sideB };
  return { band: "Balanced" }; // split or both neutral — never Clearly from one data point
}

function sideOf(map: SideMap, key?: string): string | null {
  if (!key) return null;
  return map[key] ?? null;
}

export function computeSliders(a: V2Answers): SlidersResult {
  return {
    energy: band(sideOf(A1_SIDE, a.A1?.[0]), sideOf(A2_SIDE, a.A2?.[0])),
    decision: band(sideOf(A3_SIDE, a.A3?.[0]), sideOf(A4_SIDE, a.A4?.[0])),
    structure: band(sideOf(A5_SIDE, a.A5?.[0]), sideOf(A6_SIDE, a.A6?.[0])),
    mobility: a.A7?.[0] ? MOBILITY[a.A7[0]] : undefined,
  };
}
