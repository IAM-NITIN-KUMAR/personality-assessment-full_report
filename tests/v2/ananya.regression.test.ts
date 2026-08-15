import { describe, it, expect } from "vitest";
import { buildReportV2 } from "../../lib/v2/report";
import { ANANYA_ANSWERS, ANANYA_NAME } from "../../lib/v2/fixtures";

const input = { name: ANANYA_NAME, email: "ananya@example.com", dateISO: "2026-08-15", answers: ANANYA_ANSWERS };

describe("Ananya regression (spec §12) — same answers, same Auditor, every run", () => {
  const report = buildReportV2(input);

  it("is The Auditor: Hawk with an Elephant's discipline", () => {
    expect(report.state).toBe("full");
    expect(report.yourType.kind).toBe("archetype");
    if (report.yourType.kind !== "archetype") return;
    expect(report.yourType.name).toBe("The Auditor");
    expect(report.yourType.rendering).toBe("Hawk with an Elephant's discipline");
  });

  it("radar: An 10 · Pr 10 · Cr 6 · En 6 · People 4 · Le 4", () => {
    expect(report.radar).toEqual({
      analytical: 10, practical: 10, creative: 6, entrepreneurial: 6, people: 4, leadership: 4,
    });
  });

  it("core strengths: Clearly Reflective, Clearly Deliberate, Lean Structured, Conditional mover", () => {
    expect(report.coreStrengths.map((s) => s.heading)).toEqual([
      "Clearly Reflective", "Clearly Deliberate", "Lean Structured", "Conditional mover",
    ]);
  });

  it("cards: 84 / 78 / 71 / 52, descending", () => {
    expect(report.cards!.map((c) => c.fit)).toEqual([84, 78, 71, 52]);
    expect(report.cards![0].career).toBe("Risk Analyst");
    expect(report.cards![2].career).toBe("Data Analyst");
  });

  it("verdicts: S2, H1, H4", () => {
    expect(report.verdicts.map((v) => v.id)).toEqual(["S2", "H1", "H4"]);
  });

  it("flags: romanticism, conversation_gap, family — three growth tips", () => {
    expect(report.flags.map((f) => f.id).sort()).toEqual(["conversation_gap", "family", "romanticism"]);
    expect(report.growthTips).toHaveLength(3);
  });

  it("abroad block present (gate passed, F4 open) and shaped by Money/Health", () => {
    expect(report.nextSteps.abroad).toBeDefined();
    expect(report.nextSteps.abroad).toContain("funded, affordable");
    expect(report.nextSteps.abroad).toContain("sane working cultures");
    expect(report.nextSteps.counselling).toContain("family");
  });

  it("is deterministic: two runs produce identical reports", () => {
    expect(buildReportV2(input)).toEqual(buildReportV2(input));
    expect(report.header.profileId).toBe(buildReportV2(input).header.profileId);
  });
});
