import { ANIMALS, DOMAIN_LABELS, VALUE_BY_KEY, VALUE_LABELS } from "./types";
import type {
  ArchetypeResult, Degree, DomainId, FiredFlag, RadarDim, RadarScores, RoleId, V2Answers, ValueId,
} from "./types";

/** Which protected values each role's cost/grind "spends". Calibration seed (Decision 6). */
export const SPENDS: Record<RoleId, ValueId[]> = {
  markets: ["health", "relationships"],
  deals: ["health", "relationships", "freedom"],
  risk: ["health", "relationships"],
  advisory: ["freedom"],
  operations: ["freedom"],
  strategy: ["freedom", "meaning"],
  growth: ["health", "meaning"],
  people_hr: ["freedom", "meaning"],
  founder: ["money", "health", "relationships"],
  product: ["freedom"],
  sales: ["health", "meaning"],
  operator: ["meaning", "freedom"],
  build: ["mastery"],
  data: ["meaning"],
  product_tech: ["relationships", "freedom"],
  infrastructure: ["health", "relationships"],
  psychology: ["money", "health"],
  education: ["money"],
  policy: ["money", "freedom"],
  community: ["money", "health"],
};

/** Degree → expected primary dims; divergence fires when the primary animal dim is outside. */
export const DIVERGENCE_EXPECT: Record<Degree, RadarDim[] | null> = {
  engineering: ["analytical", "practical"],
  commerce: ["practical", "analytical"],
  science: ["analytical"],
  arts: ["creative", "people"],
  other: null,
};

const DEGREE_WORD: Record<Degree, string> = {
  engineering: "engineering", commerce: "commerce", science: "science", arts: "arts", other: "college",
};

export const UNIVERSAL_TIPS: string[] = [
  "Get one real exposure this term — a project, an internship, or a shadow day in your top field.",
  "Have one conversation with someone doing this job before month-end.",
];

export function bAnswerCount(answers: V2Answers): number {
  return (["B1", "B2", "B3", "B4", "B5", "B6"] as const)
    .filter((b) => answers[b]?.[0] === "b").length;
}

const NUM_WORD = ["zero", "one", "two", "three", "four", "five", "six"];

function exposureAction(answers: V2Answers): string {
  if (answers.F2?.[0] === "a") return "one conversation with someone doing the work, this month";
  if (answers.F1?.[0] === "a") return "one small real project in the field you're most curious about";
  return "one deeper project in the field you've already touched";
}

export interface FlagContext {
  answers: V2Answers;
  radar: RadarScores;
  degree: Degree | null;
  seededTop2: DomainId[];
  chosenDomain: DomainId | null;
  winner: RoleId | null;
  confBand: "confirmed" | "provisional" | "mismatch";
  archetype: ArchetypeResult;
  defaultPathFlag: boolean;
}

export function evaluateFlags(ctx: FlagContext): FiredFlag[] {
  const { answers, degree, seededTop2, winner, confBand, archetype, defaultPathFlag } = ctx;
  const fired: FiredFlag[] = [];
  const bCount = bAnswerCount(answers);
  const dHard = ["c", "d"].includes(answers.D1?.[0] ?? "") || ["c", "d"].includes(answers.D2?.[0] ?? "");

  if (bCount >= 2 || dHard) {
    fired.push({
      id: "romanticism",
      tip: bCount >= 2
        ? `Close the gap between liking and doing. ${NUM_WORD[bCount][0].toUpperCase()}${NUM_WORD[bCount].slice(1)} times you said you wanted the answer without doing the working. One real project will tell you more than this test can.`
        : "Close the gap between liking and doing. You told us the daily cost would be hard; one real project will tell you whether it's worth building the tolerance.",
    });
  }

  if (defaultPathFlag && seededTop2[0]) {
    fired.push({
      id: "default_path",
      tip: `You picked the expected door. Your reactions pointed at ${DOMAIN_LABELS[seededTop2[0]]}. Look through that one too before deciding.`,
    });
  }

  if (archetype.kind === "archetype" && degree) {
    const expect = DIVERGENCE_EXPECT[degree];
    if (expect && !expect.includes(archetype.primary)) {
      fired.push({
        id: "divergence",
        tip: `On paper you're a ${DEGREE_WORD[degree]} student. Your answers are a ${ANIMALS[archetype.primary].name}'s. That difference is the most useful thing in this report.`,
      });
    }
  }

  if (confBand === "confirmed" && answers.F1?.[0] === "a") {
    fired.push({
      id: "preparation_gap",
      tip: "You're certain about a field you've never been near. The certainty might be right; get one project inside it and find out cheaply.",
    });
  }

  if (answers.F2?.[0] === "a") {
    fired.push({
      id: "conversation_gap",
      tip: "Talk to one person doing this job this month. You're fairly sure about work you've never heard described by someone living it.",
    });
  }

  if (["c", "d"].includes(answers.E3?.[0] ?? "")) {
    fired.push({
      id: "family",
      tip: "Your family is inside this decision. Bring them into the counselling session, not after it.",
    });
  }

  const anchorKey = answers.E1?.[0];
  const anchor = anchorKey ? VALUE_BY_KEY[anchorKey as keyof typeof VALUE_BY_KEY] : null;
  if (anchor && winner && SPENDS[winner].includes(anchor)) {
    fired.push({
      id: "constraint_conflict",
      tip: `You protect ${VALUE_LABELS[anchor]}; this path spends it. Both facts stay on the page. That tension is the first agenda item for your call.`,
    });
  }

  if (archetype.kind === "more_signal") {
    fired.push({
      id: "thin_signal",
      tip: `We need more signal, and here is the fastest way to generate it: ${exposureAction(answers)}.`,
    });
  }

  return fired;
}
