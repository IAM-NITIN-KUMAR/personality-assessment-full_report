export type Dimension =
  | "decision_style"
  | "energy"
  | "structure"
  | "risk"
  | "social"
  | "drive";

export const DIMENSION_LABELS: Record<Dimension, { low: string; high: string; label: string }> = {
  decision_style: { label: "Decision style", low: "Intuitive", high: "Deliberate" },
  energy:         { label: "Energy",         low: "Introvert", high: "Extrovert"  },
  structure:      { label: "Structure",      low: "Open-ended", high: "Structured" },
  risk:           { label: "Risk tolerance", low: "Cautious",  high: "Bold"       },
  social:         { label: "Social mode",    low: "Independent", high: "Collaborative" },
  drive:          { label: "Drive",          low: "Reactive",  high: "Proactive"  },
};

export type Section = "context" | "roots" | "teaser" | "routes" | "report";

export type QuestionKind = "anchor" | "adaptive" | "context" | "engagement";

export type QuestionType =
  | "single_choice"
  | "multi_choice"
  | "short_text"
  | "single_select_chips";

export interface Option {
  id: string;
  label: string;
  /** Partial dimension scores. Each axis ranges -2..+2 per option. */
  scores?: Partial<Record<Dimension, number>>;
  /** For Context module: tags carried into the report (e.g. "budget:5-15L"). */
  tag?: string;
}

export interface Question {
  id: string;
  section: Section;
  kind: QuestionKind;
  type: QuestionType;
  /** Tag shown above the prompt (e.g. "DECISION STYLE"). */
  category: string;
  prompt: string;
  /** Optional helper line under the prompt. */
  hint?: string;
  options?: Option[];
  /** For adaptive probes — the question this branched from. */
  parentId?: string;
  /** Primary dimension this item maps to (omitted for context/short_text). */
  dimension?: Dimension;
}

export type Reaction = "fire" | "meh" | "think" | "bored" | "love";
export type ReactionTone = "positive" | "neutral" | "negative";

export interface ReactionDef {
  id: Reaction;
  emoji: string;
  /** Apple emoji image hosted on jsdelivr (iamcal/emoji-data). */
  appleSrc: string;
  label: string;
  tone: ReactionTone;
}

const APPLE_CDN = "https://cdn.jsdelivr.net/gh/iamcal/emoji-data/img-apple-64";

export const REACTIONS: ReactionDef[] = [
  { id: "fire",  emoji: "🔥", appleSrc: `${APPLE_CDN}/1f525.png`,    label: "Loved this · probe deeper",   tone: "positive" },
  { id: "love",  emoji: "❤️", appleSrc: `${APPLE_CDN}/2764-fe0f.png`, label: "Felt seen · probe deeper",    tone: "positive" },
  { id: "think", emoji: "🤔", appleSrc: `${APPLE_CDN}/1f914.png`,    label: "Made me think",               tone: "neutral"  },
  { id: "meh",   emoji: "😐", appleSrc: `${APPLE_CDN}/1f610.png`,    label: "Meh · rephrase this",         tone: "negative" },
  { id: "bored", emoji: "😴", appleSrc: `${APPLE_CDN}/1f634.png`,    label: "Boring · rephrase this",      tone: "negative" },
];

export interface Answer {
  questionId: string;
  /** Selected option id (or array for multi). */
  optionIds?: string[];
  /** Free-text answer. */
  text?: string;
  reaction?: Reaction;
  answeredAt: number;
}

import type { Discipline } from "./course-catalog";

export type { Discipline };

export interface StudentProfile {
  name: string;
  email: string;
  /** Broad interest area (12 categories). Maps to question-bank routes. */
  discipline: Discipline;
  /** Optional specific course the student is considering. Catalog id. */
  course?: string;
  /** Optional avatar — stored as a data URL (JPEG, ~256x256, <60KB after compression). */
  photo?: string;
}

export interface AssessmentState {
  profile: StudentProfile | null;
  /** Map of questionId -> Answer. */
  answers: Record<string, Answer>;
  /** Ordered list of question ids the user has progressed through (anchors + adaptives). */
  trunk: string[];
  /** Adaptive probes generated so far, indexed by id. */
  adaptiveQuestions: Record<string, Question>;
  /** Per-question rewrites stamped after a negative reaction. Keyed by original id. */
  rewrites: Record<string, Question>;
  section: Section;
  /** Computed once Roots completes. */
  archetype?: Archetype;
}

export interface DimensionScore {
  dimension: Dimension;
  /** -10..+10 (raw sum of option scores), normalized to -100..+100 for display. */
  raw: number;
  normalized: number;
}

export interface Archetype {
  name: string;
  tagline: string;
  description: string;
  scores: DimensionScore[];
}
