import type { Discipline } from "../../course-catalog";
import type { Degree, RoleId } from "../types";
import { JOURNEYS } from "./data";
import type { Journey } from "./data";

export const JOURNEY_COUNT = 6;

/**
 * Minimum score a journey must reach to be shown at all. Three is the cost of proving the
 * student's co-candidate role, or of being their own course — sharing only a discipline (1) is
 * not relevance. This, not the degree label, decides who sees journeys: a commerce student
 * heading for a data career sees the graduates who prove that career.
 */
export const RELEVANCE_FLOOR = 3;

const COUNT_WORDS = ["No", "One", "Two", "Three", "Four", "Five", "Six"];

/**
 * Opening sentence for the journeys section, shared by the web report and the PDF so the copy can
 * never drift from how many cards actually render.
 */
export function journeyIntroLead(n: number): string {
  const word = COUNT_WORDS[n] ?? String(n);
  return n === 1
    ? word + " real graduate who started where you are."
    : word + " real graduates who started where you are.";
}


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
 * Picks the journeys that best prove the student's winning career, preferring their own course.
 * Relevance gates the section, not the degree: anything below RELEVANCE_FLOOR is dropped, so a
 * student whose career no journey proves sees none at all. Guarantees at least one same-course
 * journey when the data has one. Deterministic: ties break on roadmap serial.
 */
export function selectJourneys(a: SelectJourneysArgs): Journey[] {
  const ranked = JOURNEYS
    .map((j) => ({ j, s: score(j, a) }))
    .filter((e) => e.s >= RELEVANCE_FLOOR)
    .sort((x, y) => y.s - x.s || x.j.id.localeCompare(y.j.id));

  const top = ranked.slice(0, JOURNEY_COUNT);
  const ownCourse = (e: { j: Journey }) => Boolean(a.course && e.j.courses.includes(a.course));
  // Only needed when the list was truncated — a shorter list already holds every relevant journey.
  if (a.course && top.length === JOURNEY_COUNT && !top.some(ownCourse)) {
    const best = ranked.find(ownCourse);
    if (best) top[JOURNEY_COUNT - 1] = best;
  }
  return top.map((e) => e.j);
}
