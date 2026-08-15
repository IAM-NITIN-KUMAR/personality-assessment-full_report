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
