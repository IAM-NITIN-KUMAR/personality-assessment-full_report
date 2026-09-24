import { describe, it, expect } from "vitest";
import { selectJourneys, JOURNEY_COUNT, RELEVANCE_FLOOR } from "../../lib/v2/journeys/select";
import type { SelectJourneysArgs } from "../../lib/v2/journeys/select";
import { JOURNEYS } from "../../lib/v2/journeys/data";
import type { Journey } from "../../lib/v2/journeys/data";

const ids = (r: { id: string }[]) => r.map((j) => j.id);

/** Mirrors the documented weights: course 3, discipline 1, winner 5, co-candidate 3. */
function expectedScore(j: Journey, a: SelectJourneysArgs): number {
  let s = 0;
  if (a.course && j.courses.includes(a.course)) s += 3;
  if (a.discipline && j.discipline === a.discipline) s += 1;
  if (j.proves.includes(a.winner)) s += 5;
  if (a.coCandidate && j.proves.includes(a.coCandidate)) s += 3;
  return s;
}

describe("selectJourneys", () => {
  it("shows up to six journeys", () => {
    expect(JOURNEY_COUNT).toBe(6);
    const r = selectJourneys({ degree: "engineering", discipline: "tech_cs", course: "bca", winner: "build", coCandidate: null });
    expect(r).toHaveLength(6);
  });

  it("never shows a journey that is merely same-discipline — relevance decides", () => {
    const args: SelectJourneysArgs[] = [
      { degree: "engineering", discipline: "tech_cs", course: "btech_cse", winner: "build", coCandidate: null },
      { degree: "engineering", discipline: "tech_engg", course: "btech_mech", winner: "product_tech", coCandidate: "build" },
      { degree: "commerce", discipline: "commerce", winner: "data", coCandidate: null },
      { degree: "science", winner: "build", coCandidate: null },
    ];
    for (const a of args) {
      for (const j of selectJourneys(a)) {
        expect(expectedScore(j, a), `${j.id} for ${a.degree}/${a.winner}`).toBeGreaterThanOrEqual(RELEVANCE_FLOOR);
      }
    }
  });

  it("shows relevant tech journeys to a non-engineering student whose winning role they prove", () => {
    const r = selectJourneys({ degree: "commerce", discipline: "commerce", winner: "data", coCandidate: null });
    expect(r.length).toBeGreaterThan(0);
    for (const j of r) expect(j.proves, j.id).toContain("data");
  });

  it("shows nothing when no journey is relevant to the student", () => {
    // A degree and discipline with no journeys, and a winning role no journey proves.
    const r = selectJourneys({ degree: "arts", discipline: "humanities", winner: "psychology", coCandidate: null });
    expect(r).toEqual([]);
  });

  it("ranks by score, breaking ties on roadmap serial", () => {
    const a: SelectJourneysArgs = { degree: "engineering", discipline: "tech_engg", course: "btech_mech", winner: "build", coCandidate: "product_tech" };
    const r = selectJourneys(a);
    const scored = r.map((j) => ({ id: j.id, s: expectedScore(j, a) }));
    for (let i = 1; i < scored.length; i++) {
      const prev = scored[i - 1];
      const cur = scored[i];
      // Either strictly lower score, or equal score with a higher serial. The same-course
      // guarantee may substitute the final slot, so it is exempt from the ordering rule.
      if (i < scored.length - 1) {
        expect(prev.s >= cur.s, `${prev.id}(${prev.s}) before ${cur.id}(${cur.s})`).toBe(true);
        if (prev.s === cur.s) expect(prev.id < cur.id).toBe(true);
      }
    }
  });

  it("puts the strongest proof first", () => {
    expect(ids(selectJourneys({ degree: "engineering", discipline: "tech_cs", course: "btech_cse", winner: "build", coCandidate: null }))[0]).toBe("05");
    expect(ids(selectJourneys({ degree: "engineering", discipline: "tech_cs", course: "bca", winner: "data", coCandidate: null }))[0]).toBe("01");
    // Role proof from another course beats same-course journeys that do not prove the role.
    expect(ids(selectJourneys({ degree: "engineering", discipline: "tech_cs", course: "btech_cse", winner: "product_tech", coCandidate: null }))[0]).toBe("15");
    // The co-candidate bonus lifts a same-course journey above a role-only match.
    expect(ids(selectJourneys({ degree: "engineering", discipline: "tech_engg", course: "btech_mech", winner: "build", coCandidate: "product_tech" }))[0]).toBe("15");
  });

  it("keeps at least one same-course journey when the data has one", () => {
    const r = selectJourneys({ degree: "engineering", discipline: "tech_engg", course: "btech_mech", winner: "build", coCandidate: null });
    expect(r.some((j) => j.courses.includes("btech_mech"))).toBe(true);
  });

  it("is deterministic", () => {
    const args: SelectJourneysArgs = { degree: "engineering", discipline: "tech_cs", course: "btech_cse_cyber", winner: "infrastructure", coCandidate: null };
    expect(ids(selectJourneys(args))).toEqual(ids(selectJourneys(args)));
  });

  it("only ever returns entries from the data set, without repeats", () => {
    const r = selectJourneys({ degree: "engineering", discipline: "tech_cs", course: "bsc_ds_ai", winner: "data", coCandidate: null });
    const known = new Set(JOURNEYS.map((j) => j.id));
    for (const j of r) expect(known.has(j.id), j.id).toBe(true);
    expect(new Set(ids(r)).size).toBe(r.length);
  });
});
