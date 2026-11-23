import { describe, expect, it } from "vitest";
import { CATALOG } from "../../lib/v2/careers/catalog";
import { computeRadar } from "../../lib/v2/scoring/radar";
import { ANANYA_ANSWERS } from "../../lib/v2/fixtures";
import { CAREER_TAGS } from "../../lib/v2/fp/tags";
import { B_STATEMENTS, fpId, POST_STEPS, PRE_STEPS } from "../../lib/v2/fp/bank";
import { assumptions, bandFor, namedInA1, rebuildRoute, resolveGap, environment } from "../../lib/v2/fp/score";
import type { FpAnswers } from "../../lib/v2/fp/score";
import { nextPostStep, nextPreStep, stepDone } from "../../lib/v2/fp/steps";
import { buildThinking, fpComplete } from "../../lib/v2/fp/thinking";
import { ANANYA_FP } from "../../lib/v2/fp/fixtures";

const radar = computeRadar(ANANYA_ANSWERS);

describe("career tags", () => {
  it("tags all 60 catalogue careers", () => {
    expect(CAREER_TAGS).toHaveLength(60);
    const names = Object.values(CATALOG).flatMap((r) => r.careers.map((c) => c.name));
    expect(CAREER_TAGS.map((t) => t.career)).toEqual(names);
  });
  it("every dial is within 1-5", () => {
    CAREER_TAGS.forEach((t) => t.dials.forEach((d) => { expect(d).toBeGreaterThanOrEqual(1); expect(d).toBeLessThanOrEqual(5); }));
  });
});

describe("Part B assumptions", () => {
  it("bands: 0-3 Low, 4-7 Medium, 8-12 High", () => {
    expect([0, 3, 4, 7, 8, 12].map(bandFor)).toEqual(["Low", "Low", "Medium", "Medium", "High", "High"]);
  });
  it("flags only 4 and 5, counts per group", () => {
    const r = assumptions(ANANYA_FP);
    expect(r.flagged).toEqual([1, 4, 10, 11]);
    expect(r.band).toBe("Medium");
    expect(r.byGroup).toEqual({ career: { flags: 2, of: 5 }, work: { flags: 0, of: 4 }, next: { flags: 2, of: 3 } });
  });
  it("adds the reason note only with 2+ flags in the matching group", () => {
    const r = assumptions(ANANYA_FP); // A2 family + 2 career flags; A6 family + 2 next flags
    expect(r.reasonNotes.map((n) => n.group)).toEqual(["career", "next"]);
    expect(r.reasonNotes[0].text).toBe("Your current choice may rest mainly on family expectations. Let's check it.");
    const one: FpAnswers = { ...ANANYA_FP, [fpId("B4")]: { optionIds: ["2"] } };
    expect(assumptions(one).reasonNotes.map((n) => n.group)).toEqual(["next"]);
  });
  it("reasons that are not borrowed never add a note", () => {
    const a: FpAnswers = { ...ANANYA_FP, [fpId("A2")]: { optionIds: ["interest"] } };
    expect(assumptions(a).reasonNotes.map((n) => n.group)).not.toContain("career");
  });
});

describe("Part C route rebuild", () => {
  it("returns three distinct roles with at least one career the student did not name", () => {
    const { matches } = rebuildRoute(ANANYA_FP, radar);
    expect(matches).toHaveLength(3);
    expect(new Set(matches.map((m) => m.role)).size).toBe(3);
    expect(matches.some((m) => m.isNew)).toBe(true);
  });
  it("puts the best five-part match first", () => {
    const { matches } = rebuildRoute(ANANYA_FP, radar);
    expect(matches[0].role).toBe("risk"); // analyse/systems/discipline/company/mastery
    expect(matches[0].matched).toHaveLength(5);
  });
  it("forces a fresh career in when all top three were named", () => {
    const a: FpAnswers = { ...ANANYA_FP, [fpId("A1")]: { text: "Risk Analyst, Strategy Analyst or Data Analyst" } };
    const { matches } = rebuildRoute(a, radar);
    expect(matches.some((m) => m.isNew)).toBe(true);
  });
  it("detects a named career, and ignores 'no idea'", () => {
    expect(namedInA1("Risk Analyst", "I want to be a risk analyst")).toBe(true);
    expect(namedInA1("Risk Analyst", "I have no idea yet")).toBe(false);
    expect(namedInA1("Risk Analyst", "chartered accountancy")).toBe(false);
  });
});

describe("environment and gap", () => {
  it("describes standout dials, strongest first", () => {
    const env = environment(ANANYA_FP)!;
    // Ananya: pace 2, structure 2, company 4, security 2, contact 2, size 4. Ties keep dial order.
    expect(env.description).toBe("steady-paced, structured, team-based");
    expect(env.standouts).toHaveLength(3);
  });
  it("says flexible when every dial is in the middle", () => {
    const mid: FpAnswers = { ...ANANYA_FP };
    ["pace", "structure", "company", "security", "contact", "size"].forEach((d) => { mid[fpId(`C2.${d}`)] = { optionIds: ["3"] }; });
    expect(environment(mid)!.description).toBe("flexible");
  });
  it("clears clarity before credential before experience before skill", () => {
    const g = (...v: string[]) => resolveGap({ [fpId("C3.gap")]: { optionIds: v } })!;
    expect(g("skill", "experience").gap).toBe("experience");
    expect(g("experience", "credential").gap).toBe("credential");
    expect(g("credential", "clarity", "skill").gap).toBe("clarity");
    expect(g("clarity").action).toBe("explore first");
    expect(g("credential").action).toBe("study further");
  });
});

describe("step flow", () => {
  it("walks Part A in order and then nothing is left before the main test", () => {
    const a: FpAnswers = {};
    const seen: string[] = [];
    for (let s = nextPreStep(a); s; s = nextPreStep(a)) {
      seen.push(s.id);
      if (s.kind === "text") a[s.id] = { text: "x" };
      else if (s.kind === "choice") a[s.id] = { optionIds: [s.options[0].id] };
      else if (s.kind === "grid") s.rows.forEach((r) => { a[r.id] = { optionIds: ["3"] }; });
    }
    expect(seen).toEqual(PRE_STEPS.map((s) => s.id));
  });
  it("a grid is only done when every row is answered", () => {
    const grid = PRE_STEPS.find((s) => s.kind === "grid")!;
    const partial: FpAnswers = { [fpId("A7.career")]: { optionIds: ["2"] } };
    expect(stepDone(grid, partial)).toBe(false);
  });
  it("ends on the conclusions step", () => {
    expect(POST_STEPS[POST_STEPS.length - 1].kind).toBe("conclusions");
    // Everything before the conclusions is answered, so that is the next open step.
    expect(nextPostStep(ANANYA_FP)?.kind).toBe("conclusions");
  });
});

describe("Thinking Page", () => {
  it("is null until the module is answered", () => {
    expect(fpComplete({})).toBe(false);
    expect(buildThinking({ fp: {}, radar })).toBeNull();
  });
  it("builds Ananya's page", () => {
    const t = buildThinking({ fp: ANANYA_FP, radar })!;
    expect(t.started).toContain("leaning towards Chartered accountancy, mainly because your family suggested it");
    expect(t.confidence.average).toBeCloseTo(2.3, 1);
    expect(t.rows.length).toBeGreaterThan(0);
    expect(t.rows.length).toBeLessThanOrEqual(4);
    // Ananya ticked clarity and experience: clarity is cleared first.
    expect(t.conclusions[2]).toContain("explore first");
    expect(t.conclusions[2]).toContain("clarity about the route");
    expect(t.conclusions[2]).toContain("will also need hands-on experience");
    expect(t.saved).toBe(false);
    expect(t.questions).toHaveLength(3);
    expect(t.tests.route).toContain(t.routes[0].career);
  });
  it("uses the saved conclusions once the student has written them", () => {
    const saved: FpAnswers = {
      ...ANANYA_FP,
      [fpId("D.1")]: { text: "mine one" }, [fpId("D.2")]: { text: "mine two" }, [fpId("D.3")]: { text: "mine three" },
    };
    const t = buildThinking({ fp: saved, radar })!;
    expect(t.saved).toBe(true);
    expect(t.conclusions).toEqual(["mine one", "mine two", "mine three"]);
  });
  it("shows no belief rows when nothing is flagged", () => {
    const calm: FpAnswers = { ...ANANYA_FP };
    B_STATEMENTS.forEach((s) => { calm[fpId(`B${s.n}`)] = { optionIds: ["2"] }; });
    const t = buildThinking({ fp: calm, radar })!;
    expect(t.rows).toEqual([]);
    expect(t.assumptions.band).toBe("Low");
  });
});
