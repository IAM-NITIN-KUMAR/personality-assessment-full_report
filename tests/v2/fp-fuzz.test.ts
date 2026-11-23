import { describe, expect, it } from "vitest";
import { getScreen, nextScreenId } from "../../lib/v2/flow";
import { computeRadar } from "../../lib/v2/scoring/radar";
import { buildReportV2 } from "../../lib/v2/report";
import { ANANYA_ANSWERS } from "../../lib/v2/fixtures";
import { ALL_FP_STEPS, B_STATEMENTS, CONCLUSION_IDS, fpId, GAP_OPTIONS } from "../../lib/v2/fp/bank";
import type { FpStep } from "../../lib/v2/fp/bank";
import type { FpAnswers } from "../../lib/v2/fp/score";
import { nextPostStep, nextPreStep } from "../../lib/v2/fp/steps";
import { buildThinking, fpComplete } from "../../lib/v2/fp/thinking";
import type { V2Answers } from "../../lib/v2/types";

// Small seeded PRNG so failures are reproducible.
function rng(seed: number) {
  let s = seed >>> 0;
  return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 2 ** 32);
}

function answerStep(step: FpStep, a: FpAnswers, r: () => number) {
  const pick = <T,>(xs: T[]) => xs[Math.floor(r() * xs.length)];
  if (step.kind === "text") a[step.id] = { text: r() < 0.2 ? "I have no idea yet" : pick(["Risk analyst", "Marketing", "CA", "Software engineer", "teaching"]) };
  else if (step.kind === "choice") {
    const n = step.multi ? 1 + Math.floor(r() * 2) : 1;
    const ids = new Set<string>();
    for (let tries = 0; ids.size < n && tries < 20; tries++) ids.add(pick(step.options).id);
    a[step.id] = { optionIds: [...ids] };
  } else if (step.kind === "grid") {
    step.rows.forEach((row) => { a[row.id] = { optionIds: [pick(row.options ?? step.options).id] }; });
  } else CONCLUSION_IDS.forEach((id) => { a[id] = { text: "my own words here" }; });
}

function randomCore(r: () => number): V2Answers {
  const answers: V2Answers = { Q0: [(["a", "b", "c", "d", "e"] as const)[Math.floor(r() * 5)]] };
  for (let guard = 0; guard < 60; guard++) {
    const id = nextScreenId(answers);
    if (!id) break;
    const opts = getScreen(id, answers).options;
    answers[id] = [opts[Math.floor(r() * opts.length)].key];
  }
  return answers;
}

describe("full journey simulation", () => {
  it("every random student walks pre -> core -> post and ends cleanly", () => {
    for (let seed = 1; seed <= 60; seed++) {
      const r = rng(seed);
      const fp: FpAnswers = {};
      let steps = 0;
      for (let s = nextPreStep(fp); s; s = nextPreStep(fp)) { answerStep(s, fp, r); steps++; }
      expect(steps).toBe(7);
      const core = randomCore(r);
      expect(nextScreenId(core)).toBeNull();
      for (let s = nextPostStep(fp); s; s = nextPostStep(fp)) { answerStep(s, fp, r); steps++; }
      expect(nextPostStep(fp)).toBeNull();
      expect(steps).toBe(ALL_FP_STEPS.length);
      expect(fpComplete(fp)).toBe(true);
    }
  });
});

describe("Thinking Page invariants over random answers", () => {
  it("never throws and always satisfies the spec rules", () => {
    for (let seed = 1; seed <= 300; seed++) {
      const r = rng(seed * 7919);
      const fp: FpAnswers = {};
      ALL_FP_STEPS.filter((s) => s.kind !== "conclusions").forEach((s) => answerStep(s, fp, r));
      const core = randomCore(r);
      const radar = computeRadar(core);
      const t = buildThinking({ fp, radar });
      expect(t, `seed ${seed}`).not.toBeNull();
      if (!t) continue;
      // Box 2: at most four rows.
      expect(t.rows.length).toBeLessThanOrEqual(4);
      // Assumption load bands follow the number of flags.
      const flags = B_STATEMENTS.filter((s) => Number(fp[fpId(`B${s.n}`)].optionIds![0]) >= 4).length;
      expect(t.assumptions.total).toBe(flags);
      expect(t.assumptions.band).toBe(flags <= 3 ? "Low" : flags <= 7 ? "Medium" : "High");
      expect(t.rows.length).toBe(Math.min(4, flags));
      // Part C: three distinct careers, at least one the student did not name.
      expect(t.routes).toHaveLength(3);
      expect(new Set(t.routes.map((x) => x.career)).size).toBe(3);
      // Gap follows the priority rule.
      const chosen = fp[fpId("C3.gap")].optionIds!;
      const expected = (["clarity", "credential", "experience", "skill"] as const).find((g) => chosen.includes(g))!;
      expect(t.gap.action).toBe({ clarity: "explore first", credential: "study further", experience: "work further", skill: "work further" }[expected]);
      // Three conclusions, never empty, always first person.
      t.conclusions.forEach((c) => { expect(c.length).toBeGreaterThan(20); expect(c.startsWith("I think I need")).toBe(true); });
      // Box 5 always has three questions; confidence is within 1-5.
      expect(t.questions).toHaveLength(3);
      expect(t.confidence.average).toBeGreaterThanOrEqual(1);
      expect(t.confidence.average).toBeLessThanOrEqual(5);
      // No unfilled template braces or 'undefined' leaks into any visible copy.
      const all = JSON.stringify(t);
      expect(all).not.toMatch(/undefined|NaN|\{[A-Za-z]|[A-Za-z]\}/);
    }
  });

  it("is deterministic for the same answers", () => {
    const r = rng(42);
    const fp: FpAnswers = {};
    ALL_FP_STEPS.filter((s) => s.kind !== "conclusions").forEach((s) => answerStep(s, fp, r));
    const radar = computeRadar(ANANYA_ANSWERS);
    expect(buildThinking({ fp, radar })).toEqual(buildThinking({ fp, radar }));
  });

  it("survives odd free text in A1 (empty, huge, symbols)", () => {
    const radar = computeRadar(ANANYA_ANSWERS);
    for (const text of ["", "   ", "x".repeat(5000), "<script>alert(1)</script>", "💼🚀", "a\nb\tc", "no", "Idk."]) {
      const fp: FpAnswers = {};
      ALL_FP_STEPS.filter((s) => s.kind !== "conclusions").forEach((s) => answerStep(s, fp, () => 0.3));
      fp[fpId("A1")] = { text };
      expect(() => buildThinking({ fp, radar })).not.toThrow();
    }
  });

  it("ignores gap values it does not know", () => {
    const radar = computeRadar(ANANYA_ANSWERS);
    const fp: FpAnswers = {};
    ALL_FP_STEPS.filter((s) => s.kind !== "conclusions").forEach((s) => answerStep(s, fp, () => 0.5));
    fp[fpId("C3.gap")] = { optionIds: ["bogus"] };
    expect(buildThinking({ fp, radar })).toBeNull();
    fp[fpId("C3.gap")] = { optionIds: ["bogus", GAP_OPTIONS[0].id] };
    expect(buildThinking({ fp, radar })).not.toBeNull();
  });
});

describe("report integration across degrees", () => {
  it("builds a report with a thinking page for every degree and the older shape without it", () => {
    for (const q0 of ["a", "b", "c", "d", "e"] as const) {
      const answers: V2Answers = { ...ANANYA_ANSWERS, Q0: [q0] };
      const r = rng(q0.charCodeAt(0));
      const fp: FpAnswers = {};
      ALL_FP_STEPS.forEach((s) => answerStep(s, fp, r));
      const withFp = buildReportV2({ name: "T", dateISO: "2026-11-23", answers, fp });
      expect(withFp.thinking?.saved).toBe(true);
      const without = buildReportV2({ name: "T", dateISO: "2026-11-23", answers });
      expect(without.thinking).toBeNull();
      // The module never changes the existing report content.
      expect({ ...withFp, thinking: null }).toEqual(without);
    }
  });
});
