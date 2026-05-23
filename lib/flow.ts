import { Question, Section, StudentProfile } from "./types";
import { CONTEXT_QUESTIONS } from "./question-bank/context";
import { ROOTS_ANCHORS } from "./question-bank/roots";
import { ROUTES_BCA, ROUTES_BCA_ENGAGEMENT } from "./question-bank/routes-bca";

/** Positions inside the Roots anchor list where we fire an adaptive probe.
 *  Roots now has 20 anchors; we sprinkle 5 probes across the journey so the
 *  feel stays personal without over-stretching. Routes has 8 anchors with 3 probes. */
const ROOTS_PROBE_AFTER_ANCHOR_INDEX = [2];
const ROUTES_PROBE_AFTER_ANCHOR_INDEX = [0];

export function anchorsForSection(
  section: Section,
  discipline: StudentProfile["discipline"] = "tech_cs",
): Question[] {
  if (section === "context") return CONTEXT_QUESTIONS;
  if (section === "roots") return ROOTS_ANCHORS;
  if (section === "routes") {
    // For v0, the tech_cs (BCA / CS) Routes bank is the only one built out.
    // Other disciplines temporarily reuse it as a fallback; per-discipline
    // Routes banks land in a follow-up pass.
    void discipline;
    return [...ROUTES_BCA, ROUTES_BCA_ENGAGEMENT];
  }
  return [];
}

export interface NextStep {
  kind: "anchor" | "probe" | "transition" | "complete";
  /** For "anchor": the next anchor question to append to trunk. */
  anchor?: Question;
  /** For "probe": the parent question whose answer should generate a probe. */
  probeParent?: Question;
  /** For "transition": the new section the user should enter next. */
  nextSection?: Section;
}

/**
 * Decide what comes after the current question in the trunk.
 *
 * The user has just answered (and clicked Next on) `current`. We look at the
 * section, position in anchors, adaptive budget already used, and decide:
 *   - issue an adaptive probe branching off `current` (if probe slot)
 *   - advance to the next anchor in the section
 *   - transition to the next section
 *   - mark complete
 */
export function planNext(args: {
  current: Question;
  trunk: Question[];
  discipline: StudentProfile["discipline"];
}): NextStep {
  const { current, trunk, discipline } = args;
  const section = current.section;

  if (section === "context") {
    const anchors = anchorsForSection("context");
    const idx = anchors.findIndex((a) => a.id === current.id);
    if (idx >= 0 && idx < anchors.length - 1) {
      return { kind: "anchor", anchor: anchors[idx + 1] };
    }
    // Done with context → roots starts.
    return {
      kind: "anchor",
      anchor: ROOTS_ANCHORS[0],
      nextSection: "roots",
    } as NextStep;
  }

  if (section === "roots") {
    const probeIndices = ROOTS_PROBE_AFTER_ANCHOR_INDEX;
    return planScored(current, trunk, ROOTS_ANCHORS, probeIndices, "teaser");
  }

  if (section === "routes") {
    const anchors = anchorsForSection("routes", discipline);
    const probeIndices = ROUTES_PROBE_AFTER_ANCHOR_INDEX;
    return planScored(current, trunk, anchors, probeIndices, "report");
  }

  return { kind: "complete" };
}

function planScored(
  current: Question,
  trunk: Question[],
  anchors: Question[],
  probeIndices: number[],
  endSection: Section,
): NextStep {
  // If `current` is an anchor and its index is a probe slot AND no probe has
  // already been generated for this anchor, emit a probe.
  if (current.kind === "anchor") {
    const anchorIdx = anchors.findIndex((a) => a.id === current.id);
    const alreadyProbed = trunk.some(
      (q) => q.kind === "adaptive" && q.parentId === current.id,
    );
    if (anchorIdx >= 0 && probeIndices.includes(anchorIdx) && !alreadyProbed) {
      return { kind: "probe", probeParent: current };
    }
  }

  // Otherwise advance to next item in the anchor list. We count anything that
  // appears in the anchor bank (anchors AND the engagement check), so that the
  // engagement check terminates the section rather than looping forever.
  const sectionItemsInTrunk = trunk
    .filter((q) => anchors.some((a) => a.id === q.id))
    .map((q) => anchors.findIndex((a) => a.id === q.id));
  const lastIdx = sectionItemsInTrunk.length
    ? Math.max(...sectionItemsInTrunk)
    : -1;
  const nextIdx = lastIdx + 1;

  if (nextIdx < anchors.length) {
    return { kind: "anchor", anchor: anchors[nextIdx] };
  }

  // Section complete → transition.
  return { kind: "transition", nextSection: endSection };
}

/** How many anchors total across visible flow, for progress label. */
export function totalQuestionCountFor(
  discipline: StudentProfile["discipline"],
): number {
  return (
    CONTEXT_QUESTIONS.length +
    ROOTS_ANCHORS.length +
    anchorsForSection("routes", discipline).length
  );
}
