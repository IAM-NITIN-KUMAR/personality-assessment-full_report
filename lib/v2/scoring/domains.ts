import { DOMAIN_ORDER } from "../types";
import type { Degree, DomainId, RadarDim, RadarScores } from "../types";

export const DOMAIN_SEEDS: Record<DomainId, [RadarDim, RadarDim]> = {
  finance: ["analytical", "entrepreneurial"],
  business: ["people", "practical"],
  entrepreneurship: ["entrepreneurial", "creative"],
  technology: ["practical", "analytical"],
  people_society: ["leadership", "people"],
};

export const DEGREE_DEFAULT: Record<Degree, DomainId | null> = {
  engineering: "technology",
  commerce: "business",
  science: "technology",
  arts: "people_society",
  other: null,
};

export function seedScores(radar: RadarScores): Record<DomainId, number> {
  const out = {} as Record<DomainId, number>;
  for (const d of DOMAIN_ORDER) {
    const [x, y] = DOMAIN_SEEDS[d];
    out[d] = radar[x] + radar[y];
  }
  return out;
}

/** Descending by seed score; ties break by fixed DOMAIN_ORDER (Decision 12). */
export function rankDomains(radar: RadarScores): DomainId[] {
  const scores = seedScores(radar);
  return [...DOMAIN_ORDER].sort(
    (a, b) => scores[b] - scores[a] || DOMAIN_ORDER.indexOf(a) - DOMAIN_ORDER.indexOf(b),
  );
}

export function selectC1Cards(
  radar: RadarScores,
  degree: Degree,
): { cards: DomainId[]; seededTop2: DomainId[] } {
  const ranked = rankDomains(radar);
  const [r1, r2, r3] = ranked;
  const lowest = ranked[ranked.length - 1];
  const def = DEGREE_DEFAULT[degree];
  const seededTop2: DomainId[] = [r1, r2];

  if (def && def !== r1 && def !== r2) {
    const highestRemaining = ranked.find((d) => d !== r1 && d !== r2 && d !== def)!;
    return { cards: [r1, r2, def, highestRemaining], seededTop2 };
  }
  // Default already visible (or no default): third seed + lowest-seeded wildcard.
  return { cards: [r1, r2, r3, lowest], seededTop2 };
}

export function computeDefaultPathFlag(
  chosen: DomainId,
  degree: Degree,
  seededTop2: DomainId[],
): boolean {
  const def = DEGREE_DEFAULT[degree];
  return def !== null && chosen === def && !seededTop2.includes(def);
}
