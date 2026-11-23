import { CONCLUSION_IDS, POST_STEPS, PRE_STEPS } from "./bank";
import type { FpStep } from "./bank";
import { many, num, txt } from "./score";
import type { FpAnswers } from "./score";

/** A step is done once everything it asks has an answer. */
export function stepDone(step: FpStep, a: FpAnswers): boolean {
  switch (step.kind) {
    case "text": return txt(a, step.id).length > 0;
    case "choice": return many(a, step.id).length > 0;
    case "grid":
      return step.rows.every((r) => (step.options.length ? num(a, r.id) !== undefined : many(a, r.id).length > 0));
    case "conclusions": return CONCLUSION_IDS.every((id) => txt(a, id).length > 0);
  }
}

export const nextPreStep = (a: FpAnswers): FpStep | null => PRE_STEPS.find((s) => !stepDone(s, a)) ?? null;
export const nextPostStep = (a: FpAnswers): FpStep | null => POST_STEPS.find((s) => !stepDone(s, a)) ?? null;
