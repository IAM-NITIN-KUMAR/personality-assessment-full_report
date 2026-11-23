import { CATALOG } from "../careers/catalog";
import type { RadarDim, RoleId } from "../types";
import type { Dial, Gap, Part } from "./bank";

// DRAFT tagging of the 60-career catalogue for Part C ("Break it down").
// Tags sit at role level (every role holds 3 careers); only the entry gap is per career.
// Dial order: pace, structure, company, security, contact, size (1-5 as in the dial prompts).
// Review with the team before launch: these seed the matching, they are not facts.

type DialVec = [number, number, number, number, number, number];

interface RoleTag extends Record<Part, string> {
  dials: DialVec;
}

export const ROLE_TAGS: Record<RoleId, RoleTag> = {
  markets:        { tasks: "analyse",  problems: "money",   skills: "logic",         people: "individuals", reward: "mastery", dials: [5, 3, 2, 4, 2, 4] },
  deals:          { tasks: "analyse",  problems: "money",   skills: "logic",         people: "company",     reward: "money",   dials: [5, 3, 4, 3, 4, 5] },
  risk:           { tasks: "analyse",  problems: "systems", skills: "discipline",    people: "company",     reward: "mastery", dials: [2, 1, 2, 2, 1, 4] },
  advisory:       { tasks: "talk",     problems: "money",   skills: "communication", people: "individuals", reward: "impact",  dials: [3, 3, 3, 3, 5, 3] },
  operations:     { tasks: "organise", problems: "systems", skills: "discipline",    people: "company",     reward: "mastery", dials: [3, 2, 4, 2, 2, 4] },
  strategy:       { tasks: "analyse",  problems: "systems", skills: "logic",         people: "company",     reward: "mastery", dials: [4, 4, 4, 3, 3, 4] },
  growth:         { tasks: "talk",     problems: "new",     skills: "creative",      people: "users",       reward: "freedom", dials: [5, 4, 4, 4, 4, 3] },
  people_hr:      { tasks: "talk",     problems: "people",  skills: "communication", people: "company",     reward: "impact",  dials: [3, 3, 5, 2, 4, 4] },
  founder:        { tasks: "organise", problems: "new",     skills: "creative",      people: "users",       reward: "freedom", dials: [5, 5, 3, 5, 4, 1] },
  product:        { tasks: "build",    problems: "new",     skills: "creative",      people: "users",       reward: "mastery", dials: [4, 4, 4, 3, 2, 3] },
  sales:          { tasks: "talk",     problems: "money",   skills: "communication", people: "individuals", reward: "money",   dials: [4, 3, 3, 4, 5, 2] },
  operator:       { tasks: "organise", problems: "systems", skills: "discipline",    people: "company",     reward: "freedom", dials: [5, 4, 4, 4, 3, 2] },
  build:          { tasks: "build",    problems: "systems", skills: "logic",         people: "users",       reward: "mastery", dials: [3, 3, 3, 3, 1, 3] },
  data:           { tasks: "analyse",  problems: "systems", skills: "logic",         people: "company",     reward: "mastery", dials: [3, 2, 3, 3, 2, 3] },
  product_tech:   { tasks: "build",    problems: "new",     skills: "logic",         people: "users",       reward: "impact",  dials: [4, 3, 4, 3, 3, 3] },
  infrastructure: { tasks: "build",    problems: "systems", skills: "discipline",    people: "company",     reward: "mastery", dials: [3, 1, 3, 2, 1, 4] },
  psychology:     { tasks: "talk",     problems: "people",  skills: "communication", people: "individuals", reward: "impact",  dials: [2, 3, 2, 2, 5, 2] },
  education:      { tasks: "talk",     problems: "people",  skills: "creative",      people: "public",      reward: "impact",  dials: [2, 4, 3, 2, 5, 3] },
  policy:         { tasks: "analyse",  problems: "systems", skills: "logic",         people: "public",      reward: "impact",  dials: [2, 2, 3, 1, 2, 5] },
  community:      { tasks: "organise", problems: "people",  skills: "communication", people: "public",      reward: "impact",  dials: [3, 4, 5, 2, 5, 2] },
};

/** Usual entry gap per career, in catalogue order (3 per role). */
export const ROLE_GAPS: Record<RoleId, [Gap, Gap, Gap]> = {
  markets: ["skill", "experience", "credential"],
  deals: ["experience", "credential", "experience"],
  risk: ["skill", "credential", "skill"],
  advisory: ["skill", "skill", "experience"],
  operations: ["experience", "skill", "experience"],
  strategy: ["skill", "experience", "skill"],
  growth: ["experience", "skill", "experience"],
  people_hr: ["experience", "experience", "skill"],
  founder: ["experience", "experience", "skill"],
  product: ["experience", "skill", "skill"],
  sales: ["experience", "experience", "experience"],
  operator: ["experience", "skill", "experience"],
  build: ["skill", "skill", "skill"],
  data: ["skill", "skill", "credential"],
  product_tech: ["experience", "skill", "skill"],
  infrastructure: ["skill", "skill", "skill"],
  psychology: ["credential", "credential", "skill"],
  education: ["credential", "skill", "skill"],
  policy: ["credential", "credential", "experience"],
  community: ["experience", "experience", "credential"],
};

/** Typical dial position per workplace picked in Part A (same dial order). */
export const WORKPLACE_DIALS: Record<string, DialVec> = {
  large: [2, 2, 4, 2, 3, 5],
  startup: [5, 5, 4, 4, 3, 1],
  govt: [1, 1, 3, 1, 2, 5],
  own: [4, 5, 2, 5, 4, 1],
  research: [2, 4, 2, 3, 1, 2],
  freelance: [4, 5, 1, 4, 4, 1],
};

export const DIAL_INDEX: Record<Dial, number> = { pace: 0, structure: 1, company: 2, security: 3, contact: 4, size: 5 };

/** Roots link: a typical setting for each animal. DRAFT: the build spec gives none yet. */
export const ANIMAL_ENV: Record<RadarDim, string> = {
  analytical: "focused settings with room for deep, detailed work",
  practical: "steady, well-run teams with clear ownership",
  leadership: "places where you can steer people and decisions",
  people: "people-first teams with plenty of collaboration",
  creative: "open settings that reward original ideas",
  entrepreneurial: "fast, independent settings where you own the outcome",
};

export interface CareerTag {
  career: string;
  role: RoleId;
  domain: string;
  parts: Record<Part, string>;
  dials: DialVec;
  gap: Gap;
  dims: [RadarDim, RadarDim];
}

export const CAREER_TAGS: CareerTag[] = (Object.keys(CATALOG) as RoleId[]).flatMap((role) => {
  const entry = CATALOG[role];
  const tag = ROLE_TAGS[role];
  return entry.careers.map((c, i) => ({
    career: c.name,
    role,
    domain: entry.domain,
    parts: { tasks: tag.tasks, problems: tag.problems, skills: tag.skills, people: tag.people, reward: tag.reward },
    dials: tag.dials,
    gap: ROLE_GAPS[role][i],
    dims: entry.dims,
  }));
});
