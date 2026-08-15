import { orderDims } from "../archetype";
import { ROLE_LABELS } from "../types";
import type { CareerCard, Degree, DomainId, RadarScores, RoleId } from "../types";
import { CATALOG, CROSS_BRANCH, nextStepFor } from "./catalog";
import { NEUTRAL_CONF_COMPONENT, clampFit, computeFit } from "./fit";

export const CONF_HONESTY_LINE =
  "The pull is real. The daily cost is the problem, and you told us so yourself.";

export function buildCards(args: {
  domain: DomainId;
  radar: RadarScores;
  roleScores: Record<RoleId, number>;
  ranked: RoleId[];
  winner: RoleId;
  coCandidate: RoleId | null;
  conf: number;
  degree: Degree;
}): CareerCard[] {
  const { domain, radar, roleScores, ranked, winner, coCandidate, conf, degree } = args;

  // Card 1 — primary
  const winEntry = CATALOG[winner];
  const c1 = computeFit({ roleScore: roleScores[winner], radar, dims: winEntry.dims, conf });
  const card1: CareerCard = {
    kind: "primary",
    role: winner,
    career: winEntry.careers[0].name,
    fit: c1.fit,
    whatLine: winEntry.careers[0].whatLine,
    nextStep: nextStepFor(winner, 0, degree),
    ...(c1.capped ? { honestyLine: CONF_HONESTY_LINE } : {}),
  };

  // Card 2 — secondary: co-candidate's top career after a tie, else winner's second career
  const card2Role = coCandidate ?? winner;
  const card2Index = coCandidate ? 0 : 1;
  const card2: CareerCard = {
    kind: "secondary",
    role: card2Role,
    career: CATALOG[card2Role].careers[card2Index].name,
    fit: clampFit(c1.fit - 6),
    whatLine: CATALOG[card2Role].careers[card2Index].whatLine,
    nextStep: nextStepFor(card2Role, card2Index, degree),
  };

  // Card 4 — honest low: highest non-winning role not already on card 2
  const lowRole = ranked.find((r) => r !== winner && r !== (coCandidate ?? undefined))!;
  const lowEntry = CATALOG[lowRole];
  const lowRadarAvg = (radar[lowEntry.dims[0]] + radar[lowEntry.dims[1]]) / 2;
  const card4: CareerCard = {
    kind: "honest_low",
    role: lowRole,
    career: lowEntry.careers[0].name,
    fit: clampFit((roleScores[lowRole] / 12) * 40 + lowRadarAvg * 3 + NEUTRAL_CONF_COMPONENT),
    whatLine: `The pull is real (${ROLE_LABELS[lowRole]} ${roleScores[lowRole]}), but your reactions point elsewhere. Shown so you know why it's ranked low.`,
    nextStep: nextStepFor(lowRole, 0, degree),
  };

  // Card 3 — cross-branch: highest radar dim from a branch the student did not choose
  const used = new Set([card1.career, card2.career, card4.career]);
  let card3: CareerCard | null = null;
  for (const dim of orderDims(radar, domain)) {
    const target = CROSS_BRANCH[dim];
    if (target.domain === domain) continue;
    const career = CATALOG[target.role].careers[0];
    if (used.has(career.name)) continue;
    card3 = {
      kind: "cross_branch",
      role: target.role,
      career: career.name,
      fit: clampFit(Math.round(0.85 * c1.fit)),
      whatLine: career.whatLine,
      nextStep: nextStepFor(target.role, 0, degree),
    };
    break;
  }

  const cards = [card1, card2, card3!, card4];
  // SORT DESCENDING BEFORE RENDER, always (spec §7).
  return cards.sort((a, b) => b.fit - a.fit);
}
