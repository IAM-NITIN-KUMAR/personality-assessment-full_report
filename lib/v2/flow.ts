import {
  C1_PROMPT, C_BRANCHES, DEGREE_BY_Q0, D_OPTIONS, D_STATEMENTS, F4_OPTIONS, F4_PROMPT, STATIC_SCREENS,
} from "./question-bank";
import { selectC1Cards } from "./scoring/domains";
import { computeRadar } from "./scoring/radar";
import { resolveRole } from "./scoring/roles";
import { showAbroad } from "./gate";
import { DOMAIN_LABELS } from "./types";
import type { Degree, DomainId, OptionKey, ScreenId, V2Answers } from "./types";

export interface ScreenV2 {
  id: ScreenId;
  category: string;
  prompt: string;
  hint?: string;
  multi?: boolean;
  options: { key: OptionKey; label: string }[];
}

const CORE_ORDER: ScreenId[] = [
  "Q0",
  "A1", "A2", "A3", "A4", "A5", "A6", "A7",
  "B1", "B2", "B3", "B4", "B5", "B6",
  "C1", "C2", "C3", "C4", "C5",
  "D1", "D2",
  "E1", "E2", "E3",
  "F1", "F2", "F3",
];

export function degreeOf(answers: V2Answers): Degree | null {
  const key = answers.Q0?.[0];
  return key ? DEGREE_BY_Q0[key] : null;
}

/** The C1 card list is deterministic from radar + degree, so the chosen option key maps back to a domain. */
export function c1Cards(answers: V2Answers): DomainId[] {
  const degree = degreeOf(answers) ?? "other";
  return selectC1Cards(computeRadar(answers), degree).cards;
}

export function chosenDomain(answers: V2Answers): DomainId | null {
  const key = answers.C1?.[0];
  if (!key) return null;
  const idx = ["a", "b", "c", "d"].indexOf(key);
  return idx === -1 ? null : c1Cards(answers)[idx] ?? null;
}

export function screenOrder(answers: V2Answers): ScreenId[] {
  const order = [...CORE_ORDER];
  if (showAbroad(answers)) {
    order.push("F4");
    const f4 = answers.F4?.[0];
    if (f4 === "a" || f4 === "b") order.push("F5a", "F5b", "F5c");
  }
  return order;
}

export function getScreen(id: ScreenId, answers: V2Answers): ScreenV2 {
  if (id === "C1") {
    return {
      id, category: "Pick your world", prompt: C1_PROMPT,
      options: c1Cards(answers).map((d, i) => ({
        key: ["a", "b", "c", "d"][i] as OptionKey,
        label: DOMAIN_LABELS[d],
      })),
    };
  }
  if (id === "C2" || id === "C3" || id === "C4" || id === "C5") {
    const domain = chosenDomain(answers);
    if (!domain) throw new Error(`Screen ${id} requires C1 to be answered`);
    const screen = C_BRANCHES[domain].screens.find((s) => s.id === id)!;
    return {
      id, category: "Go deeper", prompt: screen.prompt,
      options: screen.options.map(({ key, label }) => ({ key, label })),
    };
  }
  if (id === "D1" || id === "D2") {
    const domain = chosenDomain(answers);
    if (!domain) throw new Error(`Screen ${id} requires C1-C5`);
    const { winner } = resolveRole(domain, answers);
    const st = D_STATEMENTS[winner];
    return id === "D1"
      ? { id, category: "The real cost", prompt: st.cost, options: D_OPTIONS.d1 }
      : { id, category: "The real cost", prompt: `${st.grind} — Would you actually do that?`, options: D_OPTIONS.d2 };
  }
  if (id === "F4") {
    return { id, category: "Reality & path", prompt: F4_PROMPT(answers.A7?.[0] ?? "a"), options: F4_OPTIONS };
  }
  const def = STATIC_SCREENS[id as keyof typeof STATIC_SCREENS];
  return { id: def.id, category: def.category, prompt: def.prompt, hint: def.hint, multi: def.multi, options: def.options };
}

export function nextScreenId(answers: V2Answers): ScreenId | null {
  for (const id of screenOrder(answers)) {
    const a = answers[id];
    if (!a || a.length === 0) return id;
  }
  return null;
}
