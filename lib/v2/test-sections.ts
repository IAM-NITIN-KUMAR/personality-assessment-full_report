// The parts of the test as the student sees them, and the numbers shown beside each question:
// how far along they are, part by part, and roughly how long is left.

import { screenOrder } from "./flow";
import { POST_PAGES, PRE_PAGES } from "./fp/steps";
import type { V2Answers } from "./types";

export interface TestSection {
  title: string;
  /** One line shown on the page that opens the part. */
  about: string;
}

export const TEST_SECTIONS: TestSection[] = [
  { title: "Your starting point", about: "Where your head is right now, before the test nudges it." },
  { title: "How you work", about: "Everyday situations. Pick what you would really do, not what sounds best." },
  { title: "React honestly", about: "Six real work problems. Go with your first reaction." },
  { title: "Pick your world", about: "Choose one world of work to look inside, then make four quick choices within it." },
  { title: "The real cost", about: "Every path has a price. Two honest checks on the one you are leaning towards." },
  { title: "Roots", about: "What matters most to you, and how decisions get made at home." },
  { title: "Reality & path", about: "What you have seen of the field so far, and what comes next." },
];

/** Core question ids start with the letter of their block (A1, B3, F5a); each block is one part. */
const SECTION_BY_LETTER: Record<string, number> = { Q: 1, A: 1, B: 2, C: 3, D: 4, E: 5, F: 6 };

export interface SequenceItem {
  /** The id the answer is stored under. */
  id: string;
  /** Index into TEST_SECTIONS. */
  section: number;
}

/**
 * Every question the student will be asked, in order, given their answers so far. The list can
 * grow while the test is under way: answers near the end can open the study-abroad questions.
 */
export function testSequence(answers: V2Answers, askDegree = false): SequenceItem[] {
  return [
    ...PRE_PAGES.map((p) => ({ id: p.id, section: 0 })),
    ...screenOrder(answers)
      // Q0 (the degree) is seeded from registration; it is asked only when the profile has no field of study.
      .filter((id) => id !== "Q0" || askDegree)
      .map((id) => ({ id, section: SECTION_BY_LETTER[id[0]] ?? TEST_SECTIONS.length - 1 })),
    // The closing question belongs with the last part rather than standing alone.
    ...POST_PAGES.map((p) => ({ id: p.id, section: TEST_SECTIONS.length - 1 })),
  ];
}

export interface SectionProgress {
  /** Questions of this part already answered. */
  done: number;
  total: number;
}

/** Progress through each part, when the student is on question `index` (0-based) of the sequence. */
export function sectionProgress(sequence: SequenceItem[], index: number): SectionProgress[] {
  const out = TEST_SECTIONS.map(() => ({ done: 0, total: 0 }));
  sequence.forEach((item, i) => {
    out[item.section].total += 1;
    if (i < index) out[item.section].done += 1;
  });
  return out;
}

/** True when the question at `index` is the first of its part. */
export function opensSection(sequence: SequenceItem[], index: number): boolean {
  const item = sequence[index];
  return !!item && (index === 0 || sequence[index - 1].section !== item.section);
}

/**
 * The parts that open with a page of their own. Only two do, so the test is not broken up at
 * every part: the start, and "Pick your world", which falls halfway and is answered differently.
 */
export const INTRO_SECTIONS: readonly number[] = [0, 3];

/** True when the question at `index` opens a part that has an opening page. */
export function opensWithIntro(sequence: SequenceItem[], index: number): boolean {
  return opensSection(sequence, index) && INTRO_SECTIONS.includes(sequence[index].section);
}

const DEFAULT_PACE_SECONDS = 15;

/**
 * Seconds this student takes per question, from the times their answers were saved: the middle
 * gap between one answer and the next. Long pauses (a phone call, a break) and double taps are
 * left out, and with too little to go on a typical pace is assumed.
 */
export function paceSeconds(answeredAt: number[]): number {
  const times = [...answeredAt].sort((a, b) => a - b);
  const gaps: number[] = [];
  for (let i = 1; i < times.length; i++) {
    const gap = (times[i] - times[i - 1]) / 1000;
    if (gap >= 1.5 && gap <= 90) gaps.push(gap);
  }
  if (gaps.length < 3) return DEFAULT_PACE_SECONDS;
  gaps.sort((a, b) => a - b);
  const middle = gaps[Math.floor(gaps.length / 2)];
  return Math.min(45, Math.max(6, middle));
}

/** Whole minutes left for `remaining` questions at this pace; never less than one while any remain. */
export function minutesLeft(remaining: number, pace: number): number {
  return remaining <= 0 ? 0 : Math.max(1, Math.round((remaining * pace) / 60));
}
