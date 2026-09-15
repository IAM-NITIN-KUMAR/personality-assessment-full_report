import { describe, it, expect } from "vitest";
import { JOURNEYS } from "../../lib/v2/journeys/data";
import { CATALOG } from "../../lib/v2/careers/catalog";
import { COURSES } from "../../lib/course-catalog";
import type { RoleId } from "../../lib/v2/types";

const COURSE_IDS = new Set(COURSES.map((c) => c.id));

describe("journeys data", () => {
  it("holds the 28 named, bachelor-listed profiles from the tech & engineering roadmap", () => {
    expect(JOURNEYS).toHaveLength(28);
    const ids = JOURNEYS.map((j) => j.id);
    expect(new Set(ids).size).toBe(28);
    for (const j of JOURNEYS) {
      expect(j.name, j.id).not.toMatch(/not provided/i);
    }
  });

  it("every journey is tagged with real course ids and a tech discipline", () => {
    for (const j of JOURNEYS) {
      expect(j.courses.length, j.id).toBeGreaterThan(0);
      for (const c of j.courses) expect(COURSE_IDS.has(c), `${j.id}: ${c}`).toBe(true);
      expect(["tech_cs", "tech_engg"]).toContain(j.discipline);
    }
  });

  it("proves-roles only name technology-domain roles from the catalog", () => {
    for (const j of JOURNEYS) {
      for (const r of j.proves) {
        expect(CATALOG[r as RoleId]?.domain, `${j.id}: ${r}`).toBe("technology");
      }
    }
  });

  it("every journey has the four timeline steps, at least one skill and a narrative", () => {
    for (const j of JOURNEYS) {
      for (const k of ["degree", "firstJob", "bridge", "now"] as const) {
        expect(j.steps[k].length, `${j.id}.${k}`).toBeGreaterThan(3);
      }
      expect(j.skills.length, j.id).toBeGreaterThan(0);
      expect(j.story.length, j.id).toBeGreaterThan(40);
    }
  });

  it("every technology role has at least one journey proving it", () => {
    for (const role of ["build", "data", "product_tech", "infrastructure"] as const) {
      expect(JOURNEYS.some((j) => j.proves.includes(role)), role).toBe(true);
    }
  });
});
