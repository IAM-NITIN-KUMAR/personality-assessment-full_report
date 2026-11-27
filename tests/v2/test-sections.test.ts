import { describe, expect, it } from "vitest";
import {
  minutesLeft, opensSection, opensWithIntro, paceSeconds, sectionProgress, TEST_SECTIONS, testSequence,
} from "../../lib/v2/test-sections";
import type { V2Answers } from "../../lib/v2/types";

describe("testSequence", () => {
  it("is 29 questions for a student who is not asked about studying abroad", () => {
    const seq = testSequence({});
    expect(seq).toHaveLength(29);
    expect(seq.map((s) => s.id)).not.toContain("Q0");
    expect(new Set(seq.map((s) => s.id)).size).toBe(29);
  });

  it("covers every part, in order, starting and ending with the First Principles questions", () => {
    const seq = testSequence({});
    const sections = seq.map((s) => s.section);
    expect([...sections].sort((a, b) => a - b)).toEqual(sections);
    expect(new Set(sections).size).toBe(TEST_SECTIONS.length);
    expect(seq[0].section).toBe(0);
    expect(seq[seq.length - 1].section).toBe(TEST_SECTIONS.length - 1);
  });

  it("grows to 30 and then 33 when the study-abroad questions open", () => {
    const open: V2Answers = { A7: ["a"], F3: ["a"] };
    expect(testSequence(open)).toHaveLength(30);
    expect(testSequence({ ...open, F4: ["b"] })).toHaveLength(33);
    expect(testSequence({ ...open, F4: ["c"] })).toHaveLength(30);
  });

  it("asks the degree question only when told the profile has no field of study", () => {
    const seq = testSequence({}, true);
    expect(seq).toHaveLength(30);
    expect(seq.find((s) => s.id === "Q0")?.section).toBe(1);
  });
});

describe("sectionProgress and opensSection", () => {
  const seq = testSequence({});

  it("counts answered questions part by part", () => {
    const parts = sectionProgress(seq, 11); // two starting questions, seven on how you work, two reactions
    expect(parts.map((p) => p.total)).toEqual([2, 7, 6, 5, 2, 3, 4]);
    expect(parts.map((p) => p.done)).toEqual([2, 7, 2, 0, 0, 0, 0]);
    expect(parts.reduce((n, p) => n + p.total, 0)).toBe(seq.length);
  });

  it("knows the first question of each part", () => {
    const firsts = seq.map((_, i) => i).filter((i) => opensSection(seq, i));
    expect(firsts).toEqual([0, 2, 9, 15, 20, 22, 25]);
    expect(opensSection(seq, 99)).toBe(false);
  });

  it("gives an opening page to only two parts: the start and the halfway turn", () => {
    const withPage = seq.map((_, i) => i).filter((i) => opensWithIntro(seq, i));
    expect(withPage).toEqual([0, 15]);
    expect(withPage.map((i) => TEST_SECTIONS[seq[i].section].title)).toEqual(["Your starting point", "Pick your world"]);
    expect(opensWithIntro(seq, 99)).toBe(false);
  });

  it("still gives two opening pages when the degree and study-abroad questions are asked", () => {
    const long = testSequence({ A7: ["a"], F3: ["a"], F4: ["b"] }, true);
    expect(long.filter((_, i) => opensWithIntro(long, i))).toHaveLength(2);
  });
});

describe("paceSeconds and minutesLeft", () => {
  const every = (seconds: number, n: number) => Array.from({ length: n }, (_, i) => 1_000_000 + i * seconds * 1000);

  it("assumes a typical pace until there is enough to go on", () => {
    expect(paceSeconds([])).toBe(15);
    expect(paceSeconds(every(30, 3))).toBe(15);
  });

  it("uses the student's own middle gap, ignoring long breaks and double taps", () => {
    expect(paceSeconds(every(10, 8))).toBe(10);
    const withBreak = [...every(10, 6), 1_000_000 + 50_000 + 20 * 60_000, 1_000_000 + 50_000 + 20 * 60_000 + 500];
    expect(paceSeconds(withBreak)).toBe(10);
  });

  it("keeps the pace within sensible bounds", () => {
    expect(paceSeconds(every(2, 10))).toBe(6);
    expect(paceSeconds(every(80, 10))).toBe(45);
  });

  it("gives whole minutes, and never zero while questions remain", () => {
    expect(minutesLeft(0, 15)).toBe(0);
    expect(minutesLeft(1, 6)).toBe(1);
    expect(minutesLeft(20, 15)).toBe(5);
  });
});
