import { describe, it, expect } from "vitest";
import { buildReportV2 } from "../../lib/v2/report";
import { ANANYA_ANSWERS, ANANYA_NAME } from "../../lib/v2/fixtures";
import { ANANYA_FP } from "../../lib/v2/fp/fixtures";
import { askedOnly } from "../../lib/v2/fp/steps";
import { gitaLegacyStarters, gitaLegacySummary, gitaReportSummary, gitaStarters } from "../../lib/v2/gita/report-summary";
import { buildReport } from "../../lib/report-data";
import { answerBlocks, helpParts, questionBlocks, toGitaReply, unquotedSources } from "../../lib/v2/gita/chat";
import type { V2Answers } from "../../lib/v2/types";

const EMAIL = "ananya.private@example.com";

function ananya(extra: Partial<Parameters<typeof buildReportV2>[0]> = {}) {
  return buildReportV2({ name: ANANYA_NAME, email: EMAIL, dateISO: "2026-08-15", answers: ANANYA_ANSWERS, ...extra });
}

const THIN: V2Answers = { ...ANANYA_ANSWERS, B1: ["b"], B2: ["c"], B3: ["c"], B4: ["c"], B5: ["b"], B6: ["c"] };

describe("gitaReportSummary", () => {
  it("carries the result, the role and the top career matches of a full report", () => {
    const report = ananya();
    const s = gitaReportSummary(report);
    expect(report.state).toBe("full");
    expect(String(s.result)).toContain(report.yourType.kind === "archetype" ? report.yourType.name : "Explorer");
    expect(s.best_fit_role).toBeTruthy();
    const matches = s.career_matches as { career: string; fit_percent: number }[];
    expect(matches).toHaveLength(2);
    expect(matches[0].career).toBe(report.cards![0].career);
    expect(matches[0].fit_percent).toBe(report.cards![0].fit);
    expect(s.working_style).toHaveLength(report.coreStrengths.filter((c) => c.sentence).length);
    expect(s.next_steps).toEqual([report.nextSteps.counselling, report.nextSteps.exposure, report.nextSteps.conversation]);
  });

  it("never includes the student's name, email or profile ID", () => {
    const report = ananya({ fp: ANANYA_FP });
    const json = JSON.stringify(gitaReportSummary(report));
    expect(json).not.toContain(ANANYA_NAME);
    expect(json).not.toContain(EMAIL);
    expect(json).not.toContain(report.header.profileId);
  });

  it("names no type, role or fit % when there is not enough signal", () => {
    const report = buildReportV2({ name: "X", dateISO: "2026-08-15", answers: THIN });
    expect(report.state).toBe("more_signal");
    const s = gitaReportSummary(report);
    expect(String(s.result)).toContain("Not enough signal");
    expect(s.best_fit_role).toBeUndefined();
    expect(s.career_matches).toBeUndefined();
    expect(s.scores_out_of_10).toBeUndefined();
    expect(s.growth_tips).toBeTruthy();
  });

  it("adds the thinking page once the First Principles module is answered", () => {
    expect(gitaReportSummary(ananya()).thinking_about_next_step).toBeUndefined();
    const s = gitaReportSummary(ananya({ fp: ANANYA_FP }));
    const th = s.thinking_about_next_step as Record<string, unknown>;
    expect(th.where_they_started).toBeTruthy();
    expect(th.plain_next_step).toBeTruthy();
  });

  it("passes on the three starting-point answers when there is no thinking page", () => {
    const s = gitaReportSummary(ananya({ fp: askedOnly(ANANYA_FP) }));
    expect(s.thinking_about_next_step).toBeUndefined();
    const sp = s.starting_point as Record<string, unknown>;
    expect(sp.main_reason_for_their_current_choice).toBeTruthy();
    expect(sp.workplace_they_picture).toBeTruthy();
    expect(Array.isArray(sp.what_they_feel_is_still_missing)).toBe(true);
    expect(JSON.stringify(s).length).toBeLessThan(4000);
    // With the full module answered the thinking page says it instead.
    expect(gitaReportSummary(ananya({ fp: ANANYA_FP })).starting_point).toBeUndefined();
  });

  it("stays small enough for the chat service to read in full", () => {
    // The service reads about 4,000 characters of the rendered report; JSON is the longer form.
    expect(JSON.stringify(gitaReportSummary(ananya({ fp: ANANYA_FP }))).length).toBeLessThan(4000);
    expect(JSON.stringify(gitaReportSummary(ananya())).length).toBeLessThan(4000);
  });
});

describe("gitaStarters", () => {
  it("gives three distinct openers, led by the student's own top two careers", () => {
    const report = ananya();
    const starters = gitaStarters(report);
    expect(starters).toHaveLength(3);
    expect(new Set(starters).size).toBe(3);
    expect(starters[0]).toContain(report.cards![0].career);
    expect(starters[0]).toContain(report.cards![1].career);
  });

  it("does not name careers when there is not enough signal", () => {
    const report = buildReportV2({ name: "X", dateISO: "2026-08-15", answers: THIN });
    const starters = gitaStarters(report);
    expect(starters).toHaveLength(3);
    expect(starters).toContain("I still don't know what I want.");
    expect(starters.some((s) => s.startsWith("I'm torn between"))).toBe(false);
  });

  it("offers the family opener when the family flag fired", () => {
    const report = ananya({ answers: { ...ANANYA_ANSWERS, E3: ["c"] } });
    expect(report.flags.map((f) => f.id)).toContain("family");
    expect(gitaStarters(report).some((s) => s.startsWith("My family"))).toBe(true);
  });
});

describe("reply helpers", () => {
  it("sets a paragraph headed by a bare reference as a quoted verse", () => {
    const blocks = answerBlocks("Here are the closest verses.\n\nGita 2.47\nBut thou hast only the right to work,\nbut none to the fruit thereof.\n\nTry one small step today (Gita 2.40).");
    expect(blocks).toEqual([
      { type: "text", text: "Here are the closest verses." },
      { type: "verse", ref: "Gita 2.47", text: "But thou hast only the right to work, but none to the fruit thereof." },
      { type: "text", text: "Try one small step today (Gita 2.40)." },
    ]);
    expect(unquotedSources(blocks, ["Gita 2.47", "Gita 2.40"])).toEqual(["Gita 2.40"]);
  });

  it("turns numbered lines of a question into options", () => {
    expect(questionBlocks("What is weighing on you most?\n1. Choosing between two paths\n2) Fear of failing\nPick one, or use your own words.")).toEqual([
      { type: "text", text: "What is weighing on you most?" },
      { type: "option", text: "Choosing between two paths" },
      { type: "option", text: "Fear of failing" },
      { type: "text", text: "Pick one, or use your own words." },
    ]);
  });

  it("finds helpline numbers but leaves 24x7 and longer numbers alone", () => {
    const parts = helpParts("Call Tele-MANAS on 14416 (free, 24x7). In danger, call 112.");
    expect(parts.filter((p) => p.type === "phone")).toEqual([
      { type: "phone", number: "14416" },
      { type: "phone", number: "112" },
    ]);
    expect(parts.map((p) => (p.type === "text" ? p.text : p.number)).join("")).toBe("Call Tele-MANAS on 14416 (free, 24x7). In danger, call 112.");
  });

  it("treats an unexpected reply as not found", () => {
    expect(toGitaReply({ kind: "essay", text: 3, sources: "x" })).toEqual({ kind: "not_found", text: "", sources: [] });
    expect(toGitaReply(null)).toEqual({ kind: "not_found", text: "", sources: [] });
    expect(toGitaReply({ kind: "answer", text: "ok", sources: ["Gita 2.47", 5] })).toEqual({ kind: "answer", text: "ok", sources: ["Gita 2.47"] });
    expect(toGitaReply({ kind: "chat", text: "You are welcome.", sources: [] })).toEqual({ kind: "chat", text: "You are welcome.", sources: [] });
  });
});

describe("school report (legacy)", () => {
  const data = buildReport({
    profile: { name: "Riya Mehta", email: "riya.private@example.com", phone: "9000000001", educationLevel: "10th_12th", discipline: "tech_cs", course: "bca" },
    archetype: {
      name: "The Builder",
      tagline: "You build systems, products, and solutions.",
      description: "You thrive when converting ideas into tangible, working systems.",
      scores: [
        { dimension: "decision_style", raw: 5, normalized: 50 },
        { dimension: "energy", raw: -2, normalized: -20 },
        { dimension: "structure", raw: 8, normalized: 80 },
        { dimension: "risk", raw: 4, normalized: 40 },
        { dimension: "social", raw: -3, normalized: -30 },
        { dimension: "drive", raw: 6, normalized: 60 },
      ],
    },
    questions: [],
    answers: {},
  });

  it("carries the result and top degrees, and says the student is in school", () => {
    const s = gitaLegacySummary(data);
    expect(String(s.result)).toContain("The Builder");
    expect(s.student_level).toBe("school student, class 10 to 12");
    const degrees = s.top_degrees as { degree: string; match_percent: number }[];
    expect(degrees.length).toBeGreaterThan(0);
    expect(degrees[0].degree).toBe(data.topDegrees[0].title);
  });

  it("never includes the name, email or phone, and stays small", () => {
    const json = JSON.stringify(gitaLegacySummary(data));
    expect(json).not.toContain("Riya");
    expect(json).not.toContain("riya.private@example.com");
    expect(json).not.toContain("9000000001");
    expect(json.length).toBeLessThan(4000);
  });

  it("gives three distinct openers", () => {
    const starters = gitaLegacyStarters(data);
    expect(starters).toHaveLength(3);
    expect(new Set(starters).size).toBe(3);
  });
});
