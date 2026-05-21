import type { Question } from "../types";

/**
 * Routes-BCA bank — discipline-specific scenarios for engineering / CS students,
 * plus the engagement check (the "are you actually connected to this field?" item).
 *
 * Mirrors the same dimension model as Roots so the report can show how the same
 * person shows up *in their field*.
 */
export const ROUTES_BCA: Question[] = [
  {
    id: "rb_framework",
    section: "routes",
    kind: "anchor",
    type: "single_choice",
    category: "BCA · Curiosity",
    dimension: "drive",
    prompt:
      "A new framework just dropped on Twitter. Everyone in your class is hyped. Your honest reaction is:",
    options: [
      {
        id: "a",
        label: "Already cloned the repo. Reading the source on the bus home.",
        scores: { drive: 2, risk: 1, structure: -1 },
      },
      {
        id: "b",
        label: "I'll wait for a good YouTube breakdown next weekend.",
        scores: { drive: 0, structure: 1 },
      },
      {
        id: "c",
        label: "Cool, but I have semesters to finish first.",
        scores: { drive: -1, structure: 2, risk: -1 },
      },
      {
        id: "d",
        label: "Wait, who's this 'everyone' you're talking about?",
        scores: { drive: -2, social: -1 },
      },
    ],
  },
  {
    id: "rb_bug_at_2am",
    section: "routes",
    kind: "anchor",
    type: "single_choice",
    category: "BCA · Problem mode",
    dimension: "decision_style",
    prompt:
      "It's 2 AM. Your code has been broken for three hours. The bug makes no sense. What do you do?",
    options: [
      {
        id: "a",
        label: "Stay up. I'm not sleeping until I see it work.",
        scores: { decision_style: 1, drive: 2, risk: 1 },
      },
      {
        id: "b",
        label: "Sleep. I always solve it in the shower the next morning anyway.",
        scores: { decision_style: -1, structure: 1 },
      },
      {
        id: "c",
        label: "Post the error in a Discord and go scroll until someone helps.",
        scores: { decision_style: -2, social: 2, drive: -1 },
      },
      {
        id: "d",
        label: "Comment it out, mark a TODO, push the rest. Deal with it tomorrow.",
        scores: { decision_style: 1, structure: 0, risk: 1 },
      },
    ],
  },
  {
    id: "rb_pair_programming",
    section: "routes",
    kind: "anchor",
    type: "single_choice",
    category: "BCA · Working style",
    dimension: "social",
    prompt:
      "You're paired with someone for a hackathon. They want to use a stack you've never touched.",
    options: [
      {
        id: "a",
        label: "Cool. I learn fastest under pressure anyway.",
        scores: { social: 1, risk: 2, drive: 2 },
      },
      {
        id: "b",
        label: "Push back. Suggest the stack I know — we're here to win.",
        scores: { social: -1, decision_style: 1, structure: 1 },
      },
      {
        id: "c",
        label: "Split work — I'll do the bits I know, they'll do the new stack.",
        scores: { social: 1, structure: 2 },
      },
      {
        id: "d",
        label: "I'd rather just build it solo, honestly.",
        scores: { social: -2, drive: 1 },
      },
    ],
  },
  {
    id: "rb_build_or_polish",
    section: "routes",
    kind: "anchor",
    type: "single_choice",
    category: "BCA · Output taste",
    dimension: "structure",
    prompt:
      "You're 80% done with a project. The last 20% is unglamorous polish. You have a deadline in 3 days.",
    options: [
      {
        id: "a",
        label: "Polish properly. Shipping ugly is worse than shipping late.",
        scores: { structure: 2, decision_style: 1 },
      },
      {
        id: "b",
        label: "Ship at 80. Iterate after feedback. Done > perfect.",
        scores: { structure: -1, risk: 1, drive: 1 },
      },
      {
        id: "c",
        label: "Start a second, better version. The first one was a draft.",
        scores: { structure: 0, risk: 2, drive: 2 },
      },
      {
        id: "d",
        label: "Honestly, I'd ask a friend to do the polish bit.",
        scores: { structure: -1, social: 2, drive: -1 },
      },
    ],
  },
  {
    id: "rb_career_picture",
    section: "routes",
    kind: "anchor",
    type: "single_choice",
    category: "BCA · Path",
    dimension: "drive",
    prompt:
      "Three years out of college, what's the version of work that would feel like a win?",
    options: [
      {
        id: "a",
        label: "Senior engineer at a top product company. Real systems, real scale.",
        scores: { drive: 2, structure: 1 },
      },
      {
        id: "b",
        label: "Co-founder of something I started. Even if it's small.",
        scores: { drive: 2, risk: 2, social: -1 },
      },
      {
        id: "c",
        label: "Solid job, side projects on the weekend. Both hands full.",
        scores: { drive: 1, structure: 1 },
      },
      {
        id: "d",
        label: "Honestly, I'm not sure I'm staying in tech.",
        scores: { drive: -1, risk: 0 },
      },
    ],
  },
  {
    id: "rb_academic_pressure",
    section: "routes",
    kind: "anchor",
    type: "single_choice",
    category: "BCA · Pressure",
    dimension: "structure",
    prompt:
      "Two assignments + a viva + your side project all collide in the same week. How do you actually handle it?",
    options: [
      {
        id: "a",
        label: "I make a literal hour-by-hour plan, do hardest first, treat it like ops.",
        scores: { structure: 2, decision_style: 2, drive: 1 },
      },
      {
        id: "b",
        label: "I quietly drop the side project, refocus on grades, pick it back up after.",
        scores: { structure: 1, decision_style: 1, risk: -1 },
      },
      {
        id: "c",
        label: "I do the assignments at 60%, ace the viva, side project in any breathing room.",
        scores: { structure: -1, drive: 1, decision_style: 1 },
      },
      {
        id: "d",
        label: "I would absolutely panic for the first 36 hours. Then crank the last 48.",
        scores: { structure: -2, drive: 0, risk: 1 },
      },
    ],
  },
  {
    id: "rb_horizon",
    section: "routes",
    kind: "anchor",
    type: "single_choice",
    category: "BCA · Horizon",
    dimension: "decision_style",
    prompt:
      "Pick the bet you'd make: a job that pays well now in a stable but boring stack, or low pay in a frontier area you'd be learning the bleeding edge of.",
    options: [
      {
        id: "a",
        label: "Boring stable stack. Compounding earnings + free time = leverage.",
        scores: { decision_style: 1, structure: 2, risk: -2 },
      },
      {
        id: "b",
        label: "Frontier area. Money compounds — but compounded skill compounds harder.",
        scores: { decision_style: 1, risk: 2, drive: 2 },
      },
      {
        id: "c",
        label: "Find the rare job that's both. Won't settle for either.",
        scores: { decision_style: 2, drive: 1, structure: 0 },
      },
      {
        id: "d",
        label: "Honestly I'd take whichever one had cooler people.",
        scores: { decision_style: -1, social: 2, risk: 1 },
      },
    ],
  },
];

/**
 * The engagement check — single highest-signal question per the brief (page 8).
 * Not scored on dimensions; scored on a 0–3 engagement scale that the report
 * uses for the "honest signal" layer.
 */
export const ROUTES_BCA_ENGAGEMENT: Question = {
  id: "rb_engagement",
  section: "routes",
  kind: "engagement",
  type: "single_choice",
  category: "Honest check",
  prompt:
    "In the last 6 months — outside of class, with zero pressure — have you actually built, broken, or tinkered with anything code-related? Be honest. No judgment.",
  hint: "There's no right answer. We're trying to read your real connection to this field, not your resume.",
  options: [
    { id: "a", label: "Yeah — I actively build/tinker. It's kind of my thing.", tag: "engagement:3" },
    { id: "b", label: "A little. I poked at one thing because I had to.",       tag: "engagement:2" },
    { id: "c", label: "Nope. I keep meaning to. Haven't.",                      tag: "engagement:1" },
    { id: "d", label: "Honestly, I don't really care about the technical side.", tag: "engagement:0" },
  ],
};
