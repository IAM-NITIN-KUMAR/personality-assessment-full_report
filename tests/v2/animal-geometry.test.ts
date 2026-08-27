import { describe, it, expect } from "vitest";
import { ANIMAL_ART, PUP_ART, PUP } from "../../lib/v2/animal-geometry";
import { DIM_PRIORITY } from "../../lib/v2/types";
import type { RadarDim } from "../../lib/v2/types";

const INK = "#0a0e1a";
const HEX = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
const PAIR = /^-?\d+(?:\.\d+)?,-?\d+(?:\.\d+)?$/;

const DIMS: RadarDim[] = [...DIM_PRIORITY];

describe("animal geometry data", () => {
  it("has art for all 6 radar dimensions with the canonical viewBox", () => {
    expect(Object.keys(ANIMAL_ART).sort()).toEqual([...DIMS].sort());
    for (const dim of DIMS) {
      expect(ANIMAL_ART[dim].viewBox).toBe("0 0 200 200");
    }
  });

  it.each(DIMS)("%s: every polygon parses to >=3 pairs inside 0-200", (dim) => {
    for (const poly of ANIMAL_ART[dim].polygons) {
      const pairs = poly.points.trim().split(/\s+/);
      expect(pairs.length).toBeGreaterThanOrEqual(3);
      for (const pair of pairs) {
        expect(pair).toMatch(PAIR);
        const [x, y] = pair.split(",").map(Number);
        expect(Number.isFinite(x)).toBe(true);
        expect(Number.isFinite(y)).toBe(true);
        expect(x).toBeGreaterThanOrEqual(0);
        expect(x).toBeLessThanOrEqual(200);
        expect(y).toBeGreaterThanOrEqual(0);
        expect(y).toBeLessThanOrEqual(200);
      }
    }
  });

  it.each(DIMS)("%s: every fill is a valid hex color", (dim) => {
    for (const poly of ANIMAL_ART[dim].polygons) {
      expect(poly.fill).toMatch(HEX);
    }
  });

  it.each(DIMS)("%s: has 25-60 polygons", (dim) => {
    const n = ANIMAL_ART[dim].polygons.length;
    expect(n).toBeGreaterThanOrEqual(25);
    expect(n).toBeLessThanOrEqual(60);
  });

  it.each(DIMS)("%s: includes at least one ink facet", (dim) => {
    expect(ANIMAL_ART[dim].polygons.some((p) => p.fill.toLowerCase() === INK)).toBe(true);
  });

  it("bg values are valid hex and distinct per animal", () => {
    const bgs = DIMS.map((d) => ANIMAL_ART[d].bg);
    for (const bg of bgs) expect(bg).toMatch(HEX);
    expect(new Set(bgs.map((b) => b.toLowerCase())).size).toBe(DIMS.length);
  });
});

// Pup is the Explorer's animal — not bound to a RadarDim, so it lives
// outside ANIMAL_ART but must meet the same geometry contract.
describe("pup geometry data", () => {
  it("has the canonical viewBox", () => {
    expect(PUP_ART.viewBox).toBe("0 0 200 200");
  });

  it("every polygon parses to >=3 pairs inside 0-200", () => {
    for (const poly of PUP_ART.polygons) {
      const pairs = poly.points.trim().split(/\s+/);
      expect(pairs.length).toBeGreaterThanOrEqual(3);
      for (const pair of pairs) {
        expect(pair).toMatch(PAIR);
        const [x, y] = pair.split(",").map(Number);
        expect(Number.isFinite(x)).toBe(true);
        expect(Number.isFinite(y)).toBe(true);
        expect(x).toBeGreaterThanOrEqual(0);
        expect(x).toBeLessThanOrEqual(200);
        expect(y).toBeGreaterThanOrEqual(0);
        expect(y).toBeLessThanOrEqual(200);
      }
    }
  });

  it("every fill is a valid hex color", () => {
    for (const poly of PUP_ART.polygons) {
      expect(poly.fill).toMatch(HEX);
    }
  });

  it("has 25-60 polygons", () => {
    const n = PUP_ART.polygons.length;
    expect(n).toBeGreaterThanOrEqual(25);
    expect(n).toBeLessThanOrEqual(60);
  });

  it("includes at least one ink facet", () => {
    expect(PUP_ART.polygons.some((p) => p.fill.toLowerCase() === INK)).toBe(true);
  });

  it("bg is valid hex and distinct from all six animals", () => {
    expect(PUP_ART.bg).toMatch(HEX);
    const bgs = DIMS.map((d) => ANIMAL_ART[d].bg.toLowerCase());
    expect(bgs).not.toContain(PUP_ART.bg.toLowerCase());
  });

  it("has Explorer-facing copy: name Pup and a non-empty line", () => {
    expect(PUP.name).toBe("Pup");
    expect(PUP.line.length).toBeGreaterThan(20);
  });
});
