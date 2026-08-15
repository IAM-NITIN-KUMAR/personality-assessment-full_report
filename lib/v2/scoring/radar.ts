import type { BItem, RadarDim, RadarScores, V2Answers } from "../types";

export const B_DIM: Record<BItem, RadarDim> = {
  B1: "analytical",
  B2: "people",
  B3: "creative",
  B4: "entrepreneurial",
  B5: "practical",
  B6: "leadership",
};

const RAW: Record<string, number> = { a: 3, b: 1, c: 0, d: -2 };

/** Spec §4 step 1: dimension_score = (raw + 2) * 2 → a=10, b=6, c=4, d=0. No normalisation. */
export function computeRadar(answers: V2Answers): RadarScores {
  const out = {} as RadarScores;
  (Object.keys(B_DIM) as BItem[]).forEach((item) => {
    const key = answers[item]?.[0];
    if (key === undefined || !(key in RAW)) {
      out[B_DIM[item]] = 0; // defensive: unanswered counts as a zero (Decision 17)
      return;
    }
    out[B_DIM[item]] = (RAW[key] + 2) * 2;
  });
  return out;
}
