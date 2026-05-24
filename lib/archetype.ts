import {
  Answer,
  Archetype,
  Dimension,
  DimensionScore,
  Question,
} from "./types";

const ALL_DIMENSIONS: Dimension[] = [
  "decision_style",
  "energy",
  "structure",
  "risk",
  "social",
  "drive",
];

/**
 * Sum option scores across all answered scenario questions, then normalize
 * each dimension to -100..+100. This is the back-of-envelope scoring; a
 * psychometrician will replace it in Phase 2 with proper factor analysis.
 */
export function computeDimensionScores(
  questions: Question[],
  answers: Record<string, Answer>,
): DimensionScore[] {
  const raw: Record<Dimension, number> = {
    decision_style: 0, energy: 0, structure: 0, risk: 0, social: 0, drive: 0,
  };
  const max: Record<Dimension, number> = {
    decision_style: 0, energy: 0, structure: 0, risk: 0, social: 0, drive: 0,
  };

  for (const q of questions) {
    if (!q.options) continue;
    const optMax = q.options.reduce((acc, o) => {
      const scores = o.scores ?? {};
      for (const d of ALL_DIMENSIONS) {
        const s = Math.abs(scores[d] ?? 0);
        if (s > (acc[d] ?? 0)) acc[d] = s;
      }
      return acc;
    }, {} as Partial<Record<Dimension, number>>);
    for (const d of ALL_DIMENSIONS) max[d] += optMax[d] ?? 0;

    const a = answers[q.id];
    if (!a?.optionIds?.length) continue;
    const picked = q.options.find((o) => a.optionIds!.includes(o.id));
    if (!picked?.scores) continue;
    for (const d of ALL_DIMENSIONS) raw[d] += picked.scores[d] ?? 0;
  }

  return ALL_DIMENSIONS.map((d) => ({
    dimension: d,
    raw: raw[d],
    normalized: max[d] === 0 ? 0 : Math.round((raw[d] / max[d]) * 100),
  }));
}

interface ArchetypeDef {
  name: string;
  tagline: string;
  match: (s: Record<Dimension, number>) => number; // higher = better fit
  describe: (s: Record<Dimension, number>) => string;
}

const ARCHETYPES: ArchetypeDef[] = [
  {
    name: "The Builder",
    tagline: "You'd rather ship at 80% than discuss at 100%.",
    match: (s) => s.drive + s.risk + Math.max(0, -s.structure),
    describe: () =>
      "You're driven by output. Ideas don't feel real until you've made them. You move first and refine in public — which is rarer than people think and worth protecting.",
  },
  {
    name: "The Strategist",
    tagline: "You see two moves ahead before most people see one.",
    match: (s) => s.decision_style + s.structure + Math.max(0, -s.risk / 2),
    describe: () =>
      "You make decisions deliberately. You map the terrain before you walk it, and you trust structure to do the work plans alone can't. People come to you when something needs thinking through.",
  },
  {
    name: "The Connector",
    tagline: "You read the room before the room reads itself.",
    match: (s) => s.social + s.energy + Math.max(0, -s.decision_style / 2),
    describe: () =>
      "You think out loud, with people. Your best work happens in conversation, and your network is genuinely a feature, not a side effect. You're underrated as a force multiplier.",
  },
  {
    name: "The Maverick",
    tagline: "Conventional paths bore you on purpose.",
    match: (s) => s.risk + Math.max(0, -s.structure) + Math.max(0, s.drive / 2),
    describe: () =>
      "You're comfortable with ambiguity that most people find unbearable. You'd rather invent the path than walk one — which means the right environment matters more for you than for almost anyone else.",
  },
  {
    name: "The Anchor",
    tagline: "Calm under pressure isn't a pose for you.",
    match: (s) => s.structure + Math.max(0, -s.risk) + Math.max(0, -s.energy / 2),
    describe: () =>
      "You're the person other people stabilize around. You build systems quietly, hold standards without lecturing, and resist the urge to optimize for the loudest voice in the room.",
  },
  {
    name: "The Explorer",
    tagline: "You'd rather have ten interests than one identity.",
    match: (s) => Math.max(0, -s.structure) + s.drive + Math.max(0, s.energy / 2),
    describe: () =>
      "You're curious in a way that doesn't fit a single major. The risk for you isn't picking wrong — it's picking too narrow. Your edge is breadth that eventually becomes depth in something you couldn't have predicted.",
  },
];

export function pickArchetype(scores: DimensionScore[]): Archetype {
  const map = scores.reduce((acc, s) => {
    acc[s.dimension] = s.normalized;
    return acc;
  }, {} as Record<Dimension, number>);

  let best = ARCHETYPES[0];
  let bestScore = -Infinity;
  for (const a of ARCHETYPES) {
    const m = a.match(map);
    if (m > bestScore) {
      best = a;
      bestScore = m;
    }
  }

  return {
    name: best.name,
    tagline: best.tagline,
    description: best.describe(map),
    scores,
  };
}
