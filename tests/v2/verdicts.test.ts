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
