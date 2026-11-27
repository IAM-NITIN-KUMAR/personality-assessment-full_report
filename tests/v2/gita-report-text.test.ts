// Ported from the render_report tests of the Python service (tests/test_chat.py).
import { describe, it, expect } from "vitest";
import { isIdentifierKey, renderReport } from "../../lib/v2/gita/report-text";

describe("renderReport", () => {
  it.each([[null], [{}], [{ name: "x" }], [{ a: null, b: [], c: {} }]])("is empty when there is nothing to say: %j", (report) => {
    expect(renderReport(report)).toBe("");
  });

  it("handles nesting and humanises keys", () => {
    const text = renderReport({
      _note: "internal",
      test_name: "Pathfinder",
      scores: [
        { area: "Logical reasoning", score: 82 },
        { area: "Verbal", score: 55 },
      ],
      topStrengths: ["drawing", "patience"],
      suggested_paths: { first_choice: "Design", also_fits: ["Engineering"] },
      retake: false,
      summary: "Line one.\nLine two.",
    });
    const lines = text.split("\n");
    expect(lines).toContain("Test name: Pathfinder");
    expect(lines).toContain("Scores:");
    expect(lines).toContain("  - Area: Logical reasoning; Score: 82");
    expect(lines).toContain("Top strengths: drawing, patience");
    expect(lines).toContain("Suggested paths:");
    expect(lines).toContain("  First choice: Design");
    expect(lines).toContain("  Also fits: Engineering");
    expect(lines).toContain("Retake: no");
    expect(lines).toContain("Summary: Line one. Line two.");
    expect(text).not.toContain("internal");
  });

  it("keeps names that are not personal", () => {
    const text = renderReport({ test_name: "T", stream_name: "Science", father_name: "X", school_name: "Y" });
    expect(text.split("\n")).toEqual(["Test name: T", "Stream name: Science"]);
  });

  it("leaves out identifier keys at every level", () => {
    // the report from test_identifier_keys_never_reach_the_prompt, rendered directly
    const text = renderReport({
      student_name: "Asha Verma",
      Name: "Asha V.",
      EMAIL: "asha@example.com",
      phone: "9999900000",
      id: "ID-12345",
      roll_no: "R-777",
      studentId: "SID-42",
      profile: { date_of_birth: "2009-01-02", home_address: "12 Lake Road", grade: "10" },
      test_name: "Pathfinder",
    });
    expect(text.split("\n")).toEqual(["Profile:", "  Grade: 10", "Test name: Pathfinder"]);
  });
});

describe("isIdentifierKey", () => {
  it.each(["student_name", "Name", "EMAIL", "phone", "id", "roll_no", "studentId", "date_of_birth", "home_address", "father_name", "school_name"])(
    "treats %j as personal",
    (key) => {
      expect(isIdentifierKey(key)).toBe(true);
    },
  );

  it.each(["emailid", "phoneNumber", "_note", "_meta", "", "__"])("treats %j as personal or internal", (key) => {
    expect(isIdentifierKey(key)).toBe(true);
  });

  it.each(["test_name", "stream_name", "grade", "topStrengths", "suggested_paths", "summary", "best_fit_role"])(
    "keeps %j",
    (key) => {
      expect(isIdentifierKey(key)).toBe(false);
    },
  );
});
