import { describe, it, expect } from "vitest";
import { computeArchetypeV2, DOMAIN_TIEBREAK, orderDims, pairKey, ARCHETYPE_GRID } from "../../lib/v2/archetype";
import type { RadarScores } from "../../lib/v2/types";

const r = (an: number, pe: number, cr: number, en: number, pr: number, le: number): RadarScores => ({
  analytical: an, people: pe, creative: cr, entrepreneurial: en, practical: pr, leadership: le,
});

describe("archetype pipeline", () => {
  it("Ananya: An10 Pr10 tie for first, finance alignment + priority → The Auditor (Hawk with Elephant)", () => {
    const a = computeArchetypeV2(r(10, 4, 6, 6, 10, 4), "finance");
    expect(a.kind).toBe("archetype");
    if (a.kind !== "archetype") return;
    expect(a.primary).toBe("analytical");
    expect(a.secondary).toBe("practical");
    expect(a.name).toBe("The Auditor");
    expect(a.animal).toBe("Hawk");
    expect(a.rendering).toBe("Hawk with an Elephant's discipline");
  });

  it("thin signal: max <= 6 → more_signal, even when flat", () => {
    expect(computeArchetypeV2(r(6, 6, 6, 6, 6, 6), "finance").kind).toBe("more_signal");
  });

  it("thin signal: three zeros → more_signal even with a 10", () => {
    expect(computeArchetypeV2(r(10, 0, 0, 0, 6, 6), "finance").kind).toBe("more_signal");
  });

  it("flat: all >= 6 with a 10, spread <= 4 → explorer", () => {
    expect(computeArchetypeV2(r(10, 6, 6, 6, 6, 6), "finance").kind).toBe("explorer");
  });

  it("near-tie for second breaks by C1 alignment: An10 Pr6 Cr6", () => {
    const fin = computeArchetypeV2(r(10, 4, 6, 4, 6, 4), "finance");     // favours practical
    const tech = computeArchetypeV2(r(10, 4, 6, 4, 6, 4), "technology"); // favours creative
    if (fin.kind !== "archetype" || tech.kind !== "archetype") throw new Error("expected archetypes");
    expect(fin.name).toBe("The Auditor");     // An + Pr
    expect(tech.name).toBe("The Architect");  // An + Cr
  });

  it("falls back to fixed priority with no domain", () => {
    const a = computeArchetypeV2(r(10, 4, 6, 4, 6, 4), null);
    if (a.kind !== "archetype") throw new Error("expected archetype");
    expect(a.secondary).toBe("practical"); // priority: practical before creative
  });

  it("has all 15 pair entries and a symmetric pairKey", () => {
    expect(Object.keys(ARCHETYPE_GRID)).toHaveLength(15);
    expect(pairKey("practical", "analytical")).toBe(pairKey("analytical", "practical"));
  });

  it("orderDims returns all six dims, ordered deterministically", () => {
    const dims = orderDims(r(10, 4, 6, 4, 6, 4), "finance");
    expect(dims).toHaveLength(6);
    expect(dims[0]).toBe("analytical");
    expect(dims[1]).toBe("practical");
  });

  it("tie-break table matches spec §6", () => {
    expect(DOMAIN_TIEBREAK.finance).toEqual(["analytical", "practical"]);
    expect(DOMAIN_TIEBREAK.business).toEqual(["leadership", "practical"]);
    expect(DOMAIN_TIEBREAK.entrepreneurship).toEqual(["entrepreneurial", "creative"]);
    expect(DOMAIN_TIEBREAK.technology).toEqual(["analytical", "creative"]);
    expect(DOMAIN_TIEBREAK.people_society).toEqual(["people", "leadership"]);
  });
});
