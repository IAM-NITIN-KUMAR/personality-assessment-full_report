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
