import { C_BRANCHES } from "../question-bank";
import type { DomainId, RoleId, V2Answers } from "../types";

export function resolveRole(
  domain: DomainId,
  answers: V2Answers,
): { winner: RoleId; scores: Record<RoleId, number>; coCandidate: RoleId | null; ranked: RoleId[] } {
  const branch = C_BRANCHES[domain];
  const scores = {} as Record<RoleId, number>;
  for (const role of branch.roles) scores[role] = 0;

  for (const screen of branch.screens) {
    const key = answers[screen.id]?.[0];
    if (!key) continue;
    const opt = screen.options.find((o) => o.key === key);
    if (!opt) continue;
    for (const [role, w] of Object.entries(opt.weights)) {
      scores[role as RoleId] += w ?? 0;
    }
  }

  // Descending; ties break by branch role order (Decision 12) → deterministic.
  const ranked = [...branch.roles].sort(
    (a, b) => scores[b] - scores[a] || branch.roles.indexOf(a) - branch.roles.indexOf(b),
  );
  const winner = ranked[0];
  const coCandidate = scores[winner] - scores[ranked[1]] <= 1 ? ranked[1] : null;
  return { winner, scores, coCandidate, ranked };
}
