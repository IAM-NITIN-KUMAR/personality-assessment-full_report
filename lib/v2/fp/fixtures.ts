import { fpId } from "./bank";
import type { FpAnswers } from "./score";

const c = (id: string, ...v: string[]) => [fpId(id), { optionIds: v }] as const;
const t = (id: string, v: string) => [fpId(id), { text: v }] as const;

/** Ananya's Module answers (matches ANANYA_ANSWERS): leaning towards CA because family suggested it,
 *  planned to study straight away, confidence 2/5, flagged B1, B4, B10, B11. */
export const ANANYA_FP: FpAnswers = Object.fromEntries([
  t("A1", "Chartered accountancy"), c("A2", "family"), c("A3", "large"), c("A4", "safety"), c("A5", "study"), c("A6", "family"),
  c("A7.career", "2"), c("A7.workplace", "3"), c("A7.next", "2"),
  c("B1", "5"), c("B2", "3"), c("B3", "2"), c("B4", "4"), c("B5", "3"),
  c("B6", "3"), c("B7", "2"), c("B8", "2"), c("B9", "3"),
  c("B10", "4"), c("B11", "5"), c("B12", "3"),
  t("C1.day", "Going through a messy set of accounts, finding what doesn't add up and explaining it to the team."),
  c("C1.tasks", "analyse"), c("C1.problems", "systems"), c("C1.skills", "discipline"), c("C1.people", "company"), c("C1.reward", "mastery"),
  c("C2.pace", "2"), c("C2.structure", "2"), c("C2.company", "4"), c("C2.security", "2"), c("C2.contact", "2"), c("C2.size", "4"),
  c("C2.focus", "data", "people"),
  c("C3.gap", "experience", "clarity"),
]);
