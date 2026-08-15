import { describe, it, expect } from "vitest";
import { buildReportV2, profileIdFor } from "../../lib/v2/report";
import { ANANYA_ANSWERS } from "../../lib/v2/fixtures";
import type { V2Answers } from "../../lib/v2/types";

describe("buildReportV2 states", () => {
  it("more_signal: no cards, no verdicts, thin-signal tip present", () => {
    const thin: V2Answers = {
      ...ANANYA_ANSWERS,
      B1: ["b"], B2: ["c"], B3: ["c"], B4: ["c"], B5: ["b"], B6: ["c"], // max 6 → thin
    };
    const r = buildReportV2({ name: "X", dateISO: "2026-08-15", answers: thin });
    expect(r.state).toBe("more_signal");
    expect(r.cards).toBeNull();
    expect(r.verdicts).toEqual([]);
    expect(r.flags.map((f) => f.id)).toContain("thin_signal");
  });

  it("zero flags → exactly the two universal tips", () => {
    // Ananya with only one b-reaction (romanticism off), autonomous family, real exposure,
    // conversations done. E1 stays Money (not spent by risk), primary dim stays Analytical
    // (inside the commerce expectation) and her C1 card list is unchanged → zero flags.
    const clean: V2Answers = {
      ...ANANYA_ANSWERS,
      B3: ["c"],                 // b-count drops to 1 → romanticism off
      E3: ["a"], F1: ["c"], F2: ["d"],
    };
    const r = buildReportV2({ name: "X", dateISO: "2026-08-15", answers: clean });
    expect(r.flags).toHaveLength(0);
    expect(r.growthTips).toHaveLength(2);
  });

  it("no abroad block when the gate fails", () => {
    const rooted = buildReportV2({
      name: "X", dateISO: "2026-08-15",
      answers: { ...ANANYA_ANSWERS, A7: ["d"], F4: undefined, F5a: undefined, F5b: undefined, F5c: undefined },
    });
    expect(rooted.nextSteps.abroad).toBeUndefined();
  });

  it("profile id is deterministic and formatted SS-MMYYYY-NNNN", () => {
    const id = profileIdFor("Ananya", "a@b.c", "2026-08-15");
    expect(id).toMatch(/^SS-082026-\d{4}$/);
    expect(profileIdFor("Ananya", "a@b.c", "2026-08-15")).toBe(id);
  });
});
