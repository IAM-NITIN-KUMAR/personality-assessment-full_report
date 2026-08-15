import type { V2Answers } from "../types";

export const D_SCORES: Record<"a" | "b" | "c" | "d", number> = { a: 2, b: 1, c: 0, d: -3 };

export function confTotal(answers: V2Answers): number {
  const d1 = answers.D1?.[0];
  const d2 = answers.D2?.[0];
  return (d1 ? D_SCORES[d1 as keyof typeof D_SCORES] ?? 0 : 0)
       + (d2 ? D_SCORES[d2 as keyof typeof D_SCORES] ?? 0 : 0);
}

export function confBand(total: number): "confirmed" | "provisional" | "mismatch" {
  if (total >= 3) return "confirmed";
  if (total >= 1) return "provisional";
  return "mismatch";
}
