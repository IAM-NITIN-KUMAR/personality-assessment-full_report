import { Question, Section, StudentProfile, Answer, Dimension } from "./types";
import schoolQuestionSet from "../10th_12th_question_set.json";
import ugQuestionSet from "../ug_question_set.json";

const SCHOOL_SCORES: Record<string, Record<string, Partial<Record<Dimension, number>>>> = {
  Q1: {
    a: { drive: 2, structure: 1 },
    b: { social: 2, energy: 1 },
    c: { structure: 2, decision_style: 1 },
    d: { energy: 2, risk: 1 },
  },
  Q2: {
    a: { decision_style: 2, structure: 1 },
    b: { energy: 2, risk: 1 },
    c: { social: 2, energy: 1 },
    d: { drive: 2, structure: 1 },
  },
  Q3: {
    a: { structure: 2, decision_style: 1 },
    b: { risk: 2, structure: -2 },
    c: { social: 2, energy: 1 },
    d: { decision_style: 2, structure: 1 },
  },
  Q4: {
    a: { structure: 2, decision_style: 1 },
    b: { structure: 1, decision_style: 1 },
    c: { social: 2, energy: 1 },
    d: { energy: 2, risk: 1 },
  },
  Q5: {
    a: { structure: 2, decision_style: 1 },
    b: { drive: 1, energy: -1 },
    c: { social: 2 },
    d: { risk: 2, structure: -1 },
  },
  Q6: {
    a: { structure: 1, drive: 1 },
    b: { social: 2, energy: 1 },
    c: { drive: 2, energy: 1 },
    d: { social: -1, energy: -1 },
  },
  Q7: {
    a: { social: 2, energy: 2 },
    b: { social: -2, energy: -2 },
    c: { drive: 2, structure: 1 },
    d: { risk: 2, energy: 1 },
  },
  Q15: {
    a: { structure: 2, decision_style: 1 },
    b: { structure: 1 },
    c: { structure: -1 },
    d: { structure: -2, decision_style: -1 },
  },
  Q16: {
    a: { energy: 2 },
    b: { energy: 1 },
    c: { energy: -1 },
    d: { energy: -2, social: -1 },
  },
  Q17: {
    a: { risk: 2, drive: 1 },
    b: { risk: 1, decision_style: 1 },
    c: { risk: -1 },
    d: { risk: -2, structure: 1 },
  },
  Q18: {
    a: { social: -2 },
    b: { social: -1 },
    c: { social: 1 },
    d: { social: 2, energy: 1 },
  },
  Q19: {
    a: { drive: 2 },
    b: { drive: 1, structure: 1 },
    c: { drive: -1 },
    d: { drive: -2, structure: -1 },
  },
};

const UG_SCORES: Record<string, Record<string, Partial<Record<Dimension, number>>>> = {
  Q1: {
    a: { drive: 2, social: 1 },
    b: { structure: 2, drive: 1 },
    c: { energy: 2, risk: 1 },
    d: { social: 2, energy: 1 },
  },
  Q2: {
    a: { structure: 2, decision_style: 1 },
    b: { energy: 2, risk: 1 },
    c: { social: 2, energy: 1 },
    d: { decision_style: 2, structure: 1 },
  },
  Q3: {
    a: { decision_style: 2, structure: 1 },
    b: { drive: 2, energy: 1 },
    c: { social: 2, drive: 1 },
    d: { risk: -2, structure: 1 },
  },
  Q4: {
    a: { drive: 2, structure: -1 },
    b: { structure: 2, decision_style: 1 },
    c: { risk: -1, structure: 2 },
    d: { risk: 2, structure: -2 },
  },
  Q5: {
    a: { decision_style: 2, structure: 1 },
    b: { risk: 2, energy: 1 },
    c: { social: 2 },
    d: { social: -1, energy: -1 },
  },
  Q6: {
    a: { decision_style: 2, structure: 1 },
    b: { drive: 2, energy: 1 },
    c: { energy: 2, risk: 1 },
    d: { structure: 2, social: 1 },
  },
  Q7: {
    a: { drive: 2, structure: 1 },
    b: { social: 2, energy: 2 },
    c: { social: -2, energy: -2 },
    d: { structure: 2, drive: 1 },
  },
  Q15: {
    a: { structure: 2 },
    b: { structure: 1 },
    c: { structure: -1 },
    d: { structure: -2, drive: 1 },
  },
  Q16: {
    a: { social: -2, energy: -2 },
    b: { social: -1, energy: -1 },
    c: { social: 1, energy: 1 },
    d: { social: 2, energy: 2 },
  },
  Q17: {
    a: { risk: 2, drive: 1 },
    b: { risk: 1 },
    c: { risk: -1 },
    d: { risk: -2 },
  },
  Q18: {
    a: { drive: 2, structure: -1 },
    b: { drive: 1 },
    c: { drive: -1, structure: 1 },
    d: { drive: -2, structure: 1 },
  },
  Q19: {
    a: { decision_style: 2 },
    b: { decision_style: 1 },
    c: { decision_style: -1 },
    d: { decision_style: -2, risk: 1 },
  },
};

function parseJsonQuestionSet(json: any): Question[] {
  const list: Question[] = [];
  
  for (const s of json.sections) {
    let section: Section = "main_character";
    if (s.section_id === "personality") section = "main_character";
    else if (s.section_id === "cognitive") section = "cognitive";
    else if (s.section_id === "career_specific") section = "dream_big";
    else if (s.section_id === "work_environment") section = "skill_check";
    else if (s.section_id === "abroad_element") section = "passport_era";
    
    const category = s.section_title;
    
    if (s.questions) {
      for (const q of s.questions) {
        const isMulti = !!q.multi_select;
        list.push({
          id: q.id,
          section,
          kind: "anchor",
          type: isMulti ? "multi_choice" : "single_choice",
          category,
          prompt: q.text,
          options: q.options.map((o: any) => ({
            id: o.key,
            label: o.text,
          })),
        });
      }
    }
    
    if (s.gating_question) {
      const g = s.gating_question;
      list.push({
        id: g.id,
        section,
        kind: "anchor",
        type: "single_choice",
        category,
        prompt: g.text,
        options: g.options.map((o: any) => ({
          id: o.key,
          label: o.text,
        })),
      });
      
      for (const q of s.conditional_questions.questions) {
        const isMulti = !!q.multi_select;
        list.push({
          id: q.id,
          section,
          kind: "anchor",
          type: isMulti ? "multi_choice" : "single_choice",
          category,
          prompt: q.text,
          options: q.options.map((o: any) => ({
            id: o.key,
            label: o.text,
          })),
        });
      }
    }
  }
  
  return list;
}

export function getQuestionBank(educationLevel?: "10th_12th" | "college"): Question[] {
  const isSchool = educationLevel === "10th_12th";
  const json = isSchool ? schoolQuestionSet : ugQuestionSet;
  const questions = parseJsonQuestionSet(json);
  const scoreMap = isSchool ? SCHOOL_SCORES : UG_SCORES;
  
  for (const q of questions) {
    const qScores = scoreMap[q.id];
    if (qScores && q.options) {
      for (const o of q.options) {
        o.scores = qScores[o.id];
      }
    }
  }
  
  return questions;
}

export function anchorsForSection(
  section: Section,
  educationLevel: StudentProfile["educationLevel"] = "college",
  discipline: StudentProfile["discipline"] = "tech_cs",
): Question[] {
  void discipline;
  const all = getQuestionBank(educationLevel);
  return all.filter((q) => q.section === section);
}

export interface NextStep {
  kind: "anchor" | "probe" | "transition" | "complete";
  anchor?: Question;
  probeParent?: Question;
  nextSection?: Section;
}

export function planNext(args: {
  current: Question;
  trunk: Question[];
  discipline: StudentProfile["discipline"];
  educationLevel?: StudentProfile["educationLevel"];
  answers?: Record<string, Answer>;
}): NextStep {
  const { current, educationLevel } = args;
  const section = current.section;

  // Gating check: continue only for options 'a' (study further) and 'c' (undecided)
  console.log("planNext Gating Check:", {
    currentId: current.id,
    q20Answer: args.answers?.["Q20"],
    allAnswers: args.answers ? Object.keys(args.answers) : []
  });
  if (current.section === "passport_era" && args.answers) {
    const ans = args.answers["Q20"];
    const shouldContinue = ans?.optionIds?.includes("a") || ans?.optionIds?.includes("c");
    console.log("Q20 Gating decision (section based):", { shouldContinue, ans });
    if (!shouldContinue) {
      return { kind: "transition", nextSection: "report" };
    }
  }

  if (current.id === "Q21" && args.answers) {
    const ans = args.answers["Q21"];
    const shouldEnd = ans?.optionIds?.includes("c");
    console.log("Q21 gating decision:", { shouldEnd, ans });
    if (shouldEnd) {
      return { kind: "transition", nextSection: "report" };
    }
  }

  const SECTIONS: Section[] = [
    "main_character",
    "cognitive",
    "skill_check",
    "dream_big",
    "passport_era",
  ];

  const sectionIndex = SECTIONS.indexOf(section);
  if (sectionIndex === -1) {
    return { kind: "complete" };
  }

  const anchors = anchorsForSection(section, educationLevel);
  const idx = anchors.findIndex((a) => a.id === current.id);

  if (idx >= 0 && idx < anchors.length - 1) {
    return { kind: "anchor", anchor: anchors[idx + 1] };
  }

  const nextSectionIndex = sectionIndex + 1;
  if (nextSectionIndex < SECTIONS.length) {
    const nextSec = SECTIONS[nextSectionIndex];
    const nextAnchors = anchorsForSection(nextSec, educationLevel);
    return {
      kind: "anchor",
      anchor: nextAnchors[0],
      nextSection: nextSec,
    } as NextStep;
  }

  return { kind: "transition", nextSection: "report" };
}

export function totalQuestionCountFor(
  discipline: StudentProfile["discipline"],
  educationLevel?: StudentProfile["educationLevel"],
  answers?: Record<string, Answer>,
): number {
  void discipline;
  void educationLevel;
  if (answers) {
    if (answers["Q21"]?.optionIds?.includes("c")) {
      return 21;
    }
    if (answers["Q20"]) {
      const shouldContinue = answers["Q20"]?.optionIds?.includes("a") || answers["Q20"]?.optionIds?.includes("c");
      return shouldContinue ? 25 : 20;
    }
  }
  return 25;
}
