import { ANIMALS, DIM_LABELS, DOMAIN_LABELS } from "../types";
import type { DomainId, RadarScores } from "../types";
import {
  A7_ROWS, B_STATEMENTS, CONCLUSION_IDS, DIALS, GAP_DEF, NEXT_PHRASE, NO_IDEA, PARTS, PART_LABEL, PART_PHRASE, REASON_PHRASE,
  WORKPLACE_PHRASE, fpId,
} from "./bank";
import type { Gap, Part } from "./bank";
import { ANIMAL_ENV } from "./tags";
import {
  assumptions, environment, num, one, rebuildRoute, resolveGap, rootsDims, txt,
} from "./score";
import type { AssumptionResult, EnvironmentResult, FpAnswers, GapResult } from "./score";

export interface ThinkingRow { belief: string; evidence: string; question: string }

export interface ThinkingPage {
  started: string;
  confidence: { career: number; workplace: number; next: number; average: number };
  assumptions: Pick<AssumptionResult, "total" | "band" | "byGroup" | "reasonNotes">;
  rows: ThinkingRow[];
  routes: { career: string; domain: string; matched: string[]; isNew: boolean; gap: Gap }[];
  combined?: string;
  environment: {
    dials: { label: string; value: number; left: string; right: string }[];
    description: string;
    focus: string[];
    comparison?: string;
  };
  gap: { word: string; action: string; next: string; also: string[] };
  /** What the student saved, or the suggested wording when nothing is saved yet. */
  conclusions: [string, string, string];
  suggested: [string, string, string];
  saved: boolean;
  tests: { route: string; environment: string; next: string };
  questions: string[];
}

const FOCUS_LABEL: Record<string, string> = { people: "people", data: "data", things: "things", ideas: "ideas" };

/** Every answer the Thinking Page needs, in one place. */
export function fpComplete(a: FpAnswers): boolean {
  return (
    A7_ROWS.every((r) => num(a, fpId(`A7.${r.id}`)) !== undefined) &&
    B_STATEMENTS.every((s) => num(a, fpId(`B${s.n}`)) !== undefined) &&
    PARTS.every((p) => !!one(a, fpId(`C1.${p}`))) &&
    DIALS.every((d) => num(a, fpId(`C2.${d}`)) !== undefined) &&
    resolveGap(a) !== null
  );
}

const list = (xs: string[]) => (xs.length <= 1 ? xs.join("") : `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`);
const lc = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);

function startedSentence(a: FpAnswers): string {
  const a1 = txt(a, fpId("A1"));
  const reason = one(a, fpId("A2"));
  const place = one(a, fpId("A3")) ?? "unsure";
  const next = one(a, fpId("A5")) ?? "unsure";
  const noIdea = !a1 || NO_IDEA.test(a1);
  const lead = noIdea ? "you had no clear direction yet" : `you were leaning towards ${a1.replace(/[.\s]+$/, "")}`;
  const because = reason ? (reason === "unthought" && noIdea ? "" : `, mainly because ${REASON_PHRASE[reason]}`) : "";
  return `When you began, ${lead}${because}. You pictured yourself in ${WORKPLACE_PHRASE[place]}, and your plan after this course was to ${NEXT_PHRASE[next]}.`;
}

interface Ctx {
  a: FpAnswers;
  radar: RadarScores;
  top: string;
  topIsNamed: boolean;
  env: EnvironmentResult;
  gap: GapResult;
  asm: AssumptionResult;
  primary: keyof RadarScores;
  secondary: keyof RadarScores;
}

const pick = (c: Ctx, p: Part) => one(c.a, fpId(`C1.${p}`)) ?? "";
const phrase = (c: Ctx, p: Part) => PART_PHRASE[p][pick(c, p)] ?? "";

/** Evidence from the student's results against one belief. `contrast` ranks how clearly they differ. */
function evidence(n: number, c: Ctx): { text: string; contrast: number } {
  const dial = (d: (typeof DIALS)[number]) => c.env.dials.find((x) => x.dial === d)!.value;
  const stand = c.env.standouts.length;
  switch (n) {
    case 1:
      return { text: `Your strongest signals are ${DIM_LABELS[c.primary].toLowerCase()} and ${DIM_LABELS[c.secondary].toLowerCase()}, which marks alone don't show.`, contrast: one(c.a, fpId("A2")) === "marks" ? 3 : 2 };
    case 2:
      return { text: `You described your ideal day as ${phrase(c, "tasks")}, without needing a job title.`, contrast: 2 };
    case 3:
      return { text: `Your top route, ${c.top}, mainly needs ${c.gap.word} closed, not a restart.`, contrast: c.gap.gap === "credential" ? 1 : 3 };
    case 4:
      return { text: `Your ideal day points to ${c.top}${c.topIsNamed ? "" : ", which is not what you named first"}.`, contrast: c.topIsNamed ? 1 : 3 };
    case 5:
      return { text: `You said the day feels worth it for ${phrase(c, "reward")}${pick(c, "reward") === "money" ? ", so pay does matter to you" : ", not only for pay"}.`, contrast: pick(c, "reward") === "money" ? 0 : 3 };
    case 6:
      return { text: `Your dials point to ${c.env.description} work, which a large company may or may not offer.`, contrast: 2 };
    case 7:
      return { text: `You rated pace ${dial("pace")}/5 and risk ${dial("security")}/5; startup work is usually high on both.`, contrast: dial("pace") <= 3 || dial("security") <= 3 ? 3 : 1 };
    case 8:
      return { text: `Your dials show clear preferences (${c.env.description}), so the setting seems to matter to you.`, contrast: stand >= 2 ? 3 : 1 };
    case 9:
      return { text: `Your ${ANIMALS[c.primary].name} profile tends to do best in ${ANIMAL_ENV[c.primary]}.`, contrast: 2 };
    case 10:
      return { text: `For ${c.top}, your main gap is ${c.gap.word}${c.gap.gap === "credential" ? ", which a degree can close" : ", which a degree alone does not close"}.`, contrast: c.gap.gap === "credential" ? 1 : 3 };
    case 11:
      return { text: `Your main gap is ${c.gap.word}${c.gap.gap === "experience" ? "; working first would close it" : ""}.`, contrast: c.gap.gap === "experience" || c.gap.gap === "clarity" ? 3 : 1 };
    default:
      return { text: `A small real-world test can build certainty faster than waiting for it.`, contrast: 2 };
  }
}

export function buildThinking(input: { fp: FpAnswers; radar: RadarScores }): ThinkingPage | null {
  const { fp: a, radar } = input;
  if (!fpComplete(a)) return null;

  const asm = assumptions(a);
  const route = rebuildRoute(a, radar);
  const env = environment(a)!;
  const gap = resolveGap(a)!;
  const [primary, secondary] = rootsDims(radar);
  const top = route.matches[0];
  const topName = route.combined ? `${route.combined.careers[0]} + ${route.combined.careers[1]}` : top.career;

  const conf = {
    career: num(a, fpId("A7.career"))!, workplace: num(a, fpId("A7.workplace"))!, next: num(a, fpId("A7.next"))!,
  };
  const average = Math.round(((conf.career + conf.workplace + conf.next) / 3) * 10) / 10;

  const ctx: Ctx = { a, radar, top: top.career, topIsNamed: !top.isNew, env, gap, asm, primary, secondary };

  // Box 2: at most four flagged beliefs, clearest contrast first.
  const rows = asm.flagged
    .map((n) => ({ n, ev: evidence(n, ctx), val: num(a, fpId(`B${n}`)) ?? 0 }))
    .sort((x, y) => y.ev.contrast - x.ev.contrast || y.val - x.val || x.n - y.n)
    .slice(0, 4)
    .map(({ n, ev }) => {
      const s = B_STATEMENTS.find((b) => b.n === n)!;
      return { belief: s.text, evidence: ev.text, question: s.check };
    });

  // Box 3: suggested wording the student edits.
  const highs = env.dials.filter((d) => d.value >= 4).map((d) => d.label.toLowerCase());
  const lows = env.dials.filter((d) => d.value <= 2).map((d) => d.label.toLowerCase());
  const scored = [highs.length ? `high on ${list(highs)}` : "", lows.length ? `low on ${list(lows)}` : ""].filter(Boolean).join(" and ");
  const others = gap.all.filter((g) => g !== gap.gap).map((g) => GAP_DEF[g].word);
  const suggested: [string, string, string] = [
    `I think I need to walk in the ${topName} route, because my ${ANIMALS[primary].name} profile is strongest in ${DIM_LABELS[primary].toLowerCase()}, and the day I described is about ${phrase(ctx, "tasks")}, using ${phrase(ctx, "skills")}.`,
    `I think I need to be in a ${env.description} environment, because I scored ${scored || "in the middle on most dials"}.`,
    `I think I need to ${gap.action}, because my main gap is ${gap.word}${others.length ? `, and I will also need ${list(others)}` : ""}.`,
  ];
  const savedTexts = CONCLUSION_IDS.map((id) => txt(a, id));
  const saved = savedTexts.every(Boolean);
  const conclusions = (saved ? savedTexts : suggested) as [string, string, string];

  const workplaceName = env.nearest ? WORKPLACE_PHRASE[env.nearest] : "a workplace like the one you picked";
  const picked = one(a, fpId("A3")) ?? "unsure";
  const comparison = env.differsFromA3 && env.nearest
    ? `You pictured ${WORKPLACE_PHRASE[picked]}, but your dials sit closer to ${WORKPLACE_PHRASE[env.nearest]}.`
    : undefined;

  const defaults = [
    "Why does this route fit the way I work?",
    "Which setting would I actually do my best work in?",
    "What is the smallest step that would tell me if this is right?",
  ];
  const questions = [...rows.map((r) => r.question), ...defaults].slice(0, 3);

  return {
    started: startedSentence(a),
    confidence: { ...conf, average },
    assumptions: { total: asm.total, band: asm.band, byGroup: asm.byGroup, reasonNotes: asm.reasonNotes },
    rows,
    routes: route.matches.map((m) => ({ career: m.career, domain: DOMAIN_LABELS[m.domain as DomainId], matched: m.matched.map((p) => PART_LABEL[p]), isNew: m.isNew, gap: m.gap })),
    combined: route.combined
      ? `Your answers sit across ${DOMAIN_LABELS[route.combined.domains[0] as DomainId]} and ${DOMAIN_LABELS[route.combined.domains[1] as DomainId]}. Look for routes that combine them, such as ${route.combined.careers[0]} with ${route.combined.careers[1]}.`
      : undefined,
    environment: {
      dials: env.dials.map((d) => ({ label: d.label, value: d.value, left: d.left, right: d.right })),
      description: env.description,
      focus: env.focus.map((f) => FOCUS_LABEL[f]),
      comparison,
    },
    gap: { word: gap.word, action: gap.action, next: gap.next, also: gap.all.filter((g) => g !== gap.gap).map((g) => GAP_DEF[g].word) },
    conclusions, suggested, saved,
    tests: {
      route: `Route test: have one conversation with someone working as a ${top.career}, or run a two-week mini project in that work.`,
      environment: `Environment test: visit, or shadow for a day, in ${workplaceName}.`,
      next: `Next-step test: read five job listings for ${top.career} and note what they ask for.`,
    },
    questions,
  };
}

