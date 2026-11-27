// Ported from the crisis tests in the Python service (tests/test_answer.py).
import { describe, it, expect } from "vitest";
import { CRISIS_PHRASES, isCrisis } from "../../lib/v2/gita/crisis";

describe("isCrisis", () => {
  it.each([
    "I want to kill myself",
    "I wish I was dead",
    "I don’t want to live anymore",
    "Thinking about SUICIDE",
    "i want to end my life",
    "life is not worth living",
    "I want to hang myself",
    "I don't want to exist anymore",
    "nobody would miss me if I was gone",
    "I wish I had never been born",
    "I want to disappear",
    "I have been thinking of ending things",
    "I wanna end it",
    "I want to unalive myself",
    "I want to overdose",
    "I took an overdose",
    "thinking of overdosing on pills",
    "I want to cut myself",
    "I cut myself when I am sad",
    "I am going to cut myself",
    "kms",
    "I am self harming",
    "I keep self-harming",
    "everyone would be better off without me",
  ])("detects phrases: %j", (q) => {
    expect(isCrisis(q)).toBe(true);
  });

  it.each([
    "i can not go on",
    "i cannot go on",
    "I won't go on.",
    "i cannot go on anymore",
    "killing myself",
    "ending my life",
    "taking my life",
    "hurting myself",
    "harming myself",
    "end my own life",
    "i dont want to live",
    "wanna die",
    "want to be dead",
    "don't want to be alive",
    "don't wanna live",
    "better off dead",
    "can't go on",
    "I can't go on like this",
    "I can't go on.",
    "kill  myself",
    "kill\nmyself",
    "kill my self",
    "ending it all",
    "KILL MYSELF",
    "don’t want to be alive",
    "self-harm",
    "no one would miss me",
    "I wish I was never born",
    "i dont want to exist",
    "I want to disappear forever",
    "I want to disappear.",
    "wanna disappear",
    "i want to end it.",
    "I am thinking about ending it",
    "thinking of end things",
    "I'm cutting myself",
    "KMS",
    "I am going to hang myself",
    "hanging myself",
    "I want to overdose on pills",
    "better off without me",
  ])("detects common variants: %j", (q) => {
    expect(isCrisis(q)).toBe(true);
  });

  it.each([
    "I am afraid of failing my exams",
    "What happens after we die?",
    "I don't know which path to choose",
    "How do I kill my ego?",
    "I can't go on holiday this year, is desire bad?",
    "Arjuna did not want to kill his kinsmen. Why?",
    "I want to diet",
    "How do I kill my selfish ego?",
    "i dont want to livestream",
    "the end it allowance",
    "kill my selfless friend",
    "I cannot go on holiday",
    "I want to end it with my business partner on good terms",
    "I want to disappear from social media for a while",
    "How do I cut myself some slack?",
    "I want to end it with my business partner",
    "The Gita says the soul is never born and never dies. What does that mean?",
    "Why is the self never born?",
    "What is the meaning of Gita 2.20: it is never born",
    "I feel I am overdosing on social media",
    "I am overdosing on caffeine and sugar",
    "I cut myself shaving",
    "I cut myself while cooking",
  ])("ignores ordinary questions: %j", (q) => {
    expect(isCrisis(q)).toBe(false);
  });

  it("detects every listed phrase on its own, in any case", () => {
    // The list is written in normalised form, so each phrase must match itself.
    expect(CRISIS_PHRASES).toHaveLength(52); // as many as the Python list
    for (const phrase of CRISIS_PHRASES) {
      expect(isCrisis(phrase), phrase).toBe(true);
      expect(isCrisis(`I think ${phrase.toUpperCase()}.`), phrase).toBe(true);
    }
  });
});

describe("isCrisis: unusual characters", () => {
  it.each(["kill\u001fmyself", "kill\u0085myself"])("detects %j: these control characters count as white space", (q) => {
    expect(isCrisis(q)).toBe(true);
  });

  // The Python original ignores these (a phrase joined to a non-ASCII letter is not a whole word
  // there). Word boundaries in JavaScript are ASCII-only, so here they fire. Showing the help
  // message once too often is the safe side to err on, so the difference is kept.
  it.each(["ésuicide", "suicideé", "कsuicideक"])("fires on %j, a phrase joined to a non-ASCII letter", (q) => {
    expect(isCrisis(q)).toBe(true);
  });
});
