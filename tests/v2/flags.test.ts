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
