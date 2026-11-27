import { describe, expect, it } from "vitest";
import { planReport, score, sheetsNeeded, SIZES } from "../../lib/v2/report-pdf-scale";
import type { Plan } from "../../lib/v2/report-pdf-scale";

const SHEET = 774;

/** Row heights at every size, for rows that are `at1` tall at the designed size and grow as type does. */
const grown = (at1: number[], sizes: readonly number[] = SIZES) => sizes.map((k) => at1.map((h) => h * k ** 1.7));

/** What each sheet of a plan holds: its rows' total height at the size the plan gives them. */
function sheetsOf(plan: Plan, heights: number[][], sizes: readonly number[] = SIZES): number[] {
  const used: number[] = [];
  plan.sizes.forEach((size, i) => {
    if (i === 0 || plan.breaks.has(i)) used.push(0);
    used[used.length - 1] += heights[sizes.indexOf(size)][i];
  });
  return used;
}

describe("sheetsNeeded", () => {
  it("fills each sheet until the next row does not fit", () => {
    expect(sheetsNeeded([], SHEET)).toBe(0);
    expect(sheetsNeeded([300, 300, 174], SHEET)).toBe(1);
    expect(sheetsNeeded([300, 300, 175], SHEET)).toBe(2);
    expect(sheetsNeeded([400, 400, 400], SHEET)).toBe(3);
  });

  it("gives a row taller than a sheet one to itself", () => {
    expect(sheetsNeeded([900], SHEET)).toBe(1);
    expect(sheetsNeeded([100, 900, 100], SHEET)).toBe(3);
  });
});

describe("planReport", () => {
  const shapes: Record<string, number[]> = {
    "a short report": [32, 114, 136, 289, 106, 88, 95, 78, 163, 128],
    "a standard report": [32, 114, 136, 289, 106, 88, 95, 78, 163, 128, 109, 170, 56, 106],
    "a report with six journeys": [32, 114, 136, 289, 106, 88, 95, 78, 163, 128, 225, 139, 140, 145, 176, 163, 109, 170, 56, 106],
    "many small rows": Array.from({ length: 40 }, (_, i) => 40 + (i % 5) * 9),
  };

  for (const [name, rows] of Object.entries(shapes)) {
    it(`never puts more on a sheet than it holds: ${name}`, () => {
      const heights = grown(rows);
      const plan = planReport(heights, SHEET);
      const used = sheetsOf(plan, heights);
      expect(used).toHaveLength(plan.sheets);
      used.forEach((u) => expect(u).toBeLessThanOrEqual(SHEET + 0.001));
    });

    it(`leaves little of its sheets empty: ${name}`, () => {
      const heights = grown(rows);
      const plan = planReport(heights, SHEET);
      const used = sheetsOf(plan, heights);
      expect(plan.empty).toBeCloseTo(1 - used.reduce((a, b) => a + b, 0) / (plan.sheets * SHEET), 6);
      expect(plan.empty).toBeLessThan(0.08);
    });

    it(`gives every row a size, the rows of a sheet the same one: ${name}`, () => {
      const plan = planReport(grown(rows), SHEET);
      expect(plan.sizes).toHaveLength(rows.length);
      plan.sizes.forEach((size, i) => {
        expect(SIZES).toContain(size);
        if (i > 0 && !plan.breaks.has(i)) expect(size).toBe(plan.sizes[i - 1]);
      });
      expect(plan.breaks.has(0)).toBe(false);
      expect(plan.breaks.size).toBe(plan.sheets - 1);
    });

    it(`keeps the sheets within three steps of size of one another: ${name}`, () => {
      const plan = planReport(grown(rows), SHEET);
      const at = plan.sizes.map((size) => SIZES.indexOf(size));
      expect(Math.max(...at) - Math.min(...at)).toBeLessThanOrEqual(3);
    });
  }

  it("shares the room between the sheets rather than leaving it all on the last", () => {
    // Filled as they fall, the first sheet would take three rows (750) and the last the other two (240).
    const heights = grown([250, 250, 250, 120, 120], [1]);
    const plan = planReport(heights, SHEET, [1]);
    expect(plan.sheets).toBe(2);
    expect(sheetsOf(plan, heights, [1])).toEqual([500, 490]);
    expect(plan.empty).toBeCloseTo(1 - 990 / (2 * SHEET), 6);
  });

  it("sets a sheet larger when its rows would otherwise leave it short", () => {
    // One sheet's worth of rows that fill 70% of it at the designed size.
    const heights = grown([180, 180, 180]);
    const plan = planReport(heights, SHEET);
    expect(plan.sheets).toBe(1);
    expect(plan.sizes[0]).toBeGreaterThan(1);
    expect(plan.empty).toBeLessThan(0.08);
  });

  it("sets a report smaller when that saves a nearly empty sheet", () => {
    // Just over two sheets at the designed size.
    const heights = grown([390, 390, 390, 390, 60]);
    const plan = planReport(heights, SHEET);
    expect(plan.sheets).toBe(2);
    expect(Math.max(...plan.sizes)).toBeLessThan(1);
  });

  it("prefers the size nearer the designed one when two plans are equally full", () => {
    const full = (size: number): Plan => ({ sizes: [size], breaks: new Set(), sheets: 1, empty: 0.02 });
    expect(score(full(1.02))).toBeLessThan(score(full(1.3)));
    expect(score(full(0.98))).toBeLessThan(score(full(0.9)));
  });

  it("copes with a single row, and refuses none", () => {
    const plan = planReport(grown([200]), SHEET);
    expect(plan.sheets).toBe(1);
    expect(plan.breaks.size).toBe(0);
    expect(() => planReport(grown([]), SHEET)).toThrow();
  });
});
