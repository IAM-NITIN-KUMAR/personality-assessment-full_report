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
