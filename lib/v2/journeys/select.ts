import type { Discipline } from "../../course-catalog";
import type { Degree, RoleId } from "../types";
import { JOURNEYS } from "./data";
import type { Journey } from "./data";

export const JOURNEY_COUNT = 3;

/** Calibration seeds: role proof (5) strictly beats same-course + same-discipline (3 + 1). */
const W = { course: 3, discipline: 1, winner: 5, coCandidate: 3 } as const;

export interface SelectJourneysArgs {
  degree: Degree;
  discipline?: Discipline;
  course?: string;
  winner: RoleId;
  coCandidate: RoleId | null;
}

function score(j: Journey, a: SelectJourneysArgs): number {
  let s = 0;
  if (a.course && j.courses.includes(a.course)) s += W.course;
  if (a.discipline && j.discipline === a.discipline) s += W.discipline;
  if (j.proves.includes(a.winner)) s += W.winner;
  if (a.coCandidate && j.proves.includes(a.coCandidate)) s += W.coCandidate;
  return s;
}

/**
 * Picks the three real journeys that best prove the student's winning career, preferring their own
 * course. Engineering degrees only (the roadmap covers technology and engineering); otherwise [].
 * Guarantees at least one same-course journey when the data has one. Deterministic: ties break on
 * roadmap serial.
 */
export function selectJourneys(a: SelectJourneysArgs): Journey[] {
  if (a.degree !== "engineering") return [];

  const ranked = JOURNEYS
    .map((j) => ({ j, s: score(j, a) }))
    .sort((x, y) => y.s - x.s || x.j.id.localeCompare(y.j.id));

  const top = ranked.slice(0, JOURNEY_COUNT);
  const ownCourse = (e: { j: Journey }) => Boolean(a.course && e.j.courses.includes(a.course));
  if (a.course && !top.some(ownCourse)) {
    const best = ranked.find(ownCourse);
    if (best) top[JOURNEY_COUNT - 1] = best;
  }
  return top.map((e) => e.j);
}
