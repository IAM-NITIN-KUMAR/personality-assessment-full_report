import { describe, expect, it } from "vitest";
import { CATALOG } from "../../lib/v2/careers/catalog";
import { computeRadar } from "../../lib/v2/scoring/radar";
import { ANANYA_ANSWERS } from "../../lib/v2/fixtures";
import { CAREER_TAGS } from "../../lib/v2/fp/tags";
import { B_STATEMENTS, CONCLUSION_IDS, fpId, PRE_STEPS } from "../../lib/v2/fp/bank";
import { screenOrder } from "../../lib/v2/flow";
import { assumptions, bandFor, namedInA1, rebuildRoute, resolveGap, environment } from "../../lib/v2/fp/score";
import type { FpAnswers } from "../../lib/v2/fp/score";
import { askedOnly, FP_PAGE_COUNT, nextPostPage, nextPrePage, pageDone, pagesOf, POST_PAGES, PRE_PAGES, stepDone } from "../../lib/v2/fp/steps";
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
  it("the whole test is 29 questions: 3 from the module around the 26 scored ones", () => {
    expect(PRE_PAGES.map((p) => p.id)).toEqual([fpId("A2"), fpId("A3")]);
    expect(POST_PAGES.map((p) => p.id)).toEqual([fpId("C3.gap")]);
    expect(FP_PAGE_COUNT).toBe(3);
    const core = screenOrder({}).filter((id) => id !== "Q0");
    expect(FP_PAGE_COUNT + core.length).toBe(29);
  });
  it("every module question that is asked has worded answers: no 1-to-5 scale, no typing", () => {
    for (const p of [...PRE_PAGES, ...POST_PAGES]) {
      expect(p.kind).toBe("choice");
      expect(p.options.length).toBeGreaterThanOrEqual(3);
      p.options.forEach((o) => expect(o.label).toMatch(/[A-Za-z]{3,}/));
    }
  });
  it("pages are asked one at a time, in order", () => {
    const a: FpAnswers = {};
    PRE_PAGES.forEach((p) => {
      expect(nextPrePage(a)?.id).toBe(p.id);
      expect(pageDone(p, a)).toBe(false);
      a[p.id] = { optionIds: [p.options[0].id] };
      expect(pageDone(p, a)).toBe(true);
    });
    expect(nextPrePage(a)).toBeNull();
    expect(nextPostPage(a)?.id).toBe(fpId("C3.gap"));
  });
  it("a grid question becomes one page per row, stored under the row's id", () => {
    const grid = PRE_STEPS.find((s) => s.kind === "grid")!;
    if (grid.kind !== "grid") throw new Error("expected a grid");
    const rows = pagesOf(PRE_STEPS).filter((p) => p.lead === grid.prompt);
    expect(rows.map((p) => p.id)).toEqual(grid.rows.map((r) => r.id));
    expect(rows.every((p) => p.kind === "scale" && p.options.length === 5)).toBe(true);
    const partial: FpAnswers = { [fpId("A7.career")]: { optionIds: ["2"] } };
    expect(stepDone(grid, partial)).toBe(false);
    expect(pageDone(rows[0], partial)).toBe(true);
    expect(pageDone(rows[1], partial)).toBe(false);
  });
  it("answers the test no longer asks for are ignored, so the Thinking Page is not built", () => {
    const asked = askedOnly(ANANYA_FP);
    expect(Object.keys(asked).sort()).toEqual([fpId("A2"), fpId("A3"), fpId("C3.gap")].sort());
    expect(fpComplete(ANANYA_FP)).toBe(true);
    expect(fpComplete(asked)).toBe(false);
    expect(buildThinking({ fp: asked, radar })).toBeNull();
  });
  it("the test ends after Part C: the conclusions are written on the report, not in the test", () => {
    expect(nextPostPage(ANANYA_FP)).toBeNull();
    expect(CONCLUSION_IDS.some((id) => id in ANANYA_FP)).toBe(false);
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
