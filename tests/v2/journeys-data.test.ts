import { describe, it, expect } from "vitest";
import { JOURNEYS } from "../../lib/v2/journeys/data";
import { CATALOG } from "../../lib/v2/careers/catalog";
import { COURSES } from "../../lib/course-catalog";
import type { RoleId } from "../../lib/v2/types";

const COURSE_IDS = new Set(COURSES.map((c) => c.id));

/**
 * Organisations that appeared in the original LinkedIn-sourced profiles. These are company and
 * university names, not personal data — they are listed here purely so the scrub cannot regress.
 */
const NAMED_ORGS = [
  "McKinsey", "Shell", "Tata Consultancy", "Cognizant", "Accenture", "Deloitte", "Tech Mahindra",
  "Amazon", "Google", "Apple", "Microsoft", "Tesla", "Rivian", "Cisco", "Qualcomm", "Broadcom",
  "Lam Research", "Microchip", "Numem", "State Street", "Samsung", "Mercedes", "Harman",
  "Flux Auto", "BASF", "Jaguar", "McLaren", "Aston Martin", "Honda", "Hyundai", "Ashok Leyland",
  "Bharat Heavy Electricals", "Defence Research and Development", "Cummins", "Lowe's", "Forcura",
  "Tiger Analytics", "Aptiv", "Stellantis", "Dometic", "Faurecia", "Stargate", "ZF Group",
  "SmithGroup", "Office Depot", "TK Elevator", "Dakia", "Stay Inc", "Bell", "Electrono",
  "VirGo", "Blue Barrel", "Stier Racing", "Christ University", "Punjabi University", "Jaypee",
  "CMR College", "SRM", "Amrita", "West Bengal University", "Vellore Institute", "NIIT University",
  "Alliance University", "Abdul Kalam", "Mahatma Gandhi University", "Ramaiah", "Sri Venkateswara",
  "Mohandas", "Galgotias", "Birla Institute", "Babasaheb Ambedkar", "Maulana Azad",
  "Indian Institute of Technology", "National Institute of Technology", "Purdue", "Boston University",
  "Texas A&M", "University of Texas", "University of Pennsylvania", "Georgia Institute",
  "University of Washington", "North Carolina", "Michigan-Dearborn", "Wichita", "Brunel", "Leeds",
  "Imperial College", "Siegen", "Ingolstadt", "Centennial", "Cégep", "Saarang",
];


describe("journeys data", () => {
  it("holds the 28 anonymised, bachelor-listed profiles from the tech & engineering roadmap", () => {
    expect(JOURNEYS).toHaveLength(28);
    const ids = JOURNEYS.map((j) => j.id);
    expect(new Set(ids).size).toBe(28);
  });

  it("labels every journey by degree and batch, never by a person", () => {
    for (const j of JOURNEYS) {
      expect(j.label, j.id).toMatch(/^(BCA|B\.Tech|B\.Sc|BA|BCom|BBA|Bachelor)[A-Za-z.&(),\s]* graduate(, \d{4} batch)?$/);
    }
  });

  it("names no employer or institution anywhere in the profile text", () => {
    for (const j of JOURNEYS) {
      const text = [j.label, j.story, ...Object.values(j.steps), ...j.skills].join(" | ");
      for (const org of NAMED_ORGS) {
        expect(text.includes(org), `${j.id} leaks "${org}"`).toBe(false);
      }
    }
  });

  it("writes every story in the anonymous third person, with no gendered pronouns", () => {
    for (const j of JOURNEYS) {
      expect(j.story, j.id).not.toMatch(/\b(he|she|his|her|hers|him)\b/i);
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
