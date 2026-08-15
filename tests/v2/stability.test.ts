import { describe, it, expect } from "vitest";
import { buildReportV2 } from "../../lib/v2/report";
import { ANANYA_ANSWERS, ANANYA_NAME } from "../../lib/v2/fixtures";
import type { V2Answers } from "../../lib/v2/types";

// Spec §13 near-tie gate, on the quantized scale: An 10 with Pr 6 / Cr 6 tied for second.
const nearTie: V2Answers = {
  ...ANANYA_ANSWERS,
  B2: ["c"], B3: ["b"], B4: ["c"], B5: ["b"], B6: ["c"], // An10 People4 Cr6 En4 Pr6 Le4
};
const name = (a: V2Answers) => {
  const t = buildReportV2({ name: ANANYA_NAME, dateISO: "2026-08-15", answers: a }).yourType;
  return t.kind === "archetype" ? t.name : t.kind;
};

describe("near-tie stability — must not flip on one changed unrelated answer", () => {
  it("finance branch resolves the Pr/Cr tie to The Auditor", () => {
    expect(name(nearTie)).toBe("The Auditor");
  });

  it("stays The Auditor when one unrelated answer changes", () => {
    expect(name({ ...nearTie, A1: ["a"] })).toBe("The Auditor");
    expect(name({ ...nearTie, F2: ["d"] })).toBe("The Auditor");
    expect(name({ ...nearTie, E1: ["a"] })).toBe("The Auditor");
  });

  it("technology branch resolves the same radar to The Architect, stably", () => {
    // Same reactions, C1 = a (her top seeded card is technology)
    const tech: V2Answers = { ...nearTie, C1: ["a"], C2: ["b"], C3: ["b"], C4: ["b"], C5: ["b"] };
    expect(name(tech)).toBe("The Architect");
    expect(name({ ...tech, A6: ["a"] })).toBe("The Architect");
  });
});
