import { describe, it, expect } from "vitest";
import { COURSES, DISCIPLINES, coursesByDiscipline, courseById } from "../../lib/course-catalog";
import type { Discipline } from "../../lib/course-catalog";
import { DIMENSION_LABELS } from "../../lib/types";

const DIMENSIONS = new Set(Object.keys(DIMENSION_LABELS));
const DISCIPLINE_IDS = new Set(DISCIPLINES.map((d) => d.id));

const masters = COURSES.filter((c) => c.level === "masters");
const bachelors = COURSES.filter((c) => (c.level ?? "bachelors") === "bachelors");

/**
 * Masters offered per discipline, as the picker lists them. Every stream but Business counts one
 * extra for the cross-disciplinary MBA, which any bachelor's can lead to.
 */
const MASTERS_PER_DISCIPLINE: Partial<Record<Discipline, number>> = {
  tech_cs: 7,
  tech_engg: 7,
  business: 6,
  commerce: 6,
  science: 7,
  economics: 5,
  psychology: 5,
  humanities: 7,
  media: 6,
  law: 5,
  design_arch: 6,
  education: 4,
  hospitality: 4,
};

describe("course catalog", () => {
  it("holds 63 masters programs alongside the 68 bachelors", () => {
    expect(masters).toHaveLength(63);
    expect(bachelors).toHaveLength(68);
  });

  it("gives every enrollable discipline its own masters shelf", () => {
    for (const [discipline, count] of Object.entries(MASTERS_PER_DISCIPLINE)) {
      const found = coursesByDiscipline(discipline as Discipline).filter((c) => c.level === "masters");
      expect(found.length, discipline).toBe(count);
    }
  });

  it("offers the MBA in every stream, exactly once", () => {
    for (const d of DISCIPLINES) {
      const listed = coursesByDiscipline(d.id).filter((c) => c.id === "mba");
      expect(listed.length, d.id).toBe(1);
      expect(listed[0].level, d.id).toBe("masters");
    }
  });

  it("leaks no other course across streams", () => {
    for (const d of DISCIPLINES) {
      for (const c of coursesByDiscipline(d.id)) {
        if (c.crossDiscipline) continue;
        expect(c.discipline, `${c.id} listed under ${d.id}`).toBe(d.id);
      }
    }
  });

  it("marks only genuinely cross-disciplinary courses", () => {
    const cross = COURSES.filter((c) => c.crossDiscipline).map((c) => c.id);
    expect(cross).toEqual(["mba"]);
  });

  it("keeps ids and titles unique and resolvable", () => {
    const ids = COURSES.map((c) => c.id);
    const titles = COURSES.map((c) => c.title);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(titles).size).toBe(titles.length);
    for (const c of COURSES) expect(courseById(c.id), c.id).toBe(c);
  });

  it("files every course under a real discipline with a described identity", () => {
    for (const c of COURSES) {
      expect(DISCIPLINE_IDS.has(c.discipline), `${c.id}: ${c.discipline}`).toBe(true);
      expect(c.id, c.id).toMatch(/^[a-z0-9_]+$/);
      expect(c.title.trim().length, c.id).toBeGreaterThan(3);
      expect(c.description.trim().length, c.id).toBeGreaterThan(30);
    }
  });

  it("names 3-5 careers with a salary band for every course", () => {
    for (const c of COURSES) {
      expect(c.careers.length, c.id).toBeGreaterThanOrEqual(3);
      expect(c.careers.length, c.id).toBeLessThanOrEqual(5);
      for (const career of c.careers) {
        expect(career.role.trim().length, `${c.id}: role`).toBeGreaterThan(2);
        expect(career.salaryIndia.trim().length, `${c.id}: ${career.role}`).toBeGreaterThan(2);
      }
    }
  });

  it("weights only real dimensions, within 0..1", () => {
    for (const c of COURSES) {
      for (const [dim, value] of Object.entries(c.weights ?? {})) {
        expect(DIMENSIONS.has(dim), `${c.id}: ${dim}`).toBe(true);
        expect(value, `${c.id}: ${dim}`).toBeGreaterThan(0);
        expect(value, `${c.id}: ${dim}`).toBeLessThanOrEqual(1);
      }
    }
  });

  it("labels each course with the qualification its discipline actually awards", () => {
    for (const c of COURSES) {
      const prefix = c.title.split(/[\s—(]/)[0];
      expect(prefix, c.id).not.toBe("");
      // A BBA-stream course must not be titled as a BCom degree, and vice versa.
      if (c.id.startsWith("bba_")) expect(c.title, c.id).not.toMatch(/^BCom/);
      if (c.id.startsWith("bcom_")) expect(c.title, c.id).not.toMatch(/^BBA/);
    }
  });
});
