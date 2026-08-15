import { SPENDS, bAnswerCount } from "./flags";
import { VALUE_BY_KEY, VALUE_LABELS } from "./types";
import type {
  DomainId, OptionKey, RadarScores, RoleId, SlidersResult, V2Answers, Verdict, VerdictId,
} from "./types";

export interface VerdictContext {
  answers: V2Answers;
  radar: RadarScores;
  sliders: SlidersResult;
  domain: DomainId | null;
  winner: RoleId | null;
  confTotal: number;
  defaultPathFlag: boolean;
}

export const DOMAIN_CATEGORY: Record<DomainId, "V" | "L" | "S" | "P"> = {
  finance: "S", business: "L", entrepreneurship: "V", technology: "S", people_society: "P",
};

/** Decision 7: the C5 option per branch that "takes responsibility" (L3 trigger). */
export const RESPONSIBILITY_C5: Record<DomainId, OptionKey> = {
  finance: "c", business: "d", entrepreneurship: "d", technology: "d", people_society: "d",
};

type Cat = "V" | "L" | "S" | "P" | "H";

interface BankEntry {
  id: VerdictId;
  cat: Cat;
  when: (ctx: VerdictContext) => boolean;
  line: (ctx: VerdictContext) => string;
}

const b = (ctx: VerdictContext, item: "B2" | "B3" | "B4" | "B5" | "B6", key: string) =>
  ctx.answers[item]?.[0] === key;
const a = (ctx: VerdictContext, item: "A1" | "A2", key: string) => ctx.answers[item]?.[0] === key;
const keystone = (ctx: VerdictContext) => {
  const k = ctx.answers.E2?.[0];
  return k ? VALUE_BY_KEY[k as keyof typeof VALUE_BY_KEY] : null;
};

// Spec §8, verbatim. Bank order = priority order.
export const VERDICT_BANK: BankEntry[] = [
  {
    id: "V1", cat: "V",
    when: (c) => b(c, "B4", "a") && c.domain === "entrepreneurship" && c.winner === "founder" && c.confTotal >= 2,
    line: () => "We feel you should build something of your own. Not eventually. The pattern is already here.",
  },
  {
    id: "V2", cat: "V",
    when: (c) => b(c, "B4", "a") && a(c, "A1", "c") && a(c, "A2", "a") && c.sliders.structure.side === "Open-ended",
    line: () => "You're an opportunist who works best alone. You spot the gap fast and you don't wait for a committee.",
  },
  {
    id: "V3", cat: "V",
    when: (c) => b(c, "B4", "a") && c.answers.E1?.[0] === "c", // E1 c = Freedom
    line: () => "Freedom isn't a perk for you, it's the requirement. Choose paths where you own your decisions early.",
  },
  {
    id: "V4", cat: "V",
    when: (c) => (c.winner === "founder" || c.winner === "sales") && c.answers.D2?.[0] === "a",
    line: () => "You're rare: you like the grind itself, not just the story of it. That is the actual founder trait.",
  },
  {
    id: "L1", cat: "L",
    when: (c) => (b(c, "B2", "a") || b(c, "B6", "a")) && c.radar.leadership >= 8 && c.answers.A1?.[0] === "d",
    line: () => "We feel you should be leading, and not someday. Rooms already reorganise around you; pick work where that's the job.",
  },
  {
    id: "L2", cat: "L",
    when: (c) => c.radar.leadership >= 8 && c.radar.people >= 8,
    line: () => "You lead through people, not over them. Look at roles where the team is the product.",
  },
  {
    id: "L3", cat: "L",
    when: (c) => b(c, "B6", "a") && c.domain !== null && c.answers.C5?.[0] === RESPONSIBILITY_C5[c.domain],
    line: () => "You take the blame before you take the credit. That is the version of leadership that lasts.",
  },
  {
    id: "L4", cat: "L",
    when: (c) => c.radar.leadership >= 8 && (c.winner === "operator" || c.winner === "operations"),
    line: () => "You're the leader who makes it run, not the one who makes the speech. Both are leadership. Yours ships.",
  },
  {
    id: "S1", cat: "S",
    when: (c) => {
      const sorted = Object.values(c.radar).sort((x, y) => y - x);
      return sorted[0] >= 8 && sorted[1] <= 4 && c.answers.D2?.[0] === "a";
    },
    line: () => "Go deep, not wide. You have the one trait generalists can't fake: you enjoy the boring middle of mastery.",
  },
  {
    id: "S2", cat: "S",
    when: (c) => c.radar.analytical === 10 && c.sliders.decision.band === "Clearly" && c.sliders.decision.side === "Deliberate",
    line: () => "Careful is your edge. Stop apologising for taking the extra day; it's why your answer is the one that holds.",
  },
  {
    id: "S3", cat: "S",
    when: (c) => c.radar.analytical >= 8 && c.radar.people <= 4,
    line: () => "Your best work happens one step away from the noise. Choose roles judged on output, not airtime.",
  },
  {
    id: "S4", cat: "S",
    when: (c) => c.radar.practical === 10 && b(c, "B5", "a"),
    line: () => "You can't walk past a broken process. Make that a career instead of a habit.",
  },
  {
    id: "P1", cat: "P",
    when: (c) => c.radar.people >= 8 && (c.domain === "finance" || c.domain === "technology"),
    line: () => "One thing your answers keep saying that your plan doesn't: you should work with people, not just near them.",
  },
  {
    id: "P2", cat: "P",
    when: (c) => b(c, "B6", "a") && (c.winner === "psychology" || c.winner === "education"),
    line: () => "People fall apart quietly around you and you notice. Very few do. Take that seriously as a career signal.",
  },
  {
    id: "P3", cat: "P",
    when: (c) => c.radar.creative >= 8 && b(c, "B3", "a"),
    line: () => "It physically bothers you when good work goes unseen. Marketing, product and media pay for exactly that instinct.",
  },
  {
    id: "P4", cat: "P",
    when: (c) => c.radar.creative >= 8 && c.radar.practical >= 8,
    line: () => "You're a maker. The proof of your thinking is a thing that exists. Choose work with a visible artifact.",
  },
  {
    id: "H1", cat: "H",
    when: (c) => bAnswerCount(c.answers) >= 2,
    line: () => "You like knowing more than doing, in at least two fields. Not a flaw, but pick the one where you'd happily do the working too.",
  },
  {
    id: "H2", cat: "H",
    when: (c) => c.confTotal <= -2,
    line: () => "The pull is real. The daily cost is the problem, and you told us so yourself. Read the cost line again before committing.",
  },
  {
    id: "H3", cat: "H",
    when: (c) => c.defaultPathFlag,
    line: () => "You chose the expected path even though your reactions pointed elsewhere. Worth one honest conversation about whose choice this is.",
  },
  {
    id: "H4", cat: "H",
    when: (c) => {
      const k = keystone(c);
      return k !== null && c.winner !== null && SPENDS[c.winner].includes(k);
    },
    line: (c) =>
      `You protected ${VALUE_LABELS[keystone(c)!]}, and the role you're drawn to spends exactly that. We're not resolving this for you; bring it to the call.`,
  },
];

export function evaluateVerdicts(ctx: VerdictContext): VerdictId[] {
  return VERDICT_BANK.filter((v) => v.when(ctx)).map((v) => v.id);
}

/** Decision 10: slot 1 = first fired in the winning category; then fired honesty in order;
 *  then remaining fired excluding further winning-category verdicts. Max 3. */
export function slotVerdicts(ctx: VerdictContext): Verdict[] {
  const firedIds = new Set(evaluateVerdicts(ctx));
  const fired = VERDICT_BANK.filter((v) => firedIds.has(v.id));
  const winCat = ctx.domain ? DOMAIN_CATEGORY[ctx.domain] : null;
  const slots: BankEntry[] = [];

  const winFirst = winCat ? fired.find((v) => v.cat === winCat) : undefined;
  if (winFirst) slots.push(winFirst);

  for (const v of fired) {
    if (slots.length >= 3) break;
    if (v.cat === "H" && !slots.includes(v)) slots.push(v);
  }
  for (const v of fired) {
    if (slots.length >= 3) break;
    if (v.cat !== "H" && v.cat !== winCat && !slots.includes(v)) slots.push(v);
  }

  return slots.map((v) => ({ id: v.id, line: v.line(ctx) }));
}
