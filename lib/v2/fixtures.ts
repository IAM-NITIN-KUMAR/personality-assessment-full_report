import type { V2Answers } from "./types";

/** Spec §12 worked sample: Ananya, B.Com 2nd year. Same answers must always give The Auditor. */
export const ANANYA_NAME = "Ananya";
export const ANANYA_ANSWERS: V2Answers = {
  Q0: ["b"],
  A1: ["c"], A2: ["a"], A3: ["a"], A4: ["d"], A5: ["c"], A6: ["b"], A7: ["c"],
  B1: ["a"], B2: ["c"], B3: ["b"], B4: ["b"], B5: ["a"], B6: ["c"],
  C1: ["b"], // her cards are [technology, finance, business, entrepreneurship]; b = Finance (seeded rank 2)
  C2: ["c"], C3: ["c"], C4: ["c"], C5: ["a"],
  D1: ["b"], D2: ["b"],
  E1: ["f"], E2: ["e"], E3: ["c"],
  F1: ["b"], F2: ["a"], F3: ["a"],
  F4: ["b"], F5a: ["b", "c"], F5b: ["b"], F5c: ["b"],
};
