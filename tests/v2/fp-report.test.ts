import { describe, expect, it } from "vitest";
import { buildReportV2 } from "../../lib/v2/report";
import { ANANYA_ANSWERS } from "../../lib/v2/fixtures";
import { ANANYA_FP } from "../../lib/v2/fp/fixtures";

const base = { name: "Ananya", dateISO: "2026-11-23", answers: ANANYA_ANSWERS };

describe("report with the First Principles module", () => {
  it("has no thinking page without module answers (older sessions keep working)", () => {
    expect(buildReportV2(base).thinking).toBeNull();
    expect(buildReportV2({ ...base, fp: {} }).thinking).toBeNull();
  });
  it("adds the thinking page once the module is answered", () => {
    const r = buildReportV2({ ...base, fp: ANANYA_FP });
    expect(r.thinking?.routes).toHaveLength(3);
    expect(r.thinking?.conclusions).toHaveLength(3);
  });
});
