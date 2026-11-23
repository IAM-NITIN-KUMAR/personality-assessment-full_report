import type { Answer } from "../../types";
import type { RadarDim, RadarScores } from "../types";
import { DIM_PRIORITY } from "../types";
import {
  B_STATEMENTS, DIALS, DIAL_DEF, FLAG_AT, FP_PREFIX, GAP_DEF, GAP_PRIORITY, GROUP_LABEL, NO_IDEA, PARTS, REASON_SHORT,
  fpId,
} from "./bank";
import type { BStatement, Conclusion, Dial, Focus, Gap, Part } from "./bank";
import { CAREER_TAGS, DIAL_INDEX, WORKPLACE_DIALS } from "./tags";
import type { CareerTag } from "./tags";

export type FpAnswers = Record<string, { optionIds?: string[]; text?: string }>;

/** Pull the module's answers out of the shared store (they all carry the `fp.` prefix). */
export function toFpAnswers(answers: Record<string, Answer>): FpAnswers {
  const out: FpAnswers = {};
  for (const [id, a] of Object.entries(answers)) {
    if (id.startsWith(FP_PREFIX)) out[id] = { optionIds: a.optionIds, text: a.text };
  }
  return out;
}

export const one = (a: FpAnswers, id: string): string | undefined => a[id]?.optionIds?.[0];
export const many = (a: FpAnswers, id: string): string[] => a[id]?.optionIds ?? [];
export const txt = (a: FpAnswers, id: string): string => (a[id]?.text ?? "").trim();
export const num = (a: FpAnswers, id: string): number | undefined => {
  const v = Number(one(a, id));
  return Number.isFinite(v) && v >= 1 && v <= 5 ? v : undefined;
};

// ------------------------------------------------------------ Part B

export interface AssumptionResult {
  /** Statement numbers answered 4 or 5. */
  flagged: number[];
  total: number;
  band: "Low" | "Medium" | "High";
  byGroup: Record<Conclusion, { flags: number; of: number }>;
  /** "Your current choice may rest mainly on {reason}" notes. */
  reasonNotes: { group: Conclusion; label: string; text: string }[];
}

export function bandFor(total: number): "Low" | "Medium" | "High" {
  return total <= 3 ? "Low" : total <= 7 ? "Medium" : "High";
}

export function assumptions(a: FpAnswers): AssumptionResult {
  const flagged = B_STATEMENTS.filter((s) => (num(a, fpId(`B${s.n}`)) ?? 0) >= FLAG_AT).map((s) => s.n);
  const byGroup = {} as AssumptionResult["byGroup"];
  (["career", "work", "next"] as Conclusion[]).forEach((g) => {
    const members = B_STATEMENTS.filter((s) => s.group === g);
    byGroup[g] = { flags: members.filter((s) => flagged.includes(s.n)).length, of: members.length };
  });
  const reasonNotes: AssumptionResult["reasonNotes"] = [];
  const pairs: [Conclusion, string | undefined][] = [
    ["career", one(a, fpId("A2"))], ["work", one(a, fpId("A4"))], ["next", one(a, fpId("A6"))],
  ];
  for (const [g, reason] of pairs) {
    if (reason && REASON_SHORT[reason] && byGroup[g].flags >= 2) {
      reasonNotes.push({ group: g, label: GROUP_LABEL[g], text: `Your current choice may rest mainly on ${REASON_SHORT[reason]}. Let's check it.` });
    }
  }
  return { flagged, total: flagged.length, band: bandFor(flagged.length), byGroup, reasonNotes };
}

// ------------------------------------------------------------ Part C: route

export function rootsDims(radar: RadarScores): [RadarDim, RadarDim] {
  const sorted = [...DIM_PRIORITY].sort((x, y) => radar[y] - radar[x] || DIM_PRIORITY.indexOf(x) - DIM_PRIORITY.indexOf(y));
  return [sorted[0], sorted[1]];
}

const GENERIC = new Set(["analyst", "manager", "associate", "officer", "coordinator", "engineer", "developer", "track", "side", "tech", "early-stage"]);

/** Did the student already name this career in A1? Matches on its distinctive words. */
export function namedInA1(career: string, a1: string): boolean {
  const text = a1.toLowerCase();
  if (!text || NO_IDEA.test(text)) return false;
  const words = career.toLowerCase().replace(/[()/]/g, " ").split(/\s+/).filter((w) => w.length > 2 && !GENERIC.has(w));
  return words.some((w) => text.includes(w));
}

export interface RouteMatch {
  career: string;
  role: CareerTag["role"];
  domain: string;
  matched: Part[];
  score: number;
  isNew: boolean;
  gap: Gap;
}

export interface RebuiltRoute {
  matches: RouteMatch[];
  /** Set when the top matches come from two fields that sit close together. */
  combined?: { domains: [string, string]; careers: [string, string] };
}

export function rebuildRoute(a: FpAnswers, radar: RadarScores): RebuiltRoute {
  const picks = {} as Record<Part, string | undefined>;
  PARTS.forEach((p) => { picks[p] = one(a, fpId(`C1.${p}`)); });
  const [primary, secondary] = rootsDims(radar);
  const a1 = txt(a, fpId("A1"));

  const scored: RouteMatch[] = CAREER_TAGS.map((t) => {
    const matched = PARTS.filter((p) => picks[p] && t.parts[p] === picks[p]);
    const roots = (t.dims.includes(primary) ? 1 : 0) + (t.dims.includes(secondary) ? 0.5 : 0);
    return {
      career: t.career, role: t.role, domain: t.domain, matched,
      score: matched.length + roots, isNew: !namedInA1(t.career, a1), gap: t.gap,
    };
  });
  // Stable sort: ties keep catalogue order.
  const ranked = scored.map((m, i) => ({ m, i })).sort((x, y) => y.m.score - x.m.score || x.i - y.i).map((x) => x.m);

  // One career per role keeps the three matches distinct.
  const seenRoles = new Set<string>();
  const distinct = ranked.filter((m) => (seenRoles.has(m.role) ? false : (seenRoles.add(m.role), true)));
  let top = distinct.slice(0, 3);
  // At least one match must be something the student did not name in A1.
  if (top.length === 3 && top.every((m) => !m.isNew)) {
    const fresh = distinct.slice(3).find((m) => m.isNew);
    if (fresh) top = [top[0], top[1], fresh];
  }

  let combined: RebuiltRoute["combined"];
  if (top.length >= 2 && top[0].domain !== top[1].domain && top[0].score - top[1].score <= 1) {
    combined = { domains: [top[0].domain, top[1].domain], careers: [top[0].career, top[1].career] };
  }
  return { matches: top, combined };
}

// ------------------------------------------------------------ Part C: environment

export interface DialRead { dial: Dial; value: number; label: string; left: string; right: string }
export interface EnvironmentResult {
  dials: DialRead[];
  /** "fast-paced, team-based, client-facing", or "flexible" when nothing stands out. */
  description: string;
  /** Dials that stand out, strongest first: "pace", "company"... */
  standouts: { dial: Dial; value: number; word: string }[];
  focus: Focus[];
  nearest: string | null;
  /** True when the dial profile sits clearly closer to another workplace than the one picked in A3. */
  differsFromA3: boolean;
}

function vec(a: FpAnswers): number[] | null {
  const v = DIALS.map((d) => num(a, fpId(`C2.${d}`)));
  return v.every((x) => x !== undefined) ? (v as number[]) : null;
}

export function environment(a: FpAnswers): EnvironmentResult | null {
  const v = vec(a);
  if (!v) return null;
  const dials: DialRead[] = DIALS.map((d, i) => ({ dial: d, value: v[i], label: DIAL_DEF[d].label, left: DIAL_DEF[d].left, right: DIAL_DEF[d].right }));
  const standouts = DIALS
    .map((d, i) => ({ dial: d, value: v[i], dist: Math.abs(v[i] - 3), word: v[i] >= 4 ? DIAL_DEF[d].high : DIAL_DEF[d].low }))
    .filter((x) => x.dist >= 1 && x.value !== 3)
    .sort((x, y) => y.dist - x.dist || DIALS.indexOf(x.dial) - DIALS.indexOf(y.dial))
    .slice(0, 3)
    .map(({ dial, value, word }) => ({ dial, value, word }));
  const description = standouts.length ? standouts.map((s) => s.word).join(", ") : "flexible";

  let nearest: string | null = null;
  let best = Infinity;
  const dist: Record<string, number> = {};
  for (const [w, p] of Object.entries(WORKPLACE_DIALS)) {
    const d = p.reduce((sum, x, i) => sum + Math.abs(x - v[i]), 0);
    dist[w] = d;
    if (d < best) { best = d; nearest = w; }
  }
  const picked = one(a, fpId("A3"));
  const differsFromA3 = !!(picked && picked !== "unsure" && dist[picked] !== undefined && nearest && picked !== nearest && dist[picked] - best >= 3);
  return { dials, description, standouts, focus: many(a, fpId("C2.focus")).slice(0, 2) as Focus[], nearest, differsFromA3 };
}

// ------------------------------------------------------------ Part C: gap

export interface GapResult { gap: Gap; all: Gap[]; word: string; action: "work further" | "study further" | "explore first"; next: string }

export function resolveGap(a: FpAnswers): GapResult | null {
  const chosen = many(a, fpId("C3.gap")).filter((g): g is Gap => g in GAP_DEF);
  if (chosen.length === 0) return null;
  const gap = GAP_PRIORITY.find((g) => chosen.includes(g))!;
  return { gap, all: GAP_PRIORITY.filter((g) => chosen.includes(g)), ...GAP_DEF[gap] };
}

export type { BStatement };
