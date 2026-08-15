import type { V2Answers } from "./types";

/** Spec §10: show_abroad = (F3 in [Higher studies, Undecided]) AND (A7 in [a global, c conditional]).
 *  E3 = d keeps the gate open (family flag renders beside it). A7 in {b, d} → F4/F5 never render. */
export function showAbroad(answers: V2Answers): boolean {
  const f3 = answers.F3?.[0];
  const a7 = answers.A7?.[0];
  return (f3 === "a" || f3 === "c") && (a7 === "a" || a7 === "c");
}
