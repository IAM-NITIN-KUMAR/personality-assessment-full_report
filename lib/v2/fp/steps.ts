import { POST_STEPS, PRE_STEPS, fpId } from "./bank";
import type { FpOption, FpPart, FpStep } from "./bank";
import { many, num, txt } from "./score";
import type { FpAnswers } from "./score";

/** A question is done once everything it asks has an answer. */
export function stepDone(step: FpStep, a: FpAnswers): boolean {
  switch (step.kind) {
    case "text": return txt(a, step.id).length > 0;
    case "choice": return many(a, step.id).length > 0;
    case "grid":
      return step.rows.every((r) => (step.options.length ? num(a, r.id) !== undefined : many(a, r.id).length > 0));
  }
}

/**
 * One page of the test. The student sees exactly one question at a time, so a
 * grid question (several statements rated on one scale, or several parts each
 * with its own options) becomes one page per row.
 */
export interface FpPage {
  /** The id the answer is stored under: the question's own id, or the row's id for a grid. */
  id: string;
  part: FpPart;
  category: string;
  kind: "text" | "choice" | "scale";
  prompt: string;
  /** The wider question this page is one row of, shown above the prompt. */
  lead?: string;
  hint?: string;
  options: FpOption[];
  multi?: boolean;
  /** Most options a multi-select accepts. */
  max?: number;
  /** What 1 and 5 mean on a scale page. */
  anchors?: [string, string];
}

export function pagesOf(steps: FpStep[]): FpPage[] {
  return steps.flatMap((s): FpPage[] => {
    const base = { part: s.part, category: s.category };
    if (s.kind === "text") return [{ ...base, id: s.id, kind: "text", prompt: s.prompt, hint: s.hint, options: [] }];
    if (s.kind === "choice") return [{ ...base, id: s.id, kind: "choice", prompt: s.prompt, hint: s.hint, options: s.options, multi: s.multi, max: s.max }];
    const scale = s.options.length > 0;
    return s.rows.map((r): FpPage => {
      const own: [string, string] | undefined = r.left && r.right ? [r.left, r.right] : undefined;
      return {
        ...base, id: r.id, kind: scale ? "scale" : "choice", prompt: r.label, lead: s.prompt,
        // A row with its own two ends (a dial) explains itself; "left side / right side" would not.
        hint: own ? undefined : s.hint,
        options: r.options ?? s.options,
        anchors: scale ? own ?? s.anchors : undefined,
      };
    });
  });
}

/**
 * The module questions the test actually asks.
 *
 * The test is capped at 29 questions: the 26 scored ones plus these three,
 * each with worded answers (no 1-to-5 scale, no typing). The rest of the
 * module (confidence, the twelve assumptions, the working-day breakdown and
 * the dials) is not asked, so the report's Thinking Page, which needs all of
 * it, is not built. To bring the Thinking Page back, ask every page again by
 * dropping the two filters below.
 */
export const ASKED_BEFORE: string[] = [fpId("A2"), fpId("A3")];
export const ASKED_AFTER: string[] = [fpId("C3.gap")];

/** Two questions run before the main test and one after it. */
export const PRE_PAGES: FpPage[] = pagesOf(PRE_STEPS).filter((p) => ASKED_BEFORE.includes(p.id));
export const POST_PAGES: FpPage[] = pagesOf(POST_STEPS).filter((p) => ASKED_AFTER.includes(p.id));

/** Only the answers the test asks for. An older session may hold more; the report ignores those. */
export function askedOnly(a: FpAnswers): FpAnswers {
  const keep = new Set([...ASKED_BEFORE, ...ASKED_AFTER]);
  return Object.fromEntries(Object.entries(a).filter(([id]) => keep.has(id)));
}
export const FP_PAGE_COUNT = PRE_PAGES.length + POST_PAGES.length;

export function pageDone(page: FpPage, a: FpAnswers): boolean {
  if (page.kind === "text") return txt(a, page.id).length > 0;
  if (page.kind === "scale") return num(a, page.id) !== undefined;
  return many(a, page.id).length > 0;
}

export const nextPrePage = (a: FpAnswers): FpPage | null => PRE_PAGES.find((p) => !pageDone(p, a)) ?? null;
export const nextPostPage = (a: FpAnswers): FpPage | null => POST_PAGES.find((p) => !pageDone(p, a)) ?? null;
