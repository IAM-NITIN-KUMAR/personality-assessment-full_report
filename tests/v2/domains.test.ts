import { describe, it, expect } from "vitest";
import {
  DOMAIN_SEEDS, DEGREE_DEFAULT, seedScores, rankDomains, selectC1Cards, computeDefaultPathFlag,
} from "../../lib/v2/scoring/domains";
import type { RadarScores } from "../../lib/v2/types";

const ananya: RadarScores = {
  analytical: 10, people: 4, creative: 6, entrepreneurial: 6, practical: 10, leadership: 4,
};

describe("domain seeds and C1 cards", () => {
  it("computes seed scores from the seed pairs", () => {
    expect(seedScores(ananya)).toEqual({
      finance: 16,          // B1 An 10 + B4 En 6
      business: 14,         // B2 Pe 4 + B5 Pr 10
      entrepreneurship: 12, // En 6 + Cr 6
      technology: 20,       // Pr 10 + An 10
      people_society: 8,    // Le 4 + Pe 4
    });
  });

  it("ranks Ananya's domains technology > finance > business > entrepreneurship > people_society", () => {
    expect(rankDomains(ananya)).toEqual([
      "technology", "finance", "business", "entrepreneurship", "people_society",
    ]);
  });

  it("commerce student: default (business) outside top 2 → cards are r1, r2, default, highest remaining", () => {
    const { cards, seededTop2 } = selectC1Cards(ananya, "commerce");
    expect(seededTop2).toEqual(["technology", "finance"]);
    expect(cards).toEqual(["technology", "finance", "business", "entrepreneurship"]);
  });

  it("engineering student: default (technology) inside top 2 → 3rd seed + lowest as wildcard", () => {
    const { cards } = selectC1Cards(ananya, "engineering");
    expect(cards).toEqual(["technology", "finance", "business", "people_society"]);
  });

  it("degree 'other': no default card, wildcard fills slot 4", () => {
    expect(DEGREE_DEFAULT.other).toBeNull();
    const { cards } = selectC1Cards(ananya, "other");
    expect(cards).toEqual(["technology", "finance", "business", "people_society"]);
  });

  it("fires default_path_flag only when picking a default that was outside seeded top 2", () => {
    const { seededTop2 } = selectC1Cards(ananya, "commerce");
    expect(computeDefaultPathFlag("business", "commerce", seededTop2)).toBe(true);
    expect(computeDefaultPathFlag("finance", "commerce", seededTop2)).toBe(false);
    // Ananya picked finance (seeded rank 2 for her before ties — actually rank 1 of the non-tech seeds): no flag
    expect(computeDefaultPathFlag("technology", "engineering", ["technology", "finance"])).toBe(false);
  });

  it("seed pairs match spec §4 step 3", () => {
    expect(DOMAIN_SEEDS).toEqual({
      finance: ["analytical", "entrepreneurial"],
      business: ["people", "practical"],
      entrepreneurship: ["entrepreneurial", "creative"],
      technology: ["practical", "analytical"],
      people_society: ["leadership", "people"],
    });
  });
});
