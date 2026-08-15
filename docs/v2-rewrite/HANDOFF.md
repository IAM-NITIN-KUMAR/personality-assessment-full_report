# Roots & Routes v2 Rewrite — Session Handoff

**Written:** 2026-08-15, by Claude Code (session opened in `secure-steps-2`; work resumes here in `ASSESMENT_REPORT_full`).

**Task:** Rewrite the UG assessment (question set, scoring logic, report structure) against
`C:\Users\Nitin Kumar\Desktop\WORKS\Secure_Steps\Documents&Images\Roots_and_Routes_Master_Build_Spec_v2.pdf` (22 pages).
A full text extraction of the PDF is saved next to this file: `docs/v2-rewrite/spec-v2-extracted.txt`.

**Next step when resuming:** write the full implementation plan (superpowers:writing-plans skill) to
`docs/superpowers/plans/2026-08-15-roots-routes-v2-engine.md`, using this handoff + the spec, then execute it task-by-task.

---

## 1. Which repo is which

- `secure-steps-2` (where the previous session ran) = marketing site only. It links to the assessment at
  `https://personalityassessmentv1.vercel.app` from `app/new-landing/components/{InteractiveFeaturesSection,HeroSection}.tsx`. **Do not change it.**
- **`ASSESMENT_REPORT_full` (this repo) = the assessment. All v2 work happens here.**
  Next.js 15.5 App Router, React 19, TS 5.7 strict, Tailwind, Zustand 5 (persist→localStorage), Supabase JS, @react-pdf/renderer, optional Anthropic adaptive probes. package name `roots-and-routes`; scripts: dev/build/start/lint/typecheck (no test runner — add vitest).
- `ASSESMENT_REPORT_ONEPG` = stale older snapshot, reference only. `Assesment.zip` = archive.

## 2. Spec v2 — the logic in one page

29 screens, sections A–F, one bank for every degree:

- **Q0 intake (unscored):** degree → routing only (C1 default card + career-card feasibility text). Never scores.
- **A1–A7 sliders:** Energy (A1,A2), Decision (A3,A4), Structure (A5,A6), Mobility (A7 only — a global / b national / c conditional / d rooted). Banding: both items same side = Clearly, one = Lean, else Balanced. Never "Clearly" from one data point.
- **B1–B6 pull probes** build the 6-dim radar. Identical reaction scale every time: a=+3 (started solving), b=+1 (want answer, not the working), c=0, d=−2 (energy drop). Dimension score = `(raw + 2) * 2` → a=10, b=6, c=4, d=0. **Delete all normalisation that squeezes scores.** B1 Analytical, B2 People, B3 Creative, B4 Entrepreneurial, B5 Practical, B6 Leadership.
- **C1 menu:** 4 domain cards = seeded rank1, rank2, degree-default, + highest remaining (or lowest as wildcard if default already in top 2). Seeds: Finance=B1+B4 · Business=B2+B5 · Entrepreneurship=B4+B3 · Technology=B5+B1 · People&Society=B6+B2. Picking the degree default when it's outside seeded top-2 → `default_path_flag`.
- **C2–C5 (branch-specific):** 4 roles per domain (20 roles total), weights printed per option in the spec (mostly 3s with a few 1/2 secondaries). Highest role total wins; top two within 1 point → co-candidates, D runs on the higher.
- **D1/D2 confirmation:** role-specific cost + grind statements (20-role table in spec §3/p9). D1: a+2 b+1 c0 d−3; D2 same. `conf_total` ∈ [−6,+4]. ≥+3 confirmed · +1..+2 provisional · ≤0 report leads with the mismatch.
- **E1–E3 roots:** protected anchor, keystone (constraint-conflict flag), family (E3 c/d → family flag; d softens abroad gate).
- **F1–F5 reality/path:** F1 exposure, F2 conversation-gap flag, F3 after-graduation (never terminates — everyone gets a full report, unlike current Q20 termination). **Abroad gate:** `show_abroad = F3 ∈ {higher, undecided} AND A7 ∈ {a, c}`; F4 quotes A7 back; A7 ∈ {b,d} → F4/F5 never render, domestic close. The word "abroad" must not appear before F4.
- **Fit %:** `fit = (role_score/12)*40 + (avg of the 2 radar dims mapped to career /10)*30 + (conf_total+6)*3`; cap 55 + honesty line if conf ≤ −2; clamp 5..95, never 100; **SORT DESCENDING** before render.
- **4 career cards:** 1 top career of winning role · 2 second career (fit −4..8) · 3 cross-branch card from highest radar dim in an unchosen branch · 4 honest low card (degree-default expectation at true fit). 20 roles × 3 careers catalog with Q0-adapted next-step lines (spec §7 p14–15).
- **Animals/archetypes:** Hawk=Analytical, Elephant=Practical, Lion=Leadership, Dolphin=People, Peacock=Creative, Tiger=Entrepreneurial. Order: thin-signal check (max ≤6 or ≥3 zeros → "More Signal Needed": no archetype, no animal, no fit %) → flat check (all six within 4 pts and all ≥4 → The Explorer) → pair top two dims → 15 archetypes (grid in spec §6 p13). Tie for 2nd breaks by C1 domain alignment, then fixed priority An, Pr, People, Cr, En, Le. Deterministic.
- **Verdicts ("We feel"):** 16-line bank (V1–4 venture, L1–4 leadership, S1–4 specialist, P1–4 people, H1–4 honesty), each trigger = 3+ answers across sections; render max 3, winning category first. Bank in spec §8 p16–17.
- **Flags → growth tips:** 8 flags (romanticism, default-path, divergence, preparation gap, conversation gap, family, constraint conflict, thin signal). **Delete the static growth-tips list**; tips render only from fired flags with specifics slotted in; zero flags → two universal tips (exposure + one conversation).
- **Report blocks (§11 p20):** 1 Header · 2 Your Type (animal big + modifier + archetype + strapline keyed to Decision slider) · 3 Core Strengths (4 banded sliders) · 4 Path Fit radar (real peaks/valleys, at least one score under 5) · 5 Career cards ×4 · 6 We Feel (≤3 verdicts) · 7 Growth tips (fired flags only) · 8 Next steps (counselling CTA + exposure + conversation; abroad block only if module ran) · 9 Footer disclaimer. Copy rules: never "test result"/introvert/extrovert/IQ/aptitude claims; every claim in blocks 2/6/7 traces to ≥2 answers.
- **QA gates (spec §13):** Ananya regression (sample report §12 p21 — same answers must always give The Auditor), near-tie stability (An10/Pr8/Cr8 must not flip on one changed answer), no archetype >25% of pilot students.

## 3. Verified against the worked sample (Ananya, §12)

These were checked by hand this session — reuse them in tests:

- B answers `a c b b a c` → radar An10 People4 Cr6 En6 Pr10 Le4 ✓ (formula `(raw+2)*2`).
- C2–C5 `c c c a` in Finance branch → Risk 9, Markets 4 ✓ (C2c = Rk3 Mk1; C3c Rk3; C4c Rk3; C5a Mk3).
- D1 b + D2 b → conf_total +2 ✓. An+Pr pair + Finance tie-break → The Auditor (Hawk with Elephant) ✓.
- **Card fit constants that exactly reproduce the sample's 84/78/71/52** (spec leaves these open; treat as proposed seed values, list them in the plan's "decisions" section):
  - Card 1: full formula with the career's mapped dim pair (Risk Analyst → An+Pr: (9/12)*40 + (10/10)*30 + (2+6)*3 = 84 ✓).
  - Card 2 = card1 − 6 (spec allows −4..−8) → 78 ✓.
  - Card 3 (cross-branch) = round(0.85 × card1) → 71 ✓.
  - Card 4 (honest low) = full formula with its real role_score and a fixed neutral conf component of 15 (i.e. (−1+6)*3): Markets (4/12)*40 + (avg An10,En6 =8 → 24) + 15 = 52 ✓.
- Verdict slotting that matches the sample (S2, H1, H4): slot 1 = highest-priority fired verdict of the winning category (Finance→Specialist), slots 2–3 = fired honesty verdicts in bank order, then backfill other categories. (Note S3 also fires for Ananya but is correctly excluded by this rule.)
- Divergence-flag expectation sets per degree (so the sample doesn't wrongly fire it for a commerce Hawk): engineering {An, Pr} · commerce {Pr, An} · science {An} · arts {Cr, People} · other → never fires.
- H4/constraint table must let finance roles "spend" Health (sample fires Health+Risk).

## 4. Decisions the spec leaves open (resolve in the plan)

1. Per-career radar dim pairs (fit formula needs 2 dims per career; spec only implies them) — seed table needed for all 60 careers, calibration-ready.
2. Cross-branch card lookup: dimension → (domain, career) with fallback when the mapped domain is the chosen one.
3. Degree → default domain map: engineering→Technology, commerce→Business, science→Technology, arts→People&Society, other→no default (slot filled by 3rd seed; default_path_flag never fires).
4. Anchor/keystone → "roles that spend it" table for H4 + constraint-conflict flag.
5. L3 trigger "C5 answer takes responsibility": define the option set per branch.
6. P1 "solo-ish domain": define as Finance & Capital + Technology & Data.
7. Romanticism mild vs strong: mild = exactly 2 b's in Section B; strong = 3+ b's or D1/D2 in c/d.
8. Strapline "variant keyed to Decision slider": grid has one strapline; implement optional instinctive variant field, fall back to base until copy exists.
9. Scope: v2 engine is UG-only; 10th/12th set stays on the legacy path untouched (confirm with Nitin).
10. Old flow's Q20 "terminate assessment" behaviour is **removed** — spec: everyone gets a full report.

## 5. Codebase map (what exists today in this repo)

### Question data
- `ug_question_set.json` (622 L) — current 25-question UG bank, 5 sections, gate Q20 + conditional Q21–25 (Q23 multi-select). **No scores in the JSON** — weights live separately in `flow.ts`. To be replaced by the 29-screen v2 bank.
- `10th_12th_question_set.json` (618 L) — school variant, same shape. Leave on legacy path.
- `lib/question-bank/{roots,context,routes-bca}.ts` — legacy superseded banks; only used by landing-page count, `/teaser`, and the admin API. Delete after rewiring.
- There is **no "Set 2"** literal in code; the spec's "old Set 2 items Q1,Q2,Q3,Q4,Q5,Q8,Q10×2,Q14" map to `ug_question_set.json` IDs.

### Flow & state
- `lib/flow.ts` (342 L) — `getQuestionBank(educationLevel)`, `planNext()`, `totalQuestionCountFor()`; contains `UG_SCORES`/`SCHOOL_SCORES` weight maps (only 12 of 25 UG questions scored; Q8–Q14 + abroad never score). Section-name remap: work_environment→"skill_check", career_specific→"dream_big", abroad_element→"passport_era". Leftover console.logs at 268/276/285. Q20 gate keys off section, not question id (fragile).
- `lib/store.ts` (154 L) — Zustand persist key `"roots-and-routes-assessment"`; `answer()` upserts to Supabase `student_answers` (fire-and-forget); `computeArchetype()`.
- `lib/types.ts` (138 L) — `Dimension` = decision_style|energy|structure|risk|social|drive (old 6-axis model, replaced by v2 radar+sliders), `Question`, `Answer`, `StudentProfile` (has `educationLevel`, `discipline`), `Archetype`.

### Scoring (all to be replaced)
- `lib/archetype.ts` (134 L) — `computeDimensionScores` (normalises to ±100 — spec kills this), `pickArchetype` over 6 old archetypes (Builder/Strategist/Connector/Maverick/Anchor/Explorer — no animals). Bug: multi-select scores as single-select.
- `lib/report-data.ts` (**2170 L — split hard**) — `buildReport()`; `buildMatchScore` (78..96 cover fit — replaced by v2 fit engine), `scoreCourse` (baseline-70 course fit), role clusters **tech_cs only, "Coming soon" for 13/14 disciplines**, 15 preference sliders, aptitudes, env fit, traits, `buildCommonCareerPaths` (~360 L hardcoded tables), Hidden Talent if-ladder (line ~1971 — spec: replace with the two fallback states), `extractEngagement` (abroad readiness over Q5/Q13/Q17/Q21/Q24/Q25 — replaced by A7+F3 gate), `nextSteps()`.
- `lib/course-catalog.ts` (1211 L) — 14 disciplines, 50+ courses with dim weights. v2 replaces with 20-role × 3-career catalog; keep file for the school path.

### UI
- `app/page.tsx` (336 L) — landing + registration; inserts Supabase `students` row (omits `education_level` — known bug); default discipline tech_cs.
- `app/assessment/page.tsx` (591 L — split; ~115 L of inline Cloud SVG decoration; duplicates section order a 3rd time).
- `components/node-graph/{assessment-graph,question-card,trunk-chip,reaction-bar}.tsx` — card stage, single/multi/short-text rendering, reactions.
- `app/report/page.tsx` (176 L) — hydration guard, `?mock=true` fixture, PDF download.
- `components/report-view.tsx` (**1116 L — split**) — 3-page report; **growth tips are 3 hardcoded JSX tips, identical for everyone** (L735–767; mirrored in `lib/report-pdf.tsx:1123`) — spec deletes this. "YOUR NEXT STEPS" also hardcoded while `report-data.ts` computes a parallel unused version.
- `lib/report-pdf.tsx` (**1662 L — split**) — react-pdf document, local fonts.
- `components/report-visuals.tsx` (297 L) — **dead code, nothing imports it. Delete.**
- `app/teaser/page.tsx` (325 L) — orphaned route. `app/admin/page.tsx` (697 L) + `app/api/admin/questions/route.ts` — unauthenticated, edits only the legacy banks; decide rewrite-or-delete.

### Backend
- Supabase only (`lib/supabase.ts`, hardcoded placeholder fallbacks). Writes: `students` insert on registration, `student_answers` upsert per answer. **No read path; reports never persisted** — recomputed client-side from localStorage. `/thank-you` wipes the store.
- `app/api/probe/route.ts` — Anthropic adaptive probes (model `claude-3-5-haiku-20241022` default), returns `{skip:true}` without a key.
- **Security cleanup:** committed secrets — `.env.local`, `.env.production.local`, `database details/databasepass.txt`, `sc/alter_table.py` (plaintext DB creds); unauthenticated file-writing admin route.

## 6. Proposed v2 file structure (for the plan)

```
lib/v2/
  types.ts            # AnswerSet, RadarDimension, Domain, RoleId, bands, ReportV2
  question-bank.ts    # 29 screens incl. 5 C-branches + 20-role D statement table (copy verbatim from spec)
  scoring/radar.ts    # B scoring: (raw+2)*2
  scoring/sliders.ts  # Clearly/Lean/Balanced banding + Mobility
  scoring/domains.ts  # seeds, C1 card selection, default_path_flag
  scoring/roles.ts    # C2–C5 weight summing, co-candidates
  scoring/confirmation.ts
  archetype.ts        # thin-signal → flat → pair → tie-breaks; 6 animals, 15 archetypes + 2 fallbacks
  careers/catalog.ts  # 20 roles × 3 careers, Q0 feasibility next-step variants, dim pairs
  careers/fit.ts      # fit formula, cap 55, clamp 5..95
  careers/cards.ts    # 4-card selector (primary/secondary/cross-branch/honest-low), sort desc
  verdicts.ts         # 16 triggers, max-3 slotting
  flags.ts            # 8 flags + tip templates + 2 universal fallbacks
  gate.ts             # abroad gate
  report.ts           # buildReportV2() orchestrator
tests: vitest, one file per module + ananya.regression.test.ts (spec §12) + near-tie stability test
```

UI: rewire `app/assessment` for 29 screens (C1 card select, D statement injection by winning role, E/F, gated F4/F5), rebuild report view + PDF around the 9 blocks.
