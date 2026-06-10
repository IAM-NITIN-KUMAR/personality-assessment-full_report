import { Question, Section, StudentProfile } from "./types";
import { CONTEXT_QUESTIONS } from "./question-bank/context";
import { ROOTS_ANCHORS } from "./question-bank/roots";
import { ROUTES_BCA, ROUTES_BCA_ENGAGEMENT } from "./question-bank/routes-bca";

export function anchorsForSection(
  section: Section,
  discipline: StudentProfile["discipline"] = "tech_cs",
): Question[] {
  void discipline;
  const all = [
    ...CONTEXT_QUESTIONS,
    ...ROOTS_ANCHORS,
    ...ROUTES_BCA,
    ROUTES_BCA_ENGAGEMENT,
  ];
  return all.filter((q) => q.section === section);
}

export interface NextStep {
  kind: "anchor" | "probe" | "transition" | "complete";
  anchor?: Question;
  probeParent?: Question;
  nextSection?: Section;
}

export function planNext(args: {
  current: Question;
  trunk: Question[];
  discipline: StudentProfile["discipline"];
}): NextStep {
  const { current } = args;
  const section = current.section;

  const SECTIONS: Section[] = [
    "main_character",
    "dream_big",
    "passport_era",
    "skill_check",
    "reality_check",
  ];

  const sectionIndex = SECTIONS.indexOf(section);
  if (sectionIndex === -1) {
    return { kind: "complete" };
  }

  const anchors = anchorsForSection(section);
  const idx = anchors.findIndex((a) => a.id === current.id);

  if (idx >= 0 && idx < anchors.length - 1) {
    return { kind: "anchor", anchor: anchors[idx + 1] };
  }

  const nextSectionIndex = sectionIndex + 1;
  if (nextSectionIndex < SECTIONS.length) {
    const nextSec = SECTIONS[nextSectionIndex];
    const nextAnchors = anchorsForSection(nextSec);
    return {
      kind: "anchor",
      anchor: nextAnchors[0],
      nextSection: nextSec,
    } as NextStep;
  }

  return { kind: "transition", nextSection: "report" };
}

export function totalQuestionCountFor(
  discipline: StudentProfile["discipline"],
): number {
  void discipline;
  return 25;
}
