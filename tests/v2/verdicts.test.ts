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

  it("people_society: P-category verdict takes slot 1, then H, then remaining", () => {
    // Hand-derived fired set: L2 (leadership>=8 && people>=8), P2 (B6=a && winner psychology),
    // H4 (E2=e -> health, SPENDS.psychology includes health). Everything else deliberately nulled:
    // B4/B3 != "a" (no V, no P3), domain != finance/technology (no P1), creative/analytical/practical
    // low (no S*, no P4), A1 != "d" (no L1), winner != founder/sales/operator/operations (no V4/L4),
    // C5 != RESPONSIBILITY_C5.people_society="d" (no L3), confTotal > -2 and defaultPathFlag false (no H2/H3).
    const psychAnswers: V2Answers = {
      A1: ["a"], A2: ["a"], A3: ["a"], A4: ["a"], A5: ["a"], A6: ["a"], A7: ["a"],
      B1: ["a"], B2: ["c"], B3: ["c"], B4: ["c"], B5: ["c"], B6: ["a"],
      C5: ["a"],
      D1: ["a"], D2: ["b"],
      E1: ["a"], E2: ["e"], E3: ["a"],
      F1: ["a"], F2: ["b"], F3: ["a"],
    };
    const psychRadar: RadarScores = {
      analytical: 4, people: 8, creative: 4, entrepreneurial: 4, practical: 4, leadership: 8,
    };
    const psychCtx: VerdictContext = {
      answers: psychAnswers,
      radar: psychRadar,
      sliders: computeSliders(psychAnswers),
      domain: "people_society",
      winner: "psychology",
      confTotal: 2,
      defaultPathFlag: false,
    };
    expect(evaluateVerdicts(psychCtx).sort()).toEqual(["H4", "L2", "P2"]);
    const slots = slotVerdicts(psychCtx);
    expect(slots.map((v) => v.id)).toEqual(["P2", "H4", "L2"]);
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
