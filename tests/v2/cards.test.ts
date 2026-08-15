import { describe, it, expect } from "vitest";
import { buildCards } from "../../lib/v2/careers/cards";
import type { RadarScores, RoleId } from "../../lib/v2/types";

const ananyaRadar: RadarScores = {
  analytical: 10, people: 4, creative: 6, entrepreneurial: 6, practical: 10, leadership: 4,
};
const ananyaScores = { markets: 4, deals: 0, risk: 9, advisory: 0 } as Record<RoleId, number>;

const ananyaArgs = {
  domain: "finance" as const,
  radar: ananyaRadar,
  roleScores: ananyaScores,
  ranked: ["risk", "markets", "deals", "advisory"] as RoleId[],
  winner: "risk" as RoleId,
  coCandidate: null,
  conf: 2,
  degree: "commerce" as const,
};

describe("buildCards", () => {
  it("reproduces the sample 84 / 78 / 71 / 52, sorted descending", () => {
    const cards = buildCards(ananyaArgs);
    expect(cards.map((c) => [c.career, c.fit])).toEqual([
      ["Risk Analyst", 84],
      ["Internal Auditor", 78],
      ["Data Analyst", 71],
      ["Equity Research Analyst", 52],
    ]);
    expect(cards.map((c) => c.kind)).toEqual(["primary", "secondary", "cross_branch", "honest_low"]);
  });

  it("adapts the cross-branch next step for a commerce student", () => {
    const cards = buildCards(ananyaArgs);
    const cross = cards.find((c) => c.kind === "cross_branch")!;
    expect(cross.nextStep).toContain("open to non-CS");
  });

  it("uses the co-candidate's top career for card 2 and ranked[2] for card 4", () => {
    const cards = buildCards({
      ...ananyaArgs,
      roleScores: { markets: 6, deals: 6, risk: 2, advisory: 0 } as Record<RoleId, number>,
      ranked: ["markets", "deals", "risk", "advisory"] as RoleId[],
      winner: "markets",
      coCandidate: "deals",
    });
    expect(cards.find((c) => c.kind === "secondary")!.role).toBe("deals");
    expect(cards.find((c) => c.kind === "honest_low")!.role).toBe("risk");
  });

  it("attaches the honesty line and 55 cap when conf <= -2", () => {
    const cards = buildCards({ ...ananyaArgs, conf: -2 });
    const primary = cards.find((c) => c.kind === "primary")!;
    expect(primary.fit).toBeLessThanOrEqual(55);
    expect(primary.honestyLine).toBe(
      "The pull is real. The daily cost is the problem, and you told us so yourself.",
    );
  });

  it("always returns 4 cards sorted descending", () => {
    const cards = buildCards(ananyaArgs);
    expect(cards).toHaveLength(4);
    for (let i = 1; i < cards.length; i++) expect(cards[i - 1].fit).toBeGreaterThanOrEqual(cards[i].fit);
  });
});
