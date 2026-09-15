import { describe, it, expect } from "vitest";
import { selectJourneys } from "../../lib/v2/journeys/select";
import { JOURNEYS } from "../../lib/v2/journeys/data";

const ids = (r: { id: string }[]) => r.map((j) => j.id);

describe("selectJourneys", () => {
  it("returns nothing for a non-engineering degree", () => {
    expect(selectJourneys({ degree: "commerce", discipline: "commerce", winner: "data", coCandidate: null })).toEqual([]);
    expect(selectJourneys({ degree: "other", winner: "build", coCandidate: null })).toEqual([]);
  });

  it("always returns exactly three journeys for an engineering student", () => {
    const r = selectJourneys({ degree: "engineering", discipline: "tech_cs", course: "bca", winner: "build", coCandidate: null });
    expect(r).toHaveLength(3);
  });

  it("CSE student headed for Build sees three CSE graduates now in software, lowest serial first", () => {
    const r = selectJourneys({ degree: "engineering", discipline: "tech_cs", course: "btech_cse", winner: "build", coCandidate: null });
    expect(ids(r)).toEqual(["05", "06", "07"]);
  });

  it("BCA student headed for Data: own-course data journey first, then role proof over course-only", () => {
    const r = selectJourneys({ degree: "engineering", discipline: "tech_cs", course: "bca", winner: "data", coCandidate: null });
    // 01 Anshul (BCA + data) beats 13 Sourav (data, other course) beats 02 Mansi (BCA, infrastructure).
    expect(ids(r)).toEqual(["01", "13", "02"]);
  });

  it("Mechanical student headed for Build keeps one Mechanical journey and fills with engineers who moved into software", () => {
    const r = selectJourneys({ degree: "engineering", discipline: "tech_engg", course: "btech_mech", winner: "build", coCandidate: null });
    expect(ids(r)).toEqual(["18", "19", "15"]);
    expect(r.some((j) => j.courses.includes("btech_mech"))).toBe(true);
  });

  it("role proof from another course beats same-course journeys that do not prove the role", () => {
    const r = selectJourneys({ degree: "engineering", discipline: "tech_cs", course: "btech_cse", winner: "product_tech", coCandidate: null });
    // 15 Jainam (Mechanical, Technical Program Manager at Tesla) proves product_tech; CSE software engineers fill the rest.
    expect(ids(r)).toEqual(["15", "05", "06"]);
  });

  it("co-candidate role earns a smaller bonus than the winner", () => {
    const r = selectJourneys({ degree: "engineering", discipline: "tech_engg", course: "btech_mech", winner: "build", coCandidate: "product_tech" });
    // 15 Jainam: mech + co-candidate (3+1+3=7) now outranks EEE build-only (1+5=6).
    expect(ids(r)[0]).toBe("15");
  });

  it("without a course, discipline and role decide", () => {
    const r = selectJourneys({ degree: "engineering", discipline: "tech_engg", winner: "infrastructure", coCandidate: null });
    // 21 Mrinmoy proves it inside tech_engg; then role proof from tech_cs beats same-discipline-only.
    expect(ids(r)).toEqual(["21", "02", "09"]);
  });

  it("is deterministic", () => {
    const args = { degree: "engineering" as const, discipline: "tech_cs" as const, course: "btech_cse_cyber", winner: "infrastructure" as const, coCandidate: null };
    expect(ids(selectJourneys(args))).toEqual(ids(selectJourneys(args)));
    expect(ids(selectJourneys(args))).toEqual(["09", "10", "02"]);
  });

  it("only ever returns entries from the data set", () => {
    const r = selectJourneys({ degree: "engineering", discipline: "tech_cs", course: "bsc_ds_ai", winner: "data", coCandidate: null });
    for (const j of r) expect(JOURNEYS).toContain(j);
  });
});
