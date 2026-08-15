# Roots & Routes v2 Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the UG assessment (questions, scoring, report) with the 29-screen Roots & Routes v2 engine — radar + sliders + domain/role resolution + confirmation + fit% career cards + animal/archetype system + verdicts + flag-driven growth tips + gated abroad module.

**Architecture:** A new pure, deterministic TypeScript engine under `lib/v2/` (data + scoring functions, fully unit-tested with vitest), a v2 flow component for the 29 screens wired only for `educationLevel === "college"`, and a new 9-block report view + PDF. The 10th/12th (school) path keeps the existing legacy engine untouched.

**Tech Stack:** Next.js 15.5 App Router, React 19, TypeScript 5.7 strict, Tailwind, Zustand 5 (persist), Supabase JS, @react-pdf/renderer, vitest (new, dev-only).

**Spec:** `docs/v2-rewrite/spec-v2-extracted.txt` (text extraction of `Documents&Images/Roots_and_Routes_Master_Build_Spec_v2.pdf`, 22 pages). Session context: `docs/v2-rewrite/HANDOFF.md`.

## Global Constraints

- **UG-only.** v2 applies when `profile.educationLevel === "college"`. The 10th/12th school path (bank, flow, report) is untouched. (Confirmed by Nitin 2026-08-15.)
- **Determinism.** Same answers ⇒ same report, every run. No `Math.random()`/`Date.now()` inside `lib/v2/` scoring (profile ID uses a name/email hash; date comes from the caller).
- **No normalisation.** Radar dimension score is exactly `(raw + 2) * 2` → one of {0, 4, 6, 10}. Delete/avoid anything that squeezes scores.
- **Copy rules (spec §11):** never the words "test result" (use "what your answers showed"); never "introvert"/"extrovert" (use Reflective/Outgoing); never claim IQ, aptitude, intelligence, or ability. The word **"abroad" must not appear in any screen content before F4**. Never render a fit of 100 (clamp 5..95). Never render "Clearly" from one data point (Mobility uses its own four labels).
- **Career cards always sorted descending by fit before render.**
- **Everyone gets a full report** — no answer terminates the assessment (old Q20/Q21 termination behaviour does not exist in v2).
- **Weights are calibration seeds** (spec end note): all numeric tables live as plain exported `const`s in data files so they can be tuned after the first 300–500 completions.
- New dependency allowed: `vitest` (devDependency) only. No other new packages.
- Existing npm scripts must keep passing: `npm run typecheck`, `npm run lint`, `npm run build`. New: `npm test` (vitest run).
- Commit after every task (message prefix `feat(v2):`, `chore:`, or `fix:` as appropriate).

## Decisions (spec gaps resolved for this build — all are calibration seeds)

1. **Per-career radar dim pairs** for the fit formula: defined per role in the catalog (Task 8), all 3 careers of a role share the role's pair. Verified against the worked sample: Risk → analytical+practical (84 ✓), Markets → analytical+entrepreneurial (52 ✓).
2. **Card fit constants** (reproduce the sample's 84/78/71/52 exactly): Card 1 = full formula; Card 2 = card1 − 6; Card 3 (cross-branch) = round(0.85 × card1); Card 4 (honest low) = full formula with its real role_score, the career's dim pair, and a fixed neutral confirmation component of 15.
3. **Card 4 ("honest low")** = the runner-up role in the *chosen* branch (highest non-winning role; if that role is already on card 2 as co-candidate, the third-ranked role), at its true fit. This is what the worked sample actually does (Markets 52 for Ananya) — the "degree default expectation" framing in §7 applies via the what-line copy, not the role choice.
4. **Cross-branch lookup** (card 3): analytical → (technology, data) · people → (people_society, psychology) · creative → (entrepreneurship, product) · entrepreneurial → (entrepreneurship, founder) · practical → (business, operations) · leadership → (business, strategy). Walk radar dims descending; take the first whose mapped domain ≠ chosen domain and whose career isn't already on a card.
5. **Degree → default domain:** engineering→technology, commerce→business, science→technology, arts→people_society, other→none (no default card; slot filled by 3rd seed; default_path_flag can never fire).
6. **Values-spend table** (for H4 verdict + constraint-conflict flag): per-role sets in Task 12. Constraint-conflict flag keys on **E1 (anchor)**; H4 verdict keys on **E2 (keystone)** — this is the only reading consistent with the sample (Ananya: E1 Money → no constraint flag; E2 Health → H4 fires against Risk).
7. **L3 "C5 answer takes responsibility"** per branch: finance **c** ("Fast, missed things"), business **d** ("Delivered numbers, burned people"), entrepreneurship **d** ("Grew fast, fell over"), technology **d** ("Fast, and it went down twice"), people_society **d** ("Great report, changed nothing").
8. **P1 "solo-ish domain"** = finance or technology.
9. **Romanticism** mild = exactly 2 `b` answers in Section B; strong = 3+ `b`s or D1/D2 answered c/d. Both render the same flag with variant copy.
10. **Verdict slotting** (matches sample S2/H1/H4 and correctly excludes S3/S4): slot 1 = first *fired* verdict in bank order within the winning category (domain → category: finance→S, technology→S, business→L, entrepreneurship→V, people_society→P); remaining slots = fired honesty verdicts H1–H4 in order; any space left = remaining fired verdicts in global bank order **excluding further winning-category verdicts**; max 3 total.
11. **Strapline "variant keyed to Decision slider":** grid stores one base strapline plus an optional `straplineInstinctive`; render the variant when Decision side = Instinctive and the field exists, else the base. (Copy for variants doesn't exist yet — mechanism only.)
12. **Tie-breaks everywhere are deterministic:** radar-dim ordering ties break by C1-domain alignment first (finance→[analytical, practical], business→[leadership, practical], entrepreneurship→[entrepreneurial, creative], technology→[analytical, creative], people_society→[people, leadership]), then fixed priority analytical, practical, people, creative, entrepreneurial, leadership. Domain seed ties break by fixed order finance, business, entrepreneurship, technology, people_society. Role ties break by the branch's role order.
13. **Near-tie QA gate:** spec §13 says "An 10 / Pr 8 / Cr 8" — 8 is unreachable on the quantized scale {0,4,6,10}, so the stability test uses the nearest achievable tie (An 10 / Pr 6 / Cr 6).
14. **Q0 is screen 1 of the assessment** (not part of registration). Registration keeps collecting name/email/level as today.
15. **No adaptive probes and no emoji reaction bar in the v2 flow** — the 29 screens are fixed; the B-item reaction scale IS the question. The probe API and reaction UI remain for the school path only.
16. **F4 quote-back copy varies by A7:** A7=a → "You said you would move anywhere in the world for the right opportunity." A7=c → "You said you would move for an exceptional opportunity." (F4 only renders for A7 ∈ {a, c}.)
17. **Unanswered B item** (defensive only; flow prevents it) scores its dimension 0 and counts as a zero for the thin-signal check.
18. **Admin route deleted** (unauthenticated, edits only legacy banks). Committed secrets untracked + rotation flagged (Tasks 19–20). Confirmed by Nitin 2026-08-15.

## File Structure

```
lib/v2/
  types.ts                 # Degree, RadarDim, DomainId, RoleId, ValueId, ScreenId, V2Answers, ReportV2, labels
  question-bank.ts         # all 29 screens verbatim: Q0, A1-A7, B1-B6, C-branches with weights, D table (20 roles), E, F
  scoring/radar.ts         # computeRadar: (raw+2)*2
  scoring/sliders.ts       # computeSliders: Clearly/Lean/Balanced + Mobility
  scoring/domains.ts       # seeds, selectC1Cards, defaultPathFlag, DEGREE_DEFAULT
  scoring/roles.ts         # resolveRole over C2-C5 weights, co-candidates
  scoring/confirmation.ts  # D1/D2 scoring, confBand
  archetype.ts             # thin-signal → flat → pair → tie-breaks; 6 animals, 15 archetypes + 2 fallbacks
  careers/catalog.ts       # 20 roles × 3 careers, dim pairs, what-lines, next-steps + feasibility, CROSS_BRANCH
  careers/fit.ts           # fit formula, cap 55, clamp 5..95
  careers/cards.ts         # 4-card selector, sort desc
  verdicts.ts              # 16-verdict bank, triggers, max-3 slotting
  flags.ts                 # 8 flags, tip templates, 2 universal fallbacks, SPENDS table
  gate.ts                  # showAbroad
  flow.ts                  # screen order, gating, C-branch + D-statement materialisation
  report.ts                # buildReportV2() orchestrator
components/v2/
  assessment-flow.tsx      # 29-screen runner (college only)
  v2-card.tsx              # option card renderer
  report-view.tsx          # 9-block report
  radar-chart.tsx          # SVG hexagon radar
lib/v2/report-pdf.tsx      # react-pdf 9-block document
tests/v2/*.test.ts         # one file per module + ananya.regression.test.ts + stability.test.ts
```

Modified: `package.json`, `lib/store.ts`, `app/page.tsx`, `app/assessment/page.tsx`, `app/report/page.tsx`.
Deleted (Task 19): `app/admin/`, `app/api/admin/`, `app/teaser/`, `components/report-visuals.tsx`, `lib/question-bank/`.

---

### Task 1: Vitest setup + v2 types + radar scoring

**Files:**
- Modify: `package.json` (add vitest devDependency + `test` scripts)
- Create: `vitest.config.ts`
- Create: `lib/v2/types.ts`
- Create: `lib/v2/scoring/radar.ts`
- Test: `tests/v2/radar.test.ts`

**Interfaces:**
- Consumes: nothing (first task).
- Produces: every type below (all later tasks import from `lib/v2/types`), and `computeRadar(answers: V2Answers): RadarScores`, `B_DIM: Record<BItem, RadarDim>` from `lib/v2/scoring/radar`.

- [ ] **Step 1: Install vitest and add scripts**

Run: `npm install -D vitest`
Then in `package.json` add to `"scripts"`: `"test": "vitest run", "test:watch": "vitest"`.

Create `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
  },
});
```

- [ ] **Step 2: Write the failing radar test**

Create `tests/v2/radar.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { computeRadar, B_DIM } from "../../lib/v2/scoring/radar";
import type { V2Answers } from "../../lib/v2/types";

describe("computeRadar", () => {
  it("maps a/b/c/d to 10/6/4/0 via (raw+2)*2", () => {
    const answers: V2Answers = {
      B1: ["a"], B2: ["b"], B3: ["c"], B4: ["d"], B5: ["a"], B6: ["d"],
    };
    expect(computeRadar(answers)).toEqual({
      analytical: 10, people: 6, creative: 4, entrepreneurial: 0, practical: 10, leadership: 0,
    });
  });

  it("reproduces the Ananya sample radar (B: a c b b a c)", () => {
    const answers: V2Answers = {
      B1: ["a"], B2: ["c"], B3: ["b"], B4: ["b"], B5: ["a"], B6: ["c"],
    };
    expect(computeRadar(answers)).toEqual({
      analytical: 10, people: 4, creative: 6, entrepreneurial: 6, practical: 10, leadership: 4,
    });
  });

  it("scores an unanswered item as 0", () => {
    const r = computeRadar({ B1: ["a"] });
    expect(r.analytical).toBe(10);
    expect(r.people).toBe(0);
  });

  it("covers all six dimensions exactly once", () => {
    expect(Object.values(B_DIM).sort()).toEqual(
      ["analytical", "creative", "entrepreneurial", "leadership", "people", "practical"],
    );
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npx vitest run tests/v2/radar.test.ts`
Expected: FAIL — cannot resolve `lib/v2/scoring/radar` / `lib/v2/types`.

- [ ] **Step 4: Create `lib/v2/types.ts`**

```ts
// Roots & Routes v2 engine types. All weights/tables that reference these are
// calibration seeds (spec v2, end note).

export type Degree = "engineering" | "commerce" | "science" | "arts" | "other";

export type RadarDim =
  | "analytical"
  | "people"
  | "creative"
  | "entrepreneurial"
  | "practical"
  | "leadership";

export type RadarScores = Record<RadarDim, number>;

/** Fixed tie-break priority (spec §5/§6). */
export const DIM_PRIORITY: RadarDim[] = [
  "analytical", "practical", "people", "creative", "entrepreneurial", "leadership",
];

export const DIM_LABELS: Record<RadarDim, string> = {
  analytical: "Analytical",
  people: "People Skills",
  creative: "Creative",
  entrepreneurial: "Entrepreneurial",
  practical: "Practical",
  leadership: "Leadership",
};

export type DomainId =
  | "finance"
  | "business"
  | "entrepreneurship"
  | "technology"
  | "people_society";

export const DOMAIN_ORDER: DomainId[] = [
  "finance", "business", "entrepreneurship", "technology", "people_society",
];

export const DOMAIN_LABELS: Record<DomainId, string> = {
  finance: "Finance & Capital",
  business: "Business & Management",
  entrepreneurship: "Entrepreneurship & Product",
  technology: "Technology & Data",
  people_society: "People & Society",
};

export type RoleId =
  | "markets" | "deals" | "risk" | "advisory"
  | "operations" | "strategy" | "growth" | "people_hr"
  | "founder" | "product" | "sales" | "operator"
  | "build" | "data" | "product_tech" | "infrastructure"
  | "psychology" | "education" | "policy" | "community";

export const ROLE_LABELS: Record<RoleId, string> = {
  markets: "Markets", deals: "Deals", risk: "Risk", advisory: "Advisory",
  operations: "Operations", strategy: "Strategy", growth: "Growth", people_hr: "People & HR",
  founder: "Founder", product: "Product", sales: "Sales", operator: "Operator",
  build: "Build", data: "Data", product_tech: "Product-Tech", infrastructure: "Infrastructure",
  psychology: "Psychology", education: "Education", policy: "Policy", community: "Community",
};

/** E1/E2 value options, in on-screen order. */
export type ValueId = "meaning" | "mastery" | "freedom" | "relationships" | "health" | "money";
export const VALUE_LABELS: Record<ValueId, string> = {
  meaning: "Meaning", mastery: "Mastery", freedom: "Freedom",
  relationships: "Relationships", health: "Health", money: "Money",
};

export type OptionKey = "a" | "b" | "c" | "d" | "e" | "f";

export type BItem = "B1" | "B2" | "B3" | "B4" | "B5" | "B6";

export type ScreenId =
  | "Q0"
  | "A1" | "A2" | "A3" | "A4" | "A5" | "A6" | "A7"
  | BItem
  | "C1" | "C2" | "C3" | "C4" | "C5"
  | "D1" | "D2"
  | "E1" | "E2" | "E3"
  | "F1" | "F2" | "F3" | "F4"
  | "F5a" | "F5b" | "F5c";

/** Answers keyed by screen id. Single-select screens store one key; F5a (countries) stores many. */
export type V2Answers = Partial<Record<ScreenId, OptionKey[]>>;

export type SliderName = "energy" | "decision" | "structure";
export type Band = "Clearly" | "Lean" | "Balanced";

export interface SliderResult {
  band: Band;
  /** Side label ("Outgoing", "Reflective", "Deliberate", "Instinctive", "Structured", "Open-ended"). Undefined when Balanced. */
  side?: string;
}

export type Mobility = "global" | "national" | "conditional" | "rooted";

export interface SlidersResult {
  energy: SliderResult;
  decision: SliderResult;
  structure: SliderResult;
  mobility: Mobility | undefined;
}

export const ANIMALS: Record<RadarDim, { name: string; line: string }> = {
  analytical: { name: "Hawk", line: "Sees the detail from a distance that others miss. Baaz ki nazar." },
  practical: { name: "Elephant", line: "Steady, remembers everything, carries what others can't. Never rushed, never late." },
  leadership: { name: "Lion", line: "Doesn't chase the room's approval. The room organises around it." },
  people: { name: "Dolphin", line: "Reads the group, moves with it, lifts it. Intelligence that works through connection." },
  creative: { name: "Peacock", line: "Makes the thing nobody asked for and everybody remembers." },
  entrepreneurial: { name: "Tiger", line: "Hunts alone, picks its moment, commits fully. The opportunist, in the best sense." },
};

export type ArchetypeResult =
  | {
      kind: "archetype";
      primary: RadarDim;
      secondary: RadarDim;
      name: string;              // "The Auditor"
      animal: string;            // "Hawk"
      rendering: string;         // "Hawk with an Elephant's discipline"
      strapline: string;
    }
  | { kind: "explorer"; copy: string }
  | { kind: "more_signal"; copy: string };

export interface CareerCard {
  kind: "primary" | "secondary" | "cross_branch" | "honest_low";
  role: RoleId;
  career: string;      // "Risk Analyst"
  fit: number;         // 5..95
  whatLine: string;
  nextStep: string;
  honestyLine?: string; // card 1 only, when conf_total <= -2
}

export type FlagId =
  | "romanticism" | "default_path" | "divergence" | "preparation_gap"
  | "conversation_gap" | "family" | "constraint_conflict" | "thin_signal";

export interface FiredFlag {
  id: FlagId;
  tip: string;
}

export type VerdictId =
  | "V1" | "V2" | "V3" | "V4"
  | "L1" | "L2" | "L3" | "L4"
  | "S1" | "S2" | "S3" | "S4"
  | "H1" | "H2" | "H3" | "H4";

export interface Verdict {
  id: VerdictId;
  line: string;
}

export interface ReportV2 {
  header: { name: string; profileId: string; date: string; assessmentName: string };
  state: "full" | "more_signal";
  yourType: ArchetypeResult;
  coreStrengths: {
    label: string;          // "Energy" | "Decision" | "Structure" | "Mobility"
    heading: string;        // "Clearly Reflective" / "Conditional mover"
    sentence: string;
    sourceIds: ScreenId[];  // e.g. ["A1","A2"]
  }[];
  radar: RadarScores;
  /** null in the more_signal state — never render fit % there. */
  cards: CareerCard[] | null;
  verdicts: Verdict[];
  growthTips: string[];
  nextSteps: { counselling: string; exposure: string; conversation: string; abroad?: string };
  flags: FiredFlag[];
  /** For the report body: winning role + co-candidate if any. */
  role: { winner: RoleId; coCandidate: RoleId | null; confTotal: number; confBand: "confirmed" | "provisional" | "mismatch" } | null;
  domain: DomainId | null;
}
```

- [ ] **Step 5: Create `lib/v2/scoring/radar.ts`**

```ts
import type { BItem, RadarDim, RadarScores, V2Answers } from "../types";

export const B_DIM: Record<BItem, RadarDim> = {
  B1: "analytical",
  B2: "people",
  B3: "creative",
  B4: "entrepreneurial",
  B5: "practical",
  B6: "leadership",
};

const RAW: Record<string, number> = { a: 3, b: 1, c: 0, d: -2 };

/** Spec §4 step 1: dimension_score = (raw + 2) * 2 → a=10, b=6, c=4, d=0. No normalisation. */
export function computeRadar(answers: V2Answers): RadarScores {
  const out = {} as RadarScores;
  (Object.keys(B_DIM) as BItem[]).forEach((item) => {
    const key = answers[item]?.[0];
    if (key === undefined || !(key in RAW)) {
      out[B_DIM[item]] = 0; // defensive: unanswered counts as a zero (Decision 17)
      return;
    }
    out[B_DIM[item]] = (RAW[key] + 2) * 2;
  });
  return out;
}
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `npx vitest run tests/v2/radar.test.ts`
Expected: PASS (4 tests). Also run `npm run typecheck` — must pass.

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json vitest.config.ts lib/v2/types.ts lib/v2/scoring/radar.ts tests/v2/radar.test.ts
git commit -m "feat(v2): vitest setup, v2 engine types, radar scoring (raw+2)*2"
```

---

### Task 2: Slider banding (Clearly / Lean / Balanced + Mobility)

**Files:**
- Create: `lib/v2/scoring/sliders.ts`
- Test: `tests/v2/sliders.test.ts`

**Interfaces:**
- Consumes: `V2Answers`, `SlidersResult`, `SliderResult`, `Mobility` from `lib/v2/types`.
- Produces: `computeSliders(answers: V2Answers): SlidersResult`.

Spec §4 step 2 side table: Energy — Outgoing = A1∈{a,d}, A2∈{c,d}; Reflective = A1=c, A2=a; A1=b and A2=b are neutral. Decision — Deliberate = a/d on A3 and A4; Instinctive = b; c neutral. Structure — Structured = A5=a, A6∈{a,b}; Open-ended = A5=b, A6∈{c,d}; A5∈{c,d} neutral. Banding: both items same side = Clearly; exactly one item on a side (other neutral) = Lean; split sides or both neutral = Balanced. Mobility from A7 alone: a=global, b=national, c=conditional, d=rooted.

- [ ] **Step 1: Write the failing test**

Create `tests/v2/sliders.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { computeSliders } from "../../lib/v2/scoring/sliders";
import type { V2Answers } from "../../lib/v2/types";

const base: V2Answers = { A1: ["b"], A2: ["b"], A3: ["c"], A4: ["c"], A5: ["c"], A6: ["a"], A7: ["a"] };

describe("computeSliders", () => {
  it("reproduces the Ananya sample (A: c a a d c b c)", () => {
    const s = computeSliders({
      A1: ["c"], A2: ["a"], A3: ["a"], A4: ["d"], A5: ["c"], A6: ["b"], A7: ["c"],
    });
    expect(s.energy).toEqual({ band: "Clearly", side: "Reflective" });
    expect(s.decision).toEqual({ band: "Clearly", side: "Deliberate" });
    expect(s.structure).toEqual({ band: "Lean", side: "Structured" });
    expect(s.mobility).toBe("conditional");
  });

  it("bands Clearly only when both items agree", () => {
    const s = computeSliders({ ...base, A1: ["a"], A2: ["c"] });
    expect(s.energy).toEqual({ band: "Clearly", side: "Outgoing" });
  });

  it("bands Lean when one item has a side and the other is neutral", () => {
    const s = computeSliders({ ...base, A1: ["a"], A2: ["b"] });
    expect(s.energy).toEqual({ band: "Lean", side: "Outgoing" });
  });

  it("bands Balanced on a split (never Clearly from one data point)", () => {
    const s = computeSliders({ ...base, A1: ["a"], A2: ["a"] }); // Outgoing vs Reflective
    expect(s.energy.band).toBe("Balanced");
    expect(s.energy.side).toBeUndefined();
  });

  it("bands Balanced when both items are neutral", () => {
    const s = computeSliders({ ...base, A3: ["c"], A4: ["c"] });
    expect(s.decision.band).toBe("Balanced");
  });

  it("reads Instinctive from b answers", () => {
    const s = computeSliders({ ...base, A3: ["b"], A4: ["b"] });
    expect(s.decision).toEqual({ band: "Clearly", side: "Instinctive" });
  });

  it("maps all four mobility answers", () => {
    expect(computeSliders({ ...base, A7: ["a"] }).mobility).toBe("global");
    expect(computeSliders({ ...base, A7: ["b"] }).mobility).toBe("national");
    expect(computeSliders({ ...base, A7: ["c"] }).mobility).toBe("conditional");
    expect(computeSliders({ ...base, A7: ["d"] }).mobility).toBe("rooted");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/v2/sliders.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `lib/v2/scoring/sliders.ts`**

```ts
import type { Mobility, SliderResult, SlidersResult, V2Answers } from "../types";

type SideMap = Record<string, string | null>;

// Side classification per item (spec §4 step 2). null = neutral.
const A1_SIDE: SideMap = { a: "Outgoing", b: null, c: "Reflective", d: "Outgoing" };
const A2_SIDE: SideMap = { a: "Reflective", b: null, c: "Outgoing", d: "Outgoing" };
const A3_SIDE: SideMap = { a: "Deliberate", b: "Instinctive", c: null, d: "Deliberate" };
const A4_SIDE: SideMap = { a: "Deliberate", b: "Instinctive", c: null, d: "Deliberate" };
const A5_SIDE: SideMap = { a: "Structured", b: "Open-ended", c: null, d: null };
const A6_SIDE: SideMap = { a: "Structured", b: "Structured", c: "Open-ended", d: "Open-ended" };

const MOBILITY: Record<string, Mobility> = { a: "global", b: "national", c: "conditional", d: "rooted" };

function band(sideA: string | null, sideB: string | null): SliderResult {
  if (sideA && sideB && sideA === sideB) return { band: "Clearly", side: sideA };
  if (sideA && !sideB) return { band: "Lean", side: sideA };
  if (sideB && !sideA) return { band: "Lean", side: sideB };
  return { band: "Balanced" }; // split or both neutral — never Clearly from one data point
}

function sideOf(map: SideMap, key?: string): string | null {
  if (!key) return null;
  return map[key] ?? null;
}

export function computeSliders(a: V2Answers): SlidersResult {
  return {
    energy: band(sideOf(A1_SIDE, a.A1?.[0]), sideOf(A2_SIDE, a.A2?.[0])),
    decision: band(sideOf(A3_SIDE, a.A3?.[0]), sideOf(A4_SIDE, a.A4?.[0])),
    structure: band(sideOf(A5_SIDE, a.A5?.[0]), sideOf(A6_SIDE, a.A6?.[0])),
    mobility: a.A7?.[0] ? MOBILITY[a.A7[0]] : undefined,
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/v2/sliders.test.ts`
Expected: PASS (7 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/v2/scoring/sliders.ts tests/v2/sliders.test.ts
git commit -m "feat(v2): slider banding (Clearly/Lean/Balanced) and mobility"
```

---

### Task 3: Question bank (all 29 screens, verbatim from spec §3)

**Files:**
- Create: `lib/v2/question-bank.ts`
- Test: `tests/v2/question-bank.test.ts`

**Interfaces:**
- Consumes: `ScreenId`, `OptionKey`, `DomainId`, `RoleId`, `ValueId`, `Degree` from `lib/v2/types`.
- Produces (later tasks import all of these):
  - `interface ScreenDef { id: ScreenId; category: string; prompt: string; hint?: string; multi?: boolean; options: { key: OptionKey; label: string }[] }`
  - `STATIC_SCREENS: Record<Exclude<ScreenId, "C1"|"C2"|"C3"|"C4"|"C5"|"D1"|"D2"|"F4">, ScreenDef>` — screens whose content never varies
  - `C_BRANCHES: Record<DomainId, { roles: RoleId[]; screens: { id: "C2"|"C3"|"C4"|"C5"; prompt: string; options: { key: OptionKey; label: string; weights: Partial<Record<RoleId, number>> }[] }[] }>`
  - `D_STATEMENTS: Record<RoleId, { cost: string; grind: string }>`
  - `D_OPTIONS: { d1: { key: OptionKey; label: string }[]; d2: { key: OptionKey; label: string }[] }`
  - `C1_PROMPT: string`, `B_REACTION_OPTIONS: { key: OptionKey; label: string }[]`, `B_SCENARIOS: Record<BItem, string>`
  - `DEGREE_BY_Q0: Record<OptionKey, Degree>`
  - `F4_PROMPT: (a7: OptionKey) => string`

All wording below is **final spec copy — transcribe exactly** (spec pages 4–10). The word "abroad" appears only in F4/F5 content.

- [ ] **Step 1: Write the failing integrity test**

Create `tests/v2/question-bank.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import {
  STATIC_SCREENS, C_BRANCHES, D_STATEMENTS, D_OPTIONS,
  B_SCENARIOS, B_REACTION_OPTIONS, DEGREE_BY_Q0, F4_PROMPT, C1_PROMPT,
} from "../../lib/v2/question-bank";
import { DOMAIN_ORDER } from "../../lib/v2/types";

describe("v2 question bank integrity", () => {
  it("has every static screen with 4+ options (E1/E2 have 6, F3 has 3)", () => {
    expect(STATIC_SCREENS.Q0.options).toHaveLength(5);
    for (const id of ["A1","A2","A3","A4","A5","A6","A7","B1","B2","B3","B4","B5","B6","E3","F1","F2","F5b","F5c"] as const) {
      expect(STATIC_SCREENS[id].options, id).toHaveLength(4);
    }
    expect(STATIC_SCREENS.E1.options).toHaveLength(6);
    expect(STATIC_SCREENS.E2.options).toHaveLength(6);
    expect(STATIC_SCREENS.F3.options).toHaveLength(3);
    expect(STATIC_SCREENS.F5a.options).toHaveLength(6);
    expect(STATIC_SCREENS.F5a.multi).toBe(true);
  });

  it("every C branch has 4 roles and 4 screens of 4 weighted options", () => {
    for (const domain of DOMAIN_ORDER) {
      const branch = C_BRANCHES[domain];
      expect(branch.roles).toHaveLength(4);
      expect(branch.screens).toHaveLength(4);
      for (const s of branch.screens) {
        expect(s.options).toHaveLength(4);
        for (const o of s.options) {
          const total = Object.values(o.weights).reduce((x, y) => x + (y ?? 0), 0);
          expect(total, `${domain} ${s.id} ${o.key}`).toBeGreaterThanOrEqual(3);
          for (const role of Object.keys(o.weights)) expect(branch.roles).toContain(role);
        }
      }
    }
  });

  it("spot-checks Finance weights used by the worked sample", () => {
    const fin = C_BRANCHES.finance;
    const c2 = fin.screens.find((s) => s.id === "C2")!;
    expect(c2.options.find((o) => o.key === "c")!.weights).toEqual({ risk: 3, markets: 1 });
    const c5 = fin.screens.find((s) => s.id === "C5")!;
    expect(c5.options.find((o) => o.key === "a")!.weights).toEqual({ markets: 3 });
  });

  it("has cost+grind statements for all 20 roles", () => {
    expect(Object.keys(D_STATEMENTS)).toHaveLength(20);
    for (const v of Object.values(D_STATEMENTS)) {
      expect(v.cost.length).toBeGreaterThan(10);
      expect(v.grind.length).toBeGreaterThan(10);
    }
  });

  it("B reaction scale is the fixed 4-option scale", () => {
    expect(B_REACTION_OPTIONS.map((o) => o.key)).toEqual(["a", "b", "c", "d"]);
    expect(Object.keys(B_SCENARIOS)).toHaveLength(6);
  });

  it("never says 'abroad' before F4", () => {
    const pre = [
      ...Object.entries(STATIC_SCREENS).filter(([id]) => !id.startsWith("F5")),
      ...Object.values(C_BRANCHES).flatMap((b) => b.screens.map((s) => ["C", s] as const)),
    ];
    const text = JSON.stringify([pre, D_STATEMENTS, D_OPTIONS, C1_PROMPT, B_SCENARIOS]);
    expect(text.toLowerCase()).not.toContain("abroad");
  });

  it("maps Q0 keys to degrees and F4 quotes A7 back", () => {
    expect(DEGREE_BY_Q0).toEqual({ a: "engineering", b: "commerce", c: "science", d: "arts", e: "other" });
    expect(F4_PROMPT("a")).toContain("anywhere in the world");
    expect(F4_PROMPT("c")).toContain("exceptional");
    expect(F4_PROMPT("a").toLowerCase()).toContain("abroad");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/v2/question-bank.test.ts` — Expected: FAIL (module not found).

- [ ] **Step 3: Implement `lib/v2/question-bank.ts`**

Transcribe the full bank. The complete data (all copy verbatim from the spec):

```ts
import type { BItem, Degree, DomainId, OptionKey, RoleId, ScreenId } from "./types";

export interface ScreenDef {
  id: ScreenId;
  category: string;
  prompt: string;
  hint?: string;
  multi?: boolean;
  options: { key: OptionKey; label: string }[];
}

export const DEGREE_BY_Q0: Record<OptionKey, Degree> = {
  a: "engineering", b: "commerce", c: "science", d: "arts", e: "other", f: "other",
};

export const B_SCENARIOS: Record<BItem, string> = {
  B1: "Sales are up 22%, profit is down 8%, and nobody knows why.",
  B2: "Two teammates have gone silent and the deadline is Friday.",
  B3: "A message that says exactly the right thing, and nobody reads it.",
  B4: "Rs 20,000 and 30 days to find out if an idea works.",
  B5: "The same mistake happens every month and everyone just works around it.",
  B6: "Someone capable is quietly falling behind and won't say why.",
};

export const B_REACTION_PROMPT = "Be honest about what just happened in your head.";
export const B_REACTION_OPTIONS: { key: OptionKey; label: string }[] = [
  { key: "a", label: "I started solving it before I finished reading" },
  { key: "b", label: "I want the answer, but I don't want to be the one figuring it out" },
  { key: "c", label: "Nothing much either way" },
  { key: "d", label: "I felt my energy drop" },
];

const bScreen = (id: BItem): ScreenDef => ({
  id,
  category: "React honestly",
  prompt: B_SCENARIOS[id],
  hint: B_REACTION_PROMPT,
  options: B_REACTION_OPTIONS,
});

export const C1_PROMPT = "Based on how you reacted, which of these worlds do you want to look inside?";

export const STATIC_SCREENS = {
  Q0: {
    id: "Q0", category: "About you",
    prompt: "What are you studying right now?",
    options: [
      { key: "a", label: "Engineering / Technology" },
      { key: "b", label: "Commerce / Business" },
      { key: "c", label: "Science" },
      { key: "d", label: "Arts / Humanities / Design" },
      { key: "e", label: "Other" },
    ],
  },
  A1: {
    id: "A1", category: "How you work",
    prompt: "A packed day ends, and your floor is planning something loud tonight.",
    options: [
      { key: "a", label: "I'm in, that's how I recharge" },
      { key: "b", label: "Go for a bit, leave early" },
      { key: "c", label: "Skip it, I recharge alone" },
      { key: "d", label: "Only if I'm the one running it" },
    ],
  },
  A2: {
    id: "A2", category: "How you work",
    prompt: "Your best work this year happened:",
    options: [
      { key: "a", label: "Alone, headphones on" },
      { key: "b", label: "With one or two people" },
      { key: "c", label: "In a full team" },
      { key: "d", label: "While teaching or helping someone" },
    ],
  },
  A3: {
    id: "A3", category: "How you work",
    prompt: "Electives close tomorrow. You:",
    options: [
      { key: "a", label: "Compare options on a sheet" },
      { key: "b", label: "Go with gut" },
      { key: "c", label: "Ask seniors" },
      { key: "d", label: "Pick whatever opens the most doors" },
    ],
  },
  A4: {
    id: "A4", category: "How you work",
    prompt: "A great opportunity, but half the details are missing. You:",
    options: [
      { key: "a", label: "Wait for clarity before committing" },
      { key: "b", label: "Say yes, figure it out" },
      { key: "c", label: "Yes, if someone I trust is in" },
      { key: "d", label: "Research fast, then decide" },
    ],
  },
  A5: {
    id: "A5", category: "How you work",
    prompt: "Two internships. A: clear tasks, daily check-ins. B: “here's the goal, do it your way.”",
    options: [
      { key: "a", label: "Team A" },
      { key: "b", label: "Team B" },
      { key: "c", label: "Team B, with a mentor" },
      { key: "d", label: "Whichever team I click with" },
    ],
  },
  A6: {
    id: "A6", category: "How you work",
    prompt: "A project has no deadline. What actually happens?",
    options: [
      { key: "a", label: "I set my own milestones early" },
      { key: "b", label: "Plan first, then steady work" },
      { key: "c", label: "I start when a date appears" },
      { key: "d", label: "Best work only under pressure" },
    ],
  },
  A7: {
    id: "A7", category: "How you work",
    prompt: "If the right opportunity required you to move, you would:",
    options: [
      { key: "a", label: "Relocate anywhere in the world for it" },
      { key: "b", label: "Relocate anywhere within India" },
      { key: "c", label: "Move only for an exceptional offer" },
      { key: "d", label: "Rather find something where I already live" },
    ],
  },
  B1: bScreen("B1"), B2: bScreen("B2"), B3: bScreen("B3"),
  B4: bScreen("B4"), B5: bScreen("B5"), B6: bScreen("B6"),
  E1: {
    id: "E1", category: "Roots",
    prompt: "Protect one, the rest take a hit:",
    options: [
      { key: "a", label: "Meaning" }, { key: "b", label: "Mastery" }, { key: "c", label: "Freedom" },
      { key: "d", label: "Relationships" }, { key: "e", label: "Health" }, { key: "f", label: "Money" },
    ],
  },
  E2: {
    id: "E2", category: "Roots",
    prompt: "Losing which one makes even a dream job not worth it?",
    options: [
      { key: "a", label: "Meaning" }, { key: "b", label: "Mastery" }, { key: "c", label: "Freedom" },
      { key: "d", label: "Relationships" }, { key: "e", label: "Health" }, { key: "f", label: "Money" },
    ],
  },
  E3: {
    id: "E3", category: "Roots",
    prompt: "Career decisions in your family are actually:",
    options: [
      { key: "a", label: "I decide, then tell them" },
      { key: "b", label: "We decide together" },
      { key: "c", label: "Their approval matters to my call" },
      { key: "d", label: "I'd choose differently if it were only mine" },
    ],
  },
  F1: {
    id: "F1", category: "Reality & path",
    prompt: "Real exposure to your top field so far:",
    options: [
      { key: "a", label: "None" },
      { key: "b", label: "One project or internship" },
      { key: "c", label: "A few" },
      { key: "d", label: "Ongoing" },
    ],
  },
  F2: {
    id: "F2", category: "Reality & path",
    prompt: "Spoken to anyone actually doing the job?",
    options: [
      { key: "a", label: "No" },
      { key: "b", label: "Once" },
      { key: "c", label: "A few times" },
      { key: "d", label: "Regularly" },
    ],
  },
  F3: {
    id: "F3", category: "Reality & path",
    prompt: "After graduation:",
    options: [
      { key: "a", label: "Higher studies" },
      { key: "b", label: "Work" },
      { key: "c", label: "Undecided" },
    ],
  },
  F5a: {
    id: "F5a", category: "Reality & path", multi: true,
    prompt: "Which countries are you considering?",
    options: [
      { key: "a", label: "USA" }, { key: "b", label: "UK" }, { key: "c", label: "Canada" },
      { key: "d", label: "Australia" }, { key: "e", label: "Germany" }, { key: "f", label: "Other / not decided" },
    ],
  },
  F5b: {
    id: "F5b", category: "Reality & path",
    prompt: "When would you want to start?",
    options: [
      { key: "a", label: "Within 12 months" }, { key: "b", label: "1 to 2 years" },
      { key: "c", label: "2 to 3 years" }, { key: "d", label: "No fixed timeline" },
    ],
  },
  F5c: {
    id: "F5c", category: "Reality & path",
    prompt: "How would it be funded?",
    options: [
      { key: "a", label: "Family funded" }, { key: "b", label: "Loan plus family" },
      { key: "c", label: "Scholarship dependent" }, { key: "d", label: "Not planned yet" },
    ],
  },
} satisfies Record<string, ScreenDef>;

export function F4_PROMPT(a7: OptionKey): string {
  const quote = a7 === "a"
    ? "You said you would move anywhere in the world for the right opportunity."
    : "You said you would move for an exceptional opportunity.";
  return `${quote} Would that include studying abroad?`;
}

export const F4_OPTIONS: { key: OptionKey; label: string }[] = [
  { key: "a", label: "Definitely" },
  { key: "b", label: "Open to it" },
  { key: "c", label: "I'd rather study in India" },
];

interface CScreenDef {
  id: "C2" | "C3" | "C4" | "C5";
  prompt: string;
  options: { key: OptionKey; label: string; weights: Partial<Record<RoleId, number>> }[];
}

export const C_BRANCHES: Record<DomainId, { roles: RoleId[]; screens: CScreenDef[] }> = {
  finance: {
    roles: ["markets", "deals", "risk", "advisory"],
    screens: [
      { id: "C2", prompt: "Four rooms, one morning. Pick yours.", options: [
        { key: "a", label: "The number nobody can explain", weights: { markets: 3, risk: 2 } },
        { key: "b", label: "The negotiation deciding the price", weights: { deals: 3, advisory: 1 } },
        { key: "c", label: "The review that catches the miss", weights: { risk: 3, markets: 1 } },
        { key: "d", label: "Someone deciding their money's future", weights: { advisory: 3, deals: 1 } },
      ]},
      { id: "C3", prompt: "Something fails at 9pm. Which stings most?", options: [
        { key: "a", label: "Right call, wrong size", weights: { markets: 3 } },
        { key: "b", label: "Deal closed, they won", weights: { deals: 3 } },
        { key: "c", label: "Your sign-off had a hole", weights: { risk: 3 } },
        { key: "d", label: "Client followed you and lost", weights: { advisory: 3 } },
      ]},
      { id: "C4", prompt: "You get to be definitely right about one thing:", options: [
        { key: "a", label: "Where the price goes", weights: { markets: 3 } },
        { key: "b", label: "What the business is worth", weights: { deals: 3 } },
        { key: "c", label: "What breaks, and how badly", weights: { risk: 3 } },
        { key: "d", label: "What this person should do next", weights: { advisory: 3 } },
      ]},
      { id: "C5", prompt: "Which would you least want said about your work?", options: [
        { key: "a", label: "“Safe, never called it early”", weights: { markets: 3 } },
        { key: "b", label: "“Good analyst, couldn't close”", weights: { deals: 3 } },
        { key: "c", label: "“Fast, missed things”", weights: { risk: 3 } },
        { key: "d", label: "“Smart, nobody trusted them”", weights: { advisory: 3 } },
      ]},
    ],
  },
  business: {
    roles: ["operations", "strategy", "growth", "people_hr"],
    screens: [
      { id: "C2", prompt: "Four meetings, one morning. Pick yours.", options: [
        { key: "a", label: "Why the same delay keeps happening", weights: { operations: 3 } },
        { key: "b", label: "Which of three markets to enter", weights: { strategy: 3 } },
        { key: "c", label: "Why people click but don't buy", weights: { growth: 3 } },
        { key: "d", label: "Why good people keep leaving", weights: { people_hr: 3 } },
      ]},
      { id: "C3", prompt: "Which failure stings most?", options: [
        { key: "a", label: "It worked, but couldn't scale", weights: { operations: 3 } },
        { key: "b", label: "Right call, two years late", weights: { strategy: 3 } },
        { key: "c", label: "Good product, nobody heard of it", weights: { growth: 3 } },
        { key: "d", label: "Hit the numbers, lost the team", weights: { people_hr: 3 } },
      ]},
      { id: "C4", prompt: "Definitely right about one thing:", options: [
        { key: "a", label: "How the work actually gets done", weights: { operations: 3, strategy: 1 } },
        { key: "b", label: "Where the industry is going", weights: { strategy: 3 } },
        { key: "c", label: "What makes someone choose us", weights: { growth: 3, strategy: 1 } },
        { key: "d", label: "Who to hire, who to let go", weights: { people_hr: 3 } },
      ]},
      { id: "C5", prompt: "Least want said:", options: [
        { key: "a", label: "“Great ideas, nothing shipped”", weights: { operations: 3 } },
        { key: "b", label: "“Efficient, no bigger picture”", weights: { strategy: 3 } },
        { key: "c", label: "“Solid, nothing ever landed”", weights: { growth: 3 } },
        { key: "d", label: "“Delivered numbers, burned people”", weights: { people_hr: 3 } },
      ]},
    ],
  },
  entrepreneurship: {
    roles: ["founder", "product", "sales", "operator"],
    screens: [
      { id: "C2", prompt: "Your idea has one problem. Which would you rather have?", options: [
        { key: "a", label: "Nobody knows if anyone wants it", weights: { founder: 3 } },
        { key: "b", label: "People want it, it's confusing to use", weights: { product: 3 } },
        { key: "c", label: "It's good, nobody's heard of it", weights: { sales: 3 } },
        { key: "d", label: "It works, but breaks when it grows", weights: { operator: 3 } },
      ]},
      { id: "C3", prompt: "Which morning would you enjoy?", options: [
        { key: "a", label: "Ten stranger conversations to test the idea", weights: { founder: 3, sales: 1 } },
        { key: "b", label: "Watching five people use it, noting hesitations", weights: { product: 3 } },
        { key: "c", label: "Six no's, going back a seventh time", weights: { sales: 3 } },
        { key: "d", label: "Fixing last week's break so it never repeats", weights: { operator: 3 } },
      ]},
      { id: "C4", prompt: "You can only have one:", options: [
        { key: "a", label: "The nerve to start before it's ready", weights: { founder: 3 } },
        { key: "b", label: "The instinct for what to build next", weights: { product: 3, founder: 1 } },
        { key: "c", label: "Getting almost anyone to yes", weights: { sales: 3 } },
        { key: "d", label: "Making anything run without you", weights: { operator: 3 } },
      ]},
      { id: "C5", prompt: "Least want said:", options: [
        { key: "a", label: "“Waited until it was safe”", weights: { founder: 3 } },
        { key: "b", label: "“Built what they liked, not what was needed”", weights: { product: 3 } },
        { key: "c", label: "“Great product, no customers”", weights: { sales: 3 } },
        { key: "d", label: "“Grew fast, fell over”", weights: { operator: 3 } },
      ]},
    ],
  },
  technology: {
    roles: ["build", "data", "product_tech", "infrastructure"],
    screens: [
      { id: "C2", prompt: "Pick your room.", options: [
        { key: "a", label: "The thing due Friday that doesn't exist yet", weights: { build: 3 } },
        { key: "b", label: "The number that changed and nobody knows why", weights: { data: 3 } },
        { key: "c", label: "The argument over what to build at all", weights: { product_tech: 3 } },
        { key: "d", label: "The alert that went off at 3am", weights: { infrastructure: 3 } },
      ]},
      { id: "C3", prompt: "Which failure stings most?", options: [
        { key: "a", label: "It works, the code's a mess nobody can touch", weights: { build: 3 } },
        { key: "b", label: "Clean analysis, wrong conclusion", weights: { data: 3 } },
        { key: "c", label: "Built exactly what was asked, nobody used it", weights: { product_tech: 3 } },
        { key: "d", label: "Ran perfectly until the one day it didn't", weights: { infrastructure: 3 } },
      ]},
      { id: "C4", prompt: "Definitely right about one thing:", options: [
        { key: "a", label: "How to make it work", weights: { build: 3 } },
        { key: "b", label: "What the data actually says", weights: { data: 3 } },
        { key: "c", label: "What's worth building", weights: { product_tech: 3, data: 1 } },
        { key: "d", label: "Where it breaks under load", weights: { infrastructure: 3, build: 1 } },
      ]},
      { id: "C5", prompt: "Least want said:", options: [
        { key: "a", label: "“Clever code, took three times as long”", weights: { build: 3 } },
        { key: "b", label: "“Impressive chart, wrong question”", weights: { data: 3 } },
        { key: "c", label: "“Shipped a lot, none of it mattered”", weights: { product_tech: 3 } },
        { key: "d", label: "“Fast, and it went down twice”", weights: { infrastructure: 3 } },
      ]},
    ],
  },
  people_society: {
    roles: ["psychology", "education", "policy", "community"],
    screens: [
      { id: "C2", prompt: "Pick your room.", options: [
        { key: "a", label: "One person, one hour, something never said aloud", weights: { psychology: 3 } },
        { key: "b", label: "Thirty people who'll get it by the end", weights: { education: 3 } },
        { key: "c", label: "A badly written rule affecting a lakh people", weights: { policy: 3 } },
        { key: "d", label: "A service that exists, a community that won't use it", weights: { community: 3 } },
      ]},
      { id: "C3", prompt: "Which failure stings most?", options: [
        { key: "a", label: "They trusted you, you missed what was wrong", weights: { psychology: 3 } },
        { key: "b", label: "You explained well, they still couldn't do it", weights: { education: 3 } },
        { key: "c", label: "Right policy, never implemented", weights: { policy: 3 } },
        { key: "d", label: "The programme worked, the funding stopped", weights: { community: 3 } },
      ]},
      { id: "C4", prompt: "Definitely right about one thing:", options: [
        { key: "a", label: "What's really going on with this person", weights: { psychology: 3 } },
        { key: "b", label: "How someone learns best", weights: { education: 3, psychology: 1 } },
        { key: "c", label: "What the system should change", weights: { policy: 3 } },
        { key: "d", label: "What this community actually needs", weights: { community: 3, policy: 1 } },
      ]},
      { id: "C5", prompt: "Least want said:", options: [
        { key: "a", label: "“Kind, never went deep”", weights: { psychology: 3 } },
        { key: "b", label: "“Knew it, couldn't teach it”", weights: { education: 3 } },
        { key: "c", label: "“Good intentions, no evidence”", weights: { policy: 3 } },
        { key: "d", label: "“Great report, changed nothing”", weights: { community: 3 } },
      ]},
    ],
  },
};

export const D_OPTIONS = {
  d1: [
    { key: "a" as const, label: "I'd take that over the alternative" },
    { key: "b" as const, label: "Livable, once I see why" },
    { key: "c" as const, label: "Hard, but I'd build the tolerance" },
    { key: "d" as const, label: "I'd resent it" },
  ],
  d2: [
    { key: "a" as const, label: "Yes, gladly" },
    { key: "b" as const, label: "Yes, if it compounds" },
    { key: "c" as const, label: "I'd try" },
    { key: "d" as const, label: "No" },
  ],
};

export const D_STATEMENTS: Record<RoleId, { cost: string; grind: string }> = {
  markets: {
    cost: "Being wrong in public, with a number attached, monthly",
    grind: "Five years reading dry material to spot the one line that matters",
  },
  deals: {
    cost: "Weeks of 80% waiting, 20% panic at 11pm",
    grind: "Five years building models seniors present",
  },
  risk: {
    cost: "Being the person who slows things down, and unpopular for it",
    grind: "Five years of rules that change yearly, right in ways nobody thanks you for",
  },
  advisory: {
    cost: "Sitting with someone's money fear, promising nothing",
    grind: "Five years of trust built one person at a time",
  },
  operations: {
    cost: "Fix it well and nobody notices it was broken",
    grind: "Five years of small improvements that only compound if you stay",
  },
  strategy: {
    cost: "Months of work someone else decides on",
    grind: "Five years of being new to every industry",
  },
  growth: {
    cost: "Most experiments fail, measurably",
    grind: "Five years of public failures judged on the last number",
  },
  people_hr: {
    cost: "Holding secrets you cannot repeat",
    grind: "Five years of results that show up as things that did not happen",
  },
  founder: {
    cost: "Long stretches where nobody knows if it's working",
    grind: "Five years of income and status dipping in front of batchmates",
  },
  product: {
    cost: "Responsible for outcomes, authority over nothing",
    grind: "Five years of watching people misuse what you built",
  },
  sales: {
    cost: "Rejection as a daily, counted fact",
    grind: "Five years starting every month at zero",
  },
  operator: {
    cost: "Cleaning up decisions you did not make",
    grind: "Five years of being essential and invisible",
  },
  build: {
    cost: "Beginner again every eighteen months",
    grind: "Five years of bugs that turn out to be one character",
  },
  data: {
    cost: "Mostly cleaning, rarely the insight",
    grind: "Five years of saying “the data cannot tell us that”",
  },
  product_tech: {
    cost: "Saying no to people you like, repeatedly",
    grind: "Five years of shipped things getting killed",
  },
  infrastructure: {
    cost: "Visible only when something breaks",
    grind: "Five years of preventing problems nobody knows about",
  },
  psychology: {
    cost: "Carrying distress you cannot discuss at dinner",
    grind: "Five to seven years of training before independent practice",
  },
  education: {
    cost: "The same explanation, hundredth time, like the first",
    grind: "Five years of rarely knowing if it made a difference",
  },
  policy: {
    cost: "Watching evidence lose to politics",
    grind: "Five years for one change to move, if it moves",
  },
  community: {
    cost: "Less money and fewer people than the problem needs",
    grind: "Five years of programmes ending when funding ends",
  },
};
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/v2/question-bank.test.ts` — Expected: PASS. Run `npm run typecheck` — pass.

- [ ] **Step 5: Commit**

```bash
git add lib/v2/question-bank.ts tests/v2/question-bank.test.ts
git commit -m "feat(v2): full 29-screen question bank with C-branch weights and 20-role D table"
```

---

### Task 4: Domain seeds + C1 card selection + default_path_flag

**Files:**
- Create: `lib/v2/scoring/domains.ts`
- Test: `tests/v2/domains.test.ts`

**Interfaces:**
- Consumes: `RadarScores`, `DomainId`, `Degree`, `DOMAIN_ORDER` from `lib/v2/types`.
- Produces:
  - `DOMAIN_SEEDS: Record<DomainId, [RadarDim, RadarDim]>`
  - `DEGREE_DEFAULT: Record<Degree, DomainId | null>`
  - `seedScores(radar: RadarScores): Record<DomainId, number>`
  - `rankDomains(radar: RadarScores): DomainId[]` (descending, ties by `DOMAIN_ORDER`)
  - `selectC1Cards(radar: RadarScores, degree: Degree): { cards: DomainId[]; seededTop2: DomainId[] }` (always 4 cards)
  - `computeDefaultPathFlag(chosen: DomainId, degree: Degree, seededTop2: DomainId[]): boolean`

Spec §4 step 3: seeds Finance=B1+B4, Business=B2+B5, Entrepreneurship=B4+B3, Technology=B5+B1, People&Society=B6+B2. Cards = seeded rank 1, rank 2, degree default, highest remaining; if default already in top two (or degree has no default), the fourth card is the lowest-seeded domain as wildcard (third card is then rank 3). `default_path_flag` = student picks the default AND it was outside the seeded top two.

- [ ] **Step 1: Write the failing test**

Create `tests/v2/domains.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import {
  DOMAIN_SEEDS, DEGREE_DEFAULT, seedScores, rankDomains, selectC1Cards, computeDefaultPathFlag,
} from "../../lib/v2/scoring/domains";
import type { RadarScores } from "../../lib/v2/types";

const ananya: RadarScores = {
  analytical: 10, people: 4, creative: 6, entrepreneurial: 6, practical: 10, leadership: 4,
};

describe("domain seeds and C1 cards", () => {
  it("computes seed scores from the seed pairs", () => {
    expect(seedScores(ananya)).toEqual({
      finance: 16,          // B1 An 10 + B4 En 6
      business: 14,         // B2 Pe 4 + B5 Pr 10
      entrepreneurship: 12, // En 6 + Cr 6
      technology: 20,       // Pr 10 + An 10
      people_society: 8,    // Le 4 + Pe 4
    });
  });

  it("ranks Ananya's domains technology > finance > business > entrepreneurship > people_society", () => {
    expect(rankDomains(ananya)).toEqual([
      "technology", "finance", "business", "entrepreneurship", "people_society",
    ]);
  });

  it("commerce student: default (business) outside top 2 → cards are r1, r2, default, highest remaining", () => {
    const { cards, seededTop2 } = selectC1Cards(ananya, "commerce");
    expect(seededTop2).toEqual(["technology", "finance"]);
    expect(cards).toEqual(["technology", "finance", "business", "entrepreneurship"]);
  });

  it("engineering student: default (technology) inside top 2 → 3rd seed + lowest as wildcard", () => {
    const { cards } = selectC1Cards(ananya, "engineering");
    expect(cards).toEqual(["technology", "finance", "business", "people_society"]);
  });

  it("degree 'other': no default card, wildcard fills slot 4", () => {
    expect(DEGREE_DEFAULT.other).toBeNull();
    const { cards } = selectC1Cards(ananya, "other");
    expect(cards).toEqual(["technology", "finance", "business", "people_society"]);
  });

  it("fires default_path_flag only when picking a default that was outside seeded top 2", () => {
    const { seededTop2 } = selectC1Cards(ananya, "commerce");
    expect(computeDefaultPathFlag("business", "commerce", seededTop2)).toBe(true);
    expect(computeDefaultPathFlag("finance", "commerce", seededTop2)).toBe(false);
    // Ananya picked finance (seeded rank 2 for her before ties — actually rank 1 of the non-tech seeds): no flag
    expect(computeDefaultPathFlag("technology", "engineering", ["technology", "finance"])).toBe(false);
  });

  it("seed pairs match spec §4 step 3", () => {
    expect(DOMAIN_SEEDS).toEqual({
      finance: ["analytical", "entrepreneurial"],
      business: ["people", "practical"],
      entrepreneurship: ["entrepreneurial", "creative"],
      technology: ["practical", "analytical"],
      people_society: ["leadership", "people"],
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/v2/domains.test.ts` — Expected: FAIL (module not found).

- [ ] **Step 3: Implement `lib/v2/scoring/domains.ts`**

```ts
import { DOMAIN_ORDER } from "../types";
import type { Degree, DomainId, RadarDim, RadarScores } from "../types";

export const DOMAIN_SEEDS: Record<DomainId, [RadarDim, RadarDim]> = {
  finance: ["analytical", "entrepreneurial"],
  business: ["people", "practical"],
  entrepreneurship: ["entrepreneurial", "creative"],
  technology: ["practical", "analytical"],
  people_society: ["leadership", "people"],
};

export const DEGREE_DEFAULT: Record<Degree, DomainId | null> = {
  engineering: "technology",
  commerce: "business",
  science: "technology",
  arts: "people_society",
  other: null,
};

export function seedScores(radar: RadarScores): Record<DomainId, number> {
  const out = {} as Record<DomainId, number>;
  for (const d of DOMAIN_ORDER) {
    const [x, y] = DOMAIN_SEEDS[d];
    out[d] = radar[x] + radar[y];
  }
  return out;
}

/** Descending by seed score; ties break by fixed DOMAIN_ORDER (Decision 12). */
export function rankDomains(radar: RadarScores): DomainId[] {
  const scores = seedScores(radar);
  return [...DOMAIN_ORDER].sort(
    (a, b) => scores[b] - scores[a] || DOMAIN_ORDER.indexOf(a) - DOMAIN_ORDER.indexOf(b),
  );
}

export function selectC1Cards(
  radar: RadarScores,
  degree: Degree,
): { cards: DomainId[]; seededTop2: DomainId[] } {
  const ranked = rankDomains(radar);
  const [r1, r2, r3] = ranked;
  const lowest = ranked[ranked.length - 1];
  const def = DEGREE_DEFAULT[degree];
  const seededTop2: DomainId[] = [r1, r2];

  if (def && def !== r1 && def !== r2) {
    const highestRemaining = ranked.find((d) => d !== r1 && d !== r2 && d !== def)!;
    return { cards: [r1, r2, def, highestRemaining], seededTop2 };
  }
  // Default already visible (or no default): third seed + lowest-seeded wildcard.
  return { cards: [r1, r2, r3, lowest], seededTop2 };
}

export function computeDefaultPathFlag(
  chosen: DomainId,
  degree: Degree,
  seededTop2: DomainId[],
): boolean {
  const def = DEGREE_DEFAULT[degree];
  return def !== null && chosen === def && !seededTop2.includes(def);
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/v2/domains.test.ts` — Expected: PASS (7 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/v2/scoring/domains.ts tests/v2/domains.test.ts
git commit -m "feat(v2): domain seeds, C1 card selection, default_path_flag"
```

---

### Task 5: Role resolution (C2–C5)

**Files:**
- Create: `lib/v2/scoring/roles.ts`
- Test: `tests/v2/roles.test.ts`

**Interfaces:**
- Consumes: `C_BRANCHES` from `lib/v2/question-bank`; `DomainId`, `RoleId`, `V2Answers` from `lib/v2/types`.
- Produces: `resolveRole(domain: DomainId, answers: V2Answers): { winner: RoleId; scores: Record<RoleId, number>; coCandidate: RoleId | null; ranked: RoleId[] }`.

Spec §4 step 4: sum role points across C2–C5 using printed weights; highest total wins; top two within 1 point → co-candidates, D runs on the higher. Ties break by branch role order (Decision 12). `ranked` is all 4 roles descending (needed by the honest-low card).

- [ ] **Step 1: Write the failing test**

Create `tests/v2/roles.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { resolveRole } from "../../lib/v2/scoring/roles";
import type { V2Answers } from "../../lib/v2/types";

describe("resolveRole", () => {
  it("reproduces the Ananya sample: finance c c c a → Risk 9, Markets 4, no co-candidate", () => {
    const answers: V2Answers = { C2: ["c"], C3: ["c"], C4: ["c"], C5: ["a"] };
    const r = resolveRole("finance", answers);
    expect(r.scores.risk).toBe(9);      // C2c 3 + C3c 3 + C4c 3
    expect(r.scores.markets).toBe(4);   // C2c 1 + C5a 3
    expect(r.winner).toBe("risk");
    expect(r.coCandidate).toBeNull();   // 9 - 4 > 1
    expect(r.ranked[0]).toBe("risk");
    expect(r.ranked[1]).toBe("markets");
  });

  it("declares co-candidates when top two are within 1 point", () => {
    // finance: a a b b → markets 3+3=6 (+risk 2), deals 3+3=6
    const r = resolveRole("finance", { C2: ["a"], C3: ["a"], C4: ["b"], C5: ["b"] });
    expect(r.scores.markets).toBe(6);
    expect(r.scores.deals).toBe(6);
    expect(r.coCandidate).not.toBeNull();
    // tie broken by branch role order: markets before deals
    expect(r.winner).toBe("markets");
    expect(r.coCandidate).toBe("deals");
  });

  it("secondary weights count (business C4 a gives strategy 1)", () => {
    const r = resolveRole("business", { C2: ["b"], C3: ["b"], C4: ["a"], C5: ["b"] });
    expect(r.scores.strategy).toBe(3 + 3 + 1 + 3);
    expect(r.scores.operations).toBe(3);
    expect(r.winner).toBe("strategy");
  });

  it("all four roles present in scores even at 0", () => {
    const r = resolveRole("technology", { C2: ["a"], C3: ["a"], C4: ["a"], C5: ["a"] });
    expect(Object.keys(r.scores).sort()).toEqual(["build", "data", "infrastructure", "product_tech"]);
    expect(r.scores.data).toBe(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/v2/roles.test.ts` — Expected: FAIL.

- [ ] **Step 3: Implement `lib/v2/scoring/roles.ts`**

```ts
import { C_BRANCHES } from "../question-bank";
import type { DomainId, RoleId, V2Answers } from "../types";

export function resolveRole(
  domain: DomainId,
  answers: V2Answers,
): { winner: RoleId; scores: Record<RoleId, number>; coCandidate: RoleId | null; ranked: RoleId[] } {
  const branch = C_BRANCHES[domain];
  const scores = {} as Record<RoleId, number>;
  for (const role of branch.roles) scores[role] = 0;

  for (const screen of branch.screens) {
    const key = answers[screen.id]?.[0];
    if (!key) continue;
    const opt = screen.options.find((o) => o.key === key);
    if (!opt) continue;
    for (const [role, w] of Object.entries(opt.weights)) {
      scores[role as RoleId] += w ?? 0;
    }
  }

  // Descending; ties break by branch role order (Decision 12) → deterministic.
  const ranked = [...branch.roles].sort(
    (a, b) => scores[b] - scores[a] || branch.roles.indexOf(a) - branch.roles.indexOf(b),
  );
  const winner = ranked[0];
  const coCandidate = scores[winner] - scores[ranked[1]] <= 1 ? ranked[1] : null;
  return { winner, scores, coCandidate, ranked };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/v2/roles.test.ts` — Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/v2/scoring/roles.ts tests/v2/roles.test.ts
git commit -m "feat(v2): role resolution over C2-C5 weights with co-candidates"
```

---

### Task 6: Confirmation scoring (D1/D2)

**Files:**
- Create: `lib/v2/scoring/confirmation.ts`
- Test: `tests/v2/confirmation.test.ts`

**Interfaces:**
- Consumes: `V2Answers` from `lib/v2/types`.
- Produces: `confTotal(answers: V2Answers): number` (range −6..+4), `confBand(total: number): "confirmed" | "provisional" | "mismatch"`, `D_SCORES: Record<"a"|"b"|"c"|"d", number>`.

Spec §3/§4 step 5: D1 and D2 both score a=+2, b=+1, c=0, d=−3. `conf_total = D1 + D2`. ≥+3 confirmed; +1..+2 provisional; ≤0 mismatch (report leads with the mismatch, never the role).

- [ ] **Step 1: Write the failing test**

Create `tests/v2/confirmation.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { confTotal, confBand, D_SCORES } from "../../lib/v2/scoring/confirmation";

describe("confirmation", () => {
  it("scores a/b/c/d as +2/+1/0/-3", () => {
    expect(D_SCORES).toEqual({ a: 2, b: 1, c: 0, d: -3 });
  });

  it("Ananya: D1 b + D2 b → +2 provisional", () => {
    const t = confTotal({ D1: ["b"], D2: ["b"] });
    expect(t).toBe(2);
    expect(confBand(t)).toBe("provisional");
  });

  it("bands the full range", () => {
    expect(confBand(4)).toBe("confirmed");
    expect(confBand(3)).toBe("confirmed");
    expect(confBand(2)).toBe("provisional");
    expect(confBand(1)).toBe("provisional");
    expect(confBand(0)).toBe("mismatch");
    expect(confBand(-6)).toBe("mismatch");
  });

  it("range is -6..+4", () => {
    expect(confTotal({ D1: ["d"], D2: ["d"] })).toBe(-6);
    expect(confTotal({ D1: ["a"], D2: ["a"] })).toBe(4);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/v2/confirmation.test.ts` — Expected: FAIL.

- [ ] **Step 3: Implement `lib/v2/scoring/confirmation.ts`**

```ts
import type { V2Answers } from "../types";

export const D_SCORES: Record<"a" | "b" | "c" | "d", number> = { a: 2, b: 1, c: 0, d: -3 };

export function confTotal(answers: V2Answers): number {
  const d1 = answers.D1?.[0];
  const d2 = answers.D2?.[0];
  return (d1 ? D_SCORES[d1 as keyof typeof D_SCORES] ?? 0 : 0)
       + (d2 ? D_SCORES[d2 as keyof typeof D_SCORES] ?? 0 : 0);
}

export function confBand(total: number): "confirmed" | "provisional" | "mismatch" {
  if (total >= 3) return "confirmed";
  if (total >= 1) return "provisional";
  return "mismatch";
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/v2/confirmation.test.ts` — Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/v2/scoring/confirmation.ts tests/v2/confirmation.test.ts
git commit -m "feat(v2): D1/D2 confirmation scoring and bands"
```

---

### Task 7: Archetype pipeline (thin-signal → flat → pair → tie-breaks)

**Files:**
- Create: `lib/v2/archetype.ts`
- Test: `tests/v2/archetype.test.ts`

**Interfaces:**
- Consumes: `RadarScores`, `RadarDim`, `DomainId`, `ArchetypeResult`, `ANIMALS`, `DIM_PRIORITY` from `lib/v2/types`.
- Produces:
  - `computeArchetypeV2(radar: RadarScores, chosenDomain: DomainId | null): ArchetypeResult`
  - `DOMAIN_TIEBREAK: Record<DomainId, RadarDim[]>` (C1-alignment tie-break table, spec §6)
  - `orderDims(radar: RadarScores, chosenDomain: DomainId | null): RadarDim[]` — all six dims fully ordered with tie-breaks (reused by the cross-branch card in Task 10)
  - `ARCHETYPE_GRID` — 15 pair entries `{ name, rendering, strapline, straplineInstinctive?: string }` keyed `"analytical+practical"` style (alphabetical pair key via `pairKey(a, b)` helper, also exported)
  - `EXPLORER_COPY: string`, `MORE_SIGNAL_COPY: string`

Spec §6 assignment order: (1) thin-signal: max ≤ 6 OR three-plus zeros → More Signal Needed (no archetype, no animal, no fit %). (2) flat: all six within 4 points AND all ≥ 4 → The Explorer. (3) pair top two dims. Ties (for first or second place) break by C1 domain alignment, then fixed priority analytical, practical, people, creative, entrepreneurial, leadership.

- [ ] **Step 1: Write the failing test**

Create `tests/v2/archetype.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { computeArchetypeV2, DOMAIN_TIEBREAK, orderDims, pairKey, ARCHETYPE_GRID } from "../../lib/v2/archetype";
import type { RadarScores } from "../../lib/v2/types";

const r = (an: number, pe: number, cr: number, en: number, pr: number, le: number): RadarScores => ({
  analytical: an, people: pe, creative: cr, entrepreneurial: en, practical: pr, leadership: le,
});

describe("archetype pipeline", () => {
  it("Ananya: An10 Pr10 tie for first, finance alignment + priority → The Auditor (Hawk with Elephant)", () => {
    const a = computeArchetypeV2(r(10, 4, 6, 6, 10, 4), "finance");
    expect(a.kind).toBe("archetype");
    if (a.kind !== "archetype") return;
    expect(a.primary).toBe("analytical");
    expect(a.secondary).toBe("practical");
    expect(a.name).toBe("The Auditor");
    expect(a.animal).toBe("Hawk");
    expect(a.rendering).toBe("Hawk with an Elephant's discipline");
  });

  it("thin signal: max <= 6 → more_signal, even when flat", () => {
    expect(computeArchetypeV2(r(6, 6, 6, 6, 6, 6), "finance").kind).toBe("more_signal");
  });

  it("thin signal: three zeros → more_signal even with a 10", () => {
    expect(computeArchetypeV2(r(10, 0, 0, 0, 6, 6), "finance").kind).toBe("more_signal");
  });

  it("flat: all >= 6 with a 10, spread <= 4 → explorer", () => {
    expect(computeArchetypeV2(r(10, 6, 6, 6, 6, 6), "finance").kind).toBe("explorer");
  });

  it("near-tie for second breaks by C1 alignment: An10 Pr6 Cr6", () => {
    const fin = computeArchetypeV2(r(10, 4, 6, 4, 6, 4), "finance");     // favours practical
    const tech = computeArchetypeV2(r(10, 4, 6, 4, 6, 4), "technology"); // favours creative
    if (fin.kind !== "archetype" || tech.kind !== "archetype") throw new Error("expected archetypes");
    expect(fin.name).toBe("The Auditor");     // An + Pr
    expect(tech.name).toBe("The Architect");  // An + Cr
  });

  it("falls back to fixed priority with no domain", () => {
    const a = computeArchetypeV2(r(10, 4, 6, 4, 6, 4), null);
    if (a.kind !== "archetype") throw new Error("expected archetype");
    expect(a.secondary).toBe("practical"); // priority: practical before creative
  });

  it("has all 15 pair entries and a symmetric pairKey", () => {
    expect(Object.keys(ARCHETYPE_GRID)).toHaveLength(15);
    expect(pairKey("practical", "analytical")).toBe(pairKey("analytical", "practical"));
  });

  it("orderDims returns all six dims, ordered deterministically", () => {
    const dims = orderDims(r(10, 4, 6, 4, 6, 4), "finance");
    expect(dims).toHaveLength(6);
    expect(dims[0]).toBe("analytical");
    expect(dims[1]).toBe("practical");
  });

  it("tie-break table matches spec §6", () => {
    expect(DOMAIN_TIEBREAK.finance).toEqual(["analytical", "practical"]);
    expect(DOMAIN_TIEBREAK.business).toEqual(["leadership", "practical"]);
    expect(DOMAIN_TIEBREAK.entrepreneurship).toEqual(["entrepreneurial", "creative"]);
    expect(DOMAIN_TIEBREAK.technology).toEqual(["analytical", "creative"]);
    expect(DOMAIN_TIEBREAK.people_society).toEqual(["people", "leadership"]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/v2/archetype.test.ts` — Expected: FAIL.

- [ ] **Step 3: Implement `lib/v2/archetype.ts`**

```ts
import { ANIMALS, DIM_PRIORITY } from "./types";
import type { ArchetypeResult, DomainId, RadarDim, RadarScores } from "./types";

export const DOMAIN_TIEBREAK: Record<DomainId, RadarDim[]> = {
  finance: ["analytical", "practical"],
  business: ["leadership", "practical"],
  entrepreneurship: ["entrepreneurial", "creative"],
  technology: ["analytical", "creative"],
  people_society: ["people", "leadership"],
};

export function pairKey(a: RadarDim, b: RadarDim): string {
  return [a, b].sort().join("+");
}

interface GridEntry { name: string; rendering: string; strapline: string; straplineInstinctive?: string }

// Spec §6 grid, verbatim. straplineInstinctive stays empty until copy exists (Decision 11).
export const ARCHETYPE_GRID: Record<string, GridEntry> = {
  [pairKey("analytical", "practical")]: {
    name: "The Auditor", rendering: "Hawk with an Elephant's discipline",
    strapline: "You see the hole in the plan before anyone else does.",
  },
  [pairKey("analytical", "creative")]: {
    name: "The Architect", rendering: "Hawk with a Peacock's eye",
    strapline: "You don't just solve it. You design the solution.",
  },
  [pairKey("analytical", "leadership")]: {
    name: "The Strategist", rendering: "Hawk with a Lion's nerve",
    strapline: "You play the long game while everyone plays the loud one.",
  },
  [pairKey("analytical", "people")]: {
    name: "The Advisor", rendering: "Hawk with a Dolphin's warmth",
    strapline: "People bring you their hardest questions for a reason.",
  },
  [pairKey("analytical", "entrepreneurial")]: {
    name: "The Prospector", rendering: "Hawk with a Tiger's hunger",
    strapline: "You find the opportunity hiding inside the numbers.",
  },
  [pairKey("creative", "leadership")]: {
    name: "The Visionary", rendering: "Peacock with a Lion's voice",
    strapline: "You see what it could be, and you make others see it too.",
  },
  [pairKey("creative", "people")]: {
    name: "The Storyteller", rendering: "Peacock with a Dolphin's ear",
    strapline: "You make people feel what they'd otherwise scroll past.",
  },
  [pairKey("creative", "practical")]: {
    name: "The Maker", rendering: "Peacock with an Elephant's hands",
    strapline: "You'd rather build the thing than talk about the thing.",
  },
  [pairKey("creative", "entrepreneurial")]: {
    name: "The Creator", rendering: "Peacock with a Tiger's timing",
    strapline: "You start things. That's the whole sentence.",
  },
  [pairKey("leadership", "people")]: {
    name: "The Captain", rendering: "Lion with a Dolphin's read",
    strapline: "Teams don't follow your title. They follow you.",
  },
  [pairKey("leadership", "practical")]: {
    name: "The Operator", rendering: "Lion with an Elephant's patience",
    strapline: "You're why the plan actually happens.",
  },
  [pairKey("leadership", "entrepreneurial")]: {
    name: "The Pioneer", rendering: "Lion with a Tiger's appetite",
    strapline: "First in, and comfortable there.",
  },
  [pairKey("people", "practical")]: {
    name: "The Anchor", rendering: "Dolphin with an Elephant's calm",
    strapline: "Everything holds because you hold it.",
  },
  [pairKey("people", "entrepreneurial")]: {
    name: "The Connector", rendering: "Dolphin with a Tiger's reach",
    strapline: "You know someone for everything, and everyone knows you.",
  },
  [pairKey("practical", "entrepreneurial")]: {
    name: "The Builder", rendering: "Elephant with a Tiger's pace",
    strapline: "Less talk. More done.",
  },
};

export const EXPLORER_COPY =
  "Your pull is real in several directions at once, and none of them is fake. This usually means one of two things: you are a genuine bridge profile who will thrive in roles that translate between specialist worlds, or you haven't yet met the work that takes over. The fastest way to find out is exposure, not another test. Your next 90 days matter more than your result today.";

export const MORE_SIGNAL_COPY =
  "We're not going to pretend. Your answers didn't give us enough to name your type honestly, and a made-up label would waste your time. This happens for about one student in five, and it usually means the questions met you before the experiences did.";

/** All six dims in deterministic order: score desc, then C1 alignment, then fixed priority. */
export function orderDims(radar: RadarScores, chosenDomain: DomainId | null): RadarDim[] {
  const align = chosenDomain ? DOMAIN_TIEBREAK[chosenDomain] : [];
  const rank = (d: RadarDim) => {
    const a = align.indexOf(d);
    return a === -1 ? align.length : a;
  };
  return [...DIM_PRIORITY].sort(
    (a, b) =>
      radar[b] - radar[a] ||
      rank(a) - rank(b) ||
      DIM_PRIORITY.indexOf(a) - DIM_PRIORITY.indexOf(b),
  );
}

export function computeArchetypeV2(
  radar: RadarScores,
  chosenDomain: DomainId | null,
): ArchetypeResult {
  const values = Object.values(radar);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const zeros = values.filter((v) => v === 0).length;

  // 1. thin-signal check
  if (max <= 6 || zeros >= 3) return { kind: "more_signal", copy: MORE_SIGNAL_COPY };
  // 2. flat check
  if (min >= 4 && max - min <= 4) return { kind: "explorer", copy: EXPLORER_COPY };
  // 3. pair top two
  const [primary, secondary] = orderDims(radar, chosenDomain);
  const entry = ARCHETYPE_GRID[pairKey(primary, secondary)];
  return {
    kind: "archetype",
    primary,
    secondary,
    name: entry.name,
    animal: ANIMALS[primary].name,
    rendering: entry.rendering,
    strapline: entry.strapline,
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/v2/archetype.test.ts` — Expected: PASS (9 tests).
Note: the "flat" test uses `r(10,6,6,6,6,6)` — max 10 passes thin-signal, spread 4 and min 6 hits Explorer. The quantized scale {0,4,6,10} means Explorer requires exactly one-or-more 10s with nothing below 6.

- [ ] **Step 5: Commit**

```bash
git add lib/v2/archetype.ts tests/v2/archetype.test.ts
git commit -m "feat(v2): archetype pipeline with animals, 15-pair grid, two fallbacks"
```

---

### Task 8: Career catalog (20 roles × 3 careers) + cross-branch map

**Files:**
- Create: `lib/v2/careers/catalog.ts`
- Test: `tests/v2/catalog.test.ts`

**Interfaces:**
- Consumes: `RoleId`, `DomainId`, `RadarDim`, `Degree` from `lib/v2/types`.
- Produces:
  - `interface CareerEntry { name: string; whatLine: string; nextStep: string; nextStepNonNative?: string }`
  - `CATALOG: Record<RoleId, { domain: DomainId; dims: [RadarDim, RadarDim]; careers: [CareerEntry, CareerEntry, CareerEntry] }>`
  - `CROSS_BRANCH: Record<RadarDim, { domain: DomainId; role: RoleId }>`
  - `NATIVE_DEGREES: Record<DomainId, Degree[]>` — which Q0 degrees count as "native" per domain (technology → engineering; all other domains → every degree)
  - `nextStepFor(role: RoleId, careerIndex: number, degree: Degree): string`

Career names and next-steps are spec §7 pp14–15 verbatim. **What-lines are new draft copy** (spec provides them only for the sample) — flag the whole `whatLine` column for Nitin's copy review in the task's commit message. Dim pairs per Decision 1; sample-verified: risk → analytical+practical, markets → analytical+entrepreneurial.

- [ ] **Step 1: Write the failing test**

Create `tests/v2/catalog.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { CATALOG, CROSS_BRANCH, nextStepFor } from "../../lib/v2/careers/catalog";
import { C_BRANCHES } from "../../lib/v2/question-bank";
import { DOMAIN_ORDER } from "../../lib/v2/types";
import type { RoleId } from "../../lib/v2/types";

describe("career catalog", () => {
  it("has 20 roles × 3 careers, each with name/whatLine/nextStep", () => {
    expect(Object.keys(CATALOG)).toHaveLength(20);
    for (const [role, entry] of Object.entries(CATALOG)) {
      expect(entry.careers, role).toHaveLength(3);
      for (const c of entry.careers) {
        expect(c.name.length).toBeGreaterThan(2);
        expect(c.whatLine.length).toBeGreaterThan(10);
        expect(c.nextStep.length).toBeGreaterThan(3);
      }
    }
  });

  it("every role's domain matches the branch that owns it", () => {
    for (const domain of DOMAIN_ORDER) {
      for (const role of C_BRANCHES[domain].roles) {
        expect(CATALOG[role].domain, role).toBe(domain);
      }
    }
  });

  it("sample-verified dim pairs", () => {
    expect(CATALOG.risk.dims).toEqual(["analytical", "practical"]);
    expect(CATALOG.markets.dims).toEqual(["analytical", "entrepreneurial"]);
  });

  it("cross-branch map covers all six dims and points at real roles", () => {
    expect(Object.keys(CROSS_BRANCH)).toHaveLength(6);
    expect(CROSS_BRANCH.analytical).toEqual({ domain: "technology", role: "data" });
    for (const { domain, role } of Object.values(CROSS_BRANCH)) {
      expect(CATALOG[role as RoleId].domain).toBe(domain);
    }
  });

  it("adapts next-step for non-native degrees (Build for commerce → conversion route)", () => {
    expect(nextStepFor("build", 0, "engineering")).toBe("Portfolio route — ship two real projects");
    expect(nextStepFor("build", 0, "commerce")).toBe("MSc CS conversion, then portfolio");
    expect(nextStepFor("data", 0, "commerce")).toContain("open to");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/v2/catalog.test.ts` — Expected: FAIL.

- [ ] **Step 3: Implement `lib/v2/careers/catalog.ts`**

```ts
import type { Degree, DomainId, RadarDim, RoleId } from "../types";

export interface CareerEntry {
  name: string;
  whatLine: string;            // DRAFT COPY — review with Nitin before launch
  nextStep: string;
  nextStepNonNative?: string;  // shown when the student's degree is not native to this domain
}

export const NATIVE_DEGREES: Record<DomainId, Degree[]> = {
  finance: ["engineering", "commerce", "science", "arts", "other"],
  business: ["engineering", "commerce", "science", "arts", "other"],
  entrepreneurship: ["engineering", "commerce", "science", "arts", "other"],
  technology: ["engineering"],
  people_society: ["engineering", "commerce", "science", "arts", "other"],
};

export const CATALOG: Record<RoleId, { domain: DomainId; dims: [RadarDim, RadarDim]; careers: [CareerEntry, CareerEntry, CareerEntry] }> = {
  markets: {
    domain: "finance", dims: ["analytical", "entrepreneurial"],
    careers: [
      { name: "Equity Research Analyst", whatLine: "Reads companies and calls where the price goes, in writing.", nextStep: "MSc Finance (UK/Ireland) or CFA Level 1" },
      { name: "Trader", whatLine: "Takes positions with a number attached and lives with the result.", nextStep: "Prop desk entry + NISM certs" },
      { name: "Quant Analyst", whatLine: "Turns market behaviour into models that trade or price risk.", nextStep: "MSc Quantitative Finance (strong maths)" },
    ],
  },
  deals: {
    domain: "finance", dims: ["analytical", "leadership"],
    careers: [
      { name: "Investment Banking Analyst", whatLine: "Builds the models and materials that get deals done.", nextStep: "MSc Finance or CA/CFA" },
      { name: "M&A Associate", whatLine: "Runs the process when one company buys another.", nextStep: "MSc Corporate Finance, MBA later" },
      { name: "Corporate Development", whatLine: "Finds and evaluates what a company should buy or build next.", nextStep: "MSc Strategy/Finance" },
    ],
  },
  risk: {
    domain: "finance", dims: ["analytical", "practical"],
    careers: [
      { name: "Risk Analyst", whatLine: "The person who catches the miss before it costs money.", nextStep: "MSc Risk Management (UK/Ireland) or FRM alongside work in India" },
      { name: "Internal Auditor", whatLine: "Same muscle, more structure: checks that controls actually hold.", nextStep: "CA/CIA route or MSc Accounting" },
      { name: "Compliance Officer", whatLine: "Keeps the firm inside rules that change every year.", nextStep: "ICA certs or MSc Regulation" },
    ],
  },
  advisory: {
    domain: "finance", dims: ["analytical", "people"],
    careers: [
      { name: "Wealth Manager", whatLine: "Manages a person's money with their fear in the room.", nextStep: "MSc Wealth Management + CFP" },
      { name: "Financial Planner", whatLine: "Builds the plan a family actually follows.", nextStep: "CFP India route" },
      { name: "Private Client Advisor", whatLine: "Long-trust advice for people with complicated money.", nextStep: "MSc Banking" },
    ],
  },
  operations: {
    domain: "business", dims: ["practical", "leadership"],
    careers: [
      { name: "Operations Manager", whatLine: "Makes the same work happen faster, cheaper, without drama.", nextStep: "MSc Operations/SCM" },
      { name: "Supply Chain Analyst", whatLine: "Finds where things and money get stuck between A and B.", nextStep: "MSc SCM + Six Sigma" },
      { name: "Project Coordinator", whatLine: "Keeps ten moving pieces landing in the right order.", nextStep: "PMP later or MSc Project Management" },
    ],
  },
  strategy: {
    domain: "business", dims: ["analytical", "leadership"],
    careers: [
      { name: "Strategy Analyst", whatLine: "Works out which bet the business should make next.", nextStep: "MSc Management/Strategy" },
      { name: "Consulting Business Analyst", whatLine: "Solves a different company's hardest problem every quarter.", nextStep: "Case prep now, MBA later" },
      { name: "Market Intelligence Analyst", whatLine: "Reads the market so the business isn't surprised by it.", nextStep: "MSc Business Analytics" },
    ],
  },
  growth: {
    domain: "business", dims: ["creative", "entrepreneurial"],
    careers: [
      { name: "Digital Marketing Manager", whatLine: "Runs the experiments that turn attention into customers.", nextStep: "MSc Digital Marketing" },
      { name: "Growth Analyst", whatLine: "Finds the number that moves all the other numbers.", nextStep: "MSc Marketing Analytics" },
      { name: "Brand Manager", whatLine: "Owns what a product means in people's heads.", nextStep: "MBA Marketing or MSc Brand Management" },
    ],
  },
  people_hr: {
    domain: "business", dims: ["people", "leadership"],
    careers: [
      { name: "HR Business Partner", whatLine: "The person managers call before the people problem explodes.", nextStep: "MSc HRM or IO Psychology" },
      { name: "Talent Acquisition", whatLine: "Finds and lands the people the plan depends on.", nextStep: "MSc HRM" },
      { name: "L&D Associate", whatLine: "Builds the training that changes how people actually work.", nextStep: "MSc Org Psychology or Education" },
    ],
  },
  founder: {
    domain: "entrepreneurship", dims: ["entrepreneurial", "leadership"],
    careers: [
      { name: "Startup Founder", whatLine: "Starts the thing, owns every problem nobody else takes.", nextStep: "Build now; MSc Entrepreneurship optional" },
      { name: "Early-stage Operator", whatLine: "Employee #3: does whatever the company needs this month.", nextStep: "Join a seed-stage startup" },
      { name: "Venture Analyst", whatLine: "Decides which founders get the money.", nextStep: "VC internships + MSc Finance" },
    ],
  },
  product: {
    domain: "entrepreneurship", dims: ["creative", "analytical"],
    careers: [
      { name: "Associate Product Manager", whatLine: "Decides what gets built next and why.", nextStep: "APM programmes or MSc Product/HCI" },
      { name: "Product Analyst", whatLine: "Turns usage data into the next product decision.", nextStep: "MSc Business Analytics" },
      { name: "UX-side PM", whatLine: "Owns how the product feels, not just what it does.", nextStep: "MSc HCI" },
    ],
  },
  sales: {
    domain: "entrepreneurship", dims: ["people", "entrepreneurial"],
    careers: [
      { name: "B2B Sales / Business Development", whatLine: "Turns strangers into revenue, one no at a time.", nextStep: "Start now, MBA later" },
      { name: "Account Manager", whatLine: "Keeps the customers you already won, and grows them.", nextStep: "Industry entry role" },
      { name: "Partnerships Associate", whatLine: "Builds the deals where two companies win together.", nextStep: "MSc Management" },
    ],
  },
  operator: {
    domain: "entrepreneurship", dims: ["practical", "leadership"],
    careers: [
      { name: "Chief of Staff track", whatLine: "The founder's right hand: whatever is broken this week is yours.", nextStep: "Startup entry" },
      { name: "BizOps Analyst", whatLine: "Finds and fixes how the company actually runs.", nextStep: "MSc Management/Analytics" },
      { name: "Program Manager", whatLine: "Lands the big cross-team thing nobody else can hold.", nextStep: "PMP or MSc" },
    ],
  },
  build: {
    domain: "technology", dims: ["practical", "analytical"],
    careers: [
      { name: "Software Engineer", whatLine: "Builds the thing that has to work on Friday.", nextStep: "Portfolio route — ship two real projects", nextStepNonNative: "MSc CS conversion, then portfolio" },
      { name: "Full-stack Developer", whatLine: "Owns the product from database to browser.", nextStep: "Portfolio route", nextStepNonNative: "MSc CS conversion, then portfolio" },
      { name: "Mobile Developer", whatLine: "Builds what people actually carry in their pocket.", nextStep: "Portfolio route", nextStepNonNative: "MSc CS conversion, then portfolio" },
    ],
  },
  data: {
    domain: "technology", dims: ["analytical", "practical"],
    careers: [
      { name: "Data Analyst", whatLine: "Turns messy numbers into the answer the room needs.", nextStep: "MSc Data Analytics", nextStepNonNative: "MSc Data Analytics — open to non-CS backgrounds" },
      { name: "BI Analyst", whatLine: "Builds the dashboards decisions actually get made from.", nextStep: "MSc Business Analytics", nextStepNonNative: "MSc Business Analytics — open to non-CS backgrounds" },
      { name: "Data Scientist", whatLine: "Models that predict, not just describe.", nextStep: "MSc Data Science (maths needed)" },
    ],
  },
  product_tech: {
    domain: "technology", dims: ["analytical", "creative"],
    careers: [
      { name: "Technical Product Manager", whatLine: "Decides what engineers build, and can argue why.", nextStep: "CS base + MSc/MBA" },
      { name: "Solutions Engineer", whatLine: "The technical person in the sales room.", nextStep: "CS base" },
      { name: "Product Analyst (tech)", whatLine: "Measures what shipped and whether it mattered.", nextStep: "MSc Analytics" },
    ],
  },
  infrastructure: {
    domain: "technology", dims: ["practical", "analytical"],
    careers: [
      { name: "DevOps / SRE", whatLine: "Keeps the system up while everyone else changes it.", nextStep: "Cloud certs + MSc" },
      { name: "Cloud Engineer", whatLine: "Builds the platform everything else runs on.", nextStep: "AWS/Azure certs" },
      { name: "Cybersecurity Analyst", whatLine: "Finds the hole before someone hostile does.", nextStep: "MSc Cyber Security" },
    ],
  },
  psychology: {
    domain: "people_society", dims: ["people", "analytical"],
    careers: [
      { name: "Counselling Psychologist", whatLine: "Sits with what people can't say anywhere else.", nextStep: "MA/MSc Psychology, then MPhil/licensure" },
      { name: "Organisational Psychologist", whatLine: "Applies how people work to how companies run.", nextStep: "MSc IO Psychology" },
      { name: "UX Researcher", whatLine: "Watches real people use things and reports the truth.", nextStep: "MSc HCI/Psychology" },
    ],
  },
  education: {
    domain: "people_society", dims: ["people", "creative"],
    careers: [
      { name: "Teacher / Lecturer", whatLine: "The hundredth explanation, delivered like the first.", nextStep: "B.Ed/MA + NET" },
      { name: "EdTech Content Designer", whatLine: "Designs how a million students learn a thing.", nextStep: "MSc Instructional Design" },
      { name: "Academic Counsellor", whatLine: "Helps students choose with more than a brochure.", nextStep: "MA Psychology/Education" },
    ],
  },
  policy: {
    domain: "people_society", dims: ["analytical", "people"],
    careers: [
      { name: "Policy Analyst", whatLine: "Turns evidence into rules that survive politics.", nextStep: "MPP / MA Public Policy" },
      { name: "Public Administration", whatLine: "Runs the system from inside it.", nextStep: "UPSC route or MPA" },
      { name: "Development Consultant", whatLine: "Fixes programmes that matter more than they pay.", nextStep: "MA Development Studies" },
    ],
  },
  community: {
    domain: "people_society", dims: ["people", "leadership"],
    careers: [
      { name: "NGO Program Manager", whatLine: "Delivers real change on less money than it needs.", nextStep: "MSW" },
      { name: "CSR Associate", whatLine: "Points corporate money at problems that count.", nextStep: "MSW or MBA Sustainability" },
      { name: "Public Health Coordinator", whatLine: "Gets health services to the people who won't come to them.", nextStep: "MPH" },
    ],
  },
};

/** Decision 4: highest radar dim in an unchosen branch → this card. */
export const CROSS_BRANCH: Record<RadarDim, { domain: DomainId; role: RoleId }> = {
  analytical: { domain: "technology", role: "data" },
  people: { domain: "people_society", role: "psychology" },
  creative: { domain: "entrepreneurship", role: "product" },
  entrepreneurial: { domain: "entrepreneurship", role: "founder" },
  practical: { domain: "business", role: "operations" },
  leadership: { domain: "business", role: "strategy" },
};

export function nextStepFor(role: RoleId, careerIndex: number, degree: Degree): string {
  const entry = CATALOG[role];
  const career = entry.careers[careerIndex];
  const native = NATIVE_DEGREES[entry.domain].includes(degree);
  if (!native && career.nextStepNonNative) return career.nextStepNonNative;
  return career.nextStep;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/v2/catalog.test.ts` — Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/v2/careers/catalog.ts tests/v2/catalog.test.ts
git commit -m "feat(v2): 20-role x 3-career catalog with dim pairs and Q0 feasibility (whatLine copy = DRAFT for review)"
```

---

### Task 9: Fit formula

**Files:**
- Create: `lib/v2/careers/fit.ts`
- Test: `tests/v2/fit.test.ts`

**Interfaces:**
- Consumes: `RadarScores`, `RadarDim` from `lib/v2/types`.
- Produces:
  - `clampFit(n: number): number` — round, then clamp 5..95
  - `computeFit(args: { roleScore: number; radar: RadarScores; dims: [RadarDim, RadarDim]; conf: number }): { fit: number; capped: boolean }` — full formula; when `conf <= -2`, fit is additionally capped at 55 and `capped` is true
  - `NEUTRAL_CONF_COMPONENT = 15` (used by the honest-low card, Decision 2)

Spec §7: `fit = (role_score/12)*40 + (avg of the 2 mapped radar dims / 10)*30 + (conf_total+6)*3`; cap 55 + honesty line if conf ≤ −2; clamp 5..95, never 100.

- [ ] **Step 1: Write the failing test**

Create `tests/v2/fit.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { computeFit, clampFit, NEUTRAL_CONF_COMPONENT } from "../../lib/v2/careers/fit";
import type { RadarScores } from "../../lib/v2/types";

const ananya: RadarScores = {
  analytical: 10, people: 4, creative: 6, entrepreneurial: 6, practical: 10, leadership: 4,
};

describe("fit formula", () => {
  it("reproduces the sample card 1: Risk 9, An+Pr, conf +2 → 84", () => {
    const { fit, capped } = computeFit({ roleScore: 9, radar: ananya, dims: ["analytical", "practical"], conf: 2 });
    expect(fit).toBe(84); // 30 + 30 + 24
    expect(capped).toBe(false);
  });

  it("caps at 55 when conf_total <= -2", () => {
    const { fit, capped } = computeFit({ roleScore: 12, radar: ananya, dims: ["analytical", "practical"], conf: -2 });
    expect(fit).toBe(55);
    expect(capped).toBe(true);
  });

  it("clamps into 5..95 and never renders 100", () => {
    expect(clampFit(101)).toBe(95);
    expect(clampFit(100)).toBe(95);
    expect(clampFit(0)).toBe(5);
    expect(clampFit(-10)).toBe(5);
    expect(clampFit(84.4)).toBe(84);
  });

  it("max possible uncapped fit is 95 after clamp (12/12*40 + 10*3 + 10*3 = 100 → 95)", () => {
    const max: RadarScores = { ...ananya, analytical: 10, practical: 10 };
    const { fit } = computeFit({ roleScore: 12, radar: max, dims: ["analytical", "practical"], conf: 4 });
    expect(fit).toBe(95);
  });

  it("exports the neutral conf component for the honest-low card", () => {
    expect(NEUTRAL_CONF_COMPONENT).toBe(15); // (-1 + 6) * 3
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/v2/fit.test.ts` — Expected: FAIL.

- [ ] **Step 3: Implement `lib/v2/careers/fit.ts`**

```ts
import type { RadarDim, RadarScores } from "../types";

/** Fixed neutral confirmation component for the honest-low card (Decision 2): (-1 + 6) * 3. */
export const NEUTRAL_CONF_COMPONENT = 15;

export function clampFit(n: number): number {
  return Math.min(95, Math.max(5, Math.round(n)));
}

export function computeFit(args: {
  roleScore: number;
  radar: RadarScores;
  dims: [RadarDim, RadarDim];
  conf: number;
}): { fit: number; capped: boolean } {
  const { roleScore, radar, dims, conf } = args;
  const roleComponent = (roleScore / 12) * 40;                          // 0..40
  const radarComponent = ((radar[dims[0]] + radar[dims[1]]) / 2 / 10) * 30; // 0..30
  const confComponent = (conf + 6) * 3;                                 // 0..30
  let fit = clampFit(roleComponent + radarComponent + confComponent);
  const capped = conf <= -2;
  if (capped && fit > 55) fit = 55;
  return { fit, capped };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/v2/fit.test.ts` — Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/v2/careers/fit.ts tests/v2/fit.test.ts
git commit -m "feat(v2): fit formula with 55 cap and 5..95 clamp"
```

---

### Task 10: Four-card selector

**Files:**
- Create: `lib/v2/careers/cards.ts`
- Test: `tests/v2/cards.test.ts`

**Interfaces:**
- Consumes: `computeFit`, `clampFit`, `NEUTRAL_CONF_COMPONENT` from `./fit`; `CATALOG`, `CROSS_BRANCH`, `nextStepFor` from `./catalog`; `orderDims` from `../archetype`; `ROLE_LABELS`, types from `../types`.
- Produces: `buildCards(args: { domain: DomainId; radar: RadarScores; roleScores: Record<RoleId, number>; ranked: RoleId[]; winner: RoleId; coCandidate: RoleId | null; conf: number; degree: Degree }): CareerCard[]` — always 4 cards, sorted descending by fit.

Card rules (spec §7 + Decisions 2–4):
- **Card 1 (primary):** winning role's first career at full formula fit. If conf ≤ −2 it carries `honestyLine: "The pull is real. The daily cost is the problem, and you told us so yourself."`
- **Card 2 (secondary):** co-candidate's first career if a tie happened, else winning role's second career, at `card1.fit − 6` (allowed band −4..−8).
- **Card 3 (cross-branch):** walk `orderDims(radar, domain)`; take the first dim whose `CROSS_BRANCH` domain ≠ chosen domain and whose career name isn't already used; fit = `round(0.85 × card1Fit)`.
- **Card 4 (honest low):** highest non-winning role in the chosen branch that isn't already card 2 (i.e. `ranked[1]`, or `ranked[2]` when a co-candidate took card 2); its first career at true fit with the fixed neutral conf component (15); whatLine is replaced by the why-low line.
- All fits go through `clampFit`; final array **sorted descending**.

- [ ] **Step 1: Write the failing test**

Create `tests/v2/cards.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { buildCards } from "../../lib/v2/careers/cards";
import type { RadarScores, RoleId } from "../../lib/v2/types";

const ananyaRadar: RadarScores = {
  analytical: 10, people: 4, creative: 6, entrepreneurial: 6, practical: 10, leadership: 4,
};
const ananyaScores = { markets: 4, deals: 0, risk: 9, advisory: 0 } as Record<RoleId, number>;

const ananyaArgs = {
  domain: "finance" as const,
  radar: ananyaRadar,
  roleScores: ananyaScores,
  ranked: ["risk", "markets", "deals", "advisory"] as RoleId[],
  winner: "risk" as RoleId,
  coCandidate: null,
  conf: 2,
  degree: "commerce" as const,
};

describe("buildCards", () => {
  it("reproduces the sample 84 / 78 / 71 / 52, sorted descending", () => {
    const cards = buildCards(ananyaArgs);
    expect(cards.map((c) => [c.career, c.fit])).toEqual([
      ["Risk Analyst", 84],
      ["Internal Auditor", 78],
      ["Data Analyst", 71],
      ["Equity Research Analyst", 52],
    ]);
    expect(cards.map((c) => c.kind)).toEqual(["primary", "secondary", "cross_branch", "honest_low"]);
  });

  it("adapts the cross-branch next step for a commerce student", () => {
    const cards = buildCards(ananyaArgs);
    const cross = cards.find((c) => c.kind === "cross_branch")!;
    expect(cross.nextStep).toContain("open to non-CS");
  });

  it("uses the co-candidate's top career for card 2 and ranked[2] for card 4", () => {
    const cards = buildCards({
      ...ananyaArgs,
      roleScores: { markets: 6, deals: 6, risk: 2, advisory: 0 } as Record<RoleId, number>,
      ranked: ["markets", "deals", "risk", "advisory"] as RoleId[],
      winner: "markets",
      coCandidate: "deals",
    });
    expect(cards.find((c) => c.kind === "secondary")!.role).toBe("deals");
    expect(cards.find((c) => c.kind === "honest_low")!.role).toBe("risk");
  });

  it("attaches the honesty line and 55 cap when conf <= -2", () => {
    const cards = buildCards({ ...ananyaArgs, conf: -2 });
    const primary = cards.find((c) => c.kind === "primary")!;
    expect(primary.fit).toBeLessThanOrEqual(55);
    expect(primary.honestyLine).toBe(
      "The pull is real. The daily cost is the problem, and you told us so yourself.",
    );
  });

  it("always returns 4 cards sorted descending", () => {
    const cards = buildCards(ananyaArgs);
    expect(cards).toHaveLength(4);
    for (let i = 1; i < cards.length; i++) expect(cards[i - 1].fit).toBeGreaterThanOrEqual(cards[i].fit);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/v2/cards.test.ts` — Expected: FAIL.

- [ ] **Step 3: Implement `lib/v2/careers/cards.ts`**

```ts
import { orderDims } from "../archetype";
import { ROLE_LABELS } from "../types";
import type { CareerCard, Degree, DomainId, RadarScores, RoleId } from "../types";
import { CATALOG, CROSS_BRANCH, nextStepFor } from "./catalog";
import { NEUTRAL_CONF_COMPONENT, clampFit, computeFit } from "./fit";

export const CONF_HONESTY_LINE =
  "The pull is real. The daily cost is the problem, and you told us so yourself.";

export function buildCards(args: {
  domain: DomainId;
  radar: RadarScores;
  roleScores: Record<RoleId, number>;
  ranked: RoleId[];
  winner: RoleId;
  coCandidate: RoleId | null;
  conf: number;
  degree: Degree;
}): CareerCard[] {
  const { domain, radar, roleScores, ranked, winner, coCandidate, conf, degree } = args;

  // Card 1 — primary
  const winEntry = CATALOG[winner];
  const c1 = computeFit({ roleScore: roleScores[winner], radar, dims: winEntry.dims, conf });
  const card1: CareerCard = {
    kind: "primary",
    role: winner,
    career: winEntry.careers[0].name,
    fit: c1.fit,
    whatLine: winEntry.careers[0].whatLine,
    nextStep: nextStepFor(winner, 0, degree),
    ...(c1.capped ? { honestyLine: CONF_HONESTY_LINE } : {}),
  };

  // Card 2 — secondary: co-candidate's top career after a tie, else winner's second career
  const card2Role = coCandidate ?? winner;
  const card2Index = coCandidate ? 0 : 1;
  const card2: CareerCard = {
    kind: "secondary",
    role: card2Role,
    career: CATALOG[card2Role].careers[card2Index].name,
    fit: clampFit(c1.fit - 6),
    whatLine: CATALOG[card2Role].careers[card2Index].whatLine,
    nextStep: nextStepFor(card2Role, card2Index, degree),
  };

  // Card 4 — honest low: highest non-winning role not already on card 2
  const lowRole = ranked.find((r) => r !== winner && r !== (coCandidate ?? undefined))!;
  const lowEntry = CATALOG[lowRole];
  const lowRadarAvg = (radar[lowEntry.dims[0]] + radar[lowEntry.dims[1]]) / 2;
  const card4: CareerCard = {
    kind: "honest_low",
    role: lowRole,
    career: lowEntry.careers[0].name,
    fit: clampFit((roleScores[lowRole] / 12) * 40 + lowRadarAvg * 3 + NEUTRAL_CONF_COMPONENT),
    whatLine: `The pull is real (${ROLE_LABELS[lowRole]} ${roleScores[lowRole]}), but your reactions point elsewhere. Shown so you know why it's ranked low.`,
    nextStep: nextStepFor(lowRole, 0, degree),
  };

  // Card 3 — cross-branch: highest radar dim from a branch the student did not choose
  const used = new Set([card1.career, card2.career, card4.career]);
  let card3: CareerCard | null = null;
  for (const dim of orderDims(radar, domain)) {
    const target = CROSS_BRANCH[dim];
    if (target.domain === domain) continue;
    const career = CATALOG[target.role].careers[0];
    if (used.has(career.name)) continue;
    card3 = {
      kind: "cross_branch",
      role: target.role,
      career: career.name,
      fit: clampFit(Math.round(0.85 * c1.fit)),
      whatLine: career.whatLine,
      nextStep: nextStepFor(target.role, 0, degree),
    };
    break;
  }

  const cards = [card1, card2, card3!, card4];
  // SORT DESCENDING BEFORE RENDER, always (spec §7).
  return cards.sort((a, b) => b.fit - a.fit);
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/v2/cards.test.ts` — Expected: PASS (5 tests).
Note the cross-branch next-step assertion works because `data` careers carry `nextStepNonNative` "…open to non-CS backgrounds" and commerce is non-native to technology.

- [ ] **Step 5: Commit**

```bash
git add lib/v2/careers/cards.ts tests/v2/cards.test.ts
git commit -m "feat(v2): four-card selector (primary/secondary/cross-branch/honest-low), sorted desc"
```

---

### Task 11: Flags + growth tips (+ SPENDS + VALUE_BY_KEY)

**Files:**
- Modify: `lib/v2/types.ts` (add `VALUE_BY_KEY`)
- Create: `lib/v2/flags.ts`
- Test: `tests/v2/flags.test.ts`

**Interfaces:**
- Consumes: types; `DOMAIN_LABELS`, `VALUE_LABELS`, `ANIMALS`.
- Produces:
  - In `types.ts`: `VALUE_BY_KEY: Record<"a"|"b"|"c"|"d"|"e"|"f", ValueId>` = a→meaning, b→mastery, c→freedom, d→relationships, e→health, f→money (E1/E2 on-screen order).
  - `SPENDS: Record<RoleId, ValueId[]>` — which protected values a role's cost "spends" (calibration seed; must satisfy: `health ∈ SPENDS.risk`, `money ∉ SPENDS.risk`).
  - `DIVERGENCE_EXPECT: Record<Degree, RadarDim[] | null>` — engineering [analytical, practical], commerce [practical, analytical], science [analytical], arts [creative, people], other null (never fires).
  - `interface FlagContext { answers: V2Answers; radar: RadarScores; degree: Degree | null; seededTop2: DomainId[]; chosenDomain: DomainId | null; winner: RoleId | null; confBand: "confirmed" | "provisional" | "mismatch"; archetype: ArchetypeResult; defaultPathFlag: boolean }`
  - `evaluateFlags(ctx: FlagContext): FiredFlag[]` (each with rendered tip text)
  - `UNIVERSAL_TIPS: string[]` (exactly 2 — used when zero flags fire)
  - `bAnswerCount(answers: V2Answers): number` — count of `b` reactions across B1–B6 (reused by verdicts H1)

Spec §9: delete the static tips; tips render only from fired flags with specifics slotted in; zero flags → the two universal tips (exposure + one conversation), never confidence coaching.

- [ ] **Step 1: Write the failing test**

Create `tests/v2/flags.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { evaluateFlags, SPENDS, DIVERGENCE_EXPECT, UNIVERSAL_TIPS, bAnswerCount } from "../../lib/v2/flags";
import type { FlagContext } from "../../lib/v2/flags";
import { computeArchetypeV2 } from "../../lib/v2/archetype";
import type { RadarScores, V2Answers } from "../../lib/v2/types";

const ananyaRadar: RadarScores = {
  analytical: 10, people: 4, creative: 6, entrepreneurial: 6, practical: 10, leadership: 4,
};
const ananyaAnswers: V2Answers = {
  B1: ["a"], B2: ["c"], B3: ["b"], B4: ["b"], B5: ["a"], B6: ["c"],
  D1: ["b"], D2: ["b"],
  E1: ["f"], E2: ["e"], E3: ["c"], // Money anchor, Health keystone, family approval
  F1: ["b"], F2: ["a"], F3: ["a"],
};

const ananyaCtx: FlagContext = {
  answers: ananyaAnswers,
  radar: ananyaRadar,
  degree: "commerce",
  seededTop2: ["technology", "finance"],
  chosenDomain: "finance",
  winner: "risk",
  confBand: "provisional",
  archetype: computeArchetypeV2(ananyaRadar, "finance"),
  defaultPathFlag: false,
};

describe("flags", () => {
  it("Ananya fires exactly romanticism, conversation_gap, family", () => {
    const fired = evaluateFlags(ananyaCtx).map((f) => f.id).sort();
    expect(fired).toEqual(["conversation_gap", "family", "romanticism"]);
  });

  it("romanticism tip slots the b-count in", () => {
    const tip = evaluateFlags(ananyaCtx).find((f) => f.id === "romanticism")!.tip;
    expect(tip.toLowerCase()).toContain("two");
    expect(bAnswerCount(ananyaAnswers)).toBe(2);
  });

  it("constraint_conflict keys on E1 anchor, not E2 (Money not spent by risk)", () => {
    expect(SPENDS.risk).not.toContain("money");
    expect(SPENDS.risk).toContain("health");
    // Same profile but anchor Health → conflict fires
    const fired = evaluateFlags({
      ...ananyaCtx,
      answers: { ...ananyaAnswers, E1: ["e"], E2: ["f"] },
    }).map((f) => f.id);
    expect(fired).toContain("constraint_conflict");
  });

  it("divergence fires when the primary animal dim leaves the degree expectation", () => {
    expect(DIVERGENCE_EXPECT.commerce).toEqual(["practical", "analytical"]);
    expect(DIVERGENCE_EXPECT.other).toBeNull();
    const creativeRadar: RadarScores = { ...ananyaRadar, analytical: 4, practical: 4, creative: 10, people: 6 };
    const fired = evaluateFlags({
      ...ananyaCtx,
      radar: creativeRadar,
      archetype: computeArchetypeV2(creativeRadar, "finance"),
    }).map((f) => f.id);
    expect(fired).toContain("divergence");
  });

  it("preparation_gap needs a confirmed role AND F1 = None", () => {
    const fired = evaluateFlags({
      ...ananyaCtx,
      confBand: "confirmed",
      answers: { ...ananyaAnswers, F1: ["a"] },
    }).map((f) => f.id);
    expect(fired).toContain("preparation_gap");
    expect(evaluateFlags(ananyaCtx).map((f) => f.id)).not.toContain("preparation_gap");
  });

  it("thin_signal fires from the more_signal archetype state with an exposure action", () => {
    const thinRadar: RadarScores = { analytical: 6, people: 4, creative: 4, entrepreneurial: 4, practical: 6, leadership: 4 };
    const fired = evaluateFlags({
      ...ananyaCtx,
      radar: thinRadar,
      archetype: computeArchetypeV2(thinRadar, "finance"),
    });
    const thin = fired.find((f) => f.id === "thin_signal");
    expect(thin).toBeDefined();
    expect(thin!.tip).toContain("fastest way");
  });

  it("exactly two universal tips exist for the zero-flag case", () => {
    expect(UNIVERSAL_TIPS).toHaveLength(2);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/v2/flags.test.ts` — Expected: FAIL.

- [ ] **Step 3: Add `VALUE_BY_KEY` to `lib/v2/types.ts`**

Append after `VALUE_LABELS`:

```ts
/** E1/E2 option key → value, in on-screen order (Meaning · Mastery · Freedom · Relationships · Health · Money). */
export const VALUE_BY_KEY: Record<"a" | "b" | "c" | "d" | "e" | "f", ValueId> = {
  a: "meaning", b: "mastery", c: "freedom", d: "relationships", e: "health", f: "money",
};
```

- [ ] **Step 4: Implement `lib/v2/flags.ts`**

```ts
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
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run tests/v2/flags.test.ts` — Expected: PASS (8 tests). Then `npx vitest run` (whole suite) — all green.

- [ ] **Step 6: Commit**

```bash
git add lib/v2/types.ts lib/v2/flags.ts tests/v2/flags.test.ts
git commit -m "feat(v2): eight flags with slotted growth tips, SPENDS table, universal fallbacks"
```

---

### Task 12: Verdict engine (16-line bank, max-3 slotting)

**Files:**
- Create: `lib/v2/verdicts.ts`
- Test: `tests/v2/verdicts.test.ts`

**Interfaces:**
- Consumes: `SPENDS`, `bAnswerCount` from `./flags`; `VALUE_BY_KEY`, `VALUE_LABELS`, types from `./types`; `SlidersResult`.
- Produces:
  - `interface VerdictContext { answers: V2Answers; radar: RadarScores; sliders: SlidersResult; domain: DomainId | null; winner: RoleId | null; confTotal: number; defaultPathFlag: boolean }`
  - `DOMAIN_CATEGORY: Record<DomainId, "V" | "L" | "S" | "P">` — finance→S, business→L, entrepreneurship→V, technology→S, people_society→P
  - `RESPONSIBILITY_C5: Record<DomainId, OptionKey>` (Decision 7)
  - `evaluateVerdicts(ctx: VerdictContext): VerdictId[]` — all fired, in bank order V1..V4, L1..L4, S1..S4, H1..H4
  - `slotVerdicts(ctx: VerdictContext): Verdict[]` — max 3, per Decision 10

All verdict lines are spec §8 verbatim; H4 slots the keystone in.

- [ ] **Step 1: Write the failing test**

Create `tests/v2/verdicts.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { evaluateVerdicts, slotVerdicts, DOMAIN_CATEGORY } from "../../lib/v2/verdicts";
import type { VerdictContext } from "../../lib/v2/verdicts";
import { computeSliders } from "../../lib/v2/scoring/sliders";
import type { RadarScores, V2Answers } from "../../lib/v2/types";

const ananyaAnswers: V2Answers = {
  A1: ["c"], A2: ["a"], A3: ["a"], A4: ["d"], A5: ["c"], A6: ["b"], A7: ["c"],
  B1: ["a"], B2: ["c"], B3: ["b"], B4: ["b"], B5: ["a"], B6: ["c"],
  C5: ["a"],
  D1: ["b"], D2: ["b"],
  E1: ["f"], E2: ["e"], E3: ["c"],
  F1: ["b"], F2: ["a"], F3: ["a"],
};
const ananyaRadar: RadarScores = {
  analytical: 10, people: 4, creative: 6, entrepreneurial: 6, practical: 10, leadership: 4,
};
const ananyaCtx: VerdictContext = {
  answers: ananyaAnswers,
  radar: ananyaRadar,
  sliders: computeSliders(ananyaAnswers),
  domain: "finance",
  winner: "risk",
  confTotal: 2,
  defaultPathFlag: false,
};

describe("verdict engine", () => {
  it("Ananya fires S2, S3, S4, H1, H4 (and nothing else)", () => {
    expect(evaluateVerdicts(ananyaCtx).sort()).toEqual(["H1", "H4", "S2", "S3", "S4"]);
  });

  it("Ananya slots exactly S2, H1, H4 in that order (sample report)", () => {
    const slots = slotVerdicts(ananyaCtx);
    expect(slots.map((v) => v.id)).toEqual(["S2", "H1", "H4"]);
    expect(slots[0].line).toContain("Careful is your edge");
    expect(slots[2].line).toContain("You protected Health");
  });

  it("never returns more than 3", () => {
    expect(slotVerdicts(ananyaCtx).length).toBeLessThanOrEqual(3);
  });

  it("V1 needs the full combination", () => {
    const founderCtx: VerdictContext = {
      answers: { ...ananyaAnswers, B4: ["a"], D2: ["a"] },
      radar: { ...ananyaRadar, entrepreneurial: 10 },
      sliders: computeSliders(ananyaAnswers),
      domain: "entrepreneurship",
      winner: "founder",
      confTotal: 3,
      defaultPathFlag: false,
    };
    const fired = evaluateVerdicts(founderCtx);
    expect(fired).toContain("V1");
    // entrepreneurship's winning category is V → V1 takes slot 1
    expect(slotVerdicts(founderCtx)[0].id).toBe("V1");
  });

  it("winning-category map matches Decision 10", () => {
    expect(DOMAIN_CATEGORY).toEqual({
      finance: "S", business: "L", entrepreneurship: "V", technology: "S", people_society: "P",
    });
  });

  it("backfill excludes further winning-category verdicts", () => {
    // Ananya minus honesty triggers: no b-answers, keystone not spent → only S2/S3/S4 fire.
    const ctx: VerdictContext = {
      ...ananyaCtx,
      answers: { ...ananyaAnswers, B3: ["c"], B4: ["c"], E2: ["f"] },
    };
    const fired = evaluateVerdicts(ctx);
    expect(fired.sort()).toEqual(["S2", "S3", "S4"]);
    const slots = slotVerdicts(ctx);
    expect(slots.map((v) => v.id)).toEqual(["S2"]); // no honesty, no other category → one slot only
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/v2/verdicts.test.ts` — Expected: FAIL.

- [ ] **Step 3: Implement `lib/v2/verdicts.ts`**

```ts
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
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/v2/verdicts.test.ts` — Expected: PASS (6 tests). Then the whole suite: `npx vitest run` — all green.

- [ ] **Step 5: Commit**

```bash
git add lib/v2/verdicts.ts tests/v2/verdicts.test.ts
git commit -m "feat(v2): 16-verdict bank with trigger combinations and max-3 slotting"
```

---

### Task 13: Abroad gate + screen flow engine

**Files:**
- Create: `lib/v2/gate.ts`
- Create: `lib/v2/flow.ts`
- Test: `tests/v2/flow.test.ts`

**Interfaces:**
- Consumes: bank exports from `./question-bank`; `selectC1Cards` from `./scoring/domains`; `resolveRole` from `./scoring/roles`; `computeRadar` from `./scoring/radar`; types.
- Produces:
  - `gate.ts`: `showAbroad(answers: V2Answers): boolean` — `F3 ∈ {a (Higher studies), c (Undecided)} AND A7 ∈ {a (global), c (conditional)}` (spec §10; E3=d never blocks the gate, it only adds the family flag beside it)
  - `flow.ts`:
    - `interface ScreenV2 { id: ScreenId; category: string; prompt: string; hint?: string; multi?: boolean; options: { key: OptionKey; label: string }[] }`
    - `degreeOf(answers: V2Answers): Degree | null` (from Q0 via `DEGREE_BY_Q0`)
    - `chosenDomain(answers: V2Answers): DomainId | null` — maps the C1 answer key back onto the deterministic card list
    - `screenOrder(answers: V2Answers): ScreenId[]` — dynamic order incl. gating (F4 only if `showAbroad`; F5a–c only if F4 ∈ {a, b})
    - `getScreen(id: ScreenId, answers: V2Answers): ScreenV2` — materialises C1 (cards), C2–C5 (branch), D1/D2 (winning-role statements), F4 (A7 quote-back)
    - `nextScreenId(answers: V2Answers): ScreenId | null` — first unanswered screen in order; `null` = assessment complete

- [ ] **Step 1: Write the failing test**

Create `tests/v2/flow.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { showAbroad } from "../../lib/v2/gate";
import { screenOrder, getScreen, nextScreenId, chosenDomain, degreeOf } from "../../lib/v2/flow";
import type { V2Answers } from "../../lib/v2/types";

const ananya: V2Answers = {
  Q0: ["b"],
  A1: ["c"], A2: ["a"], A3: ["a"], A4: ["d"], A5: ["c"], A6: ["b"], A7: ["c"],
  B1: ["a"], B2: ["c"], B3: ["b"], B4: ["b"], B5: ["a"], B6: ["c"],
  C1: ["b"], // cards for her are [technology, finance, business, entrepreneurship] → b = finance
  C2: ["c"], C3: ["c"], C4: ["c"], C5: ["a"],
  D1: ["b"], D2: ["b"],
  E1: ["f"], E2: ["e"], E3: ["c"],
  F1: ["b"], F2: ["a"], F3: ["a"],
  F4: ["b"], F5a: ["b", "c"], F5b: ["b"], F5c: ["b"],
};

describe("abroad gate", () => {
  it("passes for F3 higher/undecided AND A7 global/conditional", () => {
    expect(showAbroad({ F3: ["a"], A7: ["c"] })).toBe(true);
    expect(showAbroad({ F3: ["c"], A7: ["a"] })).toBe(true);
    expect(showAbroad({ F3: ["b"], A7: ["a"] })).toBe(false); // work
    expect(showAbroad({ F3: ["a"], A7: ["b"] })).toBe(false); // national
    expect(showAbroad({ F3: ["a"], A7: ["d"] })).toBe(false); // rooted
  });
});

describe("flow engine", () => {
  it("orders 24 core screens and appends F4/F5 only when gated in", () => {
    const order = screenOrder(ananya);
    expect(order.slice(0, 3)).toEqual(["Q0", "A1", "A2"]);
    expect(order).toContain("F4");
    expect(order).toContain("F5c");
    expect(order[order.length - 1]).toBe("F5c");
  });

  it("A7 national/rooted: F4 and F5 never render", () => {
    const order = screenOrder({ ...ananya, A7: ["d"] });
    expect(order).not.toContain("F4");
    expect(order).not.toContain("F5a");
    expect(order[order.length - 1]).toBe("F3");
  });

  it("F4 = 'I'd rather study in India' skips F5", () => {
    const order = screenOrder({ ...ananya, F4: ["c"] });
    expect(order).toContain("F4");
    expect(order).not.toContain("F5a");
  });

  it("resolves Ananya's degree and chosen domain", () => {
    expect(degreeOf(ananya)).toBe("commerce");
    expect(chosenDomain(ananya)).toBe("finance");
  });

  it("materialises C1 with her four domain cards", () => {
    const c1 = getScreen("C1", ananya);
    expect(c1.options.map((o) => o.label)).toEqual([
      "Technology & Data", "Finance & Capital", "Business & Management", "Entrepreneurship & Product",
    ]);
  });

  it("materialises C2 from the chosen branch", () => {
    const c2 = getScreen("C2", ananya);
    expect(c2.prompt).toBe("Four rooms, one morning. Pick yours.");
    expect(c2.options[2].label).toBe("The review that catches the miss");
  });

  it("injects the winning role's cost/grind statements into D1/D2", () => {
    const d1 = getScreen("D1", ananya);
    const d2 = getScreen("D2", ananya);
    expect(d1.prompt).toBe("Being the person who slows things down, and unpopular for it");
    expect(d2.prompt).toContain("rules that change yearly");
    expect(d2.prompt).toContain("Would you actually do that?");
  });

  it("F4 quotes the A7=c answer back", () => {
    expect(getScreen("F4", ananya).prompt).toContain("exceptional opportunity");
  });

  it("walks to the first unanswered screen and completes", () => {
    expect(nextScreenId({})).toBe("Q0");
    expect(nextScreenId({ ...ananya, F5c: undefined })).toBe("F5c");
    expect(nextScreenId(ananya)).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/v2/flow.test.ts` — Expected: FAIL.

- [ ] **Step 3: Implement `lib/v2/gate.ts`**

```ts
import type { V2Answers } from "./types";

/** Spec §10: show_abroad = (F3 in [Higher studies, Undecided]) AND (A7 in [a global, c conditional]).
 *  E3 = d keeps the gate open (family flag renders beside it). A7 in {b, d} → F4/F5 never render. */
export function showAbroad(answers: V2Answers): boolean {
  const f3 = answers.F3?.[0];
  const a7 = answers.A7?.[0];
  return (f3 === "a" || f3 === "c") && (a7 === "a" || a7 === "c");
}
```

- [ ] **Step 4: Implement `lib/v2/flow.ts`**

```ts
import {
  C1_PROMPT, C_BRANCHES, DEGREE_BY_Q0, D_OPTIONS, D_STATEMENTS, F4_OPTIONS, F4_PROMPT, STATIC_SCREENS,
} from "./question-bank";
import { selectC1Cards } from "./scoring/domains";
import { computeRadar } from "./scoring/radar";
import { resolveRole } from "./scoring/roles";
import { showAbroad } from "./gate";
import { DOMAIN_LABELS } from "./types";
import type { Degree, DomainId, OptionKey, ScreenId, V2Answers } from "./types";

export interface ScreenV2 {
  id: ScreenId;
  category: string;
  prompt: string;
  hint?: string;
  multi?: boolean;
  options: { key: OptionKey; label: string }[];
}

const CORE_ORDER: ScreenId[] = [
  "Q0",
  "A1", "A2", "A3", "A4", "A5", "A6", "A7",
  "B1", "B2", "B3", "B4", "B5", "B6",
  "C1", "C2", "C3", "C4", "C5",
  "D1", "D2",
  "E1", "E2", "E3",
  "F1", "F2", "F3",
];

export function degreeOf(answers: V2Answers): Degree | null {
  const key = answers.Q0?.[0];
  return key ? DEGREE_BY_Q0[key] : null;
}

/** The C1 card list is deterministic from radar + degree, so the chosen option key maps back to a domain. */
export function c1Cards(answers: V2Answers): DomainId[] {
  const degree = degreeOf(answers) ?? "other";
  return selectC1Cards(computeRadar(answers), degree).cards;
}

export function chosenDomain(answers: V2Answers): DomainId | null {
  const key = answers.C1?.[0];
  if (!key) return null;
  const idx = ["a", "b", "c", "d"].indexOf(key);
  return idx === -1 ? null : c1Cards(answers)[idx] ?? null;
}

export function screenOrder(answers: V2Answers): ScreenId[] {
  const order = [...CORE_ORDER];
  if (showAbroad(answers)) {
    order.push("F4");
    const f4 = answers.F4?.[0];
    if (f4 === "a" || f4 === "b") order.push("F5a", "F5b", "F5c");
  }
  return order;
}

export function getScreen(id: ScreenId, answers: V2Answers): ScreenV2 {
  if (id === "C1") {
    return {
      id, category: "Pick your world", prompt: C1_PROMPT,
      options: c1Cards(answers).map((d, i) => ({
        key: ["a", "b", "c", "d"][i] as OptionKey,
        label: DOMAIN_LABELS[d],
      })),
    };
  }
  if (id === "C2" || id === "C3" || id === "C4" || id === "C5") {
    const domain = chosenDomain(answers);
    if (!domain) throw new Error(`Screen ${id} requires C1 to be answered`);
    const screen = C_BRANCHES[domain].screens.find((s) => s.id === id)!;
    return {
      id, category: "Go deeper", prompt: screen.prompt,
      options: screen.options.map(({ key, label }) => ({ key, label })),
    };
  }
  if (id === "D1" || id === "D2") {
    const domain = chosenDomain(answers);
    if (!domain) throw new Error(`Screen ${id} requires C1-C5`);
    const { winner } = resolveRole(domain, answers);
    const st = D_STATEMENTS[winner];
    return id === "D1"
      ? { id, category: "The real cost", prompt: st.cost, options: D_OPTIONS.d1 }
      : { id, category: "The real cost", prompt: `${st.grind} — Would you actually do that?`, options: D_OPTIONS.d2 };
  }
  if (id === "F4") {
    return { id, category: "Reality & path", prompt: F4_PROMPT(answers.A7?.[0] ?? "a"), options: F4_OPTIONS };
  }
  const def = STATIC_SCREENS[id as keyof typeof STATIC_SCREENS];
  return { id: def.id, category: def.category, prompt: def.prompt, hint: def.hint, multi: def.multi, options: def.options };
}

export function nextScreenId(answers: V2Answers): ScreenId | null {
  for (const id of screenOrder(answers)) {
    const a = answers[id];
    if (!a || a.length === 0) return id;
  }
  return null;
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run tests/v2/flow.test.ts` — Expected: PASS (10 tests).
Note the D2 test expects the joined prompt `"…" — Would you actually do that?`; keep that exact format.

- [ ] **Step 6: Commit**

```bash
git add lib/v2/gate.ts lib/v2/flow.ts tests/v2/flow.test.ts
git commit -m "feat(v2): abroad gate and 29-screen flow engine with branch/role materialisation"
```

---

### Task 14: Report orchestrator + Ananya regression + near-tie stability

**Files:**
- Create: `lib/v2/fixtures.ts` (the Ananya answer set — reused by tests, the report mock, and QA)
- Create: `lib/v2/report.ts`
- Test: `tests/v2/report.test.ts`, `tests/v2/ananya.regression.test.ts`, `tests/v2/stability.test.ts`

**Interfaces:**
- Consumes: everything from Tasks 1–13.
- Produces:
  - `fixtures.ts`: `ANANYA_ANSWERS: V2Answers`, `ANANYA_NAME = "Ananya"`
  - `report.ts`:
    - `profileIdFor(name: string, email: string, dateISO: string): string` — deterministic `SS-MMYYYY-NNNN` (djb2 hash of `name|email|dateISO` mod 10000, zero-padded)
    - `buildReportV2(input: { name: string; email?: string; dateISO: string; answers: V2Answers }): ReportV2`

Report assembly order (spec §4 steps + §11): radar → sliders → C1 context (cards, seededTop2, chosen domain, default_path_flag) → role resolution → confirmation → archetype → cards → verdicts → flags → tips → next steps. In the `more_signal` state: `cards = null`, `verdicts = []`, no animal/archetype/fit anywhere; growth tips include the thin-signal tip; next steps lead with the single exposure action + counselling.

Core-strengths sentence bank (DRAFT copy except the three sample-sourced lines, marked ✓):

| Slider | Heading | Sentence |
|---|---|---|
| Energy | Clearly Outgoing | You recharge with people and your best work has an audience. |
| Energy | Lean Outgoing | People give you energy more often than they take it. |
| Energy | Clearly Reflective | You recharge alone and your deepest work happens there. ✓ |
| Energy | Lean Reflective | You do your best thinking away from the noise. |
| Energy | Balanced | You flex between the room and the quiet, depending on the work. |
| Decision | Clearly Deliberate | You compare before you commit, even with a deadline breathing. ✓ |
| Decision | Lean Deliberate | You lean toward checking twice before you move. |
| Decision | Clearly Instinctive | You commit fast and correct course as you go. |
| Decision | Lean Instinctive | You trust your gut first and the sheet second. |
| Decision | Balanced | You switch between gut and analysis depending on the stakes. |
| Structure | Clearly Structured | You work best with a clear frame and visible milestones. |
| Structure | Lean Structured | You like a frame, and you'll leave it when the room calls for it. ✓ |
| Structure | Clearly Open-ended | Give you the goal, not the steps — you'll find the way. |
| Structure | Lean Open-ended | You'd rather define the path than follow one. |
| Structure | Balanced | You can run with a plan or without one; the work decides. |
| Mobility | Global mover | The right opportunity outweighs the map. |
| Mobility | National mover | You'd move anywhere in India for the right thing. |
| Mobility | Conditional mover | You'd relocate, but only for something exceptional. ✓ |
| Mobility | Rooted | You build best where your life already is. |

Abroad next-step qualifiers (E1 main + E2 suffix, matches the sample "funded, affordable programmes in sane working cultures"):
`QUALIFIER: { meaning: "mission-driven", mastery: "deep-specialist", freedom: "flexible", relationships: "closer-to-home", health: "low-burnout", money: "funded, affordable" }` and `SUFFIX: { health: " in sane working cultures", relationships: " with strong communities", meaning: "", mastery: "", freedom: "", money: "" }`.

- [ ] **Step 1: Create `lib/v2/fixtures.ts`**

```ts
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
```

- [ ] **Step 2: Write the failing tests**

Create `tests/v2/ananya.regression.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { buildReportV2 } from "../../lib/v2/report";
import { ANANYA_ANSWERS, ANANYA_NAME } from "../../lib/v2/fixtures";

const input = { name: ANANYA_NAME, email: "ananya@example.com", dateISO: "2026-08-15", answers: ANANYA_ANSWERS };

describe("Ananya regression (spec §12) — same answers, same Auditor, every run", () => {
  const report = buildReportV2(input);

  it("is The Auditor: Hawk with an Elephant's discipline", () => {
    expect(report.state).toBe("full");
    expect(report.yourType.kind).toBe("archetype");
    if (report.yourType.kind !== "archetype") return;
    expect(report.yourType.name).toBe("The Auditor");
    expect(report.yourType.rendering).toBe("Hawk with an Elephant's discipline");
  });

  it("radar: An 10 · Pr 10 · Cr 6 · En 6 · People 4 · Le 4", () => {
    expect(report.radar).toEqual({
      analytical: 10, practical: 10, creative: 6, entrepreneurial: 6, people: 4, leadership: 4,
    });
  });

  it("core strengths: Clearly Reflective, Clearly Deliberate, Lean Structured, Conditional mover", () => {
    expect(report.coreStrengths.map((s) => s.heading)).toEqual([
      "Clearly Reflective", "Clearly Deliberate", "Lean Structured", "Conditional mover",
    ]);
  });

  it("cards: 84 / 78 / 71 / 52, descending", () => {
    expect(report.cards!.map((c) => c.fit)).toEqual([84, 78, 71, 52]);
    expect(report.cards![0].career).toBe("Risk Analyst");
    expect(report.cards![2].career).toBe("Data Analyst");
  });

  it("verdicts: S2, H1, H4", () => {
    expect(report.verdicts.map((v) => v.id)).toEqual(["S2", "H1", "H4"]);
  });

  it("flags: romanticism, conversation_gap, family — three growth tips", () => {
    expect(report.flags.map((f) => f.id).sort()).toEqual(["conversation_gap", "family", "romanticism"]);
    expect(report.growthTips).toHaveLength(3);
  });

  it("abroad block present (gate passed, F4 open) and shaped by Money/Health", () => {
    expect(report.nextSteps.abroad).toBeDefined();
    expect(report.nextSteps.abroad).toContain("funded, affordable");
    expect(report.nextSteps.abroad).toContain("sane working cultures");
    expect(report.nextSteps.counselling).toContain("family");
  });

  it("is deterministic: two runs produce identical reports", () => {
    expect(buildReportV2(input)).toEqual(buildReportV2(input));
    expect(report.header.profileId).toBe(buildReportV2(input).header.profileId);
  });
});
```

Create `tests/v2/stability.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { buildReportV2 } from "../../lib/v2/report";
import { ANANYA_ANSWERS, ANANYA_NAME } from "../../lib/v2/fixtures";
import type { V2Answers } from "../../lib/v2/types";

// Spec §13 near-tie gate, on the quantized scale: An 10 with Pr 6 / Cr 6 tied for second.
const nearTie: V2Answers = {
  ...ANANYA_ANSWERS,
  B2: ["c"], B3: ["b"], B4: ["c"], B5: ["b"], B6: ["c"], // An10 People4 Cr6 En4 Pr6 Le4
};
const name = (a: V2Answers) => {
  const t = buildReportV2({ name: ANANYA_NAME, dateISO: "2026-08-15", answers: a }).yourType;
  return t.kind === "archetype" ? t.name : t.kind;
};

describe("near-tie stability — must not flip on one changed unrelated answer", () => {
  it("finance branch resolves the Pr/Cr tie to The Auditor", () => {
    expect(name(nearTie)).toBe("The Auditor");
  });

  it("stays The Auditor when one unrelated answer changes", () => {
    expect(name({ ...nearTie, A1: ["a"] })).toBe("The Auditor");
    expect(name({ ...nearTie, F2: ["d"] })).toBe("The Auditor");
    expect(name({ ...nearTie, E1: ["a"] })).toBe("The Auditor");
  });

  it("technology branch resolves the same radar to The Architect, stably", () => {
    // Same reactions, C1 = a (her top seeded card is technology)
    const tech: V2Answers = { ...nearTie, C1: ["a"], C2: ["b"], C3: ["b"], C4: ["b"], C5: ["b"] };
    expect(name(tech)).toBe("The Architect");
    expect(name({ ...tech, A6: ["a"] })).toBe("The Architect");
  });
});
```

Create `tests/v2/report.test.ts` (state handling):

```ts
import { describe, it, expect } from "vitest";
import { buildReportV2, profileIdFor } from "../../lib/v2/report";
import { ANANYA_ANSWERS } from "../../lib/v2/fixtures";
import type { V2Answers } from "../../lib/v2/types";

describe("buildReportV2 states", () => {
  it("more_signal: no cards, no verdicts, thin-signal tip present", () => {
    const thin: V2Answers = {
      ...ANANYA_ANSWERS,
      B1: ["b"], B2: ["c"], B3: ["c"], B4: ["c"], B5: ["b"], B6: ["c"], // max 6 → thin
    };
    const r = buildReportV2({ name: "X", dateISO: "2026-08-15", answers: thin });
    expect(r.state).toBe("more_signal");
    expect(r.cards).toBeNull();
    expect(r.verdicts).toEqual([]);
    expect(r.flags.map((f) => f.id)).toContain("thin_signal");
  });

  it("zero flags → exactly the two universal tips", () => {
    // Ananya with only one b-reaction (romanticism off), autonomous family, real exposure,
    // conversations done. E1 stays Money (not spent by risk), primary dim stays Analytical
    // (inside the commerce expectation) and her C1 card list is unchanged → zero flags.
    const clean: V2Answers = {
      ...ANANYA_ANSWERS,
      B3: ["c"],                 // b-count drops to 1 → romanticism off
      E3: ["a"], F1: ["c"], F2: ["d"],
    };
    const r = buildReportV2({ name: "X", dateISO: "2026-08-15", answers: clean });
    expect(r.flags).toHaveLength(0);
    expect(r.growthTips).toHaveLength(2);
  });

  it("no abroad block when the gate fails", () => {
    const rooted = buildReportV2({
      name: "X", dateISO: "2026-08-15",
      answers: { ...ANANYA_ANSWERS, A7: ["d"], F4: undefined, F5a: undefined, F5b: undefined, F5c: undefined },
    });
    expect(rooted.nextSteps.abroad).toBeUndefined();
  });

  it("profile id is deterministic and formatted SS-MMYYYY-NNNN", () => {
    const id = profileIdFor("Ananya", "a@b.c", "2026-08-15");
    expect(id).toMatch(/^SS-082026-\d{4}$/);
    expect(profileIdFor("Ananya", "a@b.c", "2026-08-15")).toBe(id);
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `npx vitest run tests/v2/report.test.ts tests/v2/ananya.regression.test.ts tests/v2/stability.test.ts` — Expected: FAIL (no `lib/v2/report`).

- [ ] **Step 4: Implement `lib/v2/report.ts`**

```ts
import { computeRadar } from "./scoring/radar";
import { computeSliders } from "./scoring/sliders";
import { computeDefaultPathFlag, selectC1Cards } from "./scoring/domains";
import { resolveRole } from "./scoring/roles";
import { confBand, confTotal } from "./scoring/confirmation";
import { computeArchetypeV2 } from "./archetype";
import { buildCards } from "./careers/cards";
import { slotVerdicts } from "./verdicts";
import { UNIVERSAL_TIPS, evaluateFlags } from "./flags";
import { chosenDomain, degreeOf } from "./flow";
import { showAbroad } from "./gate";
import { ROLE_LABELS, VALUE_BY_KEY, VALUE_LABELS } from "./types";
import type { ReportV2, SlidersResult, V2Answers, ValueId } from "./types";

export function profileIdFor(name: string, email: string, dateISO: string): string {
  const s = `${name}|${email}|${dateISO}`;
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h * 33) ^ s.charCodeAt(i)) >>> 0;
  const [y, m] = dateISO.split("-");
  return `SS-${m}${y}-${String(h % 10000).padStart(4, "0")}`;
}

// DRAFT copy except ✓-marked sample lines (see plan Task 14 table).
const ENERGY_LINES: Record<string, string> = {
  "Clearly Outgoing": "You recharge with people and your best work has an audience.",
  "Lean Outgoing": "People give you energy more often than they take it.",
  "Clearly Reflective": "You recharge alone and your deepest work happens there.",
  "Lean Reflective": "You do your best thinking away from the noise.",
  Balanced: "You flex between the room and the quiet, depending on the work.",
};
const DECISION_LINES: Record<string, string> = {
  "Clearly Deliberate": "You compare before you commit, even with a deadline breathing.",
  "Lean Deliberate": "You lean toward checking twice before you move.",
  "Clearly Instinctive": "You commit fast and correct course as you go.",
  "Lean Instinctive": "You trust your gut first and the sheet second.",
  Balanced: "You switch between gut and analysis depending on the stakes.",
};
const STRUCTURE_LINES: Record<string, string> = {
  "Clearly Structured": "You work best with a clear frame and visible milestones.",
  "Lean Structured": "You like a frame, and you'll leave it when the room calls for it.",
  "Clearly Open-ended": "Give you the goal, not the steps — you'll find the way.",
  "Lean Open-ended": "You'd rather define the path than follow one.",
  Balanced: "You can run with a plan or without one; the work decides.",
};
const MOBILITY_LINES: Record<string, { heading: string; sentence: string }> = {
  global: { heading: "Global mover", sentence: "The right opportunity outweighs the map." },
  national: { heading: "National mover", sentence: "You'd move anywhere in India for the right thing." },
  conditional: { heading: "Conditional mover", sentence: "You'd relocate, but only for something exceptional." },
  rooted: { heading: "Rooted", sentence: "You build best where your life already is." },
};

const QUALIFIER: Record<ValueId, string> = {
  meaning: "mission-driven", mastery: "deep-specialist", freedom: "flexible",
  relationships: "closer-to-home", health: "low-burnout", money: "funded, affordable",
};
const SUFFIX: Record<ValueId, string> = {
  meaning: "", mastery: "", freedom: "", money: "",
  relationships: " with strong communities", health: " in sane working cultures",
};

function heading(band: string, side?: string): string {
  return band === "Balanced" ? "Balanced" : `${band} ${side}`;
}

function coreStrengths(sliders: SlidersResult): ReportV2["coreStrengths"] {
  const e = heading(sliders.energy.band, sliders.energy.side);
  const d = heading(sliders.decision.band, sliders.decision.side);
  const st = heading(sliders.structure.band, sliders.structure.side);
  const mob = sliders.mobility ? MOBILITY_LINES[sliders.mobility] : { heading: "Balanced", sentence: "" };
  return [
    { label: "Energy", heading: e, sentence: ENERGY_LINES[e], sourceIds: ["A1", "A2"] },
    { label: "Decision", heading: d, sentence: DECISION_LINES[d], sourceIds: ["A3", "A4"] },
    { label: "Structure", heading: st, sentence: STRUCTURE_LINES[st], sourceIds: ["A5", "A6"] },
    { label: "Mobility", heading: mob.heading, sentence: mob.sentence, sourceIds: ["A7"] },
  ];
}

function valueOf(answers: V2Answers, id: "E1" | "E2"): ValueId | null {
  const k = answers[id]?.[0];
  return k ? VALUE_BY_KEY[k as keyof typeof VALUE_BY_KEY] : null;
}

export function buildReportV2(input: {
  name: string; email?: string; dateISO: string; answers: V2Answers;
}): ReportV2 {
  const { name, email = "", dateISO, answers } = input;
  const degree = degreeOf(answers) ?? "other";
  const radar = computeRadar(answers);
  const sliders = computeSliders(answers);
  const domain = chosenDomain(answers);
  const { seededTop2 } = selectC1Cards(radar, degree);
  const defaultPathFlag = domain ? computeDefaultPathFlag(domain, degree, seededTop2) : false;

  const role = domain ? resolveRole(domain, answers) : null;
  const conf = confTotal(answers);
  const band = confBand(conf);
  const archetype = computeArchetypeV2(radar, domain);
  const moreSignal = archetype.kind === "more_signal";

  const cards = !moreSignal && domain && role
    ? buildCards({
        domain, radar, roleScores: role.scores, ranked: role.ranked,
        winner: role.winner, coCandidate: role.coCandidate, conf, degree,
      })
    : null;

  const verdicts = moreSignal ? [] : slotVerdicts({
    answers, radar, sliders, domain, winner: role?.winner ?? null, confTotal: conf, defaultPathFlag,
  });

  const flags = evaluateFlags({
    answers, radar, degree, seededTop2, chosenDomain: domain,
    winner: role?.winner ?? null, confBand: band, archetype, defaultPathFlag,
  });
  const growthTips = flags.length > 0 ? flags.map((f) => f.tip) : [...UNIVERSAL_TIPS];

  const family = ["c", "d"].includes(answers.E3?.[0] ?? "");
  const roleLabel = role ? ROLE_LABELS[role.winner] : "your top field";
  const counselling = moreSignal
    ? "A 1:1 counselling session to plan your first real exposure — that will tell us more than this result can."
    : `A 1:1 session on ${roleLabel}${role?.coCandidate ? ` vs ${ROLE_LABELS[role.coCandidate]}` : ""} pathways${family ? ", with your family in the room" : ""}.`;
  const exposure = answers.F1?.[0] === "a" || answers.F1?.[0] === "b"
    ? `One real project or internship in ${roleLabel.toLowerCase()} before the term ends.`
    : `One deeper project in ${roleLabel.toLowerCase()} — you have exposure; now aim it.`;
  const conversation = answers.F2?.[0] === "a" || answers.F2?.[0] === "b"
    ? `One conversation with a working ${roleLabel.toLowerCase()} professional before month-end.`
    : `Keep the conversations going — ask the next one what they'd study today.`;

  let abroad: string | undefined;
  const f4 = answers.F4?.[0];
  if (showAbroad(answers) && (f4 === "a" || f4 === "b")) {
    const anchor = valueOf(answers, "E1");
    const keystone = valueOf(answers, "E2");
    const openness = f4 === "a" ? "set on" : "open to";
    const q = anchor ? QUALIFIER[anchor] : "well-matched";
    const suffix = keystone ? SUFFIX[keystone] : "";
    const protects = anchor
      ? ` and you protect ${VALUE_LABELS[anchor]}${keystone ? ` with ${VALUE_LABELS[keystone]} as your keystone` : ""}`
      : "";
    abroad = `You're ${openness} studying abroad${protects}, so your shortlist will be weighted toward ${q} programmes${suffix}.`;
  }

  return {
    header: {
      name,
      profileId: profileIdFor(name, email, dateISO),
      date: dateISO,
      assessmentName: "Secure Steps · Roots & Routes",
    },
    state: moreSignal ? "more_signal" : "full",
    yourType: archetype,
    coreStrengths: coreStrengths(sliders),
    radar,
    cards,
    verdicts,
    growthTips,
    nextSteps: { counselling, exposure, conversation, ...(abroad ? { abroad } : {}) },
    flags,
    role: role ? { winner: role.winner, coCandidate: role.coCandidate, confTotal: conf, confBand: band } : null,
    domain,
  };
}
```

- [ ] **Step 5: Run the full suite**

Run: `npx vitest run` — Expected: ALL tests pass (Tasks 1–14). Run `npm run typecheck` — pass.
If the regression test fails, fix the engine, **never** the expected values — they come from spec §12.

- [ ] **Step 6: Commit**

```bash
git add lib/v2/fixtures.ts lib/v2/report.ts tests/v2/report.test.ts tests/v2/ananya.regression.test.ts tests/v2/stability.test.ts
git commit -m "feat(v2): buildReportV2 orchestrator + Ananya regression + near-tie stability gates"
```

---

### Task 15: Store migration + registration fix

**Files:**
- Modify: `lib/store.ts` (persist version bump + migrate)
- Modify: `app/page.tsx` (include `education_level` in the Supabase `students` insert — known bug)

**Interfaces:**
- Consumes: existing Zustand store (`useAssessment`, persist key `"roots-and-routes-assessment"`, currently `version: 1`).
- Produces: persist `version: 2` with a `migrate` that clears stale in-progress legacy answers for college users (their old Q1–Q25 UG answers are meaningless to the v2 engine). School users' state passes through untouched. v2 screens store their answers in the **same** `answers` map keyed by v2 screen ids (`Q0`, `A1`… — no collision with school ids `Q1`–`Q25` — note `Q0` is v2-only).

- [ ] **Step 1: Bump persist version and add migrate in `lib/store.ts`**

Replace the persist options object (currently `{ name, storage, version: 1 }`) with:

```ts
{
  name: "roots-and-routes-assessment",
  storage: createJSONStorage(() => localStorage),
  version: 2,
  migrate: (persisted: unknown, version: number) => {
    const state = persisted as AssessmentState;
    // v2 engine replaces the UG flow: stale legacy UG answers can't drive the 29-screen flow.
    if (version < 2 && state?.profile?.educationLevel === "college") {
      return {
        ...state,
        answers: {},
        trunk: [],
        adaptiveQuestions: {},
        rewrites: {},
        section: "main_character" as const,
        archetype: undefined,
      };
    }
    return state;
  },
}
```

- [ ] **Step 2: Fix the students insert in `app/page.tsx`**

Find the registration submit handler (`supabase.from("students").insert(...)` — currently omits the education level) and add to the inserted payload object:

```ts
education_level: profile.educationLevel ?? "college",
```

(using whatever local variable holds the new `StudentProfile` in that handler — read the surrounding code first; if the column doesn't exist in Supabase yet, note it in the commit message for Nitin to add: `alter table students add column education_level text;`).

- [ ] **Step 3: Verify**

Run: `npm run typecheck` and `npm run build` — both pass. Run `npx vitest run` — still green.

- [ ] **Step 4: Commit**

```bash
git add lib/store.ts app/page.tsx
git commit -m "fix: persist v2 migration clears stale UG answers; registration saves education_level"
```

---

### Task 16: v2 assessment UI (29-screen runner, college only)

**Files:**
- Create: `components/v2/v2-card.tsx`
- Create: `components/v2/assessment-flow.tsx`
- Modify: `app/assessment/page.tsx` (branch: college → v2 flow; school → existing JSX untouched)

**Interfaces:**
- Consumes: `getScreen`, `nextScreenId`, `screenOrder`, `ScreenV2` from `lib/v2/flow`; `useAssessment` from `lib/store` (`answers: Record<string, Answer>`, `answer(questionId, partial)` — the existing Supabase upsert per answer keeps working since v2 ids are plain question ids to it).
- Produces: `V2AssessmentFlow` default-export component. No adaptive probes, no emoji reaction bar in v2 (Decision 15).

Check the repo's import style first (`@/lib/...` alias vs relative) with `grep -r "from \"@/" app | head -5` and match it.

- [ ] **Step 1: Create `components/v2/v2-card.tsx`**

```tsx
"use client";

import type { ScreenV2 } from "../../lib/v2/flow";
import type { OptionKey } from "../../lib/v2/types";

interface Props {
  screen: ScreenV2;
  selected: OptionKey[];
  onToggle: (key: OptionKey) => void;
  onContinue: () => void;
}

/** One v2 screen: category chip, prompt, options. Multi-select shows a Continue button. */
export default function V2Card({ screen, selected, onToggle, onContinue }: Props) {
  return (
    <div className="mx-auto w-full max-w-xl rounded-2xl bg-white p-6 shadow-lg">
      <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-emerald-600">
        {screen.category}
      </p>
      <h2 className="mb-1 text-lg font-bold text-slate-900">{screen.prompt}</h2>
      {screen.hint && <p className="mb-3 text-sm text-slate-500">{screen.hint}</p>}
      <div className="mt-4 flex flex-col gap-2">
        {screen.options.map((o) => {
          const active = selected.includes(o.key);
          return (
            <button
              key={o.key}
              type="button"
              onClick={() => onToggle(o.key)}
              className={`rounded-xl border px-4 py-3 text-left text-sm transition ${
                active
                  ? "border-emerald-600 bg-emerald-50 font-semibold text-emerald-900"
                  : "border-slate-200 bg-white text-slate-700 hover:border-emerald-300"
              }`}
            >
              {o.label}
            </button>
          );
        })}
      </div>
      {screen.multi && (
        <button
          type="button"
          disabled={selected.length === 0}
          onClick={onContinue}
          className="mt-4 w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-40"
        >
          Continue
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create `components/v2/assessment-flow.tsx`**

```tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAssessment } from "../../lib/store";
import { getScreen, nextScreenId, screenOrder } from "../../lib/v2/flow";
import type { OptionKey, ScreenId, V2Answers } from "../../lib/v2/types";
import V2Card from "./v2-card";

const ALL_V2_IDS: ScreenId[] = [
  "Q0", "A1", "A2", "A3", "A4", "A5", "A6", "A7",
  "B1", "B2", "B3", "B4", "B5", "B6",
  "C1", "C2", "C3", "C4", "C5", "D1", "D2",
  "E1", "E2", "E3", "F1", "F2", "F3", "F4", "F5a", "F5b", "F5c",
];

export default function V2AssessmentFlow() {
  const router = useRouter();
  const answers = useAssessment((s) => s.answers);
  const saveAnswer = useAssessment((s) => s.answer);
  const [pendingMulti, setPendingMulti] = useState<OptionKey[]>([]);

  const v2Answers: V2Answers = useMemo(() => {
    const out: V2Answers = {};
    for (const id of ALL_V2_IDS) {
      const a = answers[id];
      if (a?.optionIds?.length) out[id] = a.optionIds as OptionKey[];
    }
    return out;
  }, [answers]);

  const currentId = nextScreenId(v2Answers);

  useEffect(() => {
    if (currentId === null) router.push("/report");
  }, [currentId, router]);
  useEffect(() => setPendingMulti([]), [currentId]);

  if (currentId === null) return null;
  const screen = getScreen(currentId, v2Answers);
  const order = screenOrder(v2Answers);
  const done = order.indexOf(currentId);

  const commit = (keys: OptionKey[]) => saveAnswer(currentId, { optionIds: keys });
  const onToggle = (key: OptionKey) => {
    if (!screen.multi) return commit([key]);
    setPendingMulti((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto mb-6 h-1.5 w-full max-w-xl overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all"
          style={{ width: `${Math.round((done / order.length) * 100)}%` }}
        />
      </div>
      <p className="mx-auto mb-4 w-full max-w-xl text-right text-xs text-slate-400">
        {done + 1} / {order.length}
      </p>
      <V2Card
        screen={screen}
        selected={screen.multi ? pendingMulti : (v2Answers[currentId] ?? [])}
        onToggle={onToggle}
        onContinue={() => commit(pendingMulti)}
      />
    </div>
  );
}
```

- [ ] **Step 3: Branch `app/assessment/page.tsx`**

At the top of the page component (after the existing hydration/mounted guard — this page already has one; keep it so the store is hydrated before branching), add:

```tsx
const educationLevel = useAssessment((s) => s.profile?.educationLevel);
if (educationLevel !== "10th_12th") {
  return <V2AssessmentFlow />;
}
// existing legacy JSX below — untouched, now school-only
```

with `import V2AssessmentFlow from "@/components/v2/assessment-flow";` (or relative, matching repo style). College (and missing level, which defaults to college throughout the app) gets v2; school keeps the legacy flow.

- [ ] **Step 4: Verify**

Run: `npm run typecheck`, `npm run lint`, `npm run build` — all pass. `npx vitest run` — green.
Manual: `npm run dev` → register as a college student → confirm: Q0 first; B screens show the fixed reaction scale; C1 shows 4 domain cards; C2–C5 match the picked domain; D1/D2 show the winning role's cost/grind; with A7=b or d the flow ends at F3; with A7=c + F3=Higher studies F4 appears and quotes the A7 answer; F5 runs as 3 sub-screens; finishing lands on `/report`. Refresh mid-flow → resumes at the same screen.

- [ ] **Step 5: Commit**

```bash
git add components/v2/v2-card.tsx components/v2/assessment-flow.tsx app/assessment/page.tsx
git commit -m "feat(v2): 29-screen assessment flow UI for UG; school keeps legacy flow"
```

---

### Task 17: v2 report view (9 blocks) + report page switch

**Files:**
- Create: `components/v2/radar-chart.tsx`
- Create: `components/v2/report-view.tsx`
- Modify: `app/report/page.tsx`

**Interfaces:**
- Consumes: `buildReportV2`, `ReportV2` from `lib/v2/report`; `ANANYA_ANSWERS`, `ANANYA_NAME` from `lib/v2/fixtures`; `DIM_LABELS`, `ANIMALS`; store answers (same extraction as Task 16 — export `toV2Answers(answers): V2Answers` helper from `components/v2/assessment-flow.tsx` or duplicate the 6-line loop).
- Produces: `<ReportViewV2 report={ReportV2} />`; `<RadarChart scores={RadarScores} size?: number />`.

Spec §11 blocks in order: 1 Header · 2 Your Type · 3 Core Strengths · 4 Path Fit radar · 5 Career cards · 6 We Feel · 7 Growth tips · 8 Next steps · 9 Footer disclaimer. `more_signal` state: block 2 renders the honest fallback copy with **no animal and no archetype name**, blocks 4–6 are replaced by the copy + exposure action (no fit % anywhere), 7–8 render normally.

- [ ] **Step 1: Create `components/v2/radar-chart.tsx`**

```tsx
"use client";

import { DIM_LABELS, DIM_PRIORITY } from "../../lib/v2/types";
import type { RadarScores } from "../../lib/v2/types";

export default function RadarChart({ scores, size = 280 }: { scores: RadarScores; size?: number }) {
  const cx = size / 2, cy = size / 2, r = size * 0.36;
  const angle = (i: number) => (Math.PI * 2 * i) / 6 - Math.PI / 2;
  const point = (i: number, value: number) => {
    const rr = (value / 10) * r;
    return `${cx + rr * Math.cos(angle(i))},${cy + rr * Math.sin(angle(i))}`;
  };
  const ring = (v: number) => DIM_PRIORITY.map((_, i) => point(i, v)).join(" ");
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="mx-auto w-full max-w-xs" role="img" aria-label="Path fit radar">
      {[10, 7.5, 5, 2.5].map((v) => (
        <polygon key={v} points={ring(v)} fill="none" stroke="#e2e8f0" strokeWidth={1} />
      ))}
      {DIM_PRIORITY.map((_, i) => (
        <line key={i} x1={cx} y1={cy} x2={point(i, 10).split(",")[0]} y2={point(i, 10).split(",")[1]} stroke="#e2e8f0" strokeWidth={1} />
      ))}
      <polygon
        points={DIM_PRIORITY.map((d, i) => point(i, scores[d])).join(" ")}
        fill="rgba(16,185,129,0.25)" stroke="#10b981" strokeWidth={2}
      />
      {DIM_PRIORITY.map((d, i) => {
        const [x, y] = point(i, 12.6).split(",").map(Number);
        return (
          <text key={d} x={x} y={y} textAnchor="middle" className="fill-slate-500" fontSize={10}>
            {DIM_LABELS[d]} {scores[d]}
          </text>
        );
      })}
    </svg>
  );
}
```

- [ ] **Step 2: Create `components/v2/report-view.tsx`**

```tsx
"use client";

import type { ReportV2 } from "../../lib/v2/types";
import RadarChart from "./radar-chart";

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="mb-8">
    <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-emerald-700">{title}</h2>
    {children}
  </section>
);

export default function ReportViewV2({ report }: { report: ReportV2 }) {
  const t = report.yourType;
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 text-slate-800">
      {/* 1. Header */}
      <header className="mb-8 border-b border-slate-200 pb-4">
        <p className="text-xs uppercase tracking-widest text-slate-400">{report.header.assessmentName}</p>
        <h1 className="text-2xl font-bold">{report.header.name}</h1>
        <p className="text-sm text-slate-500">{report.header.profileId} · {report.header.date}</p>
      </header>

      {/* 2. Your Type */}
      <Section title="Your Type">
        {t.kind === "archetype" ? (
          <div>
            <p className="text-3xl font-extrabold text-slate-900">THE {t.animal.toUpperCase()}</p>
            <p className="mb-2 text-sm italic text-slate-500">{t.rendering.replace(/^\w+ /, "with ")}</p>
            <p className="font-semibold">{t.name}.</p>
            <p className="text-sm text-slate-600">{t.strapline}</p>
          </div>
        ) : (
          <p className="text-sm leading-relaxed text-slate-700">{t.copy}</p>
        )}
      </Section>

      {/* 3. Core Strengths */}
      <Section title="Core Strengths">
        <ul className="space-y-2">
          {report.coreStrengths.map((s) => (
            <li key={s.label} className="text-sm">
              <span className="font-semibold">{s.heading}.</span> {s.sentence}{" "}
              <span className="text-xs text-slate-400">({s.sourceIds.join(", ")})</span>
            </li>
          ))}
        </ul>
      </Section>

      {report.state === "full" ? (
        <>
          {/* 4. Path Fit radar */}
          <Section title="Path Fit"><RadarChart scores={report.radar} /></Section>

          {/* 5. Career cards */}
          <Section title="Career Cards">
            <ol className="space-y-3">
              {report.cards!.map((c, i) => (
                <li key={c.career} className="rounded-xl border border-slate-200 p-4">
                  <p className="font-bold">{i + 1}. {c.career} · {c.fit}% fit</p>
                  <p className="text-sm text-slate-600">{c.whatLine}</p>
                  <p className="mt-1 text-sm"><span className="font-semibold">Next step:</span> {c.nextStep}</p>
                  {c.honestyLine && <p className="mt-1 text-sm italic text-amber-700">{c.honestyLine}</p>}
                </li>
              ))}
            </ol>
          </Section>

          {/* 6. We Feel */}
          {report.verdicts.length > 0 && (
            <Section title="We Feel">
              <ul className="space-y-2">
                {report.verdicts.map((v) => (
                  <li key={v.id} className="text-sm leading-relaxed">{v.line}</li>
                ))}
              </ul>
            </Section>
          )}
        </>
      ) : (
        <Section title="What Happens Next">
          <p className="text-sm text-slate-700">
            No percentages today — they wouldn't be honest. The fastest way forward is below.
          </p>
        </Section>
      )}

      {/* 7. Growth tips */}
      <Section title="Growth Tips">
        <ul className="list-disc space-y-2 pl-5">
          {report.growthTips.map((tip) => <li key={tip} className="text-sm">{tip}</li>)}
        </ul>
      </Section>

      {/* 8. Next steps */}
      <Section title="Next Steps">
        <ol className="list-decimal space-y-2 pl-5 text-sm">
          <li>{report.nextSteps.counselling}</li>
          <li>{report.nextSteps.exposure}</li>
          <li>{report.nextSteps.conversation}</li>
          {report.nextSteps.abroad && <li>{report.nextSteps.abroad}</li>}
        </ol>
      </Section>

      {/* 9. Footer */}
      <footer className="border-t border-slate-200 pt-4 text-xs text-slate-400">
        This report reflects what your answers showed about approach and preference. It does not measure
        ability, and no single question decided any line above. · Secure Steps
      </footer>
    </div>
  );
}
```

- [ ] **Step 3: Switch `app/report/page.tsx`**

Inside the existing page (keep its hydration guard and layout shell): when `profile?.educationLevel !== "10th_12th"`, build and render v2 instead of the legacy view:

```tsx
const isMock = searchParams?.get("mock") === "true";
const v2Answers = isMock ? ANANYA_ANSWERS : toV2Answers(answers);
const report = useMemo(
  () => buildReportV2({
    name: isMock ? ANANYA_NAME : profile?.name ?? "Student",
    email: profile?.email,
    dateISO: new Date().toISOString().slice(0, 10),
    answers: v2Answers,
  }),
  [isMock, profile, v2Answers],
);
return <ReportViewV2 report={report} />;
```

`toV2Answers` = the same 6-line extraction loop from Task 16 — export it from `components/v2/assessment-flow.tsx` and import here. The legacy PDF download button: hide it on the v2 branch for now (Task 18 wires the v2 PDF). `new Date()` here is fine — the determinism rule covers the engine, not the page shell.

- [ ] **Step 4: Verify**

`npm run typecheck` && `npm run build` — pass. Manual: `npm run dev` → `/report?mock=true` renders the Ananya report — check against spec §12: THE HAWK, The Auditor, four strength lines, radar 10/10/6/6/4/4, cards 84/78/71/52 in order, three We-Feel lines, three growth tips, four next steps including the abroad line.

- [ ] **Step 5: Commit**

```bash
git add components/v2/radar-chart.tsx components/v2/report-view.tsx app/report/page.tsx components/v2/assessment-flow.tsx
git commit -m "feat(v2): 9-block report view with radar, wired for UG + Ananya mock"
```

---

### Task 18: v2 PDF

**Files:**
- Create: `lib/v2/report-pdf.tsx`
- Modify: `app/report/page.tsx` (re-enable the download button on the v2 branch)

**Interfaces:**
- Consumes: `ReportV2`; `@react-pdf/renderer` (`Document, Page, Text, View, StyleSheet, Font`); the existing `Font.register` block in `lib/report-pdf.tsx` (copy it verbatim — same local font files — so the PDF matches app typography).
- Produces: `ReportPdfV2({ report }: { report: ReportV2 })` returning a `<Document>`; the report page's existing download handler calls `pdf(<ReportPdfV2 report={report} />).toBlob()` on the v2 branch (mirror the exact pattern the legacy button uses — read it first).

- [ ] **Step 1: Implement `lib/v2/report-pdf.tsx`**

Mirror the 9 blocks of `report-view.tsx` in react-pdf primitives. Structure (fill styles to taste, reuse legacy font family names):

```tsx
import { Document, Font, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ReportV2 } from "./types";

// Copy the Font.register(...) calls verbatim from lib/report-pdf.tsx here.

const s = StyleSheet.create({
  page: { padding: 40, fontSize: 10, color: "#1e293b" },
  h1: { fontSize: 20, fontWeight: 700 },
  sectionTitle: { fontSize: 9, marginTop: 16, marginBottom: 6, color: "#047857", textTransform: "uppercase", letterSpacing: 1.5 },
  card: { borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 6, padding: 8, marginBottom: 6 },
  muted: { color: "#64748b" },
  footer: { marginTop: 24, paddingTop: 8, borderTopWidth: 1, borderTopColor: "#e2e8f0", fontSize: 8, color: "#94a3b8" },
});

export default function ReportPdfV2({ report }: { report: ReportV2 }) {
  const t = report.yourType;
  return (
    <Document title={`${report.header.assessmentName} — ${report.header.name}`}>
      <Page size="A4" style={s.page}>
        <Text style={s.muted}>{report.header.assessmentName}</Text>
        <Text style={s.h1}>{report.header.name}</Text>
        <Text style={s.muted}>{report.header.profileId} · {report.header.date}</Text>

        <Text style={s.sectionTitle}>Your Type</Text>
        {t.kind === "archetype" ? (
          <View>
            <Text style={{ fontSize: 16, fontWeight: 700 }}>THE {t.animal.toUpperCase()}</Text>
            <Text style={s.muted}>{t.rendering}</Text>
            <Text>{t.name}. {t.strapline}</Text>
          </View>
        ) : (
          <Text>{t.copy}</Text>
        )}

        <Text style={s.sectionTitle}>Core Strengths</Text>
        {report.coreStrengths.map((c) => (
          <Text key={c.label}>• {c.heading}. {c.sentence} ({c.sourceIds.join(", ")})</Text>
        ))}

        {report.state === "full" && (
          <>
            <Text style={s.sectionTitle}>Path Fit</Text>
            {Object.entries(report.radar).map(([dim, v]) => (
              <Text key={dim}>{dim}: {v} / 10</Text>
            ))}

            <Text style={s.sectionTitle}>Career Cards</Text>
            {report.cards!.map((c, i) => (
              <View key={c.career} style={s.card}>
                <Text style={{ fontWeight: 700 }}>{i + 1}. {c.career} · {c.fit}% fit</Text>
                <Text>{c.whatLine}</Text>
                <Text>Next step: {c.nextStep}</Text>
                {c.honestyLine ? <Text style={s.muted}>{c.honestyLine}</Text> : null}
              </View>
            ))}

            {report.verdicts.length > 0 && (
              <>
                <Text style={s.sectionTitle}>We Feel</Text>
                {report.verdicts.map((v) => <Text key={v.id}>• {v.line}</Text>)}
              </>
            )}
          </>
        )}

        <Text style={s.sectionTitle}>Growth Tips</Text>
        {report.growthTips.map((tip) => <Text key={tip}>• {tip}</Text>)}

        <Text style={s.sectionTitle}>Next Steps</Text>
        <Text>1. {report.nextSteps.counselling}</Text>
        <Text>2. {report.nextSteps.exposure}</Text>
        <Text>3. {report.nextSteps.conversation}</Text>
        {report.nextSteps.abroad ? <Text>4. {report.nextSteps.abroad}</Text> : null}

        <Text style={s.footer}>
          This report reflects what your answers showed about approach and preference. It does not measure ability. · Secure Steps
        </Text>
      </Page>
    </Document>
  );
}
```

For the radar in PDF, the score list above is acceptable v1; a drawn hexagon via react-pdf `Svg`/`Polygon` may be added later.

- [ ] **Step 2: Wire the download button**

In `app/report/page.tsx`, on the v2 branch reuse the legacy download handler pattern with `ReportPdfV2` and filename `roots-and-routes-${report.header.profileId}.pdf`.

- [ ] **Step 3: Verify**

`npm run typecheck` && `npm run build` — pass. Manual: `/report?mock=true` → Download → open the PDF, confirm all 9 blocks and fits 84/78/71/52 in order.

- [ ] **Step 4: Commit**

```bash
git add lib/v2/report-pdf.tsx app/report/page.tsx
git commit -m "feat(v2): react-pdf 9-block report document + download wiring"
```

---

### Task 19: Legacy cleanup

**Files:**
- Delete: `components/report-visuals.tsx`, `app/teaser/`, `app/admin/`, `app/api/admin/`, `lib/question-bank/`
- Modify: `lib/flow.ts` (remove debug console.logs), `app/page.tsx` (landing question-count if it imports the legacy banks)

Each deletion is verified-dead first; **do not delete anything that greps as still imported** — fix the importer first.

- [ ] **Step 1: Verify and delete dead files**

For each target, run the grep, then delete only on a clean result:

```bash
grep -rn "report-visuals" app components lib --include="*.tsx" --include="*.ts"   # expect: no importers
grep -rn "teaser" app components lib --include="*.tsx" --include="*.ts"           # expect: only app/teaser itself
grep -rn "question-bank" app components lib --include="*.tsx" --include="*.ts"    # expect: only teaser/admin/landing-count
```

If `app/page.tsx` imports `lib/question-bank/*` for a question count, replace that usage with a constant `29` (the v2 screen count) or remove the count from the copy — then:

```bash
git rm components/report-visuals.tsx
git rm -r app/teaser app/admin app/api/admin lib/question-bank
```

The admin page is unauthenticated and only edits legacy banks (Decision 18) — deleting, not rewriting.

- [ ] **Step 2: Remove debug logging from `lib/flow.ts`**

Delete the three `console.log` calls in `planNext` (the "planNext Gating Check", "Q20 Gating decision", "Q21 gating decision" logs). Leave the school gating logic itself untouched — it still serves 10th/12th students.

- [ ] **Step 3: Verify**

`npm run typecheck`, `npm run lint`, `npm run build`, `npx vitest run` — all pass. Manual smoke: school registration (`10th_12th`) still walks the legacy flow.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: delete dead legacy surfaces (admin, teaser, report-visuals, superseded banks)"
```

---

### Task 20: Secrets cleanup

**Files:**
- Modify: `.gitignore`
- Untrack (keep on disk): `.env.local`, `.env.production.local`, `database details/`, and hardcoded creds in `sc/alter_table.py`

- [ ] **Step 1: Untrack secret files and ignore them**

```bash
git rm --cached .env.local .env.production.local
git rm -r --cached "database details"
```

Append to `.gitignore`:

```
.env*.local
database details/
```

- [ ] **Step 2: Strip hardcoded creds from `sc/alter_table.py`**

Read the file; replace the inline connection string / password with `os.environ["DATABASE_URL"]` (add `import os`), or if the script is one-shot scratch, `git rm` it entirely with the same untrack treatment.

- [ ] **Step 3: Verify and flag rotation**

`git status` shows the files as untracked/ignored, working tree still builds. Commit message must flag: **the exposed Supabase/DB credentials remain in git history — rotate them in the Supabase dashboard; history rewrite is out of scope for this plan.**

- [ ] **Step 4: Commit**

```bash
git add .gitignore sc/alter_table.py
git commit -m "chore(security): untrack committed secrets and env files — ROTATE exposed DB credentials (still in git history)"
```

---

## Self-Review Notes (already applied)

1. **Spec coverage:** all 13 developer-change-list steps (spec §13) map to tasks — Q0/A7 + retirements (T3/T19), radar formula (T1), slider banding (T2), C1 cards + flag (T4), role resolution (T5), D wiring (T3/T6/T13), fit formula (T9/T10), archetype pipeline (T7), fallback states replacing Hidden Talent (T7/T14/T17), catalog + four cards (T8/T10), verdict engine (T12), flag-driven tips (T11), abroad gate (T13), QA regression + stability (T14). Old Q20/Q21 termination doesn't exist on the v2 path (flow never terminates, T13).
2. **Known copy debt (flag for Nitin, non-blocking):** the 60 career `whatLine`s, the non-✓ core-strength sentences, and the C-branch `category` labels are draft copy; `straplineInstinctive` variants are unwritten (mechanism ships, falls back to base).
3. **Catalog deviation from spec table order:** `risk` careers are ordered Risk Analyst · Internal Auditor · Compliance Officer (spec lists Compliance second) because the worked sample's card 2 is Internal Auditor — sample wins over table order.
4. **Type consistency spot-checks:** `V2Answers` values are `OptionKey[]` everywhere; `resolveRole` returns `ranked` (consumed by `buildCards`); `orderDims` lives in `archetype.ts` and is consumed by `cards.ts`; `bAnswerCount`/`SPENDS` live in `flags.ts` and are consumed by `verdicts.ts` (flags task deliberately precedes verdicts).
5. **Supabase:** v2 answers reuse the existing per-answer upsert path untouched; reports are still client-computed (persisting reports server-side stays out of scope, as today).





